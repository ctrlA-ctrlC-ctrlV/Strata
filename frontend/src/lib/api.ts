export async function postQuote(form: HTMLFormElement) {
  // Progressive enhancement: submitting the form will work without JS
  // With JS, we can later intercept and show inline confirmation
  return fetch('/api/quotes', { method: 'POST', body: new FormData(form) });
}
