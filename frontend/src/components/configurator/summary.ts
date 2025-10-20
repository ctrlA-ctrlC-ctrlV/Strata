import type { ConfigState } from './types';
import { estimate } from '../../lib/price';
import { renderBreakdown } from './breakdown';

export function renderSummary(el: HTMLElement, state: ConfigState) {
  const price = estimate({ widthM: state.widthM, depthM: state.depthM, vat: state.vat, extras: [] });
  const extras = Array.from(state.extras);
  el.innerHTML = `
    <h2>Summary</h2>
    <ul>
      <li>Size: ${state.widthM}m x ${state.depthM}m</li>
      <li>Cladding: ${state.cladding}</li>
      <li>Bathroom: ${state.bathroom}</li>
      <li>Floor: ${state.floor}</li>
      <li>Openings: ${state.openings.windows} windows, ${state.openings.doors} doors, ${state.openings.skylights} skylights</li>
      <li>Extras: ${extras.length ? extras.join(', ') : 'None'}</li>
      <li>Total: €${price.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</li>
    </ul>
    <div id="breakdown-section"></div>
    <div id="summary-actions"></div>
  `;
  
  // Add price breakdown section
  const breakdownSection = el.querySelector('#breakdown-section') as HTMLElement;
  renderBreakdown(breakdownSection, state, {
    onBreakdownRequest: (email) => {
      // Track breakdown request for analytics
      // In a real app, you might send this to your analytics service
      console.log('Breakdown requested for:', email);
    }
  });
}
