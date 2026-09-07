/* =========================================================
   ADMIN SETTINGS PAGE SCRIPT
   Loaded after data.js, ui.js, theme.js.
   ========================================================= */

const ADMIN_PROFILE_KEY = "evt_admin_profile";

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

/* ---------- PROFILE ---------- */
function loadProfile() {
  try {
    const raw = localStorage.getItem(ADMIN_PROFILE_KEY);
    return raw ? JSON.parse(raw) : { name: "Admin User", email: "admin@eventify.com" };
  } catch (e) {
    return { name: "Admin User", email: "admin@eventify.com" };
  }
}

function renderProfile() {
  const profile = loadProfile();
  document.getElementById("adminName").value = profile.name;
  document.getElementById("adminEmail").value = profile.email;
}

function initProfileSave() {
  document.getElementById("saveProfileBtn").addEventListener("click", () => {
    const name = document.getElementById("adminName").value.trim();
    const email = document.getElementById("adminEmail").value.trim();

    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("Please enter a valid name and email.", "error");
      return;
    }

    localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify({ name, email }));
    showToast("Profile saved successfully.", "success");
  });
}

/* ---------- APPEARANCE ---------- */
function renderThemeLabel() {
  document.getElementById("currentThemeLabel").textContent = getSavedTheme() === "dark" ? "Dark" : "Light";
}

function initThemeSection() {
  renderThemeLabel();
  document.getElementById("toggleThemeBtn").addEventListener("click", () => {
    toggleTheme();
    renderThemeLabel();
  });
}

/* ---------- DATA MANAGEMENT ---------- */
function initResetData() {
  document.getElementById("resetDataBtn").addEventListener("click", () => {
    showConfirm({
      title: "Reset all data?",
      message: "This will delete all events, bookings, and customers, and restore the original demo events. This cannot be undone.",
      confirmText: "Yes, Reset Everything",
      cancelText: "Cancel",
      danger: true,
      onConfirm: () => {
        localStorage.removeItem(STORAGE_KEYS.EVENTS);
        localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
        localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
        initEventsData();
        showToast("All data has been reset.", "success");
        setTimeout(() => window.location.reload(), 1000);
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initEventsData();
  initAdminSidebar();
  renderProfile();
  initProfileSave();
  initThemeSection();
  initResetData();
});
