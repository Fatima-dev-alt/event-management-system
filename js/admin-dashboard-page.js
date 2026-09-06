/* =========================================================
   ADMIN DASHBOARD
   Advanced Event Management System
   Step 9
   ========================================================= */

(function () {
  "use strict";

  /* ---------- DOM ---------- */

  const totalEventsEl = document.getElementById("totalEvents");
  const totalBookingsEl = document.getElementById("totalBookings");
  const totalCustomersEl = document.getElementById("totalCustomers");
  const totalRevenueEl = document.getElementById("totalRevenue");
  const soldTicketsEl = document.getElementById("soldTickets");
  const availableSeatsEl = document.getElementById("availableSeats");
  const cancelledBookingsEl = document.getElementById("cancelledBookings");

  const recentBookingsBody =
    document.getElementById("recentBookingsBody");

  const eventStatusList =
    document.getElementById("eventStatusList");

  const dashboardDate =
    document.getElementById("dashboardDate");

  const sidebar =
    document.getElementById("adminSidebar");

  const overlay =
    document.getElementById("adminOverlay");

  const hamburger =
    document.getElementById("adminHamburger");


  /* ---------- INITIALIZE ---------- */

  document.addEventListener("DOMContentLoaded", function () {
    initEventsData();
    initDashboard();
    initAdminNavigation();
  });


  function initDashboard() {
    renderCurrentDate();
    renderStatistics();
    renderRecentBookings();
    renderEventOverview();
  }


  /* =====================================================
     STATISTICS
     ====================================================== */

  function renderStatistics() {
    const events = getEvents();
    const bookings = getBookings();
    const customers = getCustomers();

    const confirmedBookings = bookings.filter(function (booking) {
      return booking.status === "Confirmed";
    });

    const cancelledBookings = bookings.filter(function (booking) {
      return booking.status === "Cancelled";
    });


    /* Total events */
    totalEventsEl.textContent =
      formatNumber(events.length);


    /* Total bookings */
    totalBookingsEl.textContent =
      formatNumber(bookings.length);


    /* Total customers */
    totalCustomersEl.textContent =
      formatNumber(customers.length);


    /* Total revenue */
    const totalRevenue = confirmedBookings.reduce(
      function (total, booking) {
        return total + Number(booking.totalAmount || 0);
      },
      0
    );

    totalRevenueEl.textContent =
      formatCurrency(totalRevenue);


    /* Sold tickets */
    const soldTickets = confirmedBookings.reduce(
      function (total, booking) {
        const seats = Array.isArray(booking.seats)
          ? booking.seats.length
          : 0;

        return total + seats;
      },
      0
    );

    soldTicketsEl.textContent =
      formatNumber(soldTickets);


    /* Available seats */
    const availableSeats = events.reduce(
      function (total, event) {
        return total + getAvailableSeatsCount(event);
      },
      0
    );

    availableSeatsEl.textContent =
      formatNumber(availableSeats);


    /* Cancelled bookings */
    cancelledBookingsEl.textContent =
      formatNumber(cancelledBookings.length);
  }


  /* =====================================================
     RECENT BOOKINGS
     ====================================================== */

  function renderRecentBookings() {
    const bookings = getBookings();
    const events = getEvents();

    if (bookings.length === 0) {
      recentBookingsBody.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="dashboard-empty dashboard-empty-large">
              <div class="empty-icon">▤</div>
              <strong>No bookings yet</strong>
              <span>
                Booking records will appear here once customers
                make bookings.
              </span>
            </div>
          </td>
        </tr>
      `;

      return;
    }


    const recentBookings = bookings
      .slice()
      .sort(function (a, b) {
        return new Date(b.bookingDate) -
          new Date(a.bookingDate);
      })
      .slice(0, 5);


    recentBookingsBody.innerHTML =
      recentBookings.map(function (booking) {
        return createBookingRow(booking, events);
      }).join("");
  }


  function createBookingRow(booking, events) {
    const bookingId =
      booking.id || "—";

    const customerName =
      booking.fullName || "Unknown Customer";

    const event =
      events.find(function (item) {
        return item.id === booking.eventId;
      });

    const eventName =
      event ? event.name : "Unknown Event";

    const amount =
      Number(booking.totalAmount || 0);

    const status =
      booking.status || "Pending";

    const statusClass =
      getStatusClass(status);

    const initials =
      getInitials(customerName);


    return `
      <tr>

        <td>
          <span class="booking-id">
            #${escapeHTML(bookingId)}
          </span>
        </td>

        <td>
          <div class="customer-cell">

            <div class="customer-avatar">
              ${escapeHTML(initials)}
            </div>

            <span>
              ${escapeHTML(customerName)}
            </span>

          </div>
        </td>

        <td>
          <span class="event-name">
            ${escapeHTML(eventName)}
          </span>
        </td>

        <td>
          <strong>
            ${escapeHTML(formatCurrency(amount))}
          </strong>
        </td>

        <td>
          <span class="status-badge ${statusClass}">
            ${escapeHTML(status)}
          </span>
        </td>

      </tr>
    `;
  }


  /* =====================================================
     EVENT OVERVIEW
     ====================================================== */

  function renderEventOverview() {
    const events = getEvents();

    if (events.length === 0) {
      eventStatusList.innerHTML = `
        <div class="dashboard-empty">
          <strong>No events available</strong>
          <span>
            Add events from the Events section.
          </span>
        </div>
      `;

      return;
    }


    const statuses = [
      {
        name: "Upcoming",
        className: "upcoming"
      },
      {
        name: "Ongoing",
        className: "ongoing"
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


    const totalEvents = events.length;


    eventStatusList.innerHTML =
      statuses.map(function (status) {

        const count = events.filter(function (event) {
          return event.status === status.name;
        }).length;

        const percentage =
          totalEvents > 0
            ? Math.round((count / totalEvents) * 100)
            : 0;


        return `
          <div class="event-status-item">

            <div class="event-status-top">

              <div class="event-status-name">

                <span
                  class="event-status-dot ${status.className}"
                ></span>

                <span>
                  ${status.name}
                </span>

              </div>

              <strong>
                ${count}
              </strong>

            </div>


            <div class="event-progress">

              <div
                class="event-progress-bar ${status.className}"
                style="width: ${percentage}%"
              ></div>

            </div>


            <span class="event-percentage">
              ${percentage}%
            </span>

          </div>
        `;
      }).join("");
  }


  /* =====================================================
     ADMIN MOBILE NAVIGATION
     ====================================================== */

  function initAdminNavigation() {
    if (!hamburger || !sidebar || !overlay) {
      return;
    }


    hamburger.addEventListener("click", function () {
      const isOpen =
        sidebar.classList.contains("open");

      if (isOpen) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });


    overlay.addEventListener("click", closeSidebar);


    document
      .querySelectorAll(".admin-nav-link")
      .forEach(function (link) {
        link.addEventListener("click", closeSidebar);
      });


    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) {
        closeSidebar();
      }
    });
  }


  function openSidebar() {
    sidebar.classList.add("open");
    overlay.classList.add("open");

    hamburger.setAttribute(
      "aria-expanded",
      "true"
    );

    document.body.classList.add(
      "admin-sidebar-open"
    );
  }


  function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("open");

    hamburger.setAttribute(
      "aria-expanded",
      "false"
    );

    document.body.classList.remove(
      "admin-sidebar-open"
    );
  }


  /* =====================================================
     CURRENT DATE
     ====================================================== */

  function renderCurrentDate() {
    const now = new Date();

    dashboardDate.textContent =
      now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric"
      });
  }


  /* =====================================================
     STATUS HELPERS
     ====================================================== */

  function getStatusClass(status) {
    switch (status) {
      case "Confirmed":
        return "confirmed";

      case "Cancelled":
        return "cancelled";

      case "Completed":
        return "completed";

      case "Ongoing":
        return "ongoing";

      case "Upcoming":
        return "upcoming";

      default:
        return "pending";
    }
  }


  /* =====================================================
     NUMBER HELPERS
     ====================================================== */

  function formatNumber(number) {
    return Number(number || 0).toLocaleString("en-US");
  }


  /* =====================================================
     TEXT HELPERS
     ====================================================== */

  function getInitials(name) {
    const words =
      String(name)
        .trim()
        .split(/\s+/)
        .filter(Boolean);


    if (words.length === 0) {
      return "CU";
    }


    if (words.length === 1) {
      return words[0]
        .substring(0, 2)
        .toUpperCase();
    }


    return (
      words[0].charAt(0) +
      words[words.length - 1].charAt(0)
    ).toUpperCase();
  }


  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

})();
