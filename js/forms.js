// ============================================================
//  forms.js — Saisie et enregistrement des notes
//  Gère l'affichage du formulaire et la sauvegarde.
// ============================================================
 
import { state, noteIcons } from './state.js';
import { saveNotes }        from './storage.js';
import { renderNotes }      from './render.js';
import { openModal, closeModal } from './modals.js';
// viewNote est appelé via window.viewNote pour éviter une dépendance circulaire
// (notes.js importe forms.js → forms.js ne peut pas importer notes.js en retour)
 
// ── Formulaire ────────────────────────────────────────────────
 
export function showNoteForm(type, note = null) {
    const isEdit = note !== null;
 
    document.getElementById('formIcon').className = `fas ${noteIcons[type]}`;
    document.getElementById('formTitle').textContent = isEdit ? note.name : 'Nouvelle note';
 
    const noteForm = document.getElementById('noteForm');
    noteForm.innerHTML = buildFormHTML(type, note) + `
        <button type="submit" class="btn btn-primary">
            ${isEdit ? 'Mettre à jour' : 'Enregistrer'}
        </button>
    `;
 
    noteForm.onsubmit = (e) => {
        e.preventDefault();
        saveNote(type, isEdit);
    };
 
    openModal(document.getElementById('formModal'));
}
 
function buildFormHTML(type, note) {
    switch (type) {
        case 'simple':
            return `
                <div class="form-group">
                    <label for="noteName">Nom de la note *</label>
                    <input type="text" id="noteName" required value="${note ? note.name : ''}">
                </div>
                <div class="form-group">
                    <label for="noteContent">Contenu</label>
                    <textarea id="noteContent">${note ? note.content : ''}</textarea>
                </div>
            `;
 
        case 'liste':
            return `
                <div class="form-group">
                    <label for="noteName">Nom de la note *</label>
                    <input type="text" id="noteName" required value="${note ? note.name : ''}">
                </div>
                <div class="form-group">
                    <label>Items de la liste</label>
                    <div class="list-items" id="listItems">
                        ${note && note.items
                            ? note.items.map((item, i) => buildListItemHTML(item.text, i)).join('')
                            : buildListItemHTML('', 0, 'Item 1')}
                    </div>
                    <button type="button" class="add-item" onclick="addListItem()">
                        <i class="fas fa-plus"></i> Ajouter un item
                    </button>
                </div>
            `;
 
        case 'contact':
            return `
                <div class="form-group">
                    <label for="noteName">Nom du contact *</label>
                    <input type="text" id="noteName" required value="${note ? note.name : ''}">
                </div>
                <div class="form-group">
                    <label for="contactPhone">Téléphone</label>
                    <input type="tel" id="contactPhone" value="${note ? note.phone : ''}">
                </div>
                <div class="form-group">
                    <label for="contactEmail">Email</label>
                    <input type="email" id="contactEmail" value="${note ? note.email : ''}">
                </div>
            `;
 
        case 'lieu':
            return `
                <div class="form-group">
                    <label for="noteName">Nom du lieu *</label>
                    <input type="text" id="noteName" required value="${note ? note.name : ''}">
                </div>
                <div class="form-group">
                    <label for="placeAddress">Adresse</label>
                    <input type="text" id="placeAddress" value="${note ? note.address : ''}">
                </div>
                <div class="form-group">
                    <label for="placeNote">Note</label>
                    <textarea id="placeNote">${note ? note.note : ''}</textarea>
                </div>
            `;
 
        case 'tache':
            return `
                <div class="form-group">
                    <label for="noteName">Nom de la tâche *</label>
                    <input type="text" id="noteName" required value="${note ? note.name : ''}">
                </div>
                <div class="form-group">
                    <label for="taskDescription">Descriptif</label>
                    <textarea id="taskDescription">${note ? note.description : ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="taskDate">Quand (Date)</label>
                    <input type="date" id="taskDate" value="${note ? note.taskDate : ''}">
                </div>
            `;
 
        default:
            return '';
    }
}
 
function buildListItemHTML(value, index, placeholder = '') {
    return `
        <div class="list-item">
            <input type="text" value="${value}" placeholder="${placeholder}" data-index="${index}">
            <button type="button" class="remove-item" onclick="removeListItem(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
}
 
// ── Gestion des items de liste (exposés globalement) ──────────
 
window.addListItem = function () {
    const listItems = document.getElementById('listItems');
    const index     = listItems.children.length;
    const div       = document.createElement('div');
    div.className   = 'list-item';
    div.innerHTML   = buildListItemHTML('', index, `Item ${index + 1}`);
    listItems.appendChild(div);
    div.querySelector('input').focus();
};
 
window.removeListItem = function (btn) {
    const listItems = document.getElementById('listItems');
    if (listItems.children.length > 1) {
        btn.parentElement.remove();
    }
};
 
// ── Sauvegarde ────────────────────────────────────────────────
 
export function saveNote(type, isEdit) {
    const name = document.getElementById('noteName').value.trim();
    if (!name) return;
 
    const existing = isEdit ? state.notes.find(n => n.id === state.currentNoteId) : null;
 
    const note = {
        id:   isEdit ? state.currentNoteId : Date.now(),
        type,
        name,
        date: existing ? existing.date : new Date().toISOString(),
        ...extractFields(type, isEdit, existing),
    };
 
    if (isEdit) {
        const index = state.notes.findIndex(n => n.id === state.currentNoteId);
        state.notes[index] = note;
    } else {
        state.notes.unshift(note);
    }
 
    saveNotes();
    renderNotes();
    closeModal(document.getElementById('formModal'));
 
    if (isEdit) {
        setTimeout(() => window.viewNote(state.currentNoteId), 100);
    } else {
        state.currentNoteId  = null;
        state.scrollPosition = 0;
    }
}
 
function extractFields(type, isEdit, existing) {
    switch (type) {
        case 'simple':
            return { content: document.getElementById('noteContent').value };
 
        case 'liste': {
            const inputs = Array.from(document.querySelectorAll('#listItems input'));
            let items = inputs
                .map(input => ({ text: input.value.trim(), checked: false }))
                .filter(item => item.text !== '');
 
            // Conserver l'état des cases cochées lors d'une édition
            if (isEdit && existing?.items) {
                items = items.map((item, i) => ({
                    text:    item.text,
                    checked: existing.items[i]?.checked ?? false,
                }));
            }
            return { items };
        }
 
        case 'contact':
            return {
                phone: document.getElementById('contactPhone').value,
                email: document.getElementById('contactEmail').value,
            };
 
        case 'lieu':
            return {
                address: document.getElementById('placeAddress').value,
                note:    document.getElementById('placeNote').value,
            };
 
        case 'tache':
            return {
                description: document.getElementById('taskDescription').value,
                taskDate:    document.getElementById('taskDate').value,
            };
 
        default:
            return {};
    }
}
