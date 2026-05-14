// ── storage.js ────────────────────────────────────────────
// Handles localStorage read/write. Keeps all I/O in one place.

import { AppState } from './models.js';

const KEY = 'taskflow_v1';

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state.toJSON()));
  } catch (err) {
    console.warn('[TaskFlow] Could not save to localStorage:', err);
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return AppState.fromJSON(JSON.parse(raw));
  } catch (err) {
    console.warn('[TaskFlow] Could not load from localStorage:', err);
    return null;
  }
}

export function clearState() {
  localStorage.removeItem(KEY);
}