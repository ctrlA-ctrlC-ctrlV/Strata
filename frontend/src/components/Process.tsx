// Process Component - Static-first with TypeScript enhancement
// Displays 4 process steps for garden room and home extension projects

export interface ProcessStep {
  number: number;
  title: string;
  description: string;
  details?: string[];
  ariaLabel?: string;
}

export interface ProcessConfig {
  title?: string;
  subtitle?: string;
  steps?: ProcessStep[];
}

export class Process {
  private element: HTMLElement | null = null;

  constructor(private config: ProcessConfig = {}) {
    this.config = {
      title: 'Our Process',
      subtitle: 'From initial consultation to project completion, we guide you through every step of creating your perfect garden room or home extension',
      steps: [
        {
          number: 1,
          title: 'Initial Consultation',
          description: 'We discuss your requirements, assess your space, and understand your vision for the perfect garden room or home extension.',
          details: [
            'Free site visit and assessment',
            'Discuss your needs and budget',
            'Review planning considerations',
            'Initial design concepts'
          ],
          ariaLabel: 'Step one: Initial consultation and site assessment'
        },
        {
          number: 2,
          title: 'Design & Planning',
          description: 'Our architects create detailed plans and handle all planning permissions and building regulations compliance.',
          details: [
            'Detailed architectural drawings',
            'Planning permission application',
            'Building regulations compliance',
            'Final design approval'
          ],
          ariaLabel: 'Step two: Design development and planning permissions'
        },
        {
          number: 3,
          title: 'Approvals & Documentation',
          description: 'We manage all approvals, permits, and documentation required before construction can begin.',
          details: [
            'Planning permission approval',
            'Building control approval',
            'Construction documentation',
            'Material specifications'
          ],
          ariaLabel: 'Step three: Approvals and construction documentation'
        },
        {
          number: 4,
          title: 'Construction & Completion',
          description: 'Professional construction team builds your project to the highest standards, with regular progress updates.',
          details: [
            'Site preparation and foundations',
            'Professional construction',
            'Quality inspections',
            'Project handover and warranty'
          ],
          ariaLabel: 'Step four: Construction and project completion'
        }
      ],
      ...config
    };
  }

  public render(): string {
    return `
      <section class="process section" data-testid="process">
        <div class="container">
          <div class="process__header">
            <h2 class="process__title">${this.config.title}</h2>
            <p class="process__subtitle">${this.config.subtitle}</p>
          </div>

          <div class="process__timeline" role="list" aria-label="Process steps">
            ${this.config.steps?.map((step, index) => `
              <div class="process-step" data-testid="process-step" data-step="${step.number}" role="listitem">
                <div class="process-step__number" data-testid="step-number" aria-hidden="true">
                  ${step.number}
                </div>
                <div class="process-step__content">
                  <h3 class="process-step__title">${step.title}</h3>
                  <p class="process-step__description" data-testid="step-description">${step.description}</p>
                  ${step.details ? `
                    <ul class="process-step__details" aria-label="Step ${step.number} details">
                      ${step.details.map(detail => `
                        <li class="process-step__detail">${detail}</li>
                      `).join('')}
                    </ul>
                  ` : ''}
                </div>
                ${index < (this.config.steps?.length || 0) - 1 ? `
                  <div class="process-step__connector" aria-hidden="true"></div>
                ` : ''}
              </div>
            `).join('') || ''}
          </div>

          <div class="process__cta">
            <p class="process__cta-text">Ready to start your project?</p>
            <a href="#quote" class="process__cta-button btn btn-primary" aria-describedby="process-cta-description">
              Get Your Free Quote
            </a>
            <p id="process-cta-description" class="process__cta-description">
              Click to scroll to our quote form and begin your garden room or home extension journey
            </p>
          </div>
        </div>
      </section>
    `;
  }

  public mount(targetSelector: string = '#main'): void {
    const target = document.querySelector(targetSelector);
    if (!target) {
      console.warn(`Process: Target element '${targetSelector}' not found`);
      return;
    }

    target.insertAdjacentHTML('beforeend', this.render());
    this.element = document.querySelector('.process');
    
    if (this.element) {
      this.initialize();
    }
  }

  private initialize(): void {
    if (!this.element) return;

    this.addStyles();
    this.setupAnimations();
    this.setupAccessibility();
    this.setupInteractions();
  }

  private setupAnimations(): void {
    const processSteps = this.element?.querySelectorAll('.process-step');
    if (!processSteps || processSteps.length === 0) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
      processSteps.forEach(step => {
        step.classList.add('process-step--visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const step = entry.target as HTMLElement;
            const stepNumber = parseInt(step.getAttribute('data-step') || '1');
            
            setTimeout(() => {
              step.classList.add('process-step--visible');
            }, (stepNumber - 1) * 200); // Stagger animations by 200ms

            observer.unobserve(entry.target);
          }
        });
      },
      { 
        threshold: 0.3,
        rootMargin: '0px 0px -80px 0px'
      }
    );

    processSteps.forEach(step => {
      observer.observe(step);
    });
  }

  private setupAccessibility(): void {
    // Ensure proper ARIA labels for screen readers
    const processSteps = this.element?.querySelectorAll('.process-step');
    processSteps?.forEach((step, index) => {
      const stepData = this.config.steps?.[index];
      if (stepData?.ariaLabel) {
        step.setAttribute('aria-label', stepData.ariaLabel);
      }
      
      // Make step focusable for keyboard navigation
      step.setAttribute('tabindex', '0');
    });

    // Announce timeline structure to screen readers
    const timeline = this.element?.querySelector('.process__timeline');
    if (timeline) {
      timeline.setAttribute('aria-label', `Process timeline with ${this.config.steps?.length || 0} steps`);
    }
  }

  private setupInteractions(): void {
    // Set up CTA button scroll behavior
    const ctaButton = this.element?.querySelector('.process__cta-button');
    if (ctaButton) {
      ctaButton.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = (ctaButton as HTMLAnchorElement).getAttribute('href');
        if (targetId) {
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
            
            // Focus the first form field if it's a form
            const firstInput = targetElement.querySelector('input, textarea, select') as HTMLElement;
            if (firstInput) {
              setTimeout(() => {
                firstInput.focus();
              }, 500); // Wait for scroll to complete
            }
          }
        }
      });
    }

    // Add keyboard support for process steps
    const processSteps = this.element?.querySelectorAll('.process-step');
    processSteps?.forEach((step) => {
      step.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          step.classList.toggle('process-step--expanded');
        }
      });

      step.addEventListener('focus', () => {
        step.classList.add('process-step--focused');
      });

      step.addEventListener('blur', () => {
        step.classList.remove('process-step--focused');
      });
    });
  }

  private addStyles(): void {
    // Check if styles are already added
    if (document.querySelector('#process-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'process-styles';
    styles.textContent = this.getStyles();
    document.head.appendChild(styles);
  }

  private getStyles(): string {
    return `
      .process {
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        border-top: 1px solid #cbd5e1;
        border-bottom: 1px solid #cbd5e1;
        position: relative;
        overflow: hidden;
      }

      .process::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23e2e8f0" fill-opacity="0.1"><circle cx="30" cy="30" r="1"/></g></svg>') repeat;
        pointer-events: none;
      }

      .process__header {
        text-align: center;
        margin-bottom: 4rem;
        max-width: 800px;
        margin-left: auto;
        margin-right: auto;
        position: relative;
        z-index: 1;
      }

      .process__title {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
        color: #1e293b;
        line-height: 1.2;
      }

      @media (max-width: 768px) {
        .process__title {
          font-size: 2rem;
        }
      }

      .process__subtitle {
        font-size: 1.25rem;
        color: #64748b;
        line-height: 1.6;
        margin: 0;
      }

      @media (max-width: 768px) {
        .process__subtitle {
          font-size: 1.125rem;
        }
      }

      .process__timeline {
        max-width: 1000px;
        margin: 0 auto;
        position: relative;
        z-index: 1;
      }

      @media (min-width: 768px) {
        .process__timeline::before {
          content: '';
          position: absolute;
          top: 3rem;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          height: calc(100% - 6rem);
          background: linear-gradient(180deg, #3b82f6, #2563eb);
          border-radius: 1px;
        }
      }

      .process-step {
        position: relative;
        margin-bottom: 3rem;
        opacity: 0;
        transform: translateY(2rem);
        transition: all 0.6s ease;
        cursor: pointer;
      }

      .process-step:last-child {
        margin-bottom: 0;
      }

      .process-step--visible {
        opacity: 1;
        transform: translateY(0);
      }

      @media (prefers-reduced-motion: reduce) {
        .process-step {
          transition: none;
          opacity: 1;
          transform: none;
        }
      }

      @media (min-width: 768px) {
        .process-step {
          display: flex;
          align-items: flex-start;
          margin-bottom: 4rem;
        }

        .process-step:nth-child(even) {
          flex-direction: row-reverse;
        }
      }

      .process-step__number {
        width: 4rem;
        height: 4rem;
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0 auto 1.5rem auto;
        box-shadow: 0 8px 25px -5px rgba(59, 130, 246, 0.4);
        position: relative;
        z-index: 2;
        transition: all 0.3s ease;
      }

      @media (min-width: 768px) {
        .process-step__number {
          margin: 0;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }
      }

      .process-step:hover .process-step__number,
      .process-step--focused .process-step__number {
        transform: scale(1.1);
        box-shadow: 0 12px 30px -5px rgba(59, 130, 246, 0.6);
      }

      @media (min-width: 768px) {
        .process-step:hover .process-step__number,
        .process-step--focused .process-step__number {
          transform: translateX(-50%) scale(1.1);
        }
      }

      .process-step__content {
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        border: 1px solid #e5e7eb;
        transition: all 0.3s ease;
        max-width: 100%;
      }

      @media (min-width: 768px) {
        .process-step__content {
          max-width: 400px;
          margin-left: 0;
          margin-right: 0;
        }

        .process-step:nth-child(odd) .process-step__content {
          margin-right: calc(50% + 3rem);
        }

        .process-step:nth-child(even) .process-step__content {
          margin-left: calc(50% + 3rem);
        }
      }

      .process-step:hover .process-step__content,
      .process-step--focused .process-step__content {
        transform: translateY(-4px);
        box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.15);
      }

      .process-step__title {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: #1e293b;
        line-height: 1.3;
        margin-top: 0;
      }

      .process-step__description {
        color: #64748b;
        line-height: 1.6;
        margin-bottom: 1.5rem;
        font-size: 1rem;
      }

      .process-step__details {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .process-step__detail {
        position: relative;
        padding-left: 1.5rem;
        margin-bottom: 0.5rem;
        color: #64748b;
        font-size: 0.9rem;
        line-height: 1.5;
      }

      .process-step__detail::before {
        content: '✓';
        position: absolute;
        left: 0;
        color: #22c55e;
        font-weight: 600;
      }

      .process-step__detail:last-child {
        margin-bottom: 0;
      }

      .process-step__connector {
        display: none;
      }

      .process__cta {
        text-align: center;
        margin-top: 4rem;
        padding: 3rem 0;
        background: linear-gradient(135deg, #1e293b, #334155);
        margin-left: -2rem;
        margin-right: -2rem;
        border-radius: 1rem;
        position: relative;
        overflow: hidden;
      }

      @media (min-width: 768px) {
        .process__cta {
          margin-left: -4rem;
          margin-right: -4rem;
        }
      }

      .process__cta::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23ffffff" fill-opacity="0.05"><circle cx="30" cy="30" r="1"/></g></svg>') repeat;
        pointer-events: none;
      }

      .process__cta-text {
        color: white;
        font-size: 1.25rem;
        margin-bottom: 1.5rem;
        font-weight: 500;
      }

      .process__cta-button {
        display: inline-block;
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: white;
        padding: 0.875rem 2rem;
        text-decoration: none;
        border-radius: 0.5rem;
        font-weight: 600;
        font-size: 1.125rem;
        transition: all 0.3s ease;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.39);
        position: relative;
        z-index: 1;
      }

      .process__cta-button:hover,
      .process__cta-button:focus {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px 0 rgba(59, 130, 246, 0.5);
        color: white;
        text-decoration: none;
      }

      .process__cta-button:focus {
        outline: 2px solid white;
        outline-offset: 2px;
      }

      .process__cta-description {
        color: #cbd5e1;
        font-size: 0.875rem;
        margin-top: 1rem;
        margin-bottom: 0;
        line-height: 1.4;
      }

      /* Focus management */
      .process-step:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 4px;
        border-radius: 0.5rem;
      }

      /* High contrast mode support */
      @media (prefers-contrast: high) {
        .process {
          background: white;
          border: 2px solid #000;
        }

        .process-step__number {
          background: #000;
          color: #fff;
          border: 2px solid #000;
        }

        .process-step__content {
          border: 2px solid #000;
          background: #fff;
        }

        .process-step__title {
          color: #000;
        }

        .process-step__description,
        .process-step__detail {
          color: #333;
        }

        .process__cta {
          background: #000;
          border: 2px solid #000;
        }

        .process__cta-button {
          background: #000;
          border: 2px solid #fff;
        }
      }

      /* Print styles */
      @media print {
        .process {
          background: white;
          border: none;
        }

        .process__timeline::before {
          display: none;
        }

        .process-step {
          break-inside: avoid;
          opacity: 1;
          transform: none;
          margin-bottom: 2rem;
        }

        .process-step__content {
          box-shadow: none;
          border: 1px solid #ccc;
        }

        .process-step__number {
          background: white;
          color: black;
          border: 2px solid black;
          box-shadow: none;
        }

        .process__cta {
          background: white;
          color: black;
          border: 1px solid #ccc;
        }

        .process__cta-button {
          background: white;
          color: black;
          border: 1px solid black;
        }
      }
    `;
  }
}

// Auto-initialize if DOM is ready and not already initialized
if (typeof document !== 'undefined' && !document.querySelector('[data-testid="process"]')) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (!document.querySelector('[data-testid="process"]')) {
        const process = new Process();
        process.mount('#main');
      }
    });
  } else {
    if (!document.querySelector('[data-testid="process"]')) {
      const process = new Process();
      process.mount('#main');
    }
  }
}

export default Process;