import type { ConfigState, OnChange } from './types';

export function renderSizeStep(root: HTMLElement, state: ConfigState, onChange: OnChange) {
  root.innerHTML = `
    <h2>Size</h2>
    <label>Width (m) <input id="w" type="number" min="2" max="8" step="0.1" value="${state.widthM}"></label>
    <label>Depth (m) <input id="d" type="number" min="2" max="8" step="0.1" value="${state.depthM}"></label>
    <label><input id="vat" type="checkbox" ${state.vat ? 'checked' : ''}/> Include VAT</label>
  `;
  root.querySelector<HTMLInputElement>('#w')?.addEventListener('input', e => onChange({ widthM: Number((e.target as HTMLInputElement).value) || 0 }));
  root.querySelector<HTMLInputElement>('#d')?.addEventListener('input', e => onChange({ depthM: Number((e.target as HTMLInputElement).value) || 0 }));
  root.querySelector<HTMLInputElement>('#vat')?.addEventListener('change', e => onChange({ vat: (e.target as HTMLInputElement).checked }));
}
