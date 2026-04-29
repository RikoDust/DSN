// ============================================================
//  importexport.js — Export et import des notes en JSON
// ============================================================

import { state }       from './state.js';
import { saveNotes }   from './storage.js';
import { renderNotes } from './render.js';

const STORAGE_KEY = 'daysNotes';

// ── Export ────────────────────────────────────────────────────

export function exportNotes() {
    const data     = JSON.stringify(state.notes, null, 2);
    const blob     = new Blob([data], { type: 'application/json' });
    const url      = URL.createObjectURL(blob);
    const a        = document.createElement('a');
    const date     = new Date().toISOString().slice(0, 10); // ex: 2025-04-29

    a.href         = url;
    a.download     = `daysnotes-backup-${date}.json`;
    a.click();

    URL.revokeObjectURL(url);
}

// ── Import ────────────────────────────────────────────────────

export function importNotes() {
    const input    = document.createElement('input');
    input.type     = 'file';
    input.accept   = '.json';

    input.addEventListener('change', () => {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.addEventListener('load', (e) => {
            try {
                const parsed = JSON.parse(e.target.result);

                if (!Array.isArray(parsed)) {
                    alert('Fichier invalide : le contenu n\'est pas une liste de notes.');
                    return;
                }

                state.notes = parsed;
                saveNotes();
                renderNotes();
                alert(`${parsed.length} note(s) importée(s) avec succès.`);

            } catch {
                alert('Erreur : le fichier sélectionné n\'est pas un JSON valide.');
            }
        });

        reader.readAsText(file);
    });

    input.click();
}
