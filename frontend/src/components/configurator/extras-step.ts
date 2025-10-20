import type { ConfigState, OnChange } from './types';

const EXTRA_OPTIONS = [
  { key: 'esp_insulation', label: 'ESP Insulation' },
  { key: 'render_finish', label: 'Render Finish' },
  { key: 'steel_door', label: 'Steel Door' }
];

export function renderExtrasStep(root: HTMLElement, state: ConfigState, onChange: OnChange) {
  root.innerHTML = `
    <h2>Extras</h2>
    ${EXTRA_OPTIONS.map(o => `<label><input type=\"checkbox\" data-key=\"${o.key}\" ${state.extras.has(o.key)?'checked':''}/> ${o.label}</label>`).join('')}
  `;
  root.querySelectorAll<HTMLInputElement>('input[type=checkbox][data-key]').forEach(el => el.addEventListener('change', e => {
    const k = (e.target as HTMLInputElement).dataset.key!;
    const next = new Set(state.extras);
    if ((e.target as HTMLInputElement).checked) next.add(k); else next.delete(k);
    onChange({ extras: next as any });
  }));
}
