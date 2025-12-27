// Données et état de l'application
let notes = [];
let currentNoteId = null;
let currentNoteType = null;

// Éléments DOM
const header = document.getElementById('header');
const addButton = document.getElementById('addButton');
const typeModal = document.getElementById('typeModal');
const formModal = document.getElementById('formModal');
const viewModal = document.getElementById('viewModal');
const notesContainer = document.getElementById('notesContainer');
const emptyState = document.getElementById('emptyState');
const noteForm = document.getElementById('noteForm');

// Icônes par type de note
const noteIcons = {
    simple: 'fa-pen',
    liste: 'fa-list',
    contact: 'fa-user',
    lieu: 'fa-map-marker-alt',
    tache: 'fa-tasks'
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
    renderNotes();
    setupEventListeners();
});

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Scroll header
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Bouton d'ajout
    addButton.addEventListener('click', () => {
        openModal(typeModal);
    });

    // Fermeture des modales
    document.getElementById('closeTypeModal').addEventListener('click', () => {
        closeModal(typeModal);
    });

    document.getElementById('closeFormModal').addEventListener('click', () => {
        closeModal(formModal);
    });

    document.getElementById('closeViewModal').addEventListener('click', () => {
        closeModal(viewModal);
    });

    // Clic en dehors de la modale
    [typeModal, formModal, viewModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // Sélection du type de note
    document.querySelectorAll('.note-type-item').forEach(item => {
        item.addEventListener('click', () => {
            const type = item.dataset.type;
            currentNoteType = type;
            closeModal(typeModal);
            showNoteForm(type);
        });
    });

    // Actions de visualisation
    document.getElementById('editBtn').addEventListener('click', editNote);
    document.getElementById('deleteBtn').addEventListener('click', deleteNote);
}

// Gestion des modales
function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    currentNoteId = null;
}

// Affichage du formulaire selon le type
function showNoteForm(type, note = null) {
    const isEdit = note !== null;
    document.getElementById('formTitle').textContent = isEdit ? 'Modifier la note' : 'Nouvelle note';
    
    let formHTML = '';

    switch (type) {
        case 'simple':
            formHTML = `
                <div class="form-group">
                    <label for="noteName">Nom de la note *</label>
                    <input type="text" id="noteName" required value="${note ? note.name : ''}">
                </div>
                <div class="form-group">
                    <label for="noteContent">Contenu</label>
                    <textarea id="noteContent">${note ? note.content : ''}</textarea>
                </div>
            `;
            break;

        case 'liste':
            formHTML = `
                <div class="form-group">
                    <label for="noteName">Nom de la note *</label>
                    <input type="text" id="noteName" required value="${note ? note.name : ''}">
                </div>
                <div class="form-group">
                    <label>Items de la liste</label>
                    <div class="list-items" id="listItems">
                        ${note && note.items ? note.items.map((item, index) => `
                            <div class="list-item">
                                <input type="text" value="${item}" data-index="${index}">
                                <button type="button" class="remove-item" onclick="removeListItem(this)">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `).join('') : `
                            <div class="list-item">
                                <input type="text" placeholder="Item 1" data-index="0">
                                <button type="button" class="remove-item" onclick="removeListItem(this)">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `}
                    </div>
                    <button type="button" class="add-item" onclick="addListItem()">
                        <i class="fas fa-plus"></i> Ajouter un item
                    </button>
                </div>
            `;
            break;

        case 'contact':
            formHTML = `
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
            break;

        case 'lieu':
            formHTML = `
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
            break;

        case 'tache':
            formHTML = `
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
            break;
    }

    formHTML += `
        <button type="submit" class="btn btn-primary">
            ${isEdit ? 'Mettre à jour' : 'Enregistrer'}
        </button>
    `;

    noteForm.innerHTML = formHTML;
    noteForm.onsubmit = (e) => {
        e.preventDefault();
        saveNote(type, isEdit);
    };

    openModal(formModal);
}

// Gestion des items de liste
window.addListItem = function() {
    const listItems = document.getElementById('listItems');
    const index = listItems.children.length;
    const div = document.createElement('div');
    div.className = 'list-item';
    div.innerHTML = `
        <input type="text" placeholder="Item ${index + 1}" data-index="${index}">
        <button type="button" class="remove-item" onclick="removeListItem(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    listItems.appendChild(div);
};

window.removeListItem = function(btn) {
    const listItems = document.getElementById('listItems');
    if (listItems.children.length > 1) {
        btn.parentElement.remove();
    }
};

// Sauvegarde d'une note
function saveNote(type, isEdit) {
    const name = document.getElementById('noteName').value.trim();
    if (!name) return;

    const note = {
        id: isEdit ? currentNoteId : Date.now(),
        type: type,
        name: name,
        date: isEdit ? notes.find(n => n.id === currentNoteId).date : new Date().toISOString()
    };

    switch (type) {
        case 'simple':
            note.content = document.getElementById('noteContent').value;
            break;

        case 'liste':
            note.items = Array.from(document.querySelectorAll('#listItems input'))
                .map(input => input.value.trim())
                .filter(item => item !== '');
            break;

        case 'contact':
            note.phone = document.getElementById('contactPhone').value;
            note.email = document.getElementById('contactEmail').value;
            break;

        case 'lieu':
            note.address = document.getElementById('placeAddress').value;
            note.note = document.getElementById('placeNote').value;
            break;

        case 'tache':
            note.description = document.getElementById('taskDescription').value;
            note.taskDate = document.getElementById('taskDate').value;
            break;
    }

    if (isEdit) {
        const index = notes.findIndex(n => n.id === currentNoteId);
        notes[index] = note;
    } else {
        notes.unshift(note);
    }

    saveNotes();
    renderNotes();
    closeModal(formModal);
    currentNoteId = null;
}

// Affichage des notes
function renderNotes() {
    if (notes.length === 0) {
        emptyState.style.display = 'block';
        notesContainer.innerHTML = '';
        notesContainer.appendChild(emptyState);
        return;
    }

    emptyState.style.display = 'none';

    // Grouper les notes par mois
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
                                <div class="note-date">${formatDate(note.date)}</div>
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

// Grouper les notes par mois
function groupNotesByMonth(notes) {
    const grouped = {};
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    notes.forEach(note => {
        const date = new Date(note.date);
        const monthYear = `${months[date.getMonth()]} ${date.getFullYear()}`;
        
        if (!grouped[monthYear]) {
            grouped[monthYear] = [];
        }
        grouped[monthYear].push(note);
    });

    return grouped;
}

// Formatage de la date
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} à ${hours}:${minutes}`;
}

// Formatage de la date de tâche
function formatTaskDate(dateString) {
    if (!dateString) return 'Non définie';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

// Visualisation d'une note
window.viewNote = function(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    currentNoteId = id;
    document.getElementById('viewTitle').textContent = note.name;

    let contentHTML = '';

    switch (note.type) {
        case 'simple':
            contentHTML = `
                <div class="view-field">
                    <label>Contenu</label>
                    <p>${note.content || 'Aucun contenu'}</p>
                </div>
            `;
            break;

        case 'liste':
            contentHTML = `
                <div class="view-field">
                    <label>Items</label>
                    <ul>
                        ${note.items.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            `;
            break;

        case 'contact':
            contentHTML = `
                <div class="view-field">
                    <label>Téléphone</label>
                    <p>${note.phone || 'Non renseigné'}</p>
                </div>
                <div class="view-field">
                    <label>Email</label>
                    <p>${note.email || 'Non renseigné'}</p>
                </div>
            `;
            break;

        case 'lieu':
            contentHTML = `
                <div class="view-field">
                    <label>Adresse</label>
                    <p>${note.address || 'Non renseignée'}</p>
                </div>
                <div class="view-field">
                    <label>Note</label>
                    <p>${note.note || 'Aucune note'}</p>
                </div>
            `;
            break;

        case 'tache':
            contentHTML = `
                <div class="view-field">
                    <label>Descriptif</label>
                    <p>${note.description || 'Aucun descriptif'}</p>
                </div>
                <div class="view-field">
                    <label>Date</label>
                    <p>${formatTaskDate(note.taskDate)}</p>
                </div>
            `;
            break;
    }

    contentHTML += `
        <div class="view-field">
            <label>Date de création</label>
            <p>${formatDate(note.date)}</p>
        </div>
    `;

    document.getElementById('viewContent').innerHTML = contentHTML;
    openModal(viewModal);
};

// Partage d'une note depuis la liste
window.shareNoteFromList = function(event, id) {
    event.stopPropagation();
    const note = notes.find(n => n.id === id);
    if (!note) return;

    let shareText = `${note.name}\n\n`;

    switch (note.type) {
        case 'simple':
            shareText += note.content;
            break;

        case 'liste':
            shareText += note.items.map((item, i) => `${i + 1}. ${item}`).join('\n');
            break;

        case 'contact':
            shareText += `Téléphone: ${note.phone || 'Non renseigné'}\n`;
            shareText += `Email: ${note.email || 'Non renseigné'}`;
            break;

        case 'lieu':
            shareText += `Adresse: ${note.address || 'Non renseignée'}\n`;
            shareText += `Note: ${note.note || 'Aucune note'}`;
            break;

        case 'tache':
            shareText += `Descriptif: ${note.description || 'Aucun descriptif'}\n`;
            shareText += `Date: ${formatTaskDate(note.taskDate)}`;
            break;
    }

    shareText += `\n\nCréé le ${formatDate(note.date)}`;

    // Utilisation de l'API Web Share si disponible
    if (navigator.share) {
        navigator.share({
            title: note.name,
            text: shareText
        }).catch(err => console.log('Partage annulé'));
    } else {
        // Fallback: copier dans le presse-papier
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Note copiée dans le presse-papier !');
        });
    }
};

// Modification d'une note
function editNote() {
    const note = notes.find(n => n.id === currentNoteId);
    if (!note) return;

    closeModal(viewModal);
    currentNoteType = note.type;
    showNoteForm(note.type, note);
}

// Suppression d'une note
function deleteNote() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) return;

    notes = notes.filter(n => n.id !== currentNoteId);
    saveNotes();
    renderNotes();
    closeModal(viewModal);
}

// Sauvegarde locale
function saveNotes() {
    localStorage.setItem('daysNotes', JSON.stringify(notes));
}

function loadNotes() {
    const saved = localStorage.getItem('daysNotes');
    if (saved) {
        notes = JSON.parse(saved);
    }
}