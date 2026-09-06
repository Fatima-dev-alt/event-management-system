/* =========================================================
   ADMIN BOOKINGS MANAGEMENT PAGE SCRIPT
   Loaded after data.js, ui.js, theme.js.
   ========================================================= */

const ADMIN_BOOKING_PAGE_SIZE = 10;

let bookingCurrentPage = 1;
let bookingSortField = "bookingDate";
let bookingSortDir = "desc";


/* ---------- SIDEBAR ---------- */

function initAdminBookingSidebar() {
  const sidebar = document.getElementById("adminSidebar");
  const overlay = document.getElementById("adminOverlay");
  const hamburger = document.getElementById("adminHamburger");

  if (!sidebar || !overlay || !hamburger) return;

  hamburger.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("open");
  });

  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("open");
  });
}


/* ---------- STATUS ---------- */

function bookingStatusClass(status) {
  const value = String(status || "").toLowerCase();

  if (value === "confirmed") return "confirmed";
  if (value === "pending") return "pending";
  if (value === "cancelled") return "cancelled";
  if (value === "completed") return "completed";

  return "pending";
}


/* ---------- EVENT NAME ---------- */

function getBookingEventName(booking) {
  const event = getEventById(booking.eventId);

  if (event) {
    return event.name;
  }

  return "Unknown Event";
}


/* ---------- SEATS ---------- */

function getBookingSeatsText(booking) {
  if (!booking.seats) {
    return "No seats";
  }

  if (Array.isArray(booking.seats)) {
    if (booking.seats.length === 0) {
      return "No seats";
    }

    return booking.seats.join(", ");
  }

  return String(booking.seats);
}


/* ---------- EVENT FILTER ---------- */

function populateBookingEventFilter() {
  const select = document.getElementById("eventFilter");

  if (!select) return;

  const currentValue = select.value;

  select.innerHTML = `<option value="all">All Events</option>`;

  const events = getEvents();

  events.forEach(event => {
    const option = document.createElement("option");

    option.value = event.id;
    option.textContent = event.name;

    select.appendChild(option);
  });

  if ([...select.options].some(option => option.value === currentValue)) {
    select.value = currentValue;
  }
}


/* ---------- FILTER + SORT ---------- */

function getFilteredSortedBookings() {
  const search = document
    .getElementById("searchInput")
    .value
    .trim()
    .toLowerCase();

  const eventFilter = document.getElementById("eventFilter").value;
  const statusFilter = document.getElementById("statusFilter").value;

  let bookings = getBookings().filter(booking => {

    const eventName = getBookingEventName(booking).toLowerCase();

    const matchesSearch =
      !search ||
      String(booking.id || "").toLowerCase().includes(search) ||
      String(booking.fullName || "").toLowerCase().includes(search) ||
      String(booking.email || "").toLowerCase().includes(search) ||
      eventName.includes(search);

    const matchesEvent =
      eventFilter === "all" ||
      booking.eventId === eventFilter;

    const matchesStatus =
      statusFilter === "all" ||
      booking.status === statusFilter;

    return matchesSearch && matchesEvent && matchesStatus;
  });


  bookings.sort((a, b) => {

    let valueA;
    let valueB;

    if (bookingSortField === "eventId") {
      valueA = getBookingEventName(a);
      valueB = getBookingEventName(b);
    } else {
      valueA = a[bookingSortField];
      valueB = b[bookingSortField];
    }

    if (bookingSortField === "bookingDate") {
      valueA = new Date(valueA).getTime();
      valueB = new Date(valueB).getTime();
    }

    if (typeof valueA === "string") {
      valueA = valueA.toLowerCase();
    }

    if (typeof valueB === "string") {
      valueB = valueB.toLowerCase();
    }

    if (valueA < valueB) {
      return bookingSortDir === "asc" ? -1 : 1;
    }

    if (valueA > valueB) {
      return bookingSortDir === "asc" ? 1 : -1;
    }

    return 0;
  });

  return bookings;
}


/* ---------- BOOKING ROW ---------- */

function bookingRowHTML(booking) {

  const eventName = getBookingEventName(booking);
  const seats = getBookingSeatsText(booking);
  const statusClass = bookingStatusClass(booking.status);

  return `
    <tr data-id="${booking.id}">

      <td>
        <span class="booking-id">
          ${booking.id}
        </span>
      </td>

      <td>
        <div class="customer-cell">
          <strong>${booking.fullName || "Unknown Customer"}</strong>
          <span>${booking.email || ""}</span>
        </div>
      </td>

      <td>
        <div style="font-weight:700;">
          ${eventName}
        </div>

        <div class="seat-list">
          Seats: ${seats}
        </div>
      </td>

      <td>
        ${booking.bookingDate
          ? formatDateTime(booking.bookingDate)
          : "—"
        }
      </td>

      <td>
        <strong>
          ${formatCurrency(booking.totalAmount || 0)}
        </strong>
      </td>

      <td>
        <select
          class="booking-status ${statusClass}"
          data-action="status"
          title="Change booking status"
        >
          <option value="Confirmed"
            ${booking.status === "Confirmed" ? "selected" : ""}>
            Confirmed
          </option>

          <option value="Pending"
            ${booking.status === "Pending" ? "selected" : ""}>
            Pending
          </option>

          <option value="Completed"
            ${booking.status === "Completed" ? "selected" : ""}>
            Completed
          </option>

          <option value="Cancelled"
            ${booking.status === "Cancelled" ? "selected" : ""}>
            Cancelled
          </option>
        </select>
      </td>

      <td class="table-actions">

        <button
          class="btn btn-outline btn-icon"
          data-action="view"
          title="View booking"
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>

      </td>

    </tr>
  `;
}


/* ---------- RENDER TABLE ---------- */

function renderBookingsTable() {

  const filtered = getFilteredSortedBookings();

  const totalItems = filtered.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / ADMIN_BOOKING_PAGE_SIZE)
  );

  if (bookingCurrentPage > totalPages) {
    bookingCurrentPage = totalPages;
  }

  const start =
    (bookingCurrentPage - 1) * ADMIN_BOOKING_PAGE_SIZE;

  const pageItems =
    filtered.slice(
      start,
      start + ADMIN_BOOKING_PAGE_SIZE
    );

  const body =
    document.getElementById("bookingsTableBody");

  if (!body) return;

  body.innerHTML = pageItems.length
    ? pageItems.map(bookingRowHTML).join("")
    : `
      <tr>
        <td
          colspan="7"
          style="
            text-align:center;
            color:var(--text-muted);
            padding:40px;
          "
        >
          No bookings found.
        </td>
      </tr>
    `;

  const count = document.getElementById("bookingCount");

  if (count) {
    count.textContent =
      `${totalItems} booking${totalItems === 1 ? "" : "s"}`;
  }

  renderBookingPagination(totalItems);
  updateBookingSortArrows();
}


/* ---------- PAGINATION ---------- */

function renderBookingPagination(totalItems) {

  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / ADMIN_BOOKING_PAGE_SIZE)
  );

  const container =
    document.getElementById("pagination");

  if (!container) return;

  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  let html = `
    <button
      class="page-btn"
      data-page="prev"
      ${bookingCurrentPage === 1 ? "disabled" : ""}
    >
      &laquo;
    </button>
  `;


  for (let i = 1; i <= totalPages; i++) {

    html += `
      <button
        class="page-btn ${i === bookingCurrentPage ? "active" : ""}"
        data-page="${i}"
      >
        ${i}
      </button>
    `;
  }


  html += `
    <button
      class="page-btn"
      data-page="next"
      ${bookingCurrentPage === totalPages ? "disabled" : ""}
    >
      &raquo;
    </button>
  `;

  container.innerHTML = html;


  container
    .querySelectorAll(".page-btn")
    .forEach(button => {

      button.addEventListener("click", () => {

        const value = button.dataset.page;

        if (value === "prev") {

          bookingCurrentPage =
            Math.max(1, bookingCurrentPage - 1);

        } else if (value === "next") {

          bookingCurrentPage =
            Math.min(totalPages, bookingCurrentPage + 1);

        } else {

          bookingCurrentPage = Number(value);
        }

        renderBookingsTable();
      });
    });
}


/* ---------- SORT ARROWS ---------- */

function updateBookingSortArrows() {

  document
    .querySelectorAll("th[data-sort]")
    .forEach(th => {

      const arrow =
        th.querySelector(".sort-arrow");

      if (!arrow) return;

      th.classList.toggle(
        "sorted",
        th.dataset.sort === bookingSortField
      );

      if (th.dataset.sort === bookingSortField) {

        arrow.innerHTML =
          bookingSortDir === "asc"
            ? "&#9652;"
            : "&#9662;";

      } else {

        arrow.innerHTML = "&#9662;";
      }
    });
}


/* ---------- SORT HEADERS ---------- */

function initBookingSortHeaders() {

  document
    .querySelectorAll("th[data-sort]")
    .forEach(th => {

      th.addEventListener("click", () => {

        const field = th.dataset.sort;

        if (bookingSortField === field) {

          bookingSortDir =
            bookingSortDir === "asc"
              ? "desc"
              : "asc";

        } else {

          bookingSortField = field;
          bookingSortDir = "asc";
        }

        renderBookingsTable();
      });
    });
}


/* ---------- VIEW BOOKING MODAL ---------- */

function viewBookingDetails(booking) {

  if (!booking) return;

  const event = getEventById(booking.eventId);

  const eventName =
    event ? event.name : "Unknown Event";

  const seats =
    getBookingSeatsText(booking);

  const bodyHTML = `

    <button
      class="modal-close"
      id="bookingModalClose"
      type="button"
      style="float:right;"
    >
      <svg viewBox="0 0 24 24"
           fill="none"
           stroke="currentColor"
           stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>

    <div class="modal-header">
      <h3>Booking Details</h3>
    </div>

    <div style="
      display:flex;
      flex-direction:column;
      gap:12px;
    ">

      <div>
        <div style="
          font-size:12px;
          color:var(--text-muted);
        ">
          Booking ID
        </div>

        <strong>${booking.id}</strong>
      </div>


      <div>
        <div style="
          font-size:12px;
          color:var(--text-muted);
        ">
          Customer
        </div>

        <strong>${booking.fullName || "—"}</strong>

        <div style="
          font-size:13px;
          color:var(--text-muted);
        ">
          ${booking.email || "—"}
        </div>

        <div style="
          font-size:13px;
          color:var(--text-muted);
        ">
          ${booking.phone || "—"}
        </div>
      </div>


      <div>
        <div style="
          font-size:12px;
          color:var(--text-muted);
        ">
          Event
        </div>

        <strong>${eventName}</strong>
      </div>


      <div>
        <div style="
          font-size:12px;
          color:var(--text-muted);
        ">
          Seats
        </div>

        <strong>${seats}</strong>
      </div>


      <div>
        <div style="
          font-size:12px;
          color:var(--text-muted);
        ">
          Total Amount
        </div>

        <strong style="
          font-size:18px;
          color:var(--primary);
        ">
          ${formatCurrency(booking.totalAmount || 0)}
        </strong>
      </div>


      <div>
        <div style="
          font-size:12px;
          color:var(--text-muted);
        ">
          Booking Date
        </div>

        <strong>
          ${booking.bookingDate
            ? formatDateTime(booking.bookingDate)
            : "—"
          }
        </strong>
      </div>


      <div>
        <div style="
          font-size:12px;
          color:var(--text-muted);
        ">
          Status
        </div>

        <span class="badge ${
          bookingStatusClass(booking.status) === "confirmed"
            ? "badge-success"
            : bookingStatusClass(booking.status) === "cancelled"
              ? "badge-danger"
              : bookingStatusClass(booking.status) === "completed"
                ? "badge-gray"
                : "badge-warning"
        }">
          ${booking.status || "Pending"}
        </span>
      </div>

    </div>

    <div class="modal-footer">

      <button
        class="btn btn-outline"
        id="bookingModalCancel"
        type="button"
      >
        Close
      </button>

    </div>
  `;

  openModal(bodyHTML);

  document.getElementById("bookingModalClose").onclick =
    closeModal;

  document.getElementById("bookingModalCancel").onclick =
    closeModal;
}


/* ---------- TABLE ACTIONS ---------- */

function initBookingTableActions() {

  const body =
    document.getElementById("bookingsTableBody");

  if (!body) return;


  body.addEventListener("click", e => {

    const row =
      e.target.closest("tr[data-id]");

    if (!row) return;

    const id = row.dataset.id;

    if (
      e.target.closest('[data-action="view"]')
    ) {

      const booking =
        getBookingById(id);

      viewBookingDetails(booking);
    }
  });


  body.addEventListener("change", e => {

    if (
      e.target.dataset.action !== "status"
    ) {
      return;
    }

    const row =
      e.target.closest("tr[data-id]");

    if (!row) return;

    const id = row.dataset.id;
    const newStatus = e.target.value;

    updateBookingStatus(id, newStatus);

    showToast(
      "Booking status updated.",
      "success"
    );

    renderBookingsTable();
  });
}


/* ---------- FILTERS ---------- */

function initBookingFilters() {

  const search =
    document.getElementById("searchInput");

  const eventFilter =
    document.getElementById("eventFilter");

  const statusFilter =
    document.getElementById("statusFilter");


  search.addEventListener("input", () => {

    bookingCurrentPage = 1;
    renderBookingsTable();
  });


  eventFilter.addEventListener("change", () => {

    bookingCurrentPage = 1;
    renderBookingsTable();
  });


  statusFilter.addEventListener("change", () => {

    bookingCurrentPage = 1;
    renderBookingsTable();
  });
}


/* ---------- INITIALIZE ---------- */

document.addEventListener("DOMContentLoaded", () => {

  initEventsData();

  initAdminBookingSidebar();

  populateBookingEventFilter();

  initBookingFilters();

  initBookingSortHeaders();

  initBookingTableActions();

  renderBookingsTable();

});
