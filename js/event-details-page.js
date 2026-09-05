/* =========================================================
   EVENT DETAILS PAGE SCRIPT
   Details, interactive seat map, booking countdown timer,
   and booking form with auto-calculated totals.
   Loaded after data.js, ui.js, theme.js.
   ========================================================= */

let currentEvent = null;
let selectedSeats = [];
let countdownInterval = null;
let countdownSeconds = 600; // 10:00

function getIdFromUrl() {
  return new URLSearchParams(window.location.search).get("id");
}

/* ---------- RENDER EVENT DETAILS ---------- */
function renderEventDetails() {
  const id = getIdFromUrl();
  const event = getEventById(id);

  if (!event) {
    window.location.href = "index.html";
    return;
  }

  currentEvent = event;
  document.title = event.name + " | Eventify";
  document.getElementById("breadcrumbName").textContent = event.name;

  const img = document.getElementById("eventImage");
  img.src = event.image;
  img.alt = event.name;

  const statusBadge = document.getElementById("eventStatusBadge");
  const statusClassMap = { Upcoming: "badge-info", Ongoing: "badge-success", Completed: "badge-gray", Cancelled: "badge-danger" };
  statusBadge.className = "badge " + (statusClassMap[event.status] || "badge-gray");
  statusBadge.textContent = event.status + " \u00b7 " + event.category;

  document.getElementById("eventName").textContent = event.name;
  document.getElementById("eventPriceDisplay").textContent = formatCurrency(event.price) + " / ticket";
  document.getElementById("eventDescription").textContent = event.description;

  document.getElementById("eventMetaInfo").innerHTML = `
    <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>${formatDate(event.date)} &middot; ${event.time}</div>
    <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${event.location}</div>
  `;

  const available = getAvailableSeatsCount(event);
  const total = getTotalSeats(event);
  const seatsInfo = document.getElementById("eventSeatsInfo");
  const bookBtn = document.getElementById("bookNowBtn");

  if (event.status === "Cancelled") {
    seatsInfo.innerHTML = `<span style="color:var(--danger)">This event has been cancelled.</span>`;
    bookBtn.disabled = true;
    bookBtn.textContent = "Event Cancelled";
  } else if (event.status === "Completed") {
    seatsInfo.innerHTML = `<span style="color:var(--text-muted)">This event has already taken place.</span>`;
    bookBtn.disabled = true;
    bookBtn.textContent = "Event Completed";
  } else if (available === 0) {
    seatsInfo.innerHTML = `<span style="color:var(--danger)">Sold Out - no seats remaining.</span>`;
    bookBtn.disabled = true;
    bookBtn.textContent = "Sold Out";
  } else {
    seatsInfo.innerHTML = `<span style="color:var(--success)">${available} of ${total} seats available</span>`;
    bookBtn.disabled = false;
  }

  renderRelatedEvents(event);
}

/* ---------- RELATED EVENTS ---------- */
function relatedCardHTML(event) {
  const available = getAvailableSeatsCount(event);
  return `
    <a href="event-details.html?id=${event.id}" class="event-card">
      <div class="event-thumb">
        <img src="${event.image}" alt="${event.name}" onerror="handleImgError(this)">
        <span class="event-status ${event.status.toLowerCase()}">${event.status}</span>
      </div>
      <div class="event-body">
        <h3 class="event-name">${event.name}</h3>
        <div class="event-meta"><div>${formatDate(event.date)} &middot; ${event.location}</div></div>
      </div>
      <div class="event-footer">
        <span class="event-price">${formatCurrency(event.price)}</span>
        <span class="event-seats">${available === 0 ? "Sold Out" : available + " left"}</span>
      </div>
    </a>
  `;
}

function renderRelatedEvents(event) {
  const related = getEvents().filter(e => e.category === event.category && e.id !== event.id).slice(0, 3);
  const container = document.getElementById("relatedEvents");
  const section = document.getElementById("relatedSection");
  if (related.length === 0) {
    section.style.display = "none";
    return;
  }
  container.innerHTML = related.map(relatedCardHTML).join("");
}

/* ---------- SEAT MAP ---------- */
function renderSeatMap() {
  const booked = getBookedSeats(currentEvent.id);
  let html = "";

  for (let r = 0; r < currentEvent.rows; r++) {
    const rowLabel = String.fromCharCode(65 + r);
    html += `<div class="seat-row"><span class="seat-row-label">${rowLabel}</span>`;
    for (let s = 1; s <= currentEvent.seatsPerRow; s++) {
      const seatId = rowLabel + s;
      const isBooked = booked.includes(seatId);
      const isSelected = selectedSeats.includes(seatId);
      let cls = "seat";
      if (isBooked) cls += " booked";
      else if (isSelected) cls += " selected";
      html += `<div class="${cls}" data-seat="${seatId}">${s}</div>`;
    }
    html += `</div>`;
  }

  document.getElementById("seatMap").innerHTML = html;

  document.querySelectorAll(".seat").forEach(seatEl => {
    seatEl.addEventListener("click", () => {
      if (seatEl.classList.contains("booked")) return;
      const seatId = seatEl.dataset.seat;
      const idx = selectedSeats.indexOf(seatId);
      if (idx > -1) selectedSeats.splice(idx, 1);
      else selectedSeats.push(seatId);
      renderSeatMap();
      updateBookingSummary();
    });
  });
}

/* ---------- BOOKING SUMMARY (auto-calculated) ---------- */
function updateBookingSummary() {
  const ticketCount = selectedSeats.length;
  const subtotal = ticketCount * currentEvent.price;
  const discount = ticketCount >= 4 ? subtotal * 0.10 : 0;
  const tax = (subtotal - discount) * 0.05;
  const total = subtotal - discount + tax;

  document.getElementById("ticketCountDisplay").value =
    ticketCount + (ticketCount === 1 ? " seat selected" : " seats selected");
  document.getElementById("subtotalDisplay").textContent = formatCurrency(subtotal);
  document.getElementById("discountDisplay").textContent = "-" + formatCurrency(discount);
  document.getElementById("taxDisplay").textContent = formatCurrency(tax);
  document.getElementById("totalDisplay").textContent = formatCurrency(total);

  document.getElementById("confirmBookingBtn").disabled = ticketCount === 0;

  return { ticketCount, subtotal, discount, tax, total };
}

/* ---------- COUNTDOWN TIMER ---------- */
function updateCountdownDisplay() {
  const m = Math.floor(countdownSeconds / 60).toString().padStart(2, "0");
  const s = (countdownSeconds % 60).toString().padStart(2, "0");
  document.getElementById("countdownTime").textContent = m + ":" + s;

  const banner = document.getElementById("countdownBanner");
  if (countdownSeconds <= 60) banner.classList.add("danger");
  else banner.classList.remove("danger");
}

function startCountdown() {
  countdownSeconds = 600;
  updateCountdownDisplay();
  clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    countdownSeconds--;
    updateCountdownDisplay();
    if (countdownSeconds <= 0) {
      clearInterval(countdownInterval);
      expireBookingSession();
    }
  }, 1000);
}

function stopCountdown() {
  clearInterval(countdownInterval);
}

function expireBookingSession() {
  selectedSeats = [];
  document.getElementById("bookingSection").style.display = "none";
  showToast("Your booking session expired. Please select seats again.", "error");
}

/* ---------- FORM VALIDATION ---------- */
function setFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorEl = field.querySelector(".field-error");
  if (message) {
    field.classList.add("error");
    errorEl.textContent = message;
  } else {
    field.classList.remove("error");
    errorEl.textContent = "";
  }
}

function validateBookingForm(data) {
  let valid = true;

  if (data.fullName.trim().length < 2) {
    setFieldError("fieldName", "Please enter your full name.");
    valid = false;
  } else setFieldError("fieldName", "");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    setFieldError("fieldEmail", "Please enter a valid email address.");
    valid = false;
  } else setFieldError("fieldEmail", "");

  if (!/^[0-9+\-\s()]{7,}$/.test(data.phone)) {
    setFieldError("fieldPhone", "Please enter a valid phone number.");
    valid = false;
  } else setFieldError("fieldPhone", "");

  if (selectedSeats.length === 0) {
    setFieldError("fieldSeats", "Please select at least one seat.");
    valid = false;
  } else setFieldError("fieldSeats", "");

  return valid;
}

/* ---------- BOOKING FORM SUBMIT ---------- */
function initBookingForm() {
  const form = document.getElementById("bookingForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = {
      fullName: document.getElementById("custName").value,
      email: document.getElementById("custEmail").value,
      phone: document.getElementById("custPhone").value
    };

    if (!validateBookingForm(data)) return;

    const totals = updateBookingSummary();

    addBooking({
      eventId: currentEvent.id,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      tickets: totals.ticketCount,
      seats: selectedSeats.slice(),
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      totalAmount: totals.total
    });

    stopCountdown();
    showToast("Booking confirmed! Redirecting to My Bookings...", "success");

    setTimeout(() => {
      window.location.href = "my-bookings.html";
    }, 1400);
  });
}

/* ---------- "BOOK TICKETS" BUTTON ---------- */
function initBookNowButton() {
  document.getElementById("bookNowBtn").addEventListener("click", () => {
    selectedSeats = [];
    document.getElementById("bookingSection").style.display = "block";
    renderSeatMap();
    updateBookingSummary();
    startCountdown();
    document.getElementById("bookingSection").scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initEventsData();
  renderEventDetails();
  initBookNowButton();
  initBookingForm();
});
