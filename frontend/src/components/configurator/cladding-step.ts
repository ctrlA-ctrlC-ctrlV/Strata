import type { ConfigState, OnChange } from './types';
import { addOptionHelp } from './ui-helpers';

export function renderCladdingStep(root: HTMLElement, state: ConfigState, onChange: OnChange) {
  root.innerHTML = `
    <h2>Cladding</h2>
    <label><input type="radio" name="clad" value="panel" ${state.cladding==='panel'?'checked':''}/> Panel</label>
    <label><input type="radio" name="clad" value="timber" ${state.cladding==='timber'?'checked':''}/> Timber</label>
    <label><input type="radio" name="clad" value="render" ${state.cladding==='render'?'checked':''}/> Render</label>
  `;
  
  // Add tooltips for cladding options
  addOptionHelp(root, [
    { value: 'panel', label: 'Panel', tooltip: 'Composite panels - low maintenance, modern appearance' },
    { value: 'timber', label: 'Timber', tooltip: 'Natural wood cladding - traditional look, requires maintenance' },
    { value: 'render', label: 'Render', tooltip: 'Smooth render finish - contemporary style, weather resistant' }
  ]);
  
  root.querySelectorAll<HTMLInputElement>('input[name=clad]').forEach(el => el.addEventListener('change', e => onChange({ cladding: (e.target as HTMLInputElement).value as any })));
}
