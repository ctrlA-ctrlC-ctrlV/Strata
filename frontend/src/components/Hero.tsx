// Hero Component - Static-first with TypeScript enhancement
// Main hero section with H1, subtitle, CTA, and trust indicators

export interface HeroConfig {
  headline?: string;
  subheading?: string;
  ctaText?: string;
  ctaHref?: string;
  backgroundImage?: string;
  trustIndicators?: Array<{
    icon: string;
    label: string;
    value: string;
    description?: string;
  }>;
}

export class Hero {
  private element: HTMLElement | null = null;

  constructor(private config: HeroConfig = {}) {
    this.config = {
      headline: 'Transform Your Garden with Premium Garden Rooms & Home Extensions',
      subheading: 'Professional design and construction services for garden rooms, home offices, and extensions across Ireland. Planning permission handled.',
      ctaText: 'Get Your Free Quote',
      ctaHref: '#quote',
      backgroundImage: '/images/hero/garden-room-hero.jpg',
      trustIndicators: [
        {
          icon: '⭐',
          label: 'Rating',
          value: '4.9/5',
          description: 'Based on 127+ reviews'
        },
        {
          icon: '🏠',
          label: 'Projects',
          value: '500+',
          description: 'Completed successfully'
        },
        {
          icon: '🛡️',
          label: 'Warranty',
          value: '10 Years',
          description: 'Structural guarantee'
        },
        {
          icon: '📋',
          label: 'Planning',
          value: 'Included',
          description: 'Permission handled'
        }
      ],
      ...config
    };
  }

  public render(): string {
    return `
      <section class="hero" data-testid="hero" style="background-image: url('${this.config.backgroundImage}')">
        <div class="hero__overlay"></div>
        <div class="container">
          <div class="hero__content">
            <div class="hero__text">
              <h1 class="hero__headline">
                ${this.config.headline}
              </h1>
              
              <p class="hero__subheading">
                ${this.config.subheading}
              </p>
              
              <div class="hero__cta">
                <a 
                  href="${this.config.ctaHref}" 
                  class="btn btn--primary btn--large hero__cta-button"
                  aria-label="${this.config.ctaText} - scroll to quote form"
                >
                  ${this.config.ctaText}
                </a>
              </div>
            </div>
            
            <div class="hero__trust">
              <div class="hero__trust-indicators" data-testid="trust-indicators">
                ${this.config.trustIndicators?.map(indicator => `
                  <div class="hero__trust-item" data-testid="trust-item">
                    <div class="hero__trust-icon" aria-hidden="true">${indicator.icon}</div>
                    <div class="hero__trust-content">
                      <div class="hero__trust-value">${indicator.value}</div>
                      <div class="hero__trust-label">${indicator.label}</div>
                      ${indicator.description ? `<div class="hero__trust-description">${indicator.description}</div>` : ''}
                    </div>
                  </div>
                `).join('') || ''}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Scroll indicator -->
        <div class="hero__scroll-indicator">
          <button 
            class="hero__scroll-button" 
            aria-label="Scroll to content"
            data-testid="scroll-indicator"
          >
            <span class="hero__scroll-arrow" aria-hidden="true">↓</span>
          </button>
        </div>
      </section>
    `;
  }

  public mount(targetSelector: string = 'main'): void {
    const target = document.querySelector(targetSelector);
    if (!target) {
      console.warn(`Hero: Target element '${targetSelector}' not found`);
      return;
    }

    target.insertAdjacentHTML('afterbegin', this.render());
    this.element = document.querySelector('.hero');
    
    if (this.element) {
      this.initialize();
    }
  }

  private initialize(): void {
    if (!this.element) return;

    this.addStyles();
    this.bindEvents();
    this.setupIntersectionObserver();
  }

  private bindEvents(): void {
    // Bind CTA click for smooth scroll
    const ctaButton = this.element?.querySelector('.hero__cta-button');
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
            
            // Focus first form field if quote section
            if (href === '#quote') {
              setTimeout(() => {
                const firstInput = targetSection.querySelector('input, textarea, select') as HTMLElement;
                if (firstInput) {
                  firstInput.focus();
                }
              }, 500);
            }
          }
        }
      });
    }

    // Bind scroll indicator
    const scrollButton = this.element?.querySelector('.hero__scroll-button');
    if (scrollButton) {
      scrollButton.addEventListener('click', () => {
        const nextSection = this.element?.nextElementSibling;
        if (nextSection) {
          nextSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        } else {
          // Fallback: scroll to main content
          const mainContent = document.querySelector('#main, main');
          if (mainContent) {
            mainContent.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    }
  }

  private setupIntersectionObserver(): void {
    // Animate trust indicators when they come into view
    const trustIndicators = this.element?.querySelectorAll('.hero__trust-item');
    if (!trustIndicators || trustIndicators.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('hero__trust-item--visible');
            }, index * 100); // Stagger animations
          }
        });
      },
      { threshold: 0.5 }
    );

    trustIndicators.forEach(indicator => {
      observer.observe(indicator);
    });
  }

  private addStyles(): void {
    // Check if styles are already added
    if (document.querySelector('#hero-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'hero-styles';
    styles.textContent = this.getStyles();
    document.head.appendChild(styles);
  }

  private getStyles(): string {
    return `
      .hero {
        position: relative;
        min-height: 100vh;
        display: flex;
        align-items: center;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        background-attachment: fixed;
        color: white;
        overflow: hidden;
      }

      @media (prefers-reduced-motion: reduce) {
        .hero {
          background-attachment: scroll;
        }
      }

      .hero__overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          135deg,
          rgba(0, 0, 0, 0.7) 0%,
          rgba(0, 0, 0, 0.3) 50%,
          rgba(0, 0, 0, 0.5) 100%
        );
        z-index: 1;
      }

      .hero .container {
        position: relative;
        z-index: 2;
        width: 100%;
      }

      .hero__content {
        display: flex;
        flex-direction: column;
        gap: 3rem;
        min-height: 60vh;
        justify-content: center;
        align-items: flex-start;
        padding: 2rem 0;
      }

      @media (min-width: 1024px) {
        .hero__content {
          flex-direction: row;
          align-items: center;
          gap: 4rem;
        }
      }

      .hero__text {
        flex: 1;
        max-width: 600px;
      }

      .hero__headline {
        font-size: 2.5rem;
        font-weight: 800;
        line-height: 1.1;
        margin: 0 0 1.5rem 0;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
      }

      @media (min-width: 640px) {
        .hero__headline {
          font-size: 3rem;
        }
      }

      @media (min-width: 1024px) {
        .hero__headline {
          font-size: 3.5rem;
        }
      }

      .hero__subheading {
        font-size: 1.25rem;
        line-height: 1.6;
        margin: 0 0 2rem 0;
        opacity: 0.95;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
      }

      @media (min-width: 640px) {
        .hero__subheading {
          font-size: 1.375rem;
        }
      }

      .hero__cta {
        margin-bottom: 1rem;
      }

      .btn {
        display: inline-block;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        text-decoration: none;
        font-weight: 700;
        text-align: center;
        transition: all 0.3s ease;
        border: 2px solid transparent;
        cursor: pointer;
        font-size: 1rem;
      }

      .btn--large {
        padding: 1rem 2rem;
        font-size: 1.125rem;
      }

      @media (min-width: 640px) {
        .btn--large {
          padding: 1.25rem 2.5rem;
          font-size: 1.25rem;
        }
      }

      .btn--primary {
        background-color: #2563eb;
        color: white;
        border-color: #2563eb;
        box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.4);
      }

      .btn--primary:hover,
      .btn--primary:focus {
        background-color: #1d4ed8;
        border-color: #1d4ed8;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px 0 rgba(37, 99, 235, 0.6);
        outline: 2px solid #60a5fa;
        outline-offset: 2px;
      }

      @media (prefers-reduced-motion: reduce) {
        .btn {
          transition: none;
        }
        
        .btn--primary:hover,
        .btn--primary:focus {
          transform: none;
        }
      }

      .hero__trust {
        flex-shrink: 0;
      }

      .hero__trust-indicators {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        max-width: 400px;
      }

      @media (min-width: 640px) {
        .hero__trust-indicators {
          grid-template-columns: repeat(4, 1fr);
          max-width: none;
        }
      }

      @media (min-width: 1024px) {
        .hero__trust-indicators {
          grid-template-columns: 1fr 1fr;
          max-width: 300px;
        }
      }

      .hero__trust-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 0.75rem;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        transform: translateY(20px);
        opacity: 0;
        transition: all 0.6s ease;
      }

      .hero__trust-item--visible {
        transform: translateY(0);
        opacity: 1;
      }

      @media (prefers-reduced-motion: reduce) {
        .hero__trust-item {
          transform: none;
          opacity: 1;
          transition: none;
        }
      }

      .hero__trust-icon {
        font-size: 1.5rem;
        flex-shrink: 0;
      }

      .hero__trust-content {
        min-width: 0;
        flex: 1;
      }

      .hero__trust-value {
        font-weight: 700;
        font-size: 1.125rem;
        line-height: 1.2;
      }

      .hero__trust-label {
        font-size: 0.875rem;
        opacity: 0.9;
        line-height: 1.2;
      }

      .hero__trust-description {
        font-size: 0.75rem;
        opacity: 0.8;
        line-height: 1.2;
        margin-top: 0.25rem;
      }

      .hero__scroll-indicator {
        position: absolute;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        z-index: 3;
      }

      .hero__scroll-button {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        width: 3rem;
        height: 3rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
      }

      .hero__scroll-button:hover,
      .hero__scroll-button:focus {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
        outline: 2px solid rgba(255, 255, 255, 0.5);
        outline-offset: 2px;
      }

      .hero__scroll-arrow {
        font-size: 1.25rem;
        color: white;
        animation: bounce 2s infinite;
      }

      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
          transform: translateY(0);
        }
        40% {
          transform: translateY(-5px);
        }
        60% {
          transform: translateY(-3px);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .hero__scroll-arrow {
          animation: none;
        }
        
        .hero__scroll-button:hover,
        .hero__scroll-button:focus {
          transform: none;
        }
      }

      /* Accessibility improvements */
      @media (max-height: 600px) {
        .hero {
          min-height: 80vh;
        }
        
        .hero__content {
          min-height: 50vh;
        }
      }

      /* High contrast mode support */
      @media (prefers-contrast: high) {
        .hero__overlay {
          background: linear-gradient(
            135deg,
            rgba(0, 0, 0, 0.9) 0%,
            rgba(0, 0, 0, 0.7) 50%,
            rgba(0, 0, 0, 0.8) 100%
          );
        }
        
        .hero__trust-item {
          background: rgba(0, 0, 0, 0.8);
          border: 2px solid rgba(255, 255, 255, 0.8);
        }
      }
    `;
  }
}

export default Hero;