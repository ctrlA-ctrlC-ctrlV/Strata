import type { ConfigState } from './types';
import { estimate } from '../../lib/price';

export function getDesignSummaryText(state: ConfigState) {
  const price = estimate({ widthM: state.widthM, depthM: state.depthM, vat: state.vat, extras: [] });
  const lines = [
    `Garden Room Design`,
    `Size: ${state.widthM}m x ${state.depthM}m`,
    `Cladding: ${state.cladding}`,
    `Bathroom: ${state.bathroom}`,
    `Floor: ${state.floor}`,
    `Openings: ${state.openings.windows} windows, ${state.openings.doors} doors, ${state.openings.skylights} skylights`
  ];
  if (state.extras.size) lines.push(`Extras: ${Array.from(state.extras).join(', ')}`);
  lines.push(`Estimate Total: €${price.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
  return lines.join('\n');
}

export function attachEmailDesignButtons(container: HTMLElement, state: ConfigState) {
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <button id="email-design" type="button">Email this design to me</button>
    <button id="download-summary" type="button">Download summary</button>
  `;
  container.appendChild(wrap);
  wrap.querySelector<HTMLButtonElement>('#email-design')?.addEventListener('click', () => {
    const emailEl = document.querySelector<HTMLInputElement>('form#quote-form input[name=email]');
    const to = emailEl?.value || '';
    const subject = encodeURIComponent('My Garden Room Design Summary');
    const body = encodeURIComponent(getDesignSummaryText(state));
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  });
  wrap.querySelector<HTMLButtonElement>('#download-summary')?.addEventListener('click', () => {
    const text = getDesignSummaryText(state);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'garden-room-summary.txt';
    a.click();
    URL.revokeObjectURL(url);
  });
}
