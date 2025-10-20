import type { ConfigState } from './types';
import { estimate } from '../../lib/price';

export type BreakdownOptions = {
  onBreakdownRequest?: (email: string) => void;
};

export function renderBreakdown(el: HTMLElement, state: ConfigState, opts: BreakdownOptions = {}) {
  const price = estimate({ widthM: state.widthM, depthM: state.depthM, vat: state.vat, extras: [] });
  
  el.innerHTML = `
    <div class="breakdown">
      <h3>Price Breakdown</h3>
      <div id="breakdown-gate">
        <p>Get a detailed cost breakdown sent to your email:</p>
        <form id="breakdown-form">
          <label>Email <input type="email" name="email" required placeholder="your@email.com"></label>
          <button type="submit">Send breakdown</button>
        </form>
      </div>
      <div id="breakdown-details" style="display: none;">
        <table>
          <tbody>
            <tr><td>Base structure</td><td>€${(price.subtotal * 0.6).toFixed(2)}</td></tr>
            <tr><td>Materials & finishing</td><td>€${(price.subtotal * 0.25).toFixed(2)}</td></tr>
            <tr><td>Installation & labor</td><td>€${(price.subtotal * 0.15).toFixed(2)}</td></tr>
            <tr><td><strong>Subtotal</strong></td><td><strong>€${price.subtotal.toFixed(2)}</strong></td></tr>
            ${state.vat ? `<tr><td>VAT (23%)</td><td>€${price.vat.toFixed(2)}</td></tr>` : ''}
            <tr><td><strong>Total</strong></td><td><strong>€${price.total.toFixed(2)}</strong></td></tr>
          </tbody>
        </table>
        <p><small>*Estimate only. Final quote may vary based on site conditions and specifications.</small></p>
      </div>
    </div>
  `;
  
  const form = el.querySelector('#breakdown-form') as HTMLFormElement;
  const gate = el.querySelector('#breakdown-gate') as HTMLElement;
  const details = el.querySelector('#breakdown-details') as HTMLElement;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const email = formData.get('email') as string;
    
    if (email) {
      // Hide gate and show breakdown
      gate.style.display = 'none';
      details.style.display = 'block';
      
      // Callback for email capture
      opts.onBreakdownRequest?.(email);
    }
  });
}

export function getBreakdownText(state: ConfigState): string {
  const price = estimate({ widthM: state.widthM, depthM: state.depthM, vat: state.vat, extras: [] });
  
  const lines = [
    'PRICE BREAKDOWN',
    '================',
    '',
    `Garden Room: ${state.widthM}m x ${state.depthM}m`,
    `Cladding: ${state.cladding}`,
    `Bathroom: ${state.bathroom}`,
    `Floor: ${state.floor}`,
    '',
    'Cost Breakdown:',
    `Base structure: €${(price.subtotal * 0.6).toFixed(2)}`,
    `Materials & finishing: €${(price.subtotal * 0.25).toFixed(2)}`,
    `Installation & labor: €${(price.subtotal * 0.15).toFixed(2)}`,
    `Subtotal: €${price.subtotal.toFixed(2)}`
  ];
  
  if (state.vat) {
    lines.push(`VAT (23%): €${price.vat.toFixed(2)}`);
  }
  
  lines.push(
    `Total: €${price.total.toFixed(2)}`,
    '',
    '*Estimate only. Final quote may vary based on site conditions and specifications.'
  );
  
  return lines.join('\n');
}