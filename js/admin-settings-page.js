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

/* ---------- ADMIN PROFILE ---------- */
function loadProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(ADMIN_PROFILE_KEY));
    if (saved) {
      document.getElementById("adminName").value = saved.name;
      document.getElementById("adminEmail").value = saved.email;
    }
  } catch (e) {
    /* keep defaults */
  }
}

function initProfileForm() {
  document.getElementById("profileForm").addEventListener("submit", (e) => {
    e.preventDefault();
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
function updateThemeLabel() {
  const label = document.getElementById("currentThemeLabel");
  label.textContent = getSavedTheme() === "dark" ? "Dark" : "Light";
}

function initThemeControls() {
  updateThemeLabel();
  document.getElementById("toggleThemeBtn").addEventListener("click", () => {
    toggleTheme();
    updateThemeLabel();
  });
}

/* ---------- DATA MANAGEMENT ---------- */
function initResetData() {
  document.getElementById("resetDataBtn").addEventListener("click", () => {
    showConfirm({
      title: "Reset all data?",
      message: "All events, bookings, and customers will be permanently deleted and replaced with the original demo data.",
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
  loadProfile();
  initProfileForm();
  initThemeControls();
  initResetData();
});
