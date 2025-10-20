export function addTooltip(element: HTMLElement, text: string) {
  element.setAttribute('title', text);
  element.setAttribute('aria-describedby', `tooltip-${Math.random().toString(36).substr(2, 9)}`);
  
  // Add visual tooltip on hover for better UX
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.textContent = text;
  tooltip.style.cssText = `
    position: absolute;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 1000;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
  `;
  
  element.style.position = 'relative';
  element.appendChild(tooltip);
  
  element.addEventListener('mouseenter', () => {
    tooltip.style.opacity = '1';
    tooltip.style.bottom = '100%';
    tooltip.style.left = '50%';
    tooltip.style.transform = 'translateX(-50%)';
    tooltip.style.marginBottom = '4px';
  });
  
  element.addEventListener('mouseleave', () => {
    tooltip.style.opacity = '0';
  });
}

export function addImagePreview(element: HTMLElement, imageUrl: string, altText: string) {
  const preview = document.createElement('img');
  preview.src = imageUrl;
  preview.alt = altText;
  preview.style.cssText = `
    max-width: 200px;
    max-height: 150px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    display: none;
    position: absolute;
    z-index: 1000;
    pointer-events: none;
  `;
  
  element.style.position = 'relative';
  element.appendChild(preview);
  
  element.addEventListener('mouseenter', () => {
    preview.style.display = 'block';
    preview.style.top = '100%';
    preview.style.left = '50%';
    preview.style.transform = 'translateX(-50%)';
    preview.style.marginTop = '8px';
  });
  
  element.addEventListener('mouseleave', () => {
    preview.style.display = 'none';
  });
  
  // Add ARIA live region for screen readers
  element.setAttribute('aria-describedby', `preview-${Math.random().toString(36).substr(2, 9)}`);
  const liveRegion = document.createElement('div');
  liveRegion.id = element.getAttribute('aria-describedby')!;
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
  liveRegion.textContent = `Image preview available: ${altText}`;
  document.body.appendChild(liveRegion);
}

export function addOptionHelp(container: HTMLElement, options: { value: string; label: string; tooltip?: string; imageUrl?: string }[]) {
  options.forEach(option => {
    const optionEl = container.querySelector(`[value="${option.value}"]`) as HTMLElement;
    if (!optionEl) return;
    
    const label = optionEl.closest('label') || optionEl.parentElement;
    if (!label) return;
    
    if (option.tooltip) {
      addTooltip(label as HTMLElement, option.tooltip);
    }
    
    if (option.imageUrl) {
      addImagePreview(label as HTMLElement, option.imageUrl, option.label);
    }
  });
}