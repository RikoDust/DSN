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
}
 
export function toggleTheme() {
    isDarkMode = !isDarkMode;
    applyTheme(isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}
 
function applyTheme(dark) {
    const themeIcon = document.querySelector('#themeToggle i');
    document.body.classList.toggle('dark-mode', dark);
    if (themeIcon) {
        themeIcon.classList.toggle('fa-sun', dark);
        themeIcon.classList.toggle('fa-moon', !dark);
    }
}
