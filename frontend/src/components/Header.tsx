// Header Component - Static-first with TypeScript enhancement
// Designed to work without JavaScript but enhanced when available

export interface HeaderConfig {
  brandText?: string;
  navItems?: Array<{
    href: string;
    text: string;
    ariaLabel?: string;
  }>;
  ctaText?: string;
  ctaHref?: string;
}

export class Header {
  private element: HTMLElement | null = null;
  private isScrolled: boolean = false;
  private scrollThreshold: number = 10;

  constructor(private config: HeaderConfig = {}) {
    this.config = {
      brandText: 'Strata',
      navItems: [
        { href: '#garden-rooms', text: 'Garden Rooms' },
        { href: '#home-extensions', text: 'Home Extensions' },
        { href: '#gallery', text: 'Projects' },
        { href: '#about', text: 'About' },
        { href: '#contact', text: 'Contact' }
      ],
      ctaText: 'Get a Quote',
      ctaHref: '#quote',
      ...config
    };
  }

  public render(): string {
    return `
      <header class="header" data-testid="header">
        <div class="container">
          <div class="header__content">
            <!-- Logo/Brand -->
            <div class="header__brand">
              <a href="#main" class="header__logo" aria-label="${this.config.brandText} - Home">
                <span class="header__logo-text">${this.config.brandText}</span>
              </a>
            </div>

            <!-- Navigation -->
            <nav class="header__nav" aria-label="Main navigation">
              <ul class="header__nav-list">
                ${this.config.navItems?.map(item => `
                  <li class="header__nav-item">
                    <a href="${item.href}" class="header__nav-link" ${item.ariaLabel ? `aria-label="${item.ariaLabel}"` : ''}>
                      ${item.text}
                    </a>
                  </li>
                `).join('') || ''}
              </ul>
            </nav>

            <!-- CTA Button -->
            <div class="header__cta">
              <a href="${this.config.ctaHref}" class="btn btn--primary header__cta-btn" aria-label="${this.config.ctaText} - scroll to quote form" data-testid="header-quote-cta">
                ${this.config.ctaText}
              </a>
            </div>

            <!-- Mobile Menu Toggle -->
            <button class="header__menu-toggle" aria-label="Toggle navigation menu" aria-expanded="false" data-testid="mobile-menu-toggle">
              <span class="header__menu-icon"></span>
              <span class="header__menu-icon"></span>
              <span class="header__menu-icon"></span>
            </button>
          </div>
        </div>
      </header>
    `;
  }

  public mount(targetSelector: string = 'body'): void {
    const target = document.querySelector(targetSelector);
    if (!target) {
      console.warn(`Header: Target element '${targetSelector}' not found`);
      return;
    }

    target.insertAdjacentHTML('afterbegin', this.render());
    this.element = document.querySelector('.header');
    
    if (this.element) {
      this.initialize();
    }
  }

  private initialize(): void {
    if (!this.element) return;

    // Bind event listeners
    this.bindScrollListener();
    this.bindCTAClick();
    this.bindMobileMenuToggle();
    this.addStyles();
  }

  private bindScrollListener(): void {
    let ticking = false;

    const updateHeader = (): void => {
      const scrollTop = window.scrollY;
      const shouldBeScrolled = scrollTop > this.scrollThreshold;

      if (shouldBeScrolled !== this.isScrolled) {
        this.isScrolled = shouldBeScrolled;
        this.element?.classList.toggle('header--scrolled', this.isScrolled);
      }
      ticking = false;
    };

    const onScroll = (): void => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  private bindCTAClick(): void {
    const ctaButton = this.element?.querySelector('.header__cta-btn');
    if (!ctaButton) return;

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
          
          // Focus first form field if in quote section
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

  private bindMobileMenuToggle(): void {
    const menuToggle = this.element?.querySelector('.header__menu-toggle');
    const nav = this.element?.querySelector('.header__nav');
    
    if (!menuToggle || !nav) return;

    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', (!isExpanded).toString());
      nav.classList.toggle('header__nav--open', !isExpanded);
    });
  }

  private addStyles(): void {
    // Check if styles are already added
    if (document.querySelector('#header-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'header-styles';
    styles.textContent = this.getStyles();
    document.head.appendChild(styles);
  }

  private getStyles(): string {
    return `
      .header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 50;
        background-color: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
        border-bottom: 1px solid transparent;
      }

      @media (prefers-reduced-motion: reduce) {
        .header {
          transition: none;
        }
      }

      .header--scrolled {
        background-color: rgba(255, 255, 255, 0.98);
        border-bottom-color: rgba(0, 0, 0, 0.1);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .header__content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 0;
        min-height: 4rem;
      }

      .header__brand {
        flex-shrink: 0;
      }

      .header__logo {
        text-decoration: none;
        color: #1a1a1a;
        font-size: 1.5rem;
        font-weight: bold;
        transition: color 0.2s ease;
      }

      .header__logo:hover,
      .header__logo:focus {
        color: #2563eb;
        outline: 2px solid #2563eb;
        outline-offset: 2px;
      }

      .header__logo-text {
        font-family: system-ui, -apple-system, sans-serif;
      }

      .header__nav {
        display: none;
      }

      @media (min-width: 768px) {
        .header__nav {
          display: block;
          flex: 1;
          margin-left: 2rem;
        }
      }

      .header__nav-list {
        display: flex;
        list-style: none;
        margin: 0;
        padding: 0;
        gap: 2rem;
      }

      .header__nav-item {
        margin: 0;
      }

      .header__nav-link {
        text-decoration: none;
        color: #4b5563;
        font-weight: 500;
        padding: 0.5rem 0;
        transition: color 0.2s ease;
        position: relative;
      }

      .header__nav-link:hover,
      .header__nav-link:focus {
        color: #2563eb;
        outline: 2px solid #2563eb;
        outline-offset: 2px;
      }

      .header__cta {
        flex-shrink: 0;
        margin-left: 1rem;
      }

      .btn {
        display: inline-block;
        padding: 0.75rem 1.5rem;
        border-radius: 0.375rem;
        text-decoration: none;
        font-weight: 600;
        text-align: center;
        transition: all 0.2s ease;
        border: 2px solid transparent;
        cursor: pointer;
      }

      @media (prefers-reduced-motion: reduce) {
        .btn {
          transition: none;
        }
      }

      .btn--primary {
        background-color: #2563eb;
        color: white;
        border-color: #2563eb;
      }

      .btn--primary:hover,
      .btn--primary:focus {
        background-color: #1d4ed8;
        border-color: #1d4ed8;
        outline: 2px solid #2563eb;
        outline-offset: 2px;
      }

      .header__cta-btn {
        font-size: 0.875rem;
        padding: 0.625rem 1.25rem;
      }

      .header__menu-toggle {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 2.5rem;
        height: 2.5rem;
        background: transparent;
        border: none;
        cursor: pointer;
        margin-left: 1rem;
        gap: 0.25rem;
      }

      @media (min-width: 768px) {
        .header__menu-toggle {
          display: none;
        }
      }

      .header__menu-icon {
        display: block;
        width: 1.5rem;
        height: 2px;
        background-color: #4b5563;
        transition: all 0.3s ease;
      }

      .header__menu-toggle:hover .header__menu-icon,
      .header__menu-toggle:focus .header__menu-icon {
        background-color: #2563eb;
      }

      .header__menu-toggle:focus {
        outline: 2px solid #2563eb;
        outline-offset: 2px;
      }

      /* Mobile navigation */
      @media (max-width: 767px) {
        .header__nav {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background-color: white;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transform: translateY(-100%);
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }

        .header__nav--open {
          transform: translateY(0);
          opacity: 1;
          visibility: visible;
        }

        .header__nav-list {
          flex-direction: column;
          gap: 0;
          padding: 1rem 0;
        }

        .header__nav-link {
          display: block;
          padding: 1rem 2rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .header__nav-link:hover {
          background-color: rgba(37, 99, 235, 0.05);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .header__nav {
          transition: none;
        }
      }
    `;
  }
}

export default Header;