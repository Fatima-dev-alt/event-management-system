/* =========================================================
   THEME (LIGHT/DARK MODE) + KEYBOARD SHORTCUTS
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

/* ---------- KEYBOARD SHORTCUTS ---------- */
function initKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();

    // Ctrl/Cmd + K -> focus the page search box
    if ((e.ctrlKey || e.metaKey) && key === "k") {
      const searchInput = document.querySelector(".nav-search input, .filters-bar input[type='text']");
      if (searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
    }

    // Esc -> close any open modal
    if (e.key === "Escape") {
      const overlay = document.getElementById("modalOverlay");
      if (overlay && overlay.classList.contains("open")) {
        closeModal();
      }
    }

    // Ctrl/Cmd + D -> toggle dark mode
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
  initKeyboardShortcuts();
});
