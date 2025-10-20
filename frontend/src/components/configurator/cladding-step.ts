import type { ConfigState, OnChange } from './types';

export function renderCladdingStep(root: HTMLElement, state: ConfigState, onChange: OnChange) {
  root.innerHTML = `
    <h2>Cladding</h2>
    <label><input type="radio" name="clad" value="panel" ${state.cladding==='panel'?'checked':''}/> Panel</label>
    <label><input type="radio" name="clad" value="timber" ${state.cladding==='timber'?'checked':''}/> Timber</label>
    <label><input type="radio" name="clad" value="render" ${state.cladding==='render'?'checked':''}/> Render</label>
  `;
  root.querySelectorAll<HTMLInputElement>('input[name=clad]').forEach(el => el.addEventListener('change', e => onChange({ cladding: (e.target as HTMLInputElement).value as any })));
}
