interface HeroProps {
  /** Optional class name for styling customization */
  className?: string;
  /** Optional background image URL */
  backgroundImage?: string;
}

interface TrustMini {
  icon: string; // SVG path
  value: string;
  label: string;
  ariaLabel: string;
}

// Trust indicators/mini stats
const trustMinis: TrustMini[] = [
  {
    icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z',
    value: '4.9',
    label: 'Star Rating',
    ariaLabel: '4.9 out of 5 star rating'
  },
  {
    icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
    value: '450+',
    label: 'Projects Completed',
    ariaLabel: 'Over 450 projects completed'
  },
  {
    icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
    value: '25 Years',
    label: 'Warranty',
    ariaLabel: '25 year warranty included'
  },
  {
    icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
    value: 'Full Service',
    label: 'Planning Handled',
    ariaLabel: 'Full planning permission service handled for you'
  }
];

/**
 * Hero section component with headline, subhead, CTA, and trust indicators
 * Implements FR-004, FR-005, FR-006, FR-007 from spec
 * 
 * Features:
 * - Benefit-led H1 headline and supporting subhead
 * - Primary CTA button that scrolls to quote form
 * - Four trust mini indicators with icons and values
 * - Background image support with text legibility overlay
 * - Responsive layout and typography
 * - High contrast compliance (4.5:1)
 * - Fast loading optimization
 */
export class Hero {
  private element: HTMLElement;

  constructor(props: HeroProps = {}) {
    this.element = this.createElement(props.className || '', props.backgroundImage);
    this.initializeEventListeners();
  }

  private createElement(className: string, backgroundImage?: string): HTMLElement {
    const hero = document.createElement('section');
    hero.className = `relative min-h-screen flex items-center justify-center ${className}`;
    hero.setAttribute('role', 'banner');
    hero.setAttribute('aria-labelledby', 'hero-headline');

    // Background image styling
    const backgroundStyle = backgroundImage 
      ? `background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${backgroundImage}'); background-size: cover; background-position: center; background-repeat: no-repeat;`
      : 'background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);';

    hero.innerHTML = `
      <!-- Background -->
      <div class="absolute inset-0" style="${backgroundStyle}"></div>
      
      <!-- Content -->
      <div class="container-custom relative z-10">
        <div class="max-w-4xl mx-auto text-center">
          
          <!-- Main Headline & Subhead -->
          <div class="mb-8 md:mb-12">
            <h1 
              id="hero-headline" 
              class="text-4xl md:text-5xl lg:text-6xl font-bold ${backgroundImage ? 'text-white' : 'text-neutral-900'} mb-6 leading-tight"
            >
              Transform Your Home with 
              <span class="text-primary-500 ${backgroundImage ? '' : 'text-primary-600'}">
                Premium Garden Rooms
              </span>
            </h1>
            
            <p class="text-xl md:text-2xl ${backgroundImage ? 'text-neutral-100' : 'text-neutral-600'} max-w-2xl mx-auto leading-relaxed">
              Create the perfect extra space for work, relaxation, or family time. 
              Professionally designed, fully insulated, and ready in weeks.
            </p>
          </div>
          
          <!-- Primary CTA -->
          <div class="mb-12 md:mb-16">
            <a 
              href="#quote"
              class="inline-flex items-center px-8 py-4 bg-primary-600 text-white text-lg font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-primary-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 motion-safe:transition-transform motion-safe:duration-200"
              data-hero-cta
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Get a Free Quote
            </a>
          </div>
          
          <!-- Trust Minis -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            ${trustMinis.map((mini, index) => `
              <div class="text-center" role="group" aria-labelledby="trust-mini-${index}">
                <div class="inline-flex items-center justify-center w-12 h-12 ${backgroundImage ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-600'} rounded-lg mb-3">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="${mini.icon}" />
                  </svg>
                </div>
                <div id="trust-mini-${index}" class="text-2xl md:text-3xl font-bold ${backgroundImage ? 'text-white' : 'text-neutral-900'} mb-1" aria-label="${mini.ariaLabel}">
                  ${mini.value}
                </div>
                <div class="text-sm md:text-base ${backgroundImage ? 'text-neutral-200' : 'text-neutral-600'} font-medium">
                  ${mini.label}
                </div>
              </div>
            `).join('')}
          </div>
          
          <!-- Scroll Indicator -->
          <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <button 
              type="button"
              class="${backgroundImage ? 'text-white/70 hover:text-white' : 'text-neutral-400 hover:text-neutral-600'} transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-full p-2"
              aria-label="Scroll down to see more"
              data-scroll-indicator
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    return hero;
  }

  private initializeEventListeners(): void {
    // Primary CTA smooth scroll
    const ctaButton = this.element.querySelector('[data-hero-cta]');
    if (ctaButton) {
      ctaButton.addEventListener('click', (event) => {
        this.handleQuoteClick(event as MouseEvent);
      });
    }

    // Scroll indicator smooth scroll
    const scrollIndicator = this.element.querySelector('[data-scroll-indicator]');
    if (scrollIndicator) {
      scrollIndicator.addEventListener('click', () => {
        this.handleScrollDown();
      });
    }

    // Intersection Observer for scroll indicator fade
    this.initializeScrollIndicator();
  }

  private initializeScrollIndicator(): void {
    const scrollIndicator = this.element.querySelector('[data-scroll-indicator]') as HTMLElement;
    if (!scrollIndicator) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Hide scroll indicator when hero is not in view
            scrollIndicator.style.opacity = '0';
          } else {
            scrollIndicator.style.opacity = '1';
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(this.element);
  }

  private handleQuoteClick(event: MouseEvent): void {
    event.preventDefault();
    const quoteSection = document.getElementById('quote');
    if (quoteSection) {
      quoteSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  private handleScrollDown(): void {
    // Scroll to the next section after hero
    const nextSection = this.element.nextElementSibling;
    if (nextSection) {
      nextSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      // Fallback: scroll down by viewport height
      window.scrollBy({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    }
  }

  public render(): HTMLElement {
    return this.element;
  }

  public setBackgroundImage(imageUrl: string): void {
    const backgroundElement = this.element.querySelector('.absolute.inset-0') as HTMLElement;
    if (backgroundElement) {
      backgroundElement.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${imageUrl}')`;
      backgroundElement.style.backgroundSize = 'cover';
      backgroundElement.style.backgroundPosition = 'center';
      backgroundElement.style.backgroundRepeat = 'no-repeat';
    }

    // Update text colors for better contrast over image
    const textElements = this.element.querySelectorAll('h1, p, div');
    textElements.forEach((element) => {
      if (element.classList.contains('text-neutral-900')) {
        element.classList.remove('text-neutral-900');
        element.classList.add('text-white');
      }
      if (element.classList.contains('text-neutral-600')) {
        element.classList.remove('text-neutral-600');
        element.classList.add('text-neutral-100');
      }
    });
  }

  public updateContent(headline: string, subhead: string): void {
    const headlineElement = this.element.querySelector('#hero-headline');
    const subheadElement = this.element.querySelector('p');
    
    if (headlineElement) {
      headlineElement.innerHTML = headline;
    }
    if (subheadElement) {
      subheadElement.textContent = subhead;
    }
  }

  public destroy(): void {
    // Clean up event listeners and observers
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

// Factory function for easier usage
export function createHero(props: HeroProps = {}): Hero {
  return new Hero(props);
}

export default Hero;