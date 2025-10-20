import type { ConfigState } from './types';

export type QuoteFormOptions = {
  onSubmitted?: () => void;
  state?: ConfigState;
};

export function renderQuoteForm(el: HTMLElement, opts: QuoteFormOptions = {}) {
  el.innerHTML = `
    <h3>Request a Quote</h3>
    <form id="quote-form" method="post" action="/api/quotes">
      <label>Name <input name="name" required></label>
      <label>Email <input type="email" name="email" required></label>
      <label>Phone <input name="phone"></label>
      <label>Address <input name="address"></label>
      <label>Eircode <input name="eircode" required></label>
      <label>County
        <select name="county" required>
          <option value="">Select</option>
          <option>Dublin</option>
          <option>Wicklow</option>
          <option>Kildare</option>
        </select>
      </label>
      <label>Timeframe
        <select name="timeframe">
          <option value="">Select</option>
          <option>Next month</option>
          <option>2-3 months</option>
          <option>3-6 months</option>
          <option>6+ months</option>
        </select>
      </label>
      <button type="submit">Request quote</button>
    </form>
  `;
  const form = el.querySelector<HTMLFormElement>('#quote-form')!;
  // Attach design state as hidden inputs for backend emails/storage
  if (opts.state) {
    const hidden = (name: string, value: string) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };
    hidden('widthM', String(opts.state.widthM));
    hidden('depthM', String(opts.state.depthM));
    hidden('vat', String(opts.state.vat));
    hidden('cladding', String(opts.state.cladding));
    hidden('bathroom', String(opts.state.bathroom));
    hidden('floor', String(opts.state.floor));
    hidden('openings_windows', String(opts.state.openings.windows));
    hidden('openings_doors', String(opts.state.openings.doors));
    hidden('openings_skylights', String(opts.state.openings.skylights));
    if (opts.state.extras?.size) hidden('extras', Array.from(opts.state.extras).join(','));
  }
  form.addEventListener('submit', async (e) => {
    try {
      e.preventDefault();
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form) });
      if (!res.ok) throw new Error('Submit failed');
      opts.onSubmitted?.();
    } catch {
      form.submit();
    }
  });
}
