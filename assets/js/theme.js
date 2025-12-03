/*!
 * Theme toggler script for light/dark modes.
 */
(function() {
  const STORAGE_KEY = "theme";
  const toggler = () => document.getElementById("theme-toggler");

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.setAttribute("data-theme", "light");
    }
  }

  function currentTheme() {
    return localStorage.getItem(STORAGE_KEY) || "light";
  }

  function toggleTheme() {
    const next = currentTheme() === "light" ? "dark" : "light";
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  window.toggleTheme = toggleTheme;

  document.addEventListener("DOMContentLoaded", function() {
    applyTheme(currentTheme());
    const btn = toggler();
    if (btn) {
      btn.title = "Toggle theme";
    }
  });
})();
