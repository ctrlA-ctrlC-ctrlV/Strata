export function renderConfirmation(el: HTMLElement) {
  el.hidden = false;
  el.innerHTML = `
    <h2>Thanks! Your quote request is in.</h2>
    <p>We have sent a confirmation to your email and our team will follow up shortly.</p>
    <p><a href="/">Back to site</a></p>
  `;
}
