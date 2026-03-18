// ============================================================
//  state.js — Source de vérité unique de l'application
//  Tous les modules importent depuis ce fichier.
// ============================================================
 
export const state = {
    notes: [],
    currentNoteId: null,
    currentNoteType: null,
    scrollPosition: 0,
};
 
// Icônes par type de note (partagées dans toute l'app)
export const noteIcons = {
    simple:  'fa-pen',
    liste:   'fa-tasks',
    contact: 'fa-user',
    lieu:    'fa-map-marker-alt',
    tache:   'fa-calendar-check',
};
