/* =========================================================
   ADMIN BOOKINGS MANAGEMENT PAGE SCRIPT
   Loaded after data.js, ui.js, theme.js.
   ========================================================= */

const ADMIN_BOOK_PAGE_SIZE = 10;
let adminBookPage = 1;
let bookSortField = "bookingDate";
let bookSortDir = "desc";

function initAdminSidebar() {
  const sidebar = document.getElementById("adminSidebar");
  const overlay = document.getElementById("adminOverlay");
  const hamburger = document.getElementById("adminHamburger");

  hamburger.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("open");
  });
  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("open");
  });
}

function bookingStatusClass(status) {
  const map = { Confirmed: "badge-success", Pending: "badge-warning", Cancelled: "badge-danger", Completed: "badge-gray" };
  return map[status] || "badge-gray";
}

function populateEventFilter() {
  const events = getEvents();
  const select = document.getElementById("eventFilter");
  events.forEach(e => {
    const opt = document.createElement("option");
    opt.value = e.id;
    opt.textContent = e.name;
    select.appendChild(opt);
  });
}

function getFilteredSortedBookings() {
  const search = document.getElementById("searchInput").value.trim().toLowerCase();
  const eventFilter = document.getElementById("eventFilter").value;
  const statusFilter = document.getElementById("statusFilter").value;

  let list = getBookings().filter(b => {
    const matchesSearch = !search || b.fullName.toLowerCase().includes(search) || b.id.toLowerCase().includes(search);
    const matchesEvent = eventFilter === "all" || b.eventId === eventFilter;
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesEvent && matchesStatus;
  });

  list.sort((a, b) => {
    let valA = a[bookSortField];
    let valB = b[bookSortField];
    if (bookSortField === "bookingDate") { valA = new Date(valA).getTime(); valB = new Date(valB).getTime(); }
    if (valA < valB) return bookSortDir === "asc" ? -1 : 1;
    if (valA > valB) return bookSortDir === "asc" ? 1 : -1;
    return 0;
  });

  return list;
}

function bookingRowHTML(booking) {
  const event = getEventById(booking.eventId);
  return `
    <tr data-id="${booking.id}">
      <td>#${booking.id}</td>
      <td>${booking.fullName}</td>
      <td>${event ? event.name : "(deleted)"}</td>
      <td>${booking.tickets}</td>
      <td>${booking.seats.join(", ")}</td>
      <td>${formatCurrency(booking.totalAmount)}</td>
      <td>${formatDateTime(booking.bookingDate)}</td>
      <td>
        <select class="status-select" data-action="status" style="padding:6px 8px; border-radius:6px; border:1px solid var(--border); background:var(--surface); color:var(--text); font-size:12px;">
          <option value="Pending" ${booking.status === "Pending" ? "selected" : ""}>Pending</option>
          <option value="Confirmed" ${booking.status === "Confirmed" ? "selected" : ""}>Confirmed</option>
          <option value="Completed" ${booking.status === "Completed" ? "selected" : ""}>Completed</option>
          <option value="Cancelled" ${booking.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
        </select>
      </td>
    </tr>
  `;
}

function renderBookingsTable() {
  const filtered = getFilteredSortedBookings();
  const totalPages = Math.max(1, Math.ceil(filtered.length / ADMIN_BOOK_PAGE_SIZE));
  if (adminBookPage > totalPages) adminBookPage = totalPages;

  const start = (adminBookPage - 1) * ADMIN_BOOK_PAGE_SIZE;
  const pageItems = filtered.slice(start, start + ADMIN_BOOK_PAGE_SIZE);

  document.getElementById("filtersCount").textContent = `Showing ${filtered.length} of ${getBookings().length} bookings`;

  const body = document.getElementById("bookingsTableBody");
  body.innerHTML = pageItems.length
    ? pageItems.map(bookingRowHTML).join("")
    : `<tr><td colspan="8" style="text-align:center; color:var(--text-muted); padding:30px;">No bookings found.</td></tr>`;

  renderPagination(filtered.length);
  updateSortArrows();
}

function renderPagination(totalItems) {
  const totalPages = Math.max(1, Math.ceil(totalItems / ADMIN_BOOK_PAGE_SIZE));
  const container = document.getElementById("pagination");

  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  let html = `<button class="page-btn" data-page="prev" ${adminBookPage === 1 ? "disabled" : ""}>&laquo;</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === adminBookPage ? "active" : ""}" data-page="${i}">${i}</button>`;
  }
  html += `<button class="page-btn" data-page="next" ${adminBookPage === totalPages ? "disabled" : ""}>&raquo;</button>`;
  container.innerHTML = html;

  container.querySelectorAll(".page-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.dataset.page;
      if (val === "prev") adminBookPage = Math.max(1, adminBookPage - 1);
      else if (val === "next") adminBookPage = Math.min(totalPages, adminBookPage + 1);
      else adminBookPage = Number(val);
      renderBookingsTable();
    });
  });
}

function updateSortArrows() {
  document.querySelectorAll("th[data-sort]").forEach(th => {
    th.classList.toggle("sorted", th.dataset.sort === bookSortField);
    const arrow = th.querySelector(".sort-arrow");
    if (th.dataset.sort === bookSortField) {
      arrow.innerHTML = bookSortDir === "asc" ? "&#9652;" : "&#9662;";
    } else {
      arrow.innerHTML = "&#9662;";
    }
  });
}

function initSortHeaders() {
  document.querySelectorAll("th[data-sort]").forEach(th => {
    th.addEventListener("click", () => {
      const field = th.dataset.sort;
      if (bookSortField === field) bookSortDir = bookSortDir === "asc" ? "desc" : "asc";
      else { bookSortField = field; bookSortDir = "asc"; }
      renderBookingsTable();
    });
  });
}

function initTableActions() {
  document.getElementById("bookingsTableBody").addEventListener("change", (e) => {
    if (e.target.dataset.action === "status") {
      const row = e.target.closest("tr[data-id]");
      updateBookingStatus(row.dataset.id, e.target.value);
      showToast("Booking status updated.", "success");
      renderBookingsTable();
    }
  });
}

function initFilters() {
  document.getElementById("searchInput").addEventListener("input", () => { adminBookPage = 1; renderBookingsTable(); });
  document.getElementById("eventFilter").addEventListener("change", () => { adminBookPage = 1; renderBookingsTable(); });
  document.getElementById("statusFilter").addEventListener("change", () => { adminBookPage = 1; renderBookingsTable(); });
}

document.addEventListener("DOMContentLoaded", () => {
  initEventsData();
  initAdminSidebar();
  populateEventFilter();
  initFilters();
  initSortHeaders();
  initTableActions();
  renderBookingsTable();
});

