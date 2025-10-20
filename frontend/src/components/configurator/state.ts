import type { ConfigState } from './types';

const KEY = 'configurator_state_v1';

export function saveState(state: ConfigState) {
  try {
    const serializable = { ...state, extras: Array.from(state.extras) };
    sessionStorage.setItem(KEY, JSON.stringify(serializable));
  } catch { /* ignore */ }
}

export function loadState(): ConfigState | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    return { ...obj, extras: new Set<string>(obj.extras || []) } as ConfigState;
  } catch { return null; }
}

export function clearState() {
  try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
}
