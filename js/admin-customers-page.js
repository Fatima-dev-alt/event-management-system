/* =========================================================
   ADMIN CUSTOMERS MANAGEMENT PAGE SCRIPT
   Loaded after data.js, ui.js, theme.js.
   ========================================================= */

const ADMIN_CUSTOMER_PAGE_SIZE = 10;

let customerCurrentPage = 1;
let customerSortField = "lastBooking";
let customerSortDir = "desc";


/* ---------- SIDEBAR ---------- */

function initAdminCustomerSidebar() {

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

function escapeCustomerHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* ---------- FILTER + SORT ---------- */

function getFilteredSortedCustomers() {

  const searchInput =
    document.getElementById("searchInput");

  const search = searchInput
    ? searchInput.value.trim().toLowerCase()
    : "";


  let customers = getCustomers().filter(customer => {

    const name =
      String(customer.name || "").toLowerCase();

    const email =
      String(customer.email || "").toLowerCase();

    const phone =
      String(customer.phone || "").toLowerCase();


    return (
      !search ||
      name.includes(search) ||
      email.includes(search) ||
      phone.includes(search)
    );

  });


  customers.sort((a, b) => {

    let valueA = a[customerSortField];
    let valueB = b[customerSortField];


    if (customerSortField === "lastBooking") {

      valueA = new Date(valueA || 0).getTime();
      valueB = new Date(valueB || 0).getTime();

    }


    if (
      customerSortField === "totalBookings" ||
      customerSortField === "totalSpending"
    ) {

      valueA = Number(valueA || 0);
      valueB = Number(valueB || 0);

    }


    if (typeof valueA === "string") {
      valueA = valueA.toLowerCase();
    }

    if (typeof valueB === "string") {
      valueB = valueB.toLowerCase();
    }


    if (valueA < valueB) {

      return customerSortDir === "asc"
        ? -1
        : 1;

    }


    if (valueA > valueB) {

      return customerSortDir === "asc"
        ? 1
        : -1;

    }


    return 0;

  });


  return customers;
}


/* ---------- CUSTOMER ROW ---------- */

function customerRowHTML(customer) {

  const name =
    escapeCustomerHTML(
      customer.name || "Unknown Customer"
    );

  const email =
    escapeCustomerHTML(
      customer.email || "—"
    );

  const phone =
    escapeCustomerHTML(
      customer.phone || "—"
    );

  const totalBookings =
    Number(customer.totalBookings || 0);

  const totalSpending =
    Number(customer.totalSpending || 0);

  const lastBooking =
    customer.lastBooking
      ? formatDateTime(customer.lastBooking)
      : "—";


  return `
    <tr>

      <td>

        <div class="customer-name">
          ${name}
        </div>

        <span class="customer-email">
          ${email}
        </span>

      </td>


      <td>

        <span class="customer-phone">
          ${phone}
        </span>

      </td>


      <td>

        <span class="customer-number">
          ${totalBookings}
        </span>

      </td>


      <td>

        <span class="customer-spending">
          ${formatCurrency(totalSpending)}
        </span>

      </td>


      <td>
        ${lastBooking}
      </td>

    </tr>
  `;
}


/* ---------- RENDER TABLE ---------- */

function renderCustomersTable() {

  const customers =
    getFilteredSortedCustomers();

  const totalItems =
    customers.length;


  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalItems / ADMIN_CUSTOMER_PAGE_SIZE
      )
    );


  if (customerCurrentPage > totalPages) {
    customerCurrentPage = totalPages;
  }


  const start =
    (customerCurrentPage - 1) *
    ADMIN_CUSTOMER_PAGE_SIZE;


  const pageItems =
    customers.slice(
      start,
      start + ADMIN_CUSTOMER_PAGE_SIZE
    );


  const body =
    document.getElementById(
      "customersTableBody"
    );


  if (!body) return;


  body.innerHTML = pageItems.length

    ? pageItems
        .map(customerRowHTML)
        .join("")

    : `
      <tr>

        <td
          colspan="5"
          style="
            text-align:center;
            color:var(--text-muted);
            padding:40px;
          "
        >
          No customers found.
        </td>

      </tr>
    `;


  const count =
    document.getElementById("customerCount");


  if (count) {

    count.textContent =
      `${totalItems} customer${
        totalItems === 1 ? "" : "s"
      }`;

  }


  renderCustomerPagination(totalItems);

  updateCustomerSortArrows();
}


/* ---------- PAGINATION ---------- */

function renderCustomerPagination(totalItems) {

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalItems / ADMIN_CUSTOMER_PAGE_SIZE
      )
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
      ${customerCurrentPage === 1 ? "disabled" : ""}
    >
      &laquo;
    </button>
  `;


  for (let i = 1; i <= totalPages; i++) {

    html += `
      <button
        class="page-btn ${
          i === customerCurrentPage
            ? "active"
            : ""
        }"
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
      ${
        customerCurrentPage === totalPages
          ? "disabled"
          : ""
      }
    >
      &raquo;
    </button>
  `;


  container.innerHTML = html;


  container
    .querySelectorAll(".page-btn")
    .forEach(button => {

      button.addEventListener("click", () => {

        const value =
          button.dataset.page;


        if (value === "prev") {

          customerCurrentPage =
            Math.max(
              1,
              customerCurrentPage - 1
            );

        } else if (value === "next") {

          customerCurrentPage =
            Math.min(
              totalPages,
              customerCurrentPage + 1
            );

        } else {

          customerCurrentPage =
            Number(value);

        }


        renderCustomersTable();

      });

    });
}


/* ---------- SORT ARROWS ---------- */

function updateCustomerSortArrows() {

  document
    .querySelectorAll("th[data-sort]")
    .forEach(th => {

      const arrow =
        th.querySelector(".sort-arrow");


      if (!arrow) return;


      th.classList.toggle(
        "sorted",
        th.dataset.sort === customerSortField
      );


      if (
        th.dataset.sort === customerSortField
      ) {

        arrow.innerHTML =
          customerSortDir === "asc"
            ? "&#9652;"
            : "&#9662;";

      } else {

        arrow.innerHTML =
          "&#9662;";

      }

    });
}


/* ---------- SORT HEADERS ---------- */

function initCustomerSortHeaders() {

  document
    .querySelectorAll("th[data-sort]")
    .forEach(th => {

      th.addEventListener("click", () => {

        const field =
          th.dataset.sort;


        if (
          customerSortField === field
        ) {

          customerSortDir =
            customerSortDir === "asc"
              ? "desc"
              : "asc";

        } else {

          customerSortField = field;
          customerSortDir = "asc";

        }


        customerCurrentPage = 1;

        renderCustomersTable();

      });

    });
}


/* ---------- SEARCH ---------- */

function initCustomerSearch() {

  const search =
    document.getElementById(
      "searchInput"
    );


  if (!search) return;


  search.addEventListener("input", () => {

    customerCurrentPage = 1;

    renderCustomersTable();

  });
}


/* ---------- INITIALIZE ---------- */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initEventsData();

    /*
      Customers are rebuilt from bookings so that
      the Customers page always reflects the latest
      booking information.
    */
    rebuildCustomersFromBookings();

    initAdminCustomerSidebar();

    initCustomerSearch();

    initCustomerSortHeaders();

    renderCustomersTable();

  }
);
