// ============================================================
//  darkmode.js — Gestion du thème clair / sombre
//  Applique le thème sauvegardé au chargement,
//  et expose initTheme() pour script.js.
// ============================================================

let isDarkMode = false;

export function initTheme() {
    const saved = localStorage.getItem('theme');
    isDarkMode = saved === 'dark';
    applyTheme(isDarkMode);
    syncSwitch(isDarkMode);
}

export function toggleTheme() {
    isDarkMode = !isDarkMode;
    applyTheme(isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    syncSwitch(isDarkMode);
}

function applyTheme(dark) {
    document.body.classList.toggle('dark-mode', dark);
}

function syncSwitch(dark) {
    const checkbox = document.getElementById('themeToggle');
    if (checkbox) checkbox.checked = dark;
}