// ============================================================
//  storage.js — Persistance locale (localStorage)
//  Aucune dépendance sur le DOM.
// ============================================================
 
import { state } from './state.js';
 
const STORAGE_KEY = 'daysNotes';
 
export function saveNotes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.notes));
}
 
export function loadNotes() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        state.notes = JSON.parse(saved);
    }
}
