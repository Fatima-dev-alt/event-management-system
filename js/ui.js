/* =========================================================
   CUSTOM UI COMPONENTS
   Toast notifications, modal dialogs, confirm dialogs, and a
   loading indicator - replaces alert()/confirm()/prompt().
   Loaded after data.js on every page.
   ========================================================= */

function ensureUIRoot() {
  if (!document.getElementById("toastContainer")) {
    const t = document.createElement("div");
    t.id = "toastContainer";
    document.body.appendChild(t);
  }

  if (!document.getElementById("modalOverlay")) {
    const m = document.createElement("div");
    m.id = "modalOverlay";
    m.className = "modal-overlay";
    m.innerHTML = '<div class="modal-box" id="modalBox"></div>';
    document.body.appendChild(m);
    m.addEventListener("click", (e) => {
      if (e.target === m) closeModal();
    });
  }

  if (!document.getElementById("loadingOverlay")) {
    const l = document.createElement("div");
    l.id = "loadingOverlay";
    l.className = "loading-overlay";
    l.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(l);
  }
}

/* ---------- TOAST ---------- */
const TOAST_ICONS = {
  success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
  error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
};

function showToast(message, type) {
  type = type || "info";
  ensureUIRoot();
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = "toast " + type;
  toast.innerHTML = (TOAST_ICONS[type] || TOAST_ICONS.info) + "<span>" + message + "</span>";
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 250);
  }, 2600);
}

/* ---------- MODAL (generic - used for add/edit forms) ---------- */
function openModal(bodyHTML) {
  ensureUIRoot();
  const overlay = document.getElementById("modalOverlay");
  const box = document.getElementById("modalBox");
  box.innerHTML = bodyHTML;
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const overlay = document.getElementById("modalOverlay");
  if (overlay) overlay.classList.remove("open");
  document.body.style.overflow = "";
}

/* ---------- CONFIRM DIALOG (replaces confirm()) ---------- */
function showConfirm(options) {
  const title = options.title || "Are you sure?";
  const message = options.message || "";
  const confirmText = options.confirmText || "Confirm";
  const cancelText = options.cancelText || "Cancel";
  const danger = options.danger !== false;
  const onConfirm = options.onConfirm || function () {};

  const iconSvg = danger
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';

  const bodyHTML = `
    <button class="modal-close" id="confirmCloseX" type="button" style="float:right;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <div class="confirm-icon ${danger ? "danger" : "success"}">${iconSvg}</div>
    <div class="confirm-title">${title}</div>
    <p class="confirm-text">${message}</p>
    <div class="modal-footer" style="justify-content:center;">
      <button class="btn btn-outline" id="confirmCancelBtn" type="button">${cancelText}</button>
      <button class="btn ${danger ? "btn-danger" : "btn-primary"}" id="confirmOkBtn" type="button">${confirmText}</button>
    </div>
  `;

  openModal(bodyHTML);

  document.getElementById("confirmCloseX").onclick = closeModal;
  document.getElementById("confirmCancelBtn").onclick = closeModal;
  document.getElementById("confirmOkBtn").onclick = () => {
    closeModal();
    onConfirm();
  };
}

/* ---------- LOADING INDICATOR ---------- */
function showLoading() {
  ensureUIRoot();
  document.getElementById("loadingOverlay").classList.add("open");
}

function hideLoading() {
  const el = document.getElementById("loadingOverlay");
  if (el) el.classList.remove("open");
}

document.addEventListener("DOMContentLoaded", ensureUIRoot);
