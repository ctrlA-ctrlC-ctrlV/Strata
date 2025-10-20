import type { ConfigState, OnChange } from './types';

export function renderBathroomStep(root: HTMLElement, state: ConfigState, onChange: OnChange) {
  root.innerHTML = `
    <h2>Bathroom</h2>
    <label><input type="radio" name="bath" value="none" ${state.bathroom==='none'?'checked':''}/> None</label>
    <label><input type="radio" name="bath" value="half" ${state.bathroom==='half'?'checked':''}/> Half</label>
    <label><input type="radio" name="bath" value="three_quarter" ${state.bathroom==='three_quarter'?'checked':''}/> 3/4</label>
  `;
  root.querySelectorAll<HTMLInputElement>('input[name=bath]').forEach(el => el.addEventListener('change', e => onChange({ bathroom: (e.target as HTMLInputElement).value as any })));
}
