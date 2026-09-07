/* =========================================================
   ADMIN DASHBOARD PAGE SCRIPT
   Loaded after data.js, ui.js, theme.js.
   ========================================================= */

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

function computeStats() {
  const events = getEvents();
  const bookings = getBookings();
  const customers = getCustomers();

  const activeBookings = bookings.filter(b => b.status !== "Cancelled");
  const cancelledBookings = bookings.filter(b => b.status === "Cancelled");

  const totalRevenue = activeBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const soldTickets = activeBookings.reduce((sum, b) => sum + b.tickets, 0);
  const availableSeats = events.reduce((sum, e) => sum + getAvailableSeatsCount(e), 0);

  return {
    totalEvents: events.length,
    totalBookings: bookings.length,
    totalCustomers: customers.length,
    totalRevenue,
    soldTickets,
    availableSeats,
    cancelledBookings: cancelledBookings.length
  };
}

function statCardHTML(iconSvg, colorClass, value, label) {
  return `
    <div class="card stat-card">
      <div class="stat-card-top">
        <div class="stat-icon ${colorClass}">${iconSvg}</div>
      </div>
      <div class="stat-value">${value}</div>
      <div class="stat-label">${label}</div>
    </div>
  `;
}

function renderStats() {
  const s = computeStats();
  const icons = {
    events: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    bookings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2l1.5 4h9L18 2"/><path d="M3.5 6h17l-1.6 12.5a2 2 0 0 1-2 1.5H7.1a2 2 0 0 1-2-1.5L3.5 6z"/></svg>',
    customers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
    revenue: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    tickets: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8z"/></svg>',
    seats: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 18v-4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M4 18h16v2H4z"/><path d="M6 12V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4"/></svg>',
    cancelled: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
  };

  const cards = [
    statCardHTML(icons.events, "blue", s.totalEvents, "Total Events"),
    statCardHTML(icons.bookings, "green", s.totalBookings, "Total Bookings"),
    statCardHTML(icons.customers, "cyan", s.totalCustomers, "Total Customers"),
    statCardHTML(icons.revenue, "green", formatCurrency(s.totalRevenue), "Total Revenue"),
    statCardHTML(icons.tickets, "blue", s.soldTickets, "Sold Tickets"),
    statCardHTML(icons.seats, "orange", s.availableSeats, "Available Seats"),
    statCardHTML(icons.cancelled, "red", s.cancelledBookings, "Cancelled Bookings")
  ];

  document.getElementById("statsGrid").innerHTML = cards.join("");
}

function bookingStatusClass(status) {
  const map = { Confirmed: "badge-success", Pending: "badge-warning", Cancelled: "badge-danger", Completed: "badge-gray" };
  return map[status] || "badge-gray";
}

function renderRecentBookings() {
  const bookings = getBookings()
    .slice()
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))
    .slice(0, 5);

  const body = document.getElementById("recentBookingsBody");

  if (bookings.length === 0) {
    body.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No bookings yet.</td></tr>`;
    return;
  }

  body.innerHTML = bookings
    .map(b => {
      const event = getEventById(b.eventId);
      return `
        <tr>
          <td>#${b.id}</td>
          <td>${b.fullName}</td>
          <td>${event ? event.name : "(deleted)"}</td>
          <td>${formatCurrency(b.totalAmount)}</td>
          <td><span class="badge ${bookingStatusClass(b.status)}">${b.status}</span></td>
        </tr>
      `;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  initEventsData();
  initAdminSidebar();
  renderStats();
  renderRecentBookings();
});
