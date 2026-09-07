/* =========================================================
   ADMIN REPORTS PAGE SCRIPT
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

function reportMiniCard(value, label) {
  return `
    <div class="card" style="padding:18px; text-align:center;">
      <div style="font-size:22px; font-weight:800;">${value}</div>
      <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">${label}</div>
    </div>
  `;
}

function computeReportData() {
  const bookings = getBookings();
  const events = getEvents();
  const activeBookings = bookings.filter(b => b.status !== "Cancelled");
  const confirmedBookings = bookings.filter(b => b.status === "Confirmed" || b.status === "Completed");
  const cancelledBookings = bookings.filter(b => b.status === "Cancelled");

  const totalRevenue = activeBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalTicketsSold = activeBookings.reduce((sum, b) => sum + b.tickets, 0);
  const avgBookingValue = activeBookings.length ? totalRevenue / activeBookings.length : 0;

  const revenueByEvent = {};
  const revenueByCategory = {};

  activeBookings.forEach(b => {
    const event = getEventById(b.eventId);
    if (!event) return;
    revenueByEvent[event.name] = (revenueByEvent[event.name] || 0) + b.tickets;
    revenueByCategory[event.category] = (revenueByCategory[event.category] || 0) + b.tickets;
  });

  let popularEvent = "N/A";
  let maxEventTickets = 0;
  Object.entries(revenueByEvent).forEach(([name, tickets]) => {
    if (tickets > maxEventTickets) { maxEventTickets = tickets; popularEvent = name; }
  });

  let popularCategory = "N/A";
  let maxCatTickets = 0;
  Object.entries(revenueByCategory).forEach(([cat, tickets]) => {
    if (tickets > maxCatTickets) { maxCatTickets = tickets; popularCategory = cat; }
  });

  return {
    totalRevenue,
    totalBookings: bookings.length,
    totalTicketsSold,
    avgBookingValue,
    popularEvent,
    popularCategory,
    confirmedBookings: confirmedBookings.length,
    cancelledBookings: cancelledBookings.length
  };
}

function renderReport() {
  const r = computeReportData();

  document.getElementById("reportGeneratedOn").textContent = "Generated on " + formatDateTime(new Date().toISOString());

  const cards = [
    reportMiniCard(formatCurrency(r.totalRevenue), "Total Revenue"),
    reportMiniCard(r.totalBookings, "Total Bookings"),
    reportMiniCard(r.totalTicketsSold, "Total Tickets Sold"),
    reportMiniCard(formatCurrency(r.avgBookingValue), "Average Booking Value")
  ];
  document.getElementById("reportGrid").innerHTML = cards.join("");

  document.getElementById("repPopularEvent").textContent = r.popularEvent;
  document.getElementById("repPopularCategory").textContent = r.popularCategory;
  document.getElementById("repConfirmed").textContent = r.confirmedBookings;
  document.getElementById("repCancelled").textContent = r.cancelledBookings;
  document.getElementById("repAvgValue").textContent = formatCurrency(r.avgBookingValue);
}

function initPrintButton() {
  document.getElementById("printReportBtn").addEventListener("click", () => {
    window.print();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initEventsData();
  initAdminSidebar();
  renderReport();
  initPrintButton();
});
