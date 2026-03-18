// ============================================================
//  modals.js — Gestion des modales
//  Ouvre / ferme les modales et contrôle le scroll du body.
// ============================================================
 
import { state } from './state.js';
 
export function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}
 
export function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}
 
// Attache les comportements génériques de fermeture (clic extérieur, bouton ×)
// à toutes les modales passées en paramètre.
export function setupModalClosers({ typeModal, formModal, viewModal }) {
    document.getElementById('closeTypeModal').addEventListener('click', () => {
        closeModal(typeModal);
    });
 
    document.getElementById('closeFormModal').addEventListener('click', () => {
        closeModal(formModal);
    });
 
    document.getElementById('closeViewModal').addEventListener('click', () => {
        closeModal(viewModal);
        state.scrollPosition = 0;
    });
 
    [typeModal, formModal, viewModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
                if (modal === viewModal) {
                    state.scrollPosition = 0;
                }
            }
        });
    });
}
