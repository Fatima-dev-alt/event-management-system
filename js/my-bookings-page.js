/* =========================================================
   MY BOOKINGS PAGE SCRIPT
   Loaded after data.js, ui.js, theme.js.
   ========================================================= */

function bookingStatusClass(status) {
  const map = { Confirmed: "badge-success", Pending: "badge-warning", Cancelled: "badge-danger", Completed: "badge-gray" };
  return map[status] || "badge-gray";
}

function bookingCardHTML(booking) {
  const event = getEventById(booking.eventId);
  const eventName = event ? event.name : "(Event no longer available)";
  const canCancel = booking.status !== "Cancelled" && booking.status !== "Completed";

  return `
    <div class="card panel" style="margin-bottom:16px;" data-id="${booking.id}">
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; margin-bottom:14px;">
        <div>
          <div style="font-weight:800; font-size:15px;">#${booking.id}</div>
          <div style="font-size:13px; color:var(--text-muted);">Booked on ${formatDateTime(booking.bookingDate)}</div>
        </div>
        <span class="badge ${bookingStatusClass(booking.status)}">${booking.status}</span>
      </div>

      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:14px; margin-bottom:14px;">
        <div>
          <div style="font-size:12px; color:var(--text-muted);">Event</div>
          <div style="font-weight:700;">${eventName}</div>
        </div>
        <div>
          <div style="font-size:12px; color:var(--text-muted);">Seats</div>
          <div style="font-weight:700;">${booking.seats.join(", ")}</div>
        </div>
        <div>
          <div style="font-size:12px; color:var(--text-muted);">Tickets</div>
          <div style="font-weight:700;">${booking.tickets}</div>
        </div>
        <div>
          <div style="font-size:12px; color:var(--text-muted);">Total Amount</div>
          <div style="font-weight:700;">${formatCurrency(booking.totalAmount)}</div>
        </div>
      </div>

      ${canCancel ? `<button class="btn btn-danger btn-sm" data-action="cancel" type="button">Cancel Booking</button>` : ""}
    </div>
  `;
}

function renderBookings() {
  const statusFilter = document.getElementById("statusFilter").value;
  let bookings = getBookings().slice().sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  if (statusFilter !== "all") {
    bookings = bookings.filter(b => b.status === statusFilter);
  }

  const list = document.getElementById("bookingsList");
  const empty = document.getElementById("emptyState");
  const countEl = document.getElementById("filtersCount");

  countEl.textContent = `Showing ${bookings.length} of ${getBookings().length} bookings`;

  if (bookings.length === 0) {
    list.innerHTML = "";
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";
  list.innerHTML = bookings.map(bookingCardHTML).join("");
}

function initBookingActions() {
  document.getElementById("bookingsList").addEventListener("click", (e) => {
    const btn = e.target.closest('button[data-action="cancel"]');
    if (!btn) return;

    const card = e.target.closest("[data-id]");
    const bookingId = card.dataset.id;

    showConfirm({
      title: "Cancel this booking?",
      message: "This will free up the selected seats and cannot be undone.",
      confirmText: "Yes, Cancel Booking",
      cancelText: "Keep Booking",
      danger: true,
      onConfirm: () => {
        updateBookingStatus(bookingId, "Cancelled");
        showToast("Booking cancelled.", "info");
        renderBookings();
      }
    });
  });

  document.getElementById("statusFilter").addEventListener("change", renderBookings);
}

document.addEventListener("DOMContentLoaded", () => {
  initEventsData();
  renderBookings();
  initBookingActions();
});
