import { useSyncExternalStore } from 'react';
import { emptyState, SCHEMA_VERSION, STORAGE_KEY, type AppState } from './schema';

/** All reads and writes go through here. If storage is blocked the app runs from memory. */
let memory: AppState | null = null;
let storageWorks = true;
const listeners = new Set<() => void>();

function readStorage(): AppState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return migrate(JSON.parse(raw));
  } catch {
    storageWorks = false;
    return null;
  }
}

function writeStorage(state: AppState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    storageWorks = true;
  } catch {
    storageWorks = false;
  }
}

/** Fills anything missing, so older exports and partial imports still load. */
export function migrate(raw: unknown): AppState | null {
  if (!raw || typeof raw !== 'object') return null;
  const base = emptyState();
  const r = raw as Partial<AppState>;
  if (typeof r.version !== 'number' || r.version > SCHEMA_VERSION) return null;
  return {
    ...base,
    ...r,
    version: SCHEMA_VERSION,
    settings: { ...base.settings, ...r.settings },
    community: { ...base.community, ...r.community },
    purchases: { ...base.purchases, ...r.purchases },
  };
}

export function getState(): AppState {
  if (!memory) memory = readStorage() ?? emptyState();
  return memory;
}

export function setState(next: AppState) {
  memory = next;
  writeStorage(next);
  listeners.forEach((l) => l());
}

/** Replace state through a function of the current state. */
export function update(fn: (s: AppState) => AppState) {
  setState(fn(getState()));
}

export function isUsingStorage(): boolean {
  return storageWorks;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useApp(): AppState;
export function useApp<T>(select: (s: AppState) => T): T;
export function useApp<T>(select?: (s: AppState) => T) {
  return useSyncExternalStore(subscribe, () => (select ? select(getState()) : getState()));
}

export const today = () => new Date(Date.now());

export function resetAll() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    storageWorks = false;
  }
  setState(emptyState());
}
