// ============================================================
//  filters.js — Filtrage des notes par type
// ============================================================
 
import { state }         from './state.js';
import { renderList }    from './render.js';
 
// ── État local ────────────────────────────────────────────────
 
let currentFilter = 'all';
 
const FILTER_NAMES = {
    simple:  'notes simples',
    liste:   'listes',
    contact: 'contacts',
    lieu:    'lieux',
    tache:   'tâches',
};
 
const filterMapping = {
    all:     'all',
    simple:  'fa-pen',
    liste:   'fa-tasks',
    contact: 'fa-user',
    lieu:    'fa-map-marker-alt',
    tache:   'fa-calendar-check',
};
 
// ── Initialisation ────────────────────────────────────────────
 
export function initFilterSystem() {
    document.querySelectorAll('.filter-select button').forEach(button => {
        button.addEventListener('click', () => handleFilterClick(button));
    });
    setActiveFilter('all');
}
 
// ── Handlers ──────────────────────────────────────────────────
 
function handleFilterClick(button) {
    const buttonText = button.textContent.trim().toLowerCase();
    const buttonIcon = button.querySelector('i');
 
    let filterType = 'all';
 
    if (buttonText !== 'all' && buttonIcon) {
        const iconClass = Array.from(buttonIcon.classList)
            .find(cls => cls.startsWith('fa-') && cls !== 'fas');
        filterType = Object.keys(filterMapping)
            .find(key => filterMapping[key] === iconClass) || 'all';
    }
 
    setActiveFilter(filterType);
    applyFilter(filterType);
}
 
function setActiveFilter(filterType) {
    currentFilter = filterType;
 
    document.querySelectorAll('.filter-select button').forEach(button => {
        const buttonText = button.textContent.trim().toLowerCase();
        const buttonIcon = button.querySelector('i');
 
        let isActive = false;
        if (filterType === 'all') {
            isActive = buttonText === 'all';
        } else if (buttonIcon) {
            const iconClass = Array.from(buttonIcon.classList)
                .find(cls => cls.startsWith('fa-') && cls !== 'fas');
            isActive = filterMapping[filterType] === iconClass;
        }
 
        button.classList.toggle('active', isActive);
    });
}
 
// ── Filtrage et rendu ─────────────────────────────────────────
 
export function applyFilter(filterType) {
    const filtered = filterType === 'all'
        ? state.notes
        : state.notes.filter(note => note.type === filterType);
 
    const emptyMessage = filterType === 'all'
        ? 'Commencez par créer votre première note'
        : `Aucune ${FILTER_NAMES[filterType] || 'note'} pour le moment`;
 
    renderList(filtered, emptyMessage);
}
 
// ── Reset ─────────────────────────────────────────────────────
 
export function resetFilter() {
    setActiveFilter('all');
    applyFilter('all');
}