// BenefitsGrid Component - Static-first with TypeScript enhancement
// Displays 6 key benefits in a responsive grid layout

export interface Benefit {
  icon: string;
  title: string;
  description: string;
  ariaLabel?: string;
}

export interface BenefitsGridConfig {
  title?: string;
  subtitle?: string;
  benefits?: Benefit[];
}

export class BenefitsGrid {
  private element: HTMLElement | null = null;

  constructor(private config: BenefitsGridConfig = {}) {
    this.config = {
      title: 'Why Choose Strata Garden Rooms',
      subtitle: 'Professional expertise and quality construction for your garden room or home extension project',
      benefits: [
        {
          icon: '🏗️',
          title: 'Expert Design & Build',
          description: 'Professional architects and skilled craftspeople ensure quality construction from concept to completion.',
          ariaLabel: 'Expert design and build services'
        },
        {
          icon: '📋',
          title: 'Planning Permission',
          description: 'We handle all planning applications and building regulations compliance for hassle-free approval.',
          ariaLabel: 'Planning permission handling'
        },
        {
          icon: '🛡️',
          title: '10-Year Warranty',
          description: 'Comprehensive structural warranty gives you peace of mind for years to come.',
          ariaLabel: 'Ten year structural warranty'
        },
        {
          icon: '🌱',
          title: 'Eco-Friendly Materials',
          description: 'Sustainable timber and energy-efficient insulation for environmentally conscious construction.',
          ariaLabel: 'Environmentally friendly materials'
        },
        {
          icon: '💰',
          title: 'Fixed Price Guarantee',
          description: 'No hidden costs or surprise charges. Your quoted price is your final price.',
          ariaLabel: 'Fixed price guarantee'
        },
        {
          icon: '⚡',
          title: 'Fast Installation',
          description: 'Most garden rooms completed within 2-4 weeks from planning approval to handover.',
          ariaLabel: 'Fast installation timeline'
        }
      ],
      ...config
    };
  }

  public render(): string {
    return `
      <section class="benefits-grid section" data-testid="benefits-grid">
        <div class="container">
          <div class="benefits-grid__header">
            <h2 class="benefits-grid__title">${this.config.title}</h2>
            <p class="benefits-grid__subtitle">${this.config.subtitle}</p>
          </div>

          <div class="benefits-grid__grid">
            ${this.config.benefits?.map((benefit, index) => `
              <div class="benefit-item" data-testid="benefit-item" data-index="${index}">
                <div class="benefit-item__icon" aria-hidden="true">${benefit.icon}</div>
                <div class="benefit-item__content">
                  <h3 class="benefit-item__title">${benefit.title}</h3>
                  <p class="benefit-item__description">${benefit.description}</p>
                </div>
              </div>
            `).join('') || ''}
          </div>
        </div>
      </section>
    `;
  }

  public mount(targetSelector: string = '#main'): void {
    const target = document.querySelector(targetSelector);
    if (!target) {
      console.warn(`BenefitsGrid: Target element '${targetSelector}' not found`);
      return;
    }

    target.insertAdjacentHTML('beforeend', this.render());
    this.element = document.querySelector('.benefits-grid');
    
    if (this.element) {
      this.initialize();
    }
  }

  private initialize(): void {
    if (!this.element) return;

    this.addStyles();
    this.setupAnimations();
    this.setupAccessibility();
  }

  private setupAnimations(): void {
    // Set up intersection observer for staggered animations
    const benefitItems = this.element?.querySelectorAll('.benefit-item');
    if (!benefitItems || benefitItems.length === 0) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
      benefitItems.forEach(item => {
        item.classList.add('benefit-item--visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const item = entry.target as HTMLElement;
            const index = parseInt(item.getAttribute('data-index') || '0');
            
            setTimeout(() => {
              item.classList.add('benefit-item--visible');
            }, index * 100); // Stagger animations by 100ms

            observer.unobserve(entry.target);
          }
        });
      },
      { 
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    benefitItems.forEach(item => {
      observer.observe(item);
    });
  }

  private setupAccessibility(): void {
    // Ensure icons are properly hidden from screen readers
    const icons = this.element?.querySelectorAll('.benefit-item__icon');
    icons?.forEach(icon => {
      icon.setAttribute('aria-hidden', 'true');
    });

    // Add ARIA labels to benefit items if provided
    const benefitItems = this.element?.querySelectorAll('.benefit-item');
    benefitItems?.forEach((item, index) => {
      const benefit = this.config.benefits?.[index];
      if (benefit?.ariaLabel) {
        item.setAttribute('aria-label', benefit.ariaLabel);
      }
    });
  }

  private addStyles(): void {
    // Check if styles are already added
    if (document.querySelector('#benefits-grid-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'benefits-grid-styles';
    styles.textContent = this.getStyles();
    document.head.appendChild(styles);
  }

  private getStyles(): string {
    return `
      .benefits-grid {
        background-color: #f8fafc;
        border-top: 1px solid #e2e8f0;
        border-bottom: 1px solid #e2e8f0;
      }

      .benefits-grid__header {
        text-align: center;
        margin-bottom: 3rem;
        max-width: 800px;
        margin-left: auto;
        margin-right: auto;
      }

      .benefits-grid__title {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
        color: #1a1a1a;
        line-height: 1.2;
      }

      @media (max-width: 768px) {
        .benefits-grid__title {
          font-size: 2rem;
        }
      }

      .benefits-grid__subtitle {
        font-size: 1.25rem;
        color: #6b7280;
        line-height: 1.6;
        margin: 0;
      }

      @media (max-width: 768px) {
        .benefits-grid__subtitle {
          font-size: 1.125rem;
        }
      }

      .benefits-grid__grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      @media (min-width: 640px) {
        .benefits-grid__grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 2.5rem;
        }
      }

      @media (min-width: 1024px) {
        .benefits-grid__grid {
          grid-template-columns: repeat(3, 1fr);
          gap: 3rem;
        }
      }

      .benefit-item {
        background: white;
        padding: 2rem;
        border-radius: 0.75rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        border: 1px solid #e5e7eb;
        transition: all 0.3s ease;
        opacity: 0;
        transform: translateY(2rem);
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        position: relative;
        overflow: hidden;
      }

      .benefit-item::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #2563eb, #3b82f6);
        transform: scaleX(0);
        transition: transform 0.3s ease;
      }

      .benefit-item:hover::before,
      .benefit-item:focus-within::before {
        transform: scaleX(1);
      }

      .benefit-item:hover,
      .benefit-item:focus-within {
        transform: translateY(-4px);
        box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
      }

      .benefit-item--visible {
        opacity: 1;
        transform: translateY(0);
      }

      @media (prefers-reduced-motion: reduce) {
        .benefit-item {
          transition: none;
          opacity: 1;
          transform: none;
        }

        .benefit-item:hover,
        .benefit-item:focus-within {
          transform: none;
        }

        .benefit-item::before {
          transition: none;
        }
      }

      .benefit-item__icon {
        font-size: 3rem;
        margin-bottom: 1.5rem;
        display: block;
        height: 4rem;
        width: 4rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #eff6ff, #dbeafe);
        border-radius: 50%;
        flex-shrink: 0;
      }

      .benefit-item__content {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .benefit-item__title {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: #1a1a1a;
        line-height: 1.3;
        margin-top: 0;
      }

      .benefit-item__description {
        color: #6b7280;
        line-height: 1.6;
        margin: 0;
        flex: 1;
      }

      /* Focus management */
      .benefit-item:focus {
        outline: 2px solid #2563eb;
        outline-offset: 2px;
      }

      /* High contrast mode support */
      @media (prefers-contrast: high) {
        .benefit-item {
          border: 2px solid #000;
          background: #fff;
        }

        .benefit-item__icon {
          background: #000;
          color: #fff;
        }

        .benefit-item__title {
          color: #000;
        }

        .benefit-item__description {
          color: #333;
        }
      }

      /* Print styles */
      @media print {
        .benefits-grid {
          background: white;
          border: none;
        }

        .benefit-item {
          break-inside: avoid;
          box-shadow: none;
          border: 1px solid #ccc;
        }

        .benefit-item__icon {
          background: white;
          border: 1px solid #ccc;
        }
      }
    `;
  }
}

// Auto-initialize if DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const benefitsGrid = new BenefitsGrid();
      benefitsGrid.mount('#main');
    });
  } else {
    const benefitsGrid = new BenefitsGrid();
    benefitsGrid.mount('#main');
  }
}

export default BenefitsGrid;