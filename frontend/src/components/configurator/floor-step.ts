import type { ConfigState, OnChange } from './types';

export function renderFloorStep(root: HTMLElement, state: ConfigState, onChange: OnChange) {
  root.innerHTML = `
    <h2>Floor</h2>
    <label><input type="radio" name="floor" value="none" ${state.floor==='none'?'checked':''}/> None</label>
    <label><input type="radio" name="floor" value="wooden" ${state.floor==='wooden'?'checked':''}/> Wooden</label>
    <label><input type="radio" name="floor" value="tile" ${state.floor==='tile'?'checked':''}/> Tile</label>
  `;
  root.querySelectorAll<HTMLInputElement>('input[name=floor]').forEach(el => el.addEventListener('change', e => onChange({ floor: (e.target as HTMLInputElement).value as any })));
}
