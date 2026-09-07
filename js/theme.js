/* =========================================================
   THEME (LIGHT/DARK MODE) + KEYBOARD SHORTCUTS + MOBILE NAV
   Loaded after data.js and ui.js on every page.
   ========================================================= */

function getSavedTheme() {
  return localStorage.getItem(STORAGE_KEYS.THEME) || "light";
}

function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

function initTheme() {
  applyTheme(getSavedTheme());
}

function toggleTheme() {
  const current = getSavedTheme();
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem(STORAGE_KEYS.THEME, next);
  applyTheme(next);
}

function initThemeToggleButtons() {
  document.querySelectorAll(".theme-toggle").forEach(btn => {
    btn.addEventListener("click", toggleTheme);
  });
}

/* ---------- MOBILE NAV TOGGLE ---------- */
function initMobileNav() {
  const toggle = document.getElementById("navMenuToggle");
  const links = document.getElementById("navLinks");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => {
    links.classList.toggle("open");
  });
}

/* ---------- KEYBOARD SHORTCUTS ---------- */
function initKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();

    if ((e.ctrlKey || e.metaKey) && key === "k") {
      const searchInput = document.querySelector(".nav-search input, .filters-bar input[type='text']");
      if (searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
    }

    if (e.key === "Escape") {
      const overlay = document.getElementById("modalOverlay");
      if (overlay && overlay.classList.contains("open")) {
        closeModal();
      }
    }

    if ((e.ctrlKey || e.metaKey) && key === "d") {
      e.preventDefault();
      toggleTheme();
    }
  });
}

/* Apply theme immediately (before DOMContentLoaded) to avoid a flash */
initTheme();

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggleButtons();
  initMobileNav();
  initKeyboardShortcuts();
});
