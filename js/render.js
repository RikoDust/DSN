// ============================================================
//  render.js — Affichage de la liste des notes
//  Lit state.notes, ne la modifie jamais.
// ============================================================
 
import { state, noteIcons } from './state.js';
 
const MONTHS = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];
 
// ── Helpers ──────────────────────────────────────────────────
 
function groupNotesByMonth(notes) {
    const grouped = {};
    notes.forEach(note => {
        const date     = new Date(note.date);
        const monthKey = `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
        if (!grouped[monthKey]) grouped[monthKey] = [];
        grouped[monthKey].push(note);
    });
    return grouped;
}
 
// ── Main render ───────────────────────────────────────────────
 
export function renderNotes() {
    renderList(state.notes, 'Commencez par créer votre première note');
}
 
// Moteur de rendu partagé — utilisé aussi par filters.js
export function renderList(notes, emptyMessage) {
    const notesContainer = document.getElementById('notesContainer');
    const emptyState     = document.getElementById('emptyState');
 
    // Ne jamais déplacer emptyState dans le DOM avec appendChild :
    // notesContainer et emptyState sont deux frères dans le HTML,
    // on alterne simplement leur visibilité.
    if (notes.length === 0) {
        notesContainer.style.display = 'none';
        emptyState.style.display     = 'block';
        const p = emptyState.querySelector('p');
        if (p) p.textContent = emptyMessage;
        return;
    }
 
    notesContainer.style.display = 'block';
    emptyState.style.display     = 'none';
 
    const groupedNotes = groupNotesByMonth(notes);
    let html = '';
 
    for (const [month, monthNotes] of Object.entries(groupedNotes)) {
        html += `
            <div class="month-group">
                <div class="month-label">${month}</div>
                ${monthNotes.map(note => `
                    <div class="note-item-wrapper">
                        <div class="note-item" onclick="viewNote(${note.id})">
                            <i class="fas ${noteIcons[note.type]}"></i>
                            <div class="note-item-content">
                                <span>${note.name}</span>
                            </div>
                        </div>
                        <button class="share-button" onclick="shareNoteFromList(event, ${note.id})">
                            <i class="fas fa-share-alt"></i>
                            <span class="share-tooltip">Partager</span>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }
 
    notesContainer.innerHTML = html;
}