/* =========================================================
   ADMIN EVENTS MANAGEMENT PAGE SCRIPT
   Loaded after data.js, ui.js, theme.js.
   ========================================================= */

const ADMIN_PAGE_SIZE = 10;
let adminCurrentPage = 1;
let adminSortField = "date";
let adminSortDir = "asc";

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

function eventStatusBadgeClass(status) {
  const map = { Upcoming: "badge-info", Ongoing: "badge-success", Completed: "badge-gray", Cancelled: "badge-danger" };
  return map[status] || "badge-gray";
}

function populateCategoryFilter() {
  const categories = [...new Set(getEvents().map(e => e.category))].sort();
  const select = document.getElementById("categoryFilter");
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

function getFilteredSortedEvents() {
  const search = document.getElementById("searchInput").value.trim().toLowerCase();
  const category = document.getElementById("categoryFilter").value;
  const status = document.getElementById("statusFilter").value;

  let list = getEvents().filter(e => {
    const matchesSearch = !search || e.name.toLowerCase().includes(search);
    const matchesCategory = category === "all" || e.category === category;
    const matchesStatus = status === "all" || e.status === status;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  list.sort((a, b) => {
    let valA = a[adminSortField];
    let valB = b[adminSortField];
    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();
    if (valA < valB) return adminSortDir === "asc" ? -1 : 1;
    if (valA > valB) return adminSortDir === "asc" ? 1 : -1;
    return 0;
  });

  return list;
}

function eventRowHTML(event) {
  const available = getAvailableSeatsCount(event);
  const total = getTotalSeats(event);
  return `
    <tr data-id="${event.id}">
      <td>
        <div class="table-product" style="display:flex; align-items:center; gap:10px;">
          <img src="${event.image}" alt="${event.name}" onerror="handleImgError(this)" style="width:44px; height:44px; border-radius:8px; object-fit:cover; flex-shrink:0;">
          <div>
            <div style="font-weight:700;">${event.name}</div>
            <div style="font-size:12px; color:var(--text-muted);">${event.location}</div>
          </div>
        </div>
      </td>
      <td>${event.category}</td>
      <td>${formatDate(event.date)}</td>
      <td>${formatCurrency(event.price)}</td>
      <td>${available} / ${total}</td>
      <td>
        <select class="status-select" data-action="status" style="padding:6px 8px; border-radius:6px; border:1px solid var(--border); background:var(--surface); color:var(--text); font-size:12px;">
          <option value="Upcoming" ${event.status === "Upcoming" ? "selected" : ""}>Upcoming</option>
          <option value="Ongoing" ${event.status === "Ongoing" ? "selected" : ""}>Ongoing</option>
          <option value="Completed" ${event.status === "Completed" ? "selected" : ""}>Completed</option>
          <option value="Cancelled" ${event.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
        </select>
      </td>
      <td class="table-actions">
        <button class="btn btn-outline btn-icon" data-action="edit" title="Edit" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="btn btn-danger btn-icon" data-action="delete" title="Delete" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </button>
      </td>
    </tr>
  `;
}

function renderEventsTable() {
  const filtered = getFilteredSortedEvents();
  const totalPages = Math.max(1, Math.ceil(filtered.length / ADMIN_PAGE_SIZE));
  if (adminCurrentPage > totalPages) adminCurrentPage = totalPages;

  const start = (adminCurrentPage - 1) * ADMIN_PAGE_SIZE;
  const pageItems = filtered.slice(start, start + ADMIN_PAGE_SIZE);

  const body = document.getElementById("eventsTableBody");
  body.innerHTML = pageItems.length
    ? pageItems.map(eventRowHTML).join("")
    : `<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:30px;">No events found.</td></tr>`;

  renderPagination(filtered.length);
  updateSortArrows();
}

function renderPagination(totalItems) {
  const totalPages = Math.max(1, Math.ceil(totalItems / ADMIN_PAGE_SIZE));
  const container = document.getElementById("pagination");

  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  let html = `<button class="page-btn" data-page="prev" ${adminCurrentPage === 1 ? "disabled" : ""}>&laquo;</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === adminCurrentPage ? "active" : ""}" data-page="${i}">${i}</button>`;
  }
  html += `<button class="page-btn" data-page="next" ${adminCurrentPage === totalPages ? "disabled" : ""}>&raquo;</button>`;
  container.innerHTML = html;

  container.querySelectorAll(".page-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.dataset.page;
      if (val === "prev") adminCurrentPage = Math.max(1, adminCurrentPage - 1);
      else if (val === "next") adminCurrentPage = Math.min(totalPages, adminCurrentPage + 1);
      else adminCurrentPage = Number(val);
      renderEventsTable();
    });
  });
}

function updateSortArrows() {
  document.querySelectorAll("th[data-sort]").forEach(th => {
    th.classList.toggle("sorted", th.dataset.sort === adminSortField);
    const arrow = th.querySelector(".sort-arrow");
    if (th.dataset.sort === adminSortField) {
      arrow.innerHTML = adminSortDir === "asc" ? "&#9652;" : "&#9662;";
    } else {
      arrow.innerHTML = "&#9662;";
    }
  });
}

function initSortHeaders() {
  document.querySelectorAll("th[data-sort]").forEach(th => {
    th.addEventListener("click", () => {
      const field = th.dataset.sort;
      if (adminSortField === field) {
        adminSortDir = adminSortDir === "asc" ? "desc" : "asc";
      } else {
        adminSortField = field;
        adminSortDir = "asc";
      }
      renderEventsTable();
    });
  });
}

/* ---------- ADD / EDIT MODAL ---------- */
function eventFormHTML(event) {
  const e = event || {};
  return `
    <button class="modal-close" id="eventModalClose" type="button" style="float:right;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <div class="modal-header"><h3>${event ? "Edit Event" : "Add New Event"}</h3></div>
    <form id="eventForm" novalidate>
      <div class="form-field" id="f_name">
        <label>Event Name</label>
        <input type="text" id="ef_name" value="${e.name || ""}">
        <span class="field-error"></span>
      </div>
      <div class="form-grid">
        <div class="form-field" id="f_category">
          <label>Category</label>
          <input type="text" id="ef_category" value="${e.category || ""}">
          <span class="field-error"></span>
        </div>
        <div class="form-field" id="f_location">
          <label>Location</label>
          <input type="text" id="ef_location" value="${e.location || ""}">
          <span class="field-error"></span>
        </div>
        <div class="form-field" id="f_date">
          <label>Date</label>
          <input type="date" id="ef_date" value="${e.date || ""}">
          <span class="field-error"></span>
        </div>
        <div class="form-field" id="f_time">
          <label>Time</label>
          <input type="time" id="ef_time" value="${e.time || ""}">
          <span class="field-error"></span>
        </div>
        <div class="form-field" id="f_price">
          <label>Ticket Price ($)</label>
          <input type="number" id="ef_price" step="0.01" value="${e.price !== undefined ? e.price : ""}">
          <span class="field-error"></span>
        </div>
        <div class="form-field" id="f_status">
          <label>Status</label>
          <select id="ef_status">
            <option value="Upcoming" ${e.status === "Upcoming" || !e.status ? "selected" : ""}>Upcoming</option>
            <option value="Ongoing" ${e.status === "Ongoing" ? "selected" : ""}>Ongoing</option>
            <option value="Completed" ${e.status === "Completed" ? "selected" : ""}>Completed</option>
            <option value="Cancelled" ${e.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
          </select>
        </div>
        <div class="form-field" id="f_rows">
          <label>Seat Rows</label>
          <input type="number" id="ef_rows" value="${e.rows || ""}">
          <span class="field-error"></span>
        </div>
        <div class="form-field" id="f_seatsPerRow">
          <label>Seats Per Row</label>
          <input type="number" id="ef_seatsPerRow" value="${e.seatsPerRow || ""}">
          <span class="field-error"></span>
        </div>
      </div>
      <div class="form-field" id="f_image">
        <label>Image URL</label>
        <input type="text" id="ef_image" value="${e.image || ""}">
        <span class="field-error"></span>
      </div>
      <div class="form-field" id="f_description">
        <label>Description</label>
        <textarea id="ef_description">${e.description || ""}</textarea>
        <span class="field-error"></span>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline" id="eventModalCancel">Cancel</button>
        <button type="submit" class="btn btn-primary">${event ? "Save Changes" : "Add Event"}</button>
      </div>
    </form>
  `;
}

function setFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorEl = field.querySelector(".field-error");
  if (message) {
    field.classList.add("error");
    errorEl.textContent = message;
  } else {
    field.classList.remove("error");
    errorEl.textContent = "";
  }
}

function validateEventForm(data, editingId) {
  let valid = true;

  if (data.name.trim().length < 2) { setFieldError("f_name", "Event name is required."); valid = false; }
  else setFieldError("f_name", "");

  if (data.category.trim().length < 2) { setFieldError("f_category", "Category is required."); valid = false; }
  else setFieldError("f_category", "");

  if (data.location.trim().length < 2) { setFieldError("f_location", "Location is required."); valid = false; }
  else setFieldError("f_location", "");

  if (!data.date || isNaN(new Date(data.date).getTime())) { setFieldError("f_date", "Please enter a valid date."); valid = false; }
  else setFieldError("f_date", "");

  if (!data.time) { setFieldError("f_time", "Time is required."); valid = false; }
  else setFieldError("f_time", "");

  if (isNaN(data.price) || data.price < 0) { setFieldError("f_price", "Price cannot be negative."); valid = false; }
  else setFieldError("f_price", "");

  if (isNaN(data.rows) || data.rows < 1) { setFieldError("f_rows", "Must be at least 1."); valid = false; }
  else setFieldError("f_rows", "");

  if (isNaN(data.seatsPerRow) || data.seatsPerRow < 1) { setFieldError("f_seatsPerRow", "Must be at least 1."); valid = false; }
  else setFieldError("f_seatsPerRow", "");

  if (!data.image.trim()) { setFieldError("f_image", "Image URL is required."); valid = false; }
  else setFieldError("f_image", "");

  if (data.description.trim().length < 10) { setFieldError("f_description", "Please write at least 10 characters."); valid = false; }
  else setFieldError("f_description", "");

  if (valid && editingId) {
    const bookedCount = getBookedSeats(editingId).length;
    const newTotal = data.rows * data.seatsPerRow;
    if (newTotal < bookedCount) {
      setFieldError("f_rows", `Cannot reduce below ${bookedCount} already-booked seats.`);
      valid = false;
    }
  }

  return valid;
}

function openEventModal(event) {
  openModal(eventFormHTML(event));

  document.getElementById("eventModalClose").onclick = closeModal;
  document.getElementById("eventModalCancel").onclick = closeModal;

  document.getElementById("eventForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const data = {
      name: document.getElementById("ef_name").value,
      category: document.getElementById("ef_category").value,
      location: document.getElementById("ef_location").value,
      date: document.getElementById("ef_date").value,
      time: document.getElementById("ef_time").value,
      price: parseFloat(document.getElementById("ef_price").value),
      status: document.getElementById("ef_status").value,
      rows: parseInt(document.getElementById("ef_rows").value, 10),
      seatsPerRow: parseInt(document.getElementById("ef_seatsPerRow").value, 10),
      image: document.getElementById("ef_image").value,
      description: document.getElementById("ef_description").value
    };

    if (!validateEventForm(data, event ? event.id : null)) return;

    if (event) {
      updateEvent(event.id, data);
      showToast("Event updated successfully.", "success");
    } else {
      addEvent(data);
      showToast("Event added successfully.", "success");
    }

    closeModal();
    populateCategoryFilter();
    renderEventsTable();
  });
}

/* ---------- TABLE ACTIONS (edit / delete / inline status change) ---------- */
function initTableActions() {
  document.getElementById("eventsTableBody").addEventListener("click", (e) => {
    const row = e.target.closest("tr[data-id]");
    if (!row) return;
    const id = row.dataset.id;

    if (e.target.closest('[data-action="edit"]')) {
      openEventModal(getEventById(id));
    }

    if (e.target.closest('[data-action="delete"]')) {
      showConfirm({
        title: "Delete this event?",
        message: "This will also remove all bookings associated with this event. This cannot be undone.",
        confirmText: "Delete Event",
        danger: true,
        onConfirm: () => {
          deleteEvent(id);
          showToast("Event deleted.", "info");
          renderEventsTable();
        }
      });
    }
  });

  document.getElementById("eventsTableBody").addEventListener("change", (e) => {
    if (e.target.dataset.action === "status") {
      const row = e.target.closest("tr[data-id]");
      updateEvent(row.dataset.id, { status: e.target.value });
      showToast("Event status updated.", "success");
      renderEventsTable();
    }
  });
}

function initFilters() {
  document.getElementById("searchInput").addEventListener("input", () => { adminCurrentPage = 1; renderEventsTable(); });
  document.getElementById("categoryFilter").addEventListener("change", () => { adminCurrentPage = 1; renderEventsTable(); });
  document.getElementById("statusFilter").addEventListener("change", () => { adminCurrentPage = 1; renderEventsTable(); });
  document.getElementById("addEventBtn").addEventListener("click", () => openEventModal(null));
}

document.addEventListener("DOMContentLoaded", () => {
  initEventsData();
  initAdminSidebar();
  populateCategoryFilter();
  initFilters();
  initSortHeaders();
  initTableActions();
  renderEventsTable();
});
