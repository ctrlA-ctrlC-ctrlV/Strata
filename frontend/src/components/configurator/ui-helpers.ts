/**
 * UI Helpers for Configurator
 * Provides tooltips and image previews with accessible labels
 */

export interface TooltipOptions {
  content: string;
  trigger?: 'hover' | 'click' | 'focus';
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  delay?: number;
  maxWidth?: number;
  allowHtml?: boolean;
}

export interface ImagePreviewOptions {
  src: string;
  alt: string;
  caption?: string;
  thumbnailSrc?: string;
  zoomable?: boolean;
  lazyLoad?: boolean;
}

/**
 * Tooltip manager for configuration options
 */
export class TooltipManager {
  private static instance: TooltipManager;
  private activeTooltip: HTMLElement | null = null;
  private tooltipTimeout?: number;

  public static getInstance(): TooltipManager {
    if (!TooltipManager.instance) {
      TooltipManager.instance = new TooltipManager();
    }
    return TooltipManager.instance;
  }

  constructor() {
    this.bindGlobalEvents();
    this.injectStyles();
  }

  /**
   * Add tooltip to an element
   */
  public addTooltip(element: HTMLElement, options: TooltipOptions): void {
    element.setAttribute('data-tooltip', 'true');
    element.setAttribute('data-tooltip-content', options.content);
    element.setAttribute('data-tooltip-position', options.position || 'auto');
    
    if (options.maxWidth) {
      element.setAttribute('data-tooltip-max-width', options.maxWidth.toString());
    }
    
    if (options.allowHtml) {
      element.setAttribute('data-tooltip-html', 'true');
    }

    const trigger = options.trigger || 'hover';
    
    // Add ARIA attributes for accessibility
    if (!element.hasAttribute('aria-describedby')) {
      const tooltipId = `tooltip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      element.setAttribute('aria-describedby', tooltipId);
      element.setAttribute('data-tooltip-id', tooltipId);
    }

    // Bind events based on trigger
    if (trigger === 'hover') {
      element.addEventListener('mouseenter', () => this.showTooltip(element, options));
      element.addEventListener('mouseleave', () => this.hideTooltip(options.delay));
      element.addEventListener('focus', () => this.showTooltip(element, options));
      element.addEventListener('blur', () => this.hideTooltip(options.delay));
    } else if (trigger === 'click') {
      element.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleTooltip(element, options);
      });
    } else if (trigger === 'focus') {
      element.addEventListener('focus', () => this.showTooltip(element, options));
      element.addEventListener('blur', () => this.hideTooltip(options.delay));
    }

    // Make element keyboard accessible if not already
    if (!element.hasAttribute('tabindex') && !this.isInteractiveElement(element)) {
      element.setAttribute('tabindex', '0');
    }
  }

  /**
   * Show tooltip for element
   */
  private showTooltip(element: HTMLElement, options: TooltipOptions): void {
    // Clear any existing timeout
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
    }

    // Hide any existing tooltip
    if (this.activeTooltip) {
      this.hideTooltip(0);
    }

    const delay = options.delay || 0;
    
    this.tooltipTimeout = setTimeout(() => {
      this.createTooltip(element, options);
    }, delay);
  }

  /**
   * Create and position tooltip
   */
  private createTooltip(element: HTMLElement, options: TooltipOptions): void {
    const tooltipId = element.getAttribute('data-tooltip-id') || 'tooltip';
    
    const tooltip = document.createElement('div');
    tooltip.id = tooltipId;
    tooltip.className = 'ui-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.setAttribute('aria-hidden', 'false');

    // Set content
    if (options.allowHtml) {
      tooltip.innerHTML = options.content;
    } else {
      tooltip.textContent = options.content;
    }

    // Apply max width if specified
    if (options.maxWidth) {
      tooltip.style.maxWidth = `${options.maxWidth}px`;
    }

    // Add to DOM
    document.body.appendChild(tooltip);
    this.activeTooltip = tooltip;

    // Position tooltip
    this.positionTooltip(tooltip, element, options.position || 'auto');

    // Animate in
    requestAnimationFrame(() => {
      tooltip.classList.add('ui-tooltip--visible');
    });
  }

  /**
   * Position tooltip relative to element
   */
  private positionTooltip(tooltip: HTMLElement, element: HTMLElement, position: string): void {
    const elementRect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    let top: number;
    let left: number;
    let actualPosition = position;

    // Auto positioning logic
    if (position === 'auto') {
      const spaceAbove = elementRect.top;
      const spaceBelow = viewportHeight - elementRect.bottom;
      const spaceRight = viewportWidth - elementRect.right;

      if (spaceBelow >= tooltipRect.height || spaceBelow >= spaceAbove) {
        actualPosition = 'bottom';
      } else if (spaceAbove >= tooltipRect.height) {
        actualPosition = 'top';
      } else if (spaceRight >= tooltipRect.width) {
        actualPosition = 'right';
      } else {
        actualPosition = 'left';
      }
    }

    // Calculate position based on determined placement
    switch (actualPosition) {
      case 'top':
        top = elementRect.top + scrollY - tooltipRect.height - 8;
        left = elementRect.left + scrollX + (elementRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = elementRect.bottom + scrollY + 8;
        left = elementRect.left + scrollX + (elementRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = elementRect.top + scrollY + (elementRect.height - tooltipRect.height) / 2;
        left = elementRect.left + scrollX - tooltipRect.width - 8;
        break;
      case 'right':
        top = elementRect.top + scrollY + (elementRect.height - tooltipRect.height) / 2;
        left = elementRect.right + scrollX + 8;
        break;
      default:
        top = elementRect.bottom + scrollY + 8;
        left = elementRect.left + scrollX;
    }

    // Ensure tooltip stays within viewport
    left = Math.max(8, Math.min(left, viewportWidth - tooltipRect.width - 8));
    top = Math.max(8, Math.min(top, viewportHeight - tooltipRect.height - 8));

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
    tooltip.setAttribute('data-position', actualPosition);
  }

  /**
   * Hide tooltip
   */
  private hideTooltip(delay: number = 200): void {
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
    }

    this.tooltipTimeout = setTimeout(() => {
      if (this.activeTooltip) {
        this.activeTooltip.classList.remove('ui-tooltip--visible');
        setTimeout(() => {
          if (this.activeTooltip && this.activeTooltip.parentNode) {
            this.activeTooltip.parentNode.removeChild(this.activeTooltip);
          }
          this.activeTooltip = null;
        }, 200);
      }
    }, delay);
  }

  /**
   * Toggle tooltip visibility
   */
  private toggleTooltip(element: HTMLElement, options: TooltipOptions): void {
    if (this.activeTooltip) {
      this.hideTooltip(0);
    } else {
      this.showTooltip(element, options);
    }
  }

  /**
   * Check if element is naturally interactive
   */
  private isInteractiveElement(element: HTMLElement): boolean {
    const interactiveTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
    return interactiveTags.includes(element.tagName) || 
           element.hasAttribute('onclick') ||
           element.hasAttribute('role');
  }

  /**
   * Bind global events
   */
  private bindGlobalEvents(): void {
    // Close tooltip on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeTooltip) {
        this.hideTooltip(0);
      }
    });

    // Close tooltip on outside click
    document.addEventListener('click', (e) => {
      if (this.activeTooltip && !this.activeTooltip.contains(e.target as Node)) {
        this.hideTooltip(0);
      }
    });

    // Hide tooltip on scroll
    document.addEventListener('scroll', () => {
      if (this.activeTooltip) {
        this.hideTooltip(0);
      }
    }, { passive: true });
  }

  /**
   * Inject tooltip styles
   */
  private injectStyles(): void {
    if (document.querySelector('#ui-tooltip-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'ui-tooltip-styles';
    styles.textContent = TOOLTIP_STYLES;
    document.head.appendChild(styles);
  }
}

/**
 * Image Preview Manager
 */
export class ImagePreviewManager {
  private static instance: ImagePreviewManager;
  private activePreview: HTMLElement | null = null;
  private previewContainer!: HTMLElement;

  public static getInstance(): ImagePreviewManager {
    if (!ImagePreviewManager.instance) {
      ImagePreviewManager.instance = new ImagePreviewManager();
    }
    return ImagePreviewManager.instance;
  }

  constructor() {
    this.createPreviewContainer();
    this.bindGlobalEvents();
    this.injectStyles();
  }

  /**
   * Add image preview to an element
   */
  public addImagePreview(element: HTMLElement, options: ImagePreviewOptions): void {
    element.setAttribute('data-image-preview', 'true');
    element.setAttribute('data-preview-src', options.src);
    element.setAttribute('data-preview-alt', options.alt);
    
    if (options.caption) {
      element.setAttribute('data-preview-caption', options.caption);
    }
    
    if (options.zoomable) {
      element.setAttribute('data-preview-zoomable', 'true');
    }

    // Add ARIA attributes
    element.setAttribute('aria-haspopup', 'dialog');
    element.setAttribute('aria-label', `View larger image: ${options.alt}`);

    // Make keyboard accessible
    if (!element.hasAttribute('tabindex') && !this.isInteractiveElement(element)) {
      element.setAttribute('tabindex', '0');
    }

    // Bind events
    element.addEventListener('click', (e) => {
      e.preventDefault();
      this.showPreview(options);
    });

    element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.showPreview(options);
      }
    });

    // If it's an image element, set up lazy loading
    if (element.tagName === 'IMG' && options.lazyLoad) {
      this.setupLazyLoading(element as HTMLImageElement, options);
    }
  }

  /**
   * Show image preview
   */
  private showPreview(options: ImagePreviewOptions): void {
    if (this.activePreview) {
      this.hidePreview();
    }

    const preview = document.createElement('div');
    preview.className = 'image-preview';
    preview.setAttribute('role', 'dialog');
    preview.setAttribute('aria-modal', 'true');
    preview.setAttribute('aria-labelledby', 'preview-title');

    const img = new Image();
    img.onload = () => {
      preview.innerHTML = `
        <div class="image-preview__overlay"></div>
        <div class="image-preview__container">
          <div class="image-preview__header">
            <h3 id="preview-title" class="image-preview__title">${options.alt}</h3>
            <button class="image-preview__close" aria-label="Close preview">&times;</button>
          </div>
          <div class="image-preview__content">
            <img src="${options.src}" alt="${options.alt}" class="image-preview__image ${options.zoomable ? 'image-preview__image--zoomable' : ''}" />
            ${options.caption ? `<p class="image-preview__caption">${options.caption}</p>` : ''}
          </div>
        </div>
      `;

      this.previewContainer.appendChild(preview);
      this.activePreview = preview;

      // Focus management
      const closeButton = preview.querySelector('.image-preview__close') as HTMLButtonElement;
      closeButton.focus();

      // Bind close events
      closeButton.addEventListener('click', () => this.hidePreview());
      preview.querySelector('.image-preview__overlay')?.addEventListener('click', () => this.hidePreview());

      // Animate in
      requestAnimationFrame(() => {
        preview.classList.add('image-preview--visible');
      });

      // Set up zoom if enabled
      if (options.zoomable) {
        this.setupZoom(preview.querySelector('.image-preview__image') as HTMLImageElement);
      }
    };

    img.onerror = () => {
      console.error('Failed to load preview image:', options.src);
    };

    img.src = options.src;
  }

  /**
   * Hide image preview
   */
  private hidePreview(): void {
    if (this.activePreview) {
      this.activePreview.classList.remove('image-preview--visible');
      setTimeout(() => {
        if (this.activePreview && this.activePreview.parentNode) {
          this.activePreview.parentNode.removeChild(this.activePreview);
        }
        this.activePreview = null;
      }, 300);
    }
  }

  /**
   * Setup lazy loading for images
   */
  private setupLazyLoading(img: HTMLImageElement, options: ImagePreviewOptions): void {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const thumbnail = options.thumbnailSrc || options.src;
            img.src = thumbnail;
            img.classList.remove('image-lazy');
            observer.unobserve(img);
          }
        });
      });

      img.classList.add('image-lazy');
      observer.observe(img);
    } else {
      // Fallback for older browsers
      img.src = options.thumbnailSrc || options.src;
    }
  }

  /**
   * Setup zoom functionality
   */
  private setupZoom(img: HTMLImageElement): void {
    let isZoomed = false;
    
    img.addEventListener('click', () => {
      if (isZoomed) {
        img.classList.remove('image-preview__image--zoomed');
        isZoomed = false;
      } else {
        img.classList.add('image-preview__image--zoomed');
        isZoomed = true;
      }
    });

    img.style.cursor = 'zoom-in';
  }

  /**
   * Create preview container
   */
  private createPreviewContainer(): void {
    this.previewContainer = document.createElement('div');
    this.previewContainer.id = 'image-preview-container';
    this.previewContainer.className = 'image-preview-container';
    document.body.appendChild(this.previewContainer);
  }

  /**
   * Check if element is interactive
   */
  private isInteractiveElement(element: HTMLElement): boolean {
    const interactiveTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
    return interactiveTags.includes(element.tagName);
  }

  /**
   * Bind global events
   */
  private bindGlobalEvents(): void {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activePreview) {
        this.hidePreview();
      }
    });
  }

  /**
   * Inject preview styles
   */
  private injectStyles(): void {
    if (document.querySelector('#image-preview-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'image-preview-styles';
    styles.textContent = IMAGE_PREVIEW_STYLES;
    document.head.appendChild(styles);
  }
}

/**
 * Utility functions
 */
export function addTooltip(element: HTMLElement, content: string, options?: Partial<TooltipOptions>): void {
  const manager = TooltipManager.getInstance();
  manager.addTooltip(element, { content, ...options });
}

export function addImagePreview(element: HTMLElement, src: string, alt: string, options?: Partial<ImagePreviewOptions>): void {
  const manager = ImagePreviewManager.getInstance();
  manager.addImagePreview(element, { src, alt, ...options });
}

/**
 * CSS Styles for tooltips
 */
const TOOLTIP_STYLES = `
.ui-tooltip {
  position: absolute;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.4;
  max-width: 250px;
  word-wrap: break-word;
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.ui-tooltip--visible {
  opacity: 1;
  transform: translateY(0);
}

.ui-tooltip::after {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border: 5px solid transparent;
}

.ui-tooltip[data-position="top"]::after {
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  border-top-color: rgba(0, 0, 0, 0.9);
}

.ui-tooltip[data-position="bottom"]::after {
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-color: rgba(0, 0, 0, 0.9);
}

.ui-tooltip[data-position="left"]::after {
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  border-left-color: rgba(0, 0, 0, 0.9);
}

.ui-tooltip[data-position="right"]::after {
  left: -10px;
  top: 50%;
  transform: translateY(-50%);
  border-right-color: rgba(0, 0, 0, 0.9);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .ui-tooltip {
    background: black;
    border: 2px solid white;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .ui-tooltip {
    transition: none;
  }
}
`;

/**
 * CSS Styles for image previews
 */
const IMAGE_PREVIEW_STYLES = `
.image-preview-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}

.image-preview {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  pointer-events: all;
}

.image-preview--visible {
  opacity: 1;
  visibility: visible;
}

.image-preview__overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
}

.image-preview__container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  transform: scale(0.9);
  transition: transform 0.3s ease;
}

.image-preview--visible .image-preview__container {
  transform: scale(1);
}

.image-preview__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.image-preview__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #212529;
}

.image-preview__close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s, color 0.2s;
}

.image-preview__close:hover,
.image-preview__close:focus {
  background-color: #e9ecef;
  color: #495057;
  outline: none;
}

.image-preview__content {
  padding: 1.5rem;
  text-align: center;
}

.image-preview__image {
  max-width: 100%;
  max-height: 70vh;
  height: auto;
  border-radius: 4px;
  transition: transform 0.3s ease;
}

.image-preview__image--zoomable {
  cursor: zoom-in;
}

.image-preview__image--zoomed {
  transform: scale(1.5);
  cursor: zoom-out;
}

.image-preview__caption {
  margin: 1rem 0 0;
  color: #6c757d;
  font-size: 0.875rem;
  line-height: 1.5;
}

.image-lazy {
  background: #f8f9fa;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-lazy::before {
  content: 'Loading...';
  color: #6c757d;
}

/* Mobile styles */
@media (max-width: 768px) {
  .image-preview__container {
    max-width: 95vw;
    max-height: 95vh;
    margin: 1rem;
  }
  
  .image-preview__header {
    padding: 0.75rem 1rem;
  }
  
  .image-preview__title {
    font-size: 1rem;
  }
  
  .image-preview__content {
    padding: 1rem;
  }
  
  .image-preview__image {
    max-height: 60vh;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .image-preview__overlay {
    background: black;
  }
  
  .image-preview__container {
    border: 2px solid white;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .image-preview,
  .image-preview__container,
  .image-preview__image {
    transition: none;
  }
}
`;