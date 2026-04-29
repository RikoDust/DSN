// ============================================================
//  script.js — Point d'entrée de l'application
//  Rôle unique : initialiser et câbler les événements.
// ============================================================

import { state }                                        from './state.js';
import { loadNotes }                                    from './storage.js';
import { renderNotes }                                  from './render.js';
import { openModal, closeModal, setupModalClosers }     from './modals.js';
import { showNoteForm }                                 from './forms.js';
import { editNote, deleteNote }                         from './notes.js';
import { initTheme, toggleTheme }                       from './darkmode.js';
import { initFilterSystem }                             from './filters.js';

// ── Éléments DOM ──────────────────────────────────────────────

const header        = document.getElementById('header');
const addButton     = document.getElementById('addButton');
const typeModal     = document.getElementById('typeModal');
const formModal     = document.getElementById('formModal');
const viewModal     = document.getElementById('viewModal');
const burgerBtn     = document.getElementById('burgerBtn');
const burgerMenu    = document.getElementById('burgerMenu');
const burgerOverlay = document.getElementById('burgerOverlay');

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

    // Toggle thème (switch checkbox dans le menu burger)
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.addEventListener('change', toggleTheme);

    // Menu burger
    function toggleMenu(open) {
        burgerBtn.classList.toggle('open', open);
        burgerMenu.classList.toggle('open', open);
        burgerOverlay.classList.toggle('open', open);
        burgerBtn.setAttribute('aria-expanded', open);
        burgerMenu.setAttribute('aria-hidden', !open);
    }

    burgerBtn.addEventListener('click', () => {
        toggleMenu(!burgerMenu.classList.contains('open'));
    });

    burgerOverlay.addEventListener('click', () => toggleMenu(false));

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