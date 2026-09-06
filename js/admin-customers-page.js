/* =========================================================
   ADMIN CUSTOMERS PAGE SCRIPT
   Loaded after data.js, ui.js, theme.js.
   ========================================================= */

const ADMIN_CUST_PAGE_SIZE = 10;
let adminCustPage = 1;
let custSortField = "totalSpending";
let custSortDir = "desc";

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

function getFilteredSortedCustomers() {
  const search = document.getElementById("searchInput").value.trim().toLowerCase();

  let list = getCustomers().filter(c => {
    return !search || c.name.toLowerCase().includes(search) || c.email.toLowerCase().includes(search);
  });

  list.sort((a, b) => {
    let valA = a[custSortField];
    let valB = b[custSortField];
    if (custSortField === "lastBooking") { valA = new Date(valA).getTime(); valB = new Date(valB).getTime(); }
    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();
    if (valA < valB) return custSortDir === "asc" ? -1 : 1;
    if (valA > valB) return custSortDir === "asc" ? 1 : -1;
    return 0;
  });

  return list;
}

function customerRowHTML(customer) {
  return `
    <tr>
      <td style="font-weight:700;">${customer.name}</td>
      <td>${customer.email}</td>
      <td>${customer.phone}</td>
      <td>${customer.totalBookings}</td>
      <td>${formatCurrency(customer.totalSpending)}</td>
      <td>${formatDateTime(customer.lastBooking)}</td>
    </tr>
  `;
}

function renderCustomersTable() {
  const filtered = getFilteredSortedCustomers();
  const totalPages = Math.max(1, Math.ceil(filtered.length / ADMIN_CUST_PAGE_SIZE));
  if (adminCustPage > totalPages) adminCustPage = totalPages;

  const start = (adminCustPage - 1) * ADMIN_CUST_PAGE_SIZE;
  const pageItems = filtered.slice(start, start + ADMIN_CUST_PAGE_SIZE);

  document.getElementById("filtersCount").textContent = `Showing ${filtered.length} of ${getCustomers().length} customers`;

  const body = document.getElementById("customersTableBody");
  body.innerHTML = pageItems.length
    ? pageItems.map(customerRowHTML).join("")
    : `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:30px;">No customers found.</td></tr>`;

  renderPagination(filtered.length);
  updateSortArrows();
}

function renderPagination(totalItems) {
  const totalPages = Math.max(1, Math.ceil(totalItems / ADMIN_CUST_PAGE_SIZE));
  const container = document.getElementById("pagination");

  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  let html = `<button class="page-btn" data-page="prev" ${adminCustPage === 1 ? "disabled" : ""}>&laquo;</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === adminCustPage ? "active" : ""}" data-page="${i}">${i}</button>`;
  }
  html += `<button class="page-btn" data-page="next" ${adminCustPage === totalPages ? "disabled" : ""}>&raquo;</button>`;
  container.innerHTML = html;

  container.querySelectorAll(".page-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.dataset.page;
      if (val === "prev") adminCustPage = Math.max(1, adminCustPage - 1);
      else if (val === "next") adminCustPage = Math.min(totalPages, adminCustPage + 1);
      else adminCustPage = Number(val);
      renderCustomersTable();
    });
  });
}

function updateSortArrows() {
  document.querySelectorAll("th[data-sort]").forEach(th => {
    th.classList.toggle("sorted", th.dataset.sort === custSortField);
    const arrow = th.querySelector(".sort-arrow");
    if (th.dataset.sort === custSortField) {
      arrow.innerHTML = custSortDir === "asc" ? "&#9652;" : "&#9662;";
    } else {
      arrow.innerHTML = "&#9662;";
    }
  });
}

function initSortHeaders() {
  document.querySelectorAll("th[data-sort]").forEach(th => {
    th.addEventListener("click", () => {
      const field = th.dataset.sort;
      if (custSortField === field) custSortDir = custSortDir === "asc" ? "desc" : "asc";
      else { custSortField = field; custSortDir = "asc"; }
      renderCustomersTable();
    });
  });
}

function initFilters() {
  document.getElementById("searchInput").addEventListener("input", () => { adminCustPage = 1; renderCustomersTable(); });
}

document.addEventListener("DOMContentLoaded", () => {
  initEventsData();
  initAdminSidebar();
  initFilters();
  initSortHeaders();
  renderCustomersTable();
});

