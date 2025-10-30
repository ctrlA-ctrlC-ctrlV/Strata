// Testimonial Component - Static-first with TypeScript enhancement
// Displays customer testimonials with navigation controls

export interface TestimonialData {
  id: string;
  quote: string;
  rating: number;
  authorFirstName: string;
  authorInitial: string;
  projectArea: string;
  image?: {
    src: string;
    alt: string;
    width: number;
    height: number;
    srcset?: string;
  };
}

export interface TestimonialConfig {
  testimonials?: TestimonialData[];
  showNavigation?: boolean;
  autoRotate?: boolean;
  rotationInterval?: number;
  enableKeyboardNavigation?: boolean;
}

export class Testimonial {
  private element: HTMLElement | null = null;
  private currentIndex: number = 0;
  private autoRotateTimer: number | null = null;
  private liveRegion: HTMLElement | null = null;

  constructor(private config: TestimonialConfig = {}) {
    this.config = {
      testimonials: [
        {
          id: '1',
          quote: 'The garden room exceeded all our expectations. The quality of workmanship is outstanding, and the planning permission process was handled seamlessly. We now have the perfect home office.',
          rating: 5,
          authorFirstName: 'Sarah',
          authorInitial: 'M',
          projectArea: 'Dublin'
        },
        {
          id: '2', 
          quote: 'From initial consultation to final handover, the service was professional and efficient. Our home extension has transformed our living space and added significant value to our property.',
          rating: 5,
          authorFirstName: 'Michael',
          authorInitial: 'O',
          projectArea: 'Cork'
        },
        {
          id: '3',
          quote: 'Exceptional attention to detail and customer service. The 10-year warranty gives us complete peace of mind. Highly recommend for anyone considering a garden room.',
          rating: 5,
          authorFirstName: 'Emma',
          authorInitial: 'K',
          projectArea: 'Galway'
        }
      ],
      showNavigation: true,
      autoRotate: false,
      rotationInterval: 8000,
      enableKeyboardNavigation: true,
      ...config
    };
  }

  public render(): string {
    if (!this.config.testimonials || this.config.testimonials.length === 0) {
      return '';
    }

    return `
      <section class="testimonials" data-testid="testimonials" role="region" aria-labelledby="testimonials-heading">
        <div class="container">
          <h2 id="testimonials-heading" class="testimonials__heading">
            What Our Customers Say
          </h2>
          
          <div class="testimonials__wrapper">
            <div class="testimonials__track" data-testid="testimonials-track">
              ${this.config.testimonials.map((testimonial, index) => this.renderTestimonial(testimonial, index)).join('')}
            </div>
            
            ${this.config.showNavigation ? this.renderNavigation() : ''}
            ${this.renderIndicators()}
          </div>
          
          <!-- Live region for screen reader announcements -->
          <div 
            class="testimonials__live-region sr-only" 
            data-testid="testimonial-live-region"
            aria-live="polite" 
            aria-atomic="true"
          ></div>
        </div>
      </section>
    `;
  }

  private renderTestimonial(testimonial: TestimonialData, index: number): string {
    const isActive = index === this.currentIndex;
    
    return `
      <div 
        class="testimonial-item ${isActive ? 'testimonial-item--active' : ''}" 
        data-testid="testimonial-item"
        ${isActive ? 'aria-current="true"' : ''}
        role="group"
        aria-labelledby="testimonial-${testimonial.id}-text"
      >
        <blockquote class="testimonial__quote">
          <p class="testimonial__text" id="testimonial-${testimonial.id}-text">
            "${testimonial.quote}"
          </p>
          
          <footer class="testimonial__attribution">
            <div class="testimonial__rating" aria-label="${testimonial.rating} out of 5 stars">
              ${this.renderStars(testimonial.rating)}
            </div>
            
            <cite class="testimonial__author">
              <span class="testimonial__author-name">${testimonial.authorFirstName} ${testimonial.authorInitial}</span>
              <span class="testimonial__project-area">${testimonial.projectArea}</span>
            </cite>
            
            ${testimonial.image ? `
              <img 
                class="testimonial__image" 
                src="${testimonial.image.src}" 
                alt="${testimonial.image.alt}"
                width="${testimonial.image.width}"
                height="${testimonial.image.height}"
                ${testimonial.image.srcset ? `srcset="${testimonial.image.srcset}"` : ''}
                loading="lazy"
              />
            ` : ''}
          </footer>
        </blockquote>
      </div>
    `;
  }

  private renderStars(rating: number): string {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? '★' : '☆');
    }
    return `<span class="testimonial__stars" aria-hidden="true">${stars.join('')}</span>`;
  }

  private renderNavigation(): string {
    return `
      <div class="testimonials__navigation" data-testid="testimonials-navigation">
        <button 
          type="button"
          class="testimonials__nav-button testimonials__nav-button--prev"
          data-testid="testimonial-prev"
          aria-label="Previous testimonial"
        >
          <span class="testimonials__nav-icon" aria-hidden="true">‹</span>
          <span class="sr-only">Previous</span>
        </button>
        
        <button 
          type="button"
          class="testimonials__nav-button testimonials__nav-button--next"
          data-testid="testimonial-next"
          aria-label="Next testimonial"
        >
          <span class="testimonials__nav-icon" aria-hidden="true">›</span>
          <span class="sr-only">Next</span>
        </button>
      </div>
    `;
  }

  private renderIndicators(): string {
    if (!this.config.testimonials || this.config.testimonials.length <= 1) {
      return '';
    }

    return `
      <div class="testimonials__indicators" data-testid="testimonials-indicators" role="tablist" aria-label="Testimonial indicators">
        ${this.config.testimonials.map((_, index) => `
          <button 
            type="button"
            class="testimonials__indicator ${index === this.currentIndex ? 'testimonials__indicator--active' : ''}"
            data-testid="testimonial-indicator"
            data-index="${index}"
            role="tab"
            aria-label="Go to testimonial ${index + 1}"
            aria-selected="${index === this.currentIndex}"
            tabindex="${index === this.currentIndex ? '0' : '-1'}"
          >
            <span class="sr-only">Testimonial ${index + 1}</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  public mount(targetSelector: string = 'main'): void {
    const target = document.querySelector(targetSelector);
    if (!target) {
      console.warn(`Testimonial: Target element '${targetSelector}' not found`);
      return;
    }

    target.insertAdjacentHTML('beforeend', this.render());
    this.element = document.querySelector('.testimonials');
    
    if (this.element) {
      this.initialize();
    }
  }

  private initialize(): void {
    if (!this.element) return;

    this.liveRegion = this.element.querySelector('.testimonials__live-region');
    this.addStyles();
    this.bindEvents();
    this.updateDisplay();
    
    if (this.config.autoRotate) {
      this.startAutoRotation();
    }
  }

  private bindEvents(): void {
    if (!this.element) return;

    // Navigation buttons
    const prevButton = this.element.querySelector('[data-testid="testimonial-prev"]');
    const nextButton = this.element.querySelector('[data-testid="testimonial-next"]');

    if (prevButton) {
      prevButton.addEventListener('click', () => this.previousTestimonial());
    }

    if (nextButton) {
      nextButton.addEventListener('click', () => this.nextTestimonial());
    }

    // Indicator buttons
    const indicators = this.element.querySelectorAll('[data-testid="testimonial-indicator"]');
    indicators.forEach(indicator => {
      indicator.addEventListener('click', (e) => {
        const index = parseInt((e.target as HTMLElement).getAttribute('data-index') || '0', 10);
        this.goToTestimonial(index);
      });
    });

    // Keyboard navigation
    if (this.config.enableKeyboardNavigation) {
      this.element.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    // Pause auto-rotation on mouse hover
    if (this.config.autoRotate) {
      this.element.addEventListener('mouseenter', () => this.pauseAutoRotation());
      this.element.addEventListener('mouseleave', () => this.startAutoRotation());
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        this.previousTestimonial();
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.nextTestimonial();
        break;
      case 'Home':
        e.preventDefault();
        this.goToTestimonial(0);
        break;
      case 'End':
        e.preventDefault();
        this.goToTestimonial((this.config.testimonials?.length || 1) - 1);
        break;
    }
  }

  private previousTestimonial(): void {
    this.pauseAutoRotation();
    const maxIndex = (this.config.testimonials?.length || 1) - 1;
    this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : maxIndex;
    this.updateDisplay();
    this.announceChange();
  }

  private nextTestimonial(): void {
    this.pauseAutoRotation();
    const maxIndex = (this.config.testimonials?.length || 1) - 1;
    this.currentIndex = this.currentIndex < maxIndex ? this.currentIndex + 1 : 0;
    this.updateDisplay();
    this.announceChange();
  }

  private goToTestimonial(index: number): void {
    this.pauseAutoRotation();
    const maxIndex = (this.config.testimonials?.length || 1) - 1;
    this.currentIndex = Math.max(0, Math.min(index, maxIndex));
    this.updateDisplay();
    this.announceChange();
  }

  private updateDisplay(): void {
    if (!this.element || !this.config.testimonials) return;

    // Update testimonial items
    const items = this.element.querySelectorAll('.testimonial-item');
    items.forEach((item, index) => {
      const isActive = index === this.currentIndex;
      item.classList.toggle('testimonial-item--active', isActive);
      item.setAttribute('aria-current', isActive.toString());
    });

    // Update indicators
    const indicators = this.element.querySelectorAll('.testimonials__indicator');
    indicators.forEach((indicator, index) => {
      const isActive = index === this.currentIndex;
      indicator.classList.toggle('testimonials__indicator--active', isActive);
      indicator.setAttribute('aria-selected', isActive.toString());
      indicator.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    // Update navigation button states
    this.updateNavigationStates();
  }

  private updateNavigationStates(): void {
    if (!this.element || !this.config.testimonials) return;

    const prevButton = this.element.querySelector('[data-testid="testimonial-prev"]') as HTMLButtonElement;
    const nextButton = this.element.querySelector('[data-testid="testimonial-next"]') as HTMLButtonElement;
    const maxIndex = this.config.testimonials.length - 1;

    if (prevButton) {
      prevButton.disabled = this.currentIndex === 0;
      prevButton.setAttribute('aria-disabled', (this.currentIndex === 0).toString());
    }

    if (nextButton) {
      nextButton.disabled = this.currentIndex === maxIndex;
      nextButton.setAttribute('aria-disabled', (this.currentIndex === maxIndex).toString());
    }
  }

  private announceChange(): void {
    if (!this.liveRegion || !this.config.testimonials) return;

    const currentTestimonial = this.config.testimonials[this.currentIndex];
    if (currentTestimonial) {
      const announcement = `Testimonial ${this.currentIndex + 1} of ${this.config.testimonials.length}: ${currentTestimonial.quote} - ${currentTestimonial.authorFirstName} ${currentTestimonial.authorInitial}, ${currentTestimonial.projectArea}`;
      this.liveRegion.textContent = announcement;
    }
  }

  private startAutoRotation(): void {
    if (!this.config.autoRotate || !this.config.testimonials || this.config.testimonials.length <= 1) return;

    this.pauseAutoRotation(); // Clear any existing timer
    this.autoRotateTimer = window.setInterval(() => {
      this.nextTestimonial();
    }, this.config.rotationInterval);
  }

  private pauseAutoRotation(): void {
    if (this.autoRotateTimer) {
      window.clearInterval(this.autoRotateTimer);
      this.autoRotateTimer = null;
    }
  }

  private addStyles(): void {
    // Check if styles are already added
    if (document.querySelector('#testimonial-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'testimonial-styles';
    styles.textContent = this.getStyles();
    document.head.appendChild(styles);
  }

  private getStyles(): string {
    return `
      .testimonials {
        padding: 4rem 0;
        background-color: #f8fafc;
        border-top: 1px solid #e2e8f0;
        border-bottom: 1px solid #e2e8f0;
      }

      .testimonials__heading {
        text-align: center;
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0 0 3rem 0;
        color: #1a1a1a;
      }

      @media (max-width: 768px) {
        .testimonials__heading {
          font-size: 2rem;
          margin-bottom: 2rem;
        }
      }

      .testimonials__wrapper {
        position: relative;
        max-width: 800px;
        margin: 0 auto;
      }

      .testimonials__track {
        position: relative;
        overflow: hidden;
      }

      .testimonial-item {
        display: none;
        opacity: 0;
        transition: opacity 0.5s ease;
      }

      .testimonial-item--active {
        display: block;
        opacity: 1;
      }

      @media (prefers-reduced-motion: reduce) {
        .testimonial-item {
          transition: none;
        }
      }

      .testimonial__quote {
        margin: 0;
        text-align: center;
      }

      .testimonial__text {
        font-size: 1.25rem;
        line-height: 1.6;
        color: #374151;
        margin: 0 0 2rem 0;
        font-style: italic;
        position: relative;
      }

      @media (min-width: 640px) {
        .testimonial__text {
          font-size: 1.375rem;
        }
      }

      .testimonial__text::before {
        content: '"';
        font-size: 4rem;
        color: #e5e7eb;
        position: absolute;
        top: -1rem;
        left: -2rem;
        font-family: serif;
        line-height: 1;
      }

      .testimonial__attribution {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }

      .testimonial__rating {
        margin-bottom: 0.5rem;
      }

      .testimonial__stars {
        color: #f59e0b;
        font-size: 1.25rem;
      }

      .testimonial__author {
        font-style: normal;
        font-weight: 600;
        color: #1f2937;
        text-align: center;
      }

      .testimonial__author-name {
        display: block;
        font-size: 1.125rem;
        margin-bottom: 0.25rem;
      }

      .testimonial__project-area {
        display: block;
        font-size: 0.875rem;
        color: #6b7280;
        font-weight: 400;
      }

      .testimonial__image {
        width: 4rem;
        height: 4rem;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #ffffff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .testimonials__navigation {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-top: 2rem;
      }

      .testimonials__nav-button {
        width: 3rem;
        height: 3rem;
        border-radius: 50%;
        border: 2px solid #e5e7eb;
        background-color: #ffffff;
        color: #374151;
        font-size: 1.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .testimonials__nav-button:hover:not(:disabled),
      .testimonials__nav-button:focus:not(:disabled) {
        border-color: #2563eb;
        background-color: #2563eb;
        color: #ffffff;
        outline: 2px solid #60a5fa;
        outline-offset: 2px;
      }

      .testimonials__nav-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        border-color: #e5e7eb;
        background-color: #f9fafb;
        color: #9ca3af;
      }

      @media (prefers-reduced-motion: reduce) {
        .testimonials__nav-button {
          transition: none;
        }
      }

      .testimonials__nav-icon {
        line-height: 1;
      }

      .testimonials__indicators {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 1.5rem;
      }

      .testimonials__indicator {
        width: 0.75rem;
        height: 0.75rem;
        border-radius: 50%;
        border: none;
        background-color: #d1d5db;
        cursor: pointer;
        transition: background-color 0.3s ease;
      }

      .testimonials__indicator--active,
      .testimonials__indicator:hover,
      .testimonials__indicator:focus {
        background-color: #2563eb;
        outline: 2px solid #60a5fa;
        outline-offset: 2px;
      }

      @media (prefers-reduced-motion: reduce) {
        .testimonials__indicator {
          transition: none;
        }
      }

      /* Screen reader only content */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      /* High contrast mode support */
      @media (prefers-contrast: high) {
        .testimonials {
          background-color: #000000;
          color: #ffffff;
          border-color: #ffffff;
        }
        
        .testimonial__text {
          color: #ffffff;
        }
        
        .testimonial__author {
          color: #ffffff;
        }
        
        .testimonial__project-area {
          color: #cccccc;
        }
        
        .testimonials__nav-button {
          border-color: #ffffff;
          background-color: #000000;
          color: #ffffff;
        }
        
        .testimonials__indicator {
          background-color: #666666;
        }
        
        .testimonials__indicator--active {
          background-color: #ffffff;
        }
      }

      /* Print styles */
      @media print {
        .testimonials__navigation,
        .testimonials__indicators {
          display: none;
        }
        
        .testimonial-item {
          display: block !important;
          opacity: 1 !important;
          page-break-inside: avoid;
        }
      }
    `;
  }

  public destroy(): void {
    this.pauseAutoRotation();
    
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
    
    this.liveRegion = null;
  }
}

export default Testimonial;