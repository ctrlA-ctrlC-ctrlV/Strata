export function renderProgress(el: HTMLElement, current: number, total: number, estimateText: string) {
  const pct = Math.round(((current + 1) / total) * 100);
  el.innerHTML = `
    <div aria-label="Progress ${pct}%" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" style="background:#eee;height:8px;border-radius:4px;overflow:hidden">
      <div style="width:${pct}%;height:100%;background:var(--accent,#0a6)"></div>
    </div>
    <p>Step ${current + 1} of ${total} • ${estimateText}</p>
  `;
}
