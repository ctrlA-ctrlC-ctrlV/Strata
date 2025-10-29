// ProblemOutcome Component - Static-first with TypeScript enhancement
// Displays problem/solution messaging strip

export interface ProblemOutcomeConfig {
  problemTitle?: string;
  problemDescription?: string;
  outcomeTitle?: string;
  outcomeDescription?: string;
  ctaText?: string;
  ctaHref?: string;
  theme?: 'light' | 'dark' | 'gradient';
}

export class ProblemOutcome {
  private element: HTMLElement | null = null;

  constructor(private config: ProblemOutcomeConfig = {}) {
    this.config = {
      problemTitle: 'Limited Space, Big Dreams?',
      problemDescription: 'Your garden has potential, but your home feels cramped. You need space for a home office, gym, or entertainment area, but traditional extensions are expensive and disruptive.',
      outcomeTitle: 'Transform Your Garden Into Valuable Living Space',
      outcomeDescription: 'Our premium garden rooms and home extensions create the perfect additional space you need. Professional design, planning permission included, and completed in weeks not months.',
      ctaText: 'See How We Can Help',
      ctaHref: '#quote',
      theme: 'gradient',
      ...config
    };
  }

  public render(): string {
    const themeClass = `problem-outcome--${this.config.theme}`;
    
    return `
      <section class="problem-outcome section ${themeClass}" data-testid="problem-outcome">
        <div class="container">
          <div class="problem-outcome__content">
            <!-- Problem Side -->
            <div class="problem-outcome__problem">
              <div class="problem-outcome__problem-content">
                <div class="problem-outcome__icon problem-outcome__icon--problem" aria-hidden="true">
                  ❌
                </div>
                <h2 class="problem-outcome__title problem-outcome__title--problem">
                  ${this.config.problemTitle}
                </h2>
                <p class="problem-outcome__description">
                  ${this.config.problemDescription}
                </p>
              </div>
            </div>

            <!-- Arrow/Separator -->
            <div class="problem-outcome__separator" aria-hidden="true">
              <div class="problem-outcome__arrow">
                <span class="problem-outcome__arrow-text">Solution</span>
                <span class="problem-outcome__arrow-icon">→</span>
              </div>
            </div>

            <!-- Outcome Side -->
            <div class="problem-outcome__outcome">
              <div class="problem-outcome__outcome-content">
                <div class="problem-outcome__icon problem-outcome__icon--outcome" aria-hidden="true">
                  ✅
                </div>
                <h2 class="problem-outcome__title problem-outcome__title--outcome">
                  ${this.config.outcomeTitle}
                </h2>
                <p class="problem-outcome__description">
                  ${this.config.outcomeDescription}
                </p>
                <div class="problem-outcome__cta">
                  <a 
                    href="${this.config.ctaHref}" 
                    class="btn btn--secondary problem-outcome__cta-button"
                    aria-label="${this.config.ctaText} - learn more about our solutions"
                  >
                    ${this.config.ctaText}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  public mount(targetSelector: string = '#main'): void {
    const target = document.querySelector(targetSelector);
    if (!target) {
      console.warn(`ProblemOutcome: Target element '${targetSelector}' not found`);
      return;
    }

    target.insertAdjacentHTML('beforeend', this.render());
    this.element = document.querySelector('.problem-outcome');
    
    if (this.element) {
      this.initialize();
    }
  }

  private initialize(): void {
    if (!this.element) return;

    this.addStyles();
    this.setupAnimations();
    this.bindEvents();
  }

  private setupAnimations(): void {
    // Set up intersection observer for reveal animations
    const animatedElements = this.element?.querySelectorAll(
      '.problem-outcome__problem, .problem-outcome__separator, .problem-outcome__outcome'
    );
    
    if (!animatedElements || animatedElements.length === 0) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
      animatedElements.forEach(element => {
        element.classList.add('problem-outcome__animated--visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('problem-outcome__animated--visible');
            }, index * 200); // Stagger animations
            
            observer.unobserve(entry.target);
          }
        });
      },
      { 
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    animatedElements.forEach(element => {
      element.classList.add('problem-outcome__animated');
      observer.observe(element);
    });
  }

  private bindEvents(): void {
    // Bind CTA click for smooth scroll
    const ctaButton = this.element?.querySelector('.problem-outcome__cta-button');
    if (ctaButton) {
      ctaButton.addEventListener('click', (e: Event) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLAnchorElement;
        const href = target.getAttribute('href');
        
        if (href?.startsWith('#')) {
          const targetSection = document.querySelector(href);
          if (targetSection) {
            targetSection.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    }
  }

  private addStyles(): void {
    // Check if styles are already added
    if (document.querySelector('#problem-outcome-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'problem-outcome-styles';
    styles.textContent = this.getStyles();
    document.head.appendChild(styles);
  }

  private getStyles(): string {
    return `
      .problem-outcome {
        position: relative;
        overflow: hidden;
      }

      .problem-outcome--light {
        background-color: #ffffff;
        color: #1a1a1a;
      }

      .problem-outcome--dark {
        background-color: #1f2937;
        color: #ffffff;
      }

      .problem-outcome--gradient {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #ffffff;
      }

      .problem-outcome__content {
        display: grid;
        grid-template-columns: 1fr;
        gap: 3rem;
        align-items: center;
        position: relative;
      }

      @media (min-width: 768px) {
        .problem-outcome__content {
          grid-template-columns: 1fr auto 1fr;
          gap: 2rem;
        }
      }

      @media (min-width: 1024px) {
        .problem-outcome__content {
          gap: 4rem;
        }
      }

      .problem-outcome__problem,
      .problem-outcome__outcome {
        padding: 2rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 1rem;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        text-align: center;
      }

      .problem-outcome--light .problem-outcome__problem,
      .problem-outcome--light .problem-outcome__outcome {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        backdrop-filter: none;
      }

      .problem-outcome--dark .problem-outcome__problem,
      .problem-outcome--dark .problem-outcome__outcome {
        background: #374151;
        border: 1px solid #4b5563;
        backdrop-filter: none;
      }

      .problem-outcome__problem-content,
      .problem-outcome__outcome-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
      }

      .problem-outcome__icon {
        font-size: 3rem;
        width: 4rem;
        height: 4rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .problem-outcome__icon--problem {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
      }

      .problem-outcome__icon--outcome {
        background: rgba(34, 197, 94, 0.2);
        color: #22c55e;
      }

      .problem-outcome--light .problem-outcome__icon--problem {
        background: #fef2f2;
        color: #dc2626;
      }

      .problem-outcome--light .problem-outcome__icon--outcome {
        background: #f0fdf4;
        color: #16a34a;
      }

      .problem-outcome__title {
        font-size: 1.5rem;
        font-weight: 700;
        line-height: 1.3;
        margin: 0;
      }

      @media (min-width: 768px) {
        .problem-outcome__title {
          font-size: 1.75rem;
        }
      }

      .problem-outcome__description {
        font-size: 1rem;
        line-height: 1.6;
        margin: 0;
        opacity: 0.9;
      }

      @media (min-width: 768px) {
        .problem-outcome__description {
          font-size: 1.125rem;
        }
      }

      .problem-outcome__separator {
        display: flex;
        justify-content: center;
        align-items: center;
        order: -1;
      }

      @media (min-width: 768px) {
        .problem-outcome__separator {
          order: 0;
        }
      }

      .problem-outcome__arrow {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 0.75rem;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      .problem-outcome--light .problem-outcome__arrow {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        color: #1a1a1a;
        backdrop-filter: none;
      }

      .problem-outcome--dark .problem-outcome__arrow {
        background: #374151;
        border: 1px solid #4b5563;
        backdrop-filter: none;
      }

      .problem-outcome__arrow-text {
        font-size: 0.875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .problem-outcome__arrow-icon {
        font-size: 1.5rem;
        font-weight: bold;
        transform: rotate(90deg);
      }

      @media (min-width: 768px) {
        .problem-outcome__arrow-icon {
          transform: rotate(0deg);
        }
      }

      .problem-outcome__cta {
        margin-top: 1rem;
      }

      .btn {
        display: inline-block;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        text-decoration: none;
        font-weight: 600;
        text-align: center;
        transition: all 0.3s ease;
        border: 2px solid transparent;
        cursor: pointer;
        font-size: 1rem;
      }

      .btn--secondary {
        background-color: rgba(255, 255, 255, 0.2);
        color: currentColor;
        border-color: rgba(255, 255, 255, 0.3);
        backdrop-filter: blur(10px);
      }

      .btn--secondary:hover,
      .btn--secondary:focus {
        background-color: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.5);
        transform: translateY(-2px);
        outline: 2px solid rgba(255, 255, 255, 0.5);
        outline-offset: 2px;
      }

      .problem-outcome--light .btn--secondary {
        background-color: #2563eb;
        color: white;
        border-color: #2563eb;
        backdrop-filter: none;
      }

      .problem-outcome--light .btn--secondary:hover,
      .problem-outcome--light .btn--secondary:focus {
        background-color: #1d4ed8;
        border-color: #1d4ed8;
      }

      .problem-outcome--dark .btn--secondary {
        background-color: #3b82f6;
        color: white;
        border-color: #3b82f6;
        backdrop-filter: none;
      }

      .problem-outcome--dark .btn--secondary:hover,
      .problem-outcome--dark .btn--secondary:focus {
        background-color: #2563eb;
        border-color: #2563eb;
      }

      /* Animation classes */
      .problem-outcome__animated {
        opacity: 0;
        transform: translateY(2rem);
        transition: all 0.8s ease;
      }

      .problem-outcome__animated--visible {
        opacity: 1;
        transform: translateY(0);
      }

      @media (prefers-reduced-motion: reduce) {
        .problem-outcome__animated {
          opacity: 1;
          transform: none;
          transition: none;
        }

        .btn--secondary:hover,
        .btn--secondary:focus {
          transform: none;
        }
      }

      /* High contrast mode support */
      @media (prefers-contrast: high) {
        .problem-outcome {
          background: #000 !important;
          color: #fff !important;
        }

        .problem-outcome__problem,
        .problem-outcome__outcome,
        .problem-outcome__arrow {
          background: #fff !important;
          color: #000 !important;
          border: 2px solid #fff !important;
        }

        .problem-outcome__icon--problem {
          background: #ff0000 !important;
          color: #fff !important;
        }

        .problem-outcome__icon--outcome {
          background: #00ff00 !important;
          color: #000 !important;
        }
      }

      /* Responsive adjustments */
      @media (max-width: 640px) {
        .problem-outcome__problem,
        .problem-outcome__outcome {
          padding: 1.5rem;
        }

        .problem-outcome__title {
          font-size: 1.25rem;
        }

        .problem-outcome__description {
          font-size: 0.875rem;
        }
      }
    `;
  }
}

// Auto-initialize if DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const problemOutcome = new ProblemOutcome();
      problemOutcome.mount('#main');
    });
  } else {
    const problemOutcome = new ProblemOutcome();
    problemOutcome.mount('#main');
  }
}

export default ProblemOutcome;