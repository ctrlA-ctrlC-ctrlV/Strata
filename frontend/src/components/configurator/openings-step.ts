import type { ConfigState, OnChange } from './types';

export function renderOpeningsStep(root: HTMLElement, state: ConfigState, onChange: OnChange) {
  root.innerHTML = `
    <h2>Openings</h2>
    <label>Windows <input id="windows" type="number" min="0" max="10" step="1" value="${state.openings.windows}"></label>
    <label>Doors <input id="doors" type="number" min="0" max="5" step="1" value="${state.openings.doors}"></label>
    <label>Skylights <input id="skylights" type="number" min="0" max="5" step="1" value="${state.openings.skylights}"></label>
  `;
  root.querySelector<HTMLInputElement>('#windows')?.addEventListener('input', e => onChange({ openings: { ...state.openings, windows: Number((e.target as HTMLInputElement).value) || 0 } } as any));
  root.querySelector<HTMLInputElement>('#doors')?.addEventListener('input', e => onChange({ openings: { ...state.openings, doors: Number((e.target as HTMLInputElement).value) || 0 } } as any));
  root.querySelector<HTMLInputElement>('#skylights')?.addEventListener('input', e => onChange({ openings: { ...state.openings, skylights: Number((e.target as HTMLInputElement).value) || 0 } } as any));
}
