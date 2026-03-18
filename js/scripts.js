// ============================================================
//  script.js — Point d'entrée de l'application
//  Rôle unique : initialiser et câbler les événements.
// ============================================================
 
import { state }                              from './state.js';
import { loadNotes }                          from './storage.js';
import { renderNotes }                        from './render.js';
import { openModal, closeModal, setupModalClosers } from './modals.js';
import { showNoteForm }                       from './forms.js';
import { editNote, deleteNote }               from './notes.js';
import { initTheme, toggleTheme }             from './darkmode.js';
import { initFilterSystem }                   from './filters.js';
 
// ── Éléments DOM ──────────────────────────────────────────────
 
const header    = document.getElementById('header');
const addButton = document.getElementById('addButton');
const typeModal = document.getElementById('typeModal');
const formModal = document.getElementById('formModal');
const viewModal = document.getElementById('viewModal');
 
// ── Initialisation ────────────────────────────────────────────
 
document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
    renderNotes();
    initTheme();
    initFilterSystem();
    setupEventListeners();
});
 
// ── Événements ────────────────────────────────────────────────
 
function setupEventListeners() {
    // Header scroll
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });
 
    // Bouton "+" → modale de sélection du type
    addButton.addEventListener('click', () => openModal(typeModal));
 
    // Toggle thème
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
 
    // Fermetures génériques des modales (bouton × + clic extérieur)
    setupModalClosers({ typeModal, formModal, viewModal });
 
    // Sélection du type de note
    document.querySelectorAll('.note-type-item').forEach(item => {
        item.addEventListener('click', () => {
            const type = item.dataset.type;
            state.currentNoteType = type;
            closeModal(typeModal);
            showNoteForm(type);
        });
    });
 
    // Boutons de la modale de visualisation
    document.getElementById('editBtn').addEventListener('click', editNote);
    document.getElementById('deleteBtn').addEventListener('click', deleteNote);
}
