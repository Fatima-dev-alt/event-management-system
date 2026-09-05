/* =========================================================
   EVENT LISTING PAGE SCRIPT
   Loaded after data.js, ui.js, theme.js.
   ========================================================= */

const PAGE_SIZE = 6;
let currentPage = 1;

function eventCardHTML(event) {
  const available = getAvailableSeatsCount(event);
  const total = getTotalSeats(event);
  let seatsClass = "";
  if (available === 0) seatsClass = "none";
  else if (available <= total * 0.2) seatsClass = "low";

  return `
    <a href="event-details.html?id=${event.id}" class="event-card">
      <div class="event-thumb">
        <img src="${event.image}" alt="${event.name}" onerror="handleImgError(this)">
        <span class="event-status ${event.status.toLowerCase()}">${event.status}</span>
        <span class="event-category">${event.category}</span>
      </div>
      <div class="event-body">
        <h3 class="event-name">${event.name}</h3>
        <div class="event-meta">
          <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>${formatDate(event.date)} &middot; ${event.time}</div>
          <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${event.location}</div>
        </div>
      </div>
      <div class="event-footer">
        <span class="event-price">${formatCurrency(event.price)}</span>
        <span class="event-seats ${seatsClass}">${available === 0 ? "Sold Out" : available + " seats left"}</span>
      </div>
    </a>
  `;
}

function populateFilterOptions() {
  const events = getEvents();
  const categories = [...new Set(events.map(e => e.category))].sort();
  const locations = [...new Set(events.map(e => e.location))].sort();

  const categorySelect = document.getElementById("categoryFilter");
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });

  const locationSelect = document.getElementById("locationFilter");
  locations.forEach(loc => {
    const opt = document.createElement("option");
    opt.value = loc;
    opt.textContent = loc;
    locationSelect.appendChild(opt);
  });
}

function getFilteredSortedEvents() {
  const search = document.getElementById("searchInput").value.trim().toLowerCase();
  const category = document.getElementById("categoryFilter").value;
  const location = document.getElementById("locationFilter").value;
  const dateFrom = document.getElementById("dateFilter").value;
  const seatsMode = document.getElementById("seatsFilter").value;
  const sort = document.getElementById("sortFilter").value;

  let list = getEvents().filter(event => {
    const matchesSearch = !search || event.name.toLowerCase().includes(search);
    const matchesCategory = category === "all" || event.category === category;
    const matchesLocation = location === "all" || event.location === location;
    const matchesDate = !dateFrom || event.date >= dateFrom;
    const matchesSeats = seatsMode !== "available" || getAvailableSeatsCount(event) > 0;
    return matchesSearch && matchesCategory && matchesLocation && matchesDate && matchesSeats;
  });

  if (sort === "date-asc") list.sort((a, b) => a.date.localeCompare(b.date));
  else if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  else if (sort === "name-asc") list.sort((a, b) => a.name.localeCompare(b.name));

  return list;
}

function renderPagination(totalItems) {
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const container = document.getElementById("pagination");

  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  let html = `<button class="page-btn" data-page="prev" ${currentPage === 1 ? "disabled" : ""}>&laquo;</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</button>`;
  }
  html += `<button class="page-btn" data-page="next" ${currentPage === totalPages ? "disabled" : ""}>&raquo;</button>`;

  container.innerHTML = html;

  container.querySelectorAll(".page-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.dataset.page;
      if (val === "prev") currentPage = Math.max(1, currentPage - 1);
      else if (val === "next") currentPage = Math.min(totalPages, currentPage + 1);
      else currentPage = Number(val);
      renderEvents();
      window.scrollTo({ top: document.getElementById("eventsGrid").offsetTop - 100, behavior: "smooth" });
    });
  });
}

function renderEvents() {
  const filtered = getFilteredSortedEvents();
  const grid = document.getElementById("eventsGrid");
  const empty = document.getElementById("emptyState");
  const countEl = document.getElementById("filtersCount");

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;

  countEl.textContent = `Showing ${filtered.length} of ${getEvents().length} events`;

  if (filtered.length === 0) {
    grid.innerHTML = "";
    grid.style.display = "none";
    empty.style.display = "block";
    document.getElementById("pagination").innerHTML = "";
    return;
  }

  grid.style.display = "grid";
  empty.style.display = "none";

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);
  grid.innerHTML = pageItems.map(eventCardHTML).join("");

  renderPagination(filtered.length);
}

function initFilters() {
  ["searchInput"].forEach(id => document.getElementById(id).addEventListener("input", () => { currentPage = 1; renderEvents(); }));
  ["categoryFilter", "locationFilter", "dateFilter", "seatsFilter", "sortFilter"].forEach(id => {
    document.getElementById(id).addEventListener("change", () => { currentPage = 1; renderEvents(); });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initEventsData();
  populateFilterOptions();
  initFilters();
  renderEvents();
});
