/* =========================================================
   ADMIN REPORTS PAGE SCRIPT
   Loaded after data.js, ui.js, theme.js.
   ========================================================= */


/* ---------- SIDEBAR ---------- */

function initAdminReportsSidebar() {

  const sidebar =
    document.getElementById("adminSidebar");

  const overlay =
    document.getElementById("adminOverlay");

  const hamburger =
    document.getElementById("adminHamburger");

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


/* ---------- ESCAPE HTML ---------- */

function escapeReportHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* ---------- NUMBER HELPERS ---------- */

function getActiveBookings() {

  return getBookings().filter(
    booking => booking.status !== "Cancelled"
  );

}


function getBookingRevenue(bookings) {

  return bookings.reduce(
    (total, booking) => {
      return total + Number(booking.totalAmount || 0);
    },
    0
  );

}


function getBookingSeatCount(booking) {

  if (!Array.isArray(booking.seats)) {
    return 0;
  }

  return booking.seats.length;
}


/* ---------- SUMMARY CARDS ---------- */

function renderReportSummary() {

  const events =
    getEvents();

  const bookings =
    getActiveBookings();

  const customers =
    getCustomers();

  const revenue =
    getBookingRevenue(bookings);


  const totalEvents =
    document.getElementById("totalEvents");

  const totalBookings =
    document.getElementById("totalBookings");

  const totalCustomers =
    document.getElementById("totalCustomers");

  const totalRevenue =
    document.getElementById("totalRevenue");


  if (totalEvents) {
    totalEvents.textContent =
      events.length;
  }


  if (totalBookings) {
    totalBookings.textContent =
      bookings.length;
  }


  if (totalCustomers) {
    totalCustomers.textContent =
      customers.length;
  }


  if (totalRevenue) {
    totalRevenue.textContent =
      formatCurrency(revenue);
  }

}


/* ---------- EVENT PERFORMANCE ---------- */

function renderEventPerformance() {

  const body =
    document.getElementById(
      "eventPerformanceBody"
    );

  if (!body) return;


  const events =
    getEvents();

  const bookings =
    getBookings();


  if (!events.length) {

    body.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-report">
            No events found.
          </div>
        </td>
      </tr>
    `;

    return;
  }


  const rows =
    events.map(event => {

      const eventBookings =
        bookings.filter(
          booking =>
            booking.eventId === event.id &&
            booking.status !== "Cancelled"
        );


      const bookingCount =
        eventBookings.length;


      const seatsSold =
        eventBookings.reduce(
          (total, booking) => {
            return total + getBookingSeatCount(booking);
          },
          0
        );


      const revenue =
        getBookingRevenue(eventBookings);


      const availableSeats =
        Math.max(
          0,
          getTotalSeats(event) - seatsSold
        );


      return `
        <tr>

          <td>
            <div class="report-event-name">
              ${escapeReportHTML(event.name)}
            </div>

            <div class="report-event-category">
              ${escapeReportHTML(event.category || "—")}
            </div>
          </td>

          <td>
            <span class="report-number">
              ${bookingCount}
            </span>
          </td>

          <td>
            <span class="report-number">
              ${seatsSold}
            </span>
          </td>

          <td>
            <span class="report-money">
              ${formatCurrency(revenue)}
            </span>
          </td>

          <td>
            <span class="report-number">
              ${availableSeats}
            </span>
          </td>

        </tr>
      `;

    });


  body.innerHTML =
    rows.join("");

}


/* ---------- BOOKING STATUS ---------- */

function renderBookingStatusReport() {

  const container =
    document.getElementById(
      "bookingStatusList"
    );

  if (!container) return;


  const bookings =
    getBookings();


  const statuses = [
    {
      name: "Confirmed",
      className: "confirmed"
    },
    {
      name: "Pending",
      className: "pending"
    },
    {
      name: "Completed",
      className: "completed"
    },
    {
      name: "Cancelled",
      className: "cancelled"
    }
  ];


  const total =
    bookings.length;


  if (!total) {

    container.innerHTML = `
      <div class="empty-report">
        No bookings found.
      </div>
    `;

    return;
  }


  container.innerHTML =
    statuses.map(status => {

      const count =
        bookings.filter(
          booking =>
            booking.status === status.name
        ).length;


      const percentage =
        total
          ? Math.round((count / total) * 100)
          : 0;


      return `
        <div>

          <div class="status-row">

            <div class="status-label">

              <span
                class="status-dot ${status.className}"
              ></span>

              ${status.name}

            </div>

            <div class="status-value">
              ${count}
            </div>

          </div>


          <div class="report-progress">

            <div
              class="report-progress-bar"
              style="width:${percentage}%"
            ></div>

          </div>

        </div>
      `;

    }).join("");

}


/* ---------- RECENT BOOKINGS ---------- */

function renderRecentBookings() {

  const body =
    document.getElementById(
      "recentBookingsBody"
    );

  if (!body) return;


  const bookings =
    getBookings()
      .slice()
      .sort((a, b) => {

        const dateA =
          new Date(a.bookingDate || 0).getTime();

        const dateB =
          new Date(b.bookingDate || 0).getTime();

        return dateB - dateA;

      })
      .slice(0, 10);


  if (!bookings.length) {

    body.innerHTML = `
      <tr>

        <td colspan="6">

          <div class="empty-report">
            No bookings found.
          </div>

        </td>

      </tr>
    `;

    return;
  }


  body.innerHTML =
    bookings.map(booking => {

      const event =
        getEventById(booking.eventId);

      const eventName =
        event
          ? event.name
          : "Unknown Event";


      const status =
        booking.status || "Pending";


      const statusClass =
        String(status).toLowerCase();


      return `
        <tr>

          <td>
            <strong>
              ${escapeReportHTML(booking.id)}
            </strong>
          </td>


          <td>

            <div class="report-event-name">
              ${escapeReportHTML(
                booking.fullName || "Unknown Customer"
              )}
            </div>

            <div class="report-event-category">
              ${escapeReportHTML(
                booking.email || "—"
              )}
            </div>

          </td>


          <td>
            ${escapeReportHTML(eventName)}
          </td>


          <td>
            ${
              booking.bookingDate
                ? escapeReportHTML(
                    formatDateTime(
                      booking.bookingDate
                    )
                  )
                : "—"
            }
          </td>


          <td>
            <span class="report-money">
              ${formatCurrency(
                booking.totalAmount || 0
              )}
            </span>
          </td>


          <td>

            <span class="badge ${
              statusClass === "confirmed"
                ? "badge-success"
                : statusClass === "cancelled"
                  ? "badge-danger"
                  : statusClass === "completed"
                    ? "badge-gray"
                    : "badge-warning"
            }">
              ${escapeReportHTML(status)}
            </span>

          </td>

        </tr>
      `;

    }).join("");

}


/* ---------- REFRESH REPORTS ---------- */

function renderReports() {

  renderReportSummary();

  renderEventPerformance();

  renderBookingStatusReport();

  renderRecentBookings();

}


/* ---------- INITIALIZE ---------- */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initEventsData();

    /*
      Keep customer data synchronized
      with the current bookings.
    */
    rebuildCustomersFromBookings();

    initAdminReportsSidebar();

    renderReports();

  }
);
