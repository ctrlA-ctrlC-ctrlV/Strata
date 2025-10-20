import type { ConfigState, OnChange } from './types';
import { addOptionHelp } from './ui-helpers';

export function renderBathroomStep(root: HTMLElement, state: ConfigState, onChange: OnChange) {
  root.innerHTML = `
    <h2>Bathroom</h2>
    <label><input type="radio" name="bath" value="none" ${state.bathroom==='none'?'checked':''}/> None</label>
    <label><input type="radio" name="bath" value="half" ${state.bathroom==='half'?'checked':''}/> Half</label>
    <label><input type="radio" name="bath" value="three_quarter" ${state.bathroom==='three_quarter'?'checked':''}/> 3/4</label>
  `;
  
  // Add tooltips for bathroom options
  addOptionHelp(root, [
    { value: 'none', label: 'None', tooltip: 'No bathroom facilities included' },
    { value: 'half', label: 'Half', tooltip: 'Toilet and sink only' },
    { value: 'three_quarter', label: '3/4', tooltip: 'Toilet, sink, and shower' }
  ]);
  
  root.querySelectorAll<HTMLInputElement>('input[name=bath]').forEach(el => el.addEventListener('change', e => onChange({ bathroom: (e.target as HTMLInputElement).value as any })));
}
