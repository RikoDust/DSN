// ============================================================
//  notes.js — Actions sur une note existante
//  viewNote · editNote · deleteNote · share · calendar
// ============================================================
 
import { state, noteIcons } from './state.js';
import { saveNotes }        from './storage.js';
import { renderNotes }      from './render.js';
import { openModal, closeModal } from './modals.js';
import { showNoteForm }     from './forms.js';
 
// ── Helpers ───────────────────────────────────────────────────
 
export function formatTaskDate(dateString) {
    if (!dateString) return 'Non définie';
    const date  = new Date(dateString);
    const dd    = String(date.getDate()).padStart(2, '0');
    const mm    = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy  = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}
 
// ── Visualisation ─────────────────────────────────────────────
 
export function viewNote(id, maintainScroll = false) {
    const note = state.notes.find(n => n.id === id);
    if (!note) return;
 
    state.currentNoteId = id;
 
    document.getElementById('viewIcon').className = `fas ${noteIcons[note.type]}`;
    document.getElementById('viewTitle').textContent = note.name;
    document.getElementById('viewContent').innerHTML = buildViewHTML(note);
 
    if (maintainScroll && note.type === 'liste') {
        setTimeout(() => {
            const list = document.querySelector('.view-field ul');
            if (list) list.scrollTop = state.scrollPosition;
        }, 0);
    } else {
        state.scrollPosition = 0;
    }
 
    openModal(document.getElementById('viewModal'));
}
 
// Exposé globalement pour les onclick inline dans le HTML généré
window.viewNote = viewNote;
 
function buildViewHTML(note) {
    switch (note.type) {
        case 'simple':
            return `
                <div class="view-field">
                    <label>Contenu</label>
                    <p>${note.content || 'Aucun contenu'}</p>
                </div>
            `;
 
        case 'liste':
            return `
                <div class="view-field">
                    <label>Liste</label>
                    <ul id="noteListItems">
                        ${note.items.map((item, i) => `
                            <li class="${item.checked ? 'checked' : ''}" onclick="toggleListItem(${note.id}, ${i})">
                                <span class="item-text">${item.text}</span>
                                <i class="fas fa-check check-icon"></i>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
 
        case 'contact': {
            const phoneLink = note.phone
                ? `<a href="tel:${note.phone}" style="color:inherit;text-decoration:none">${note.phone}</a>`
                : 'Non renseigné';
            const emailLink = note.email
                ? `<a href="mailto:${note.email}" style="color:inherit;text-decoration:none">${note.email}</a>`
                : 'Non renseigné';
            return `
                <div class="view-field">
                    <label>Téléphone</label>
                    <p>${phoneLink}</p>
                </div>
                <div class="view-field">
                    <label>Email</label>
                    <p>${emailLink}</p>
                </div>
                <div class="contact-actions">
                    ${note.phone ? `
                    <button class="btn-contact btn-phone" onclick="window.location.href='tel:${note.phone}'">
                        <i class="fas fa-phone"></i> Appeler
                    </button>` : ''}
                    ${note.email ? `
                    <button class="btn-contact btn-email" onclick="window.location.href='mailto:${note.email}'">
                        <i class="fas fa-envelope"></i> Envoyer un mail
                    </button>` : ''}
                </div>
            `;
        }
 
        case 'lieu': {
            const mapsUrl     = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(note.address || '')}`;
            const addressLink = note.address
                ? `<a href="${mapsUrl}" target="_blank" style="color:inherit;text-decoration:none">${note.address}</a>`
                : 'Non renseignée';
            return `
                <div class="view-field">
                    <label>Adresse</label>
                    <p>${addressLink}</p>
                </div>
                <div class="view-field">
                    <label>Note</label>
                    <p>${note.note || 'Aucune note'}</p>
                </div>
                ${note.address ? `
                <div class="add-to-calendar">
                    <button class="btn-calendar" onclick="window.open('${mapsUrl}', '_blank')">
                        <i class="fas fa-map-marked-alt"></i> Ouvrir dans Maps
                    </button>
                </div>` : ''}
            `;
        }
 
        case 'tache':
            return `
                <div class="view-field">
                    <label>Descriptif</label>
                    <p>${note.description || 'Aucun descriptif'}</p>
                </div>
                <div class="view-field">
                    <label>Date</label>
                    <p>${formatTaskDate(note.taskDate)}</p>
                </div>
                ${note.taskDate ? `
                <div class="add-to-calendar">
                    <button class="btn-calendar" onclick="addToCalendar(${note.id})">
                        <i class="fas fa-calendar-plus"></i> Ajouter à l'agenda
                    </button>
                </div>` : ''}
            `;
 
        default:
            return '';
    }
}
 
// ── Toggle item de liste ──────────────────────────────────────
 
window.toggleListItem = function (noteId, itemIndex) {
    const note = state.notes.find(n => n.id === noteId);
    if (!note?.items?.[itemIndex]) return;
 
    const list = document.querySelector('.view-field ul');
    if (list) state.scrollPosition = list.scrollTop;
 
    note.items[itemIndex].checked = !note.items[itemIndex].checked;
    saveNotes();
    viewNote(noteId, true);
};
 
// ── Édition ───────────────────────────────────────────────────
 
export function editNote() {
    const note = state.notes.find(n => n.id === state.currentNoteId);
    if (!note) return;
 
    closeModal(document.getElementById('viewModal'));
    state.currentNoteType = note.type;
    state.scrollPosition  = 0;
    showNoteForm(note.type, note);
}
 
// ── Suppression ───────────────────────────────────────────────
 
export function deleteNote() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) return;
 
    state.notes = state.notes.filter(n => n.id !== state.currentNoteId);
    saveNotes();
    renderNotes();
    closeModal(document.getElementById('viewModal'));
    state.currentNoteId  = null;
    state.scrollPosition = 0;
}
 
// ── Partage ───────────────────────────────────────────────────
 
window.shareNoteFromList = function (event, id) {
    event.stopPropagation();
    const note = state.notes.find(n => n.id === id);
    if (!note) return;
 
    const shareText = buildShareText(note);
 
    if (navigator.share) {
        navigator.share({ title: note.name, text: shareText })
            .catch(() => {}); // Partage annulé — pas d'erreur à afficher
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Note copiée dans le presse-papier !');
        });
    }
};
 
function buildShareText(note) {
    let text = `${note.name}\n\n`;
    switch (note.type) {
        case 'simple':
            text += note.content;
            break;
        case 'liste':
            text += note.items.map(item => `${item.checked ? '[✓]' : '[ ]'} ${item.text}`).join('\n');
            break;
        case 'contact':
            text += `Téléphone: ${note.phone || 'Non renseigné'}\nEmail: ${note.email || 'Non renseigné'}`;
            break;
        case 'lieu':
            text += `Adresse: ${note.address || 'Non renseignée'}\nNote: ${note.note || 'Aucune note'}`;
            break;
        case 'tache':
            text += `Descriptif: ${note.description || 'Aucun descriptif'}\nDate: ${formatTaskDate(note.taskDate)}`;
            break;
    }
    return text;
}
 
// ── Agenda (.ics) ─────────────────────────────────────────────
 
window.addToCalendar = function (noteId) {
    const note = state.notes.find(n => n.id === noteId);
    if (!note?.taskDate) return;
 
    const start = new Date(note.taskDate);
    start.setHours(9, 0, 0, 0);
 
    const end = new Date(start);
    end.setHours(10, 0, 0, 0);
 
    const fmt = (d) => {
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    };
 
    const now = fmt(new Date());
 
    const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Day\'s Notes//Calendar//FR',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `DTSTART:${fmt(start)}`,
        `DTEND:${fmt(end)}`,
        `DTSTAMP:${now}`,
        `UID:${note.id}@daysnotes`,
        `CREATED:${now}`,
        `DESCRIPTION:${note.description || ''}`,
        `LAST-MODIFIED:${now}`,
        'LOCATION:',
        'SEQUENCE:0',
        'STATUS:CONFIRMED',
        `SUMMARY:${note.name}`,
        'TRANSP:OPAQUE',
        'END:VEVENT',
        'END:VCALENDAR',
    ].join('\n');
 
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href     = URL.createObjectURL(blob);
    link.download = `${note.name.replace(/[^a-z0-9]/gi, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};
