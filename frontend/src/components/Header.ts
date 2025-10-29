interface HeaderProps {
  /** Optional class name for styling customization */
  className?: string;
}

interface NavItem {
  label: string;
  href: string;
  /** Whether this is an external link */
  external?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Garden Rooms', href: '/garden-rooms' },
  { label: 'Home Extensions', href: '/home-extensions' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'FAQ', href: '/faq' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

/**
 * Sticky header component with navigation and CTA button
 * Implements FR-001, FR-002, FR-003 from spec
 * 
 * Features:
 * - Sticky positioning with backdrop blur
 * - Responsive mobile hamburger menu
 * - WCAG AA contrast compliance (4.5:1)
 * - Keyboard navigation support
 * - Smooth scroll to quote section
 */
export class Header {
  private element: HTMLElement;
  private mobileMenuButton: HTMLButtonElement | null = null;
  private mobileMenu: HTMLDivElement | null = null;
  private isMobileMenuOpen: boolean = false;

  constructor(props: HeaderProps = {}) {
    this.element = this.createElement(props.className || '');
    this.initializeEventListeners();
  }

  private createElement(className: string): HTMLElement {
    const header = document.createElement('header');
    header.className = `sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-200 ${className}`;
    header.setAttribute('role', 'banner');

    header.innerHTML = `
      <div class="container-custom">
        <div class="flex items-center justify-between h-16 md:h-18">
          <!-- Logo -->
          <div class="flex-shrink-0">
            <a 
              href="/" 
              class="flex items-center space-x-2 text-xl font-bold text-neutral-900 hover:text-primary-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-sm"
              aria-label="Strata Garden Rooms - Home"
            >
              <!-- Logo icon placeholder - would be replaced with actual logo -->
              <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-sm" aria-hidden="true">S</span>
              </div>
              <span class="hidden sm:block">Strata Garden Rooms</span>
              <span class="sm:hidden">Strata</span>
            </a>
          </div>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center space-x-6" role="navigation" aria-label="Main navigation">
            ${navItems.map(item => `
              <a
                href="${item.href}"
                class="text-neutral-700 hover:text-primary-600 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-sm px-2 py-1"
                ${item.external ? 'target="_blank" rel="noopener noreferrer"' : ''}
              >
                ${item.label}
              </a>
            `).join('')}
          </nav>

          <!-- Desktop CTA Buttons -->
          <div class="hidden md:flex items-center space-x-3">
            <!-- Contact Button - Emphasized -->
            <a
              href="/contact"
              class="text-primary-600 hover:text-primary-700 font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-sm px-3 py-2"
            >
              Contact
            </a>
            
            <!-- Get a Quote Button - High contrast CTA -->
            <a
              href="#quote"
              class="bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm"
              data-quote-link
            >
              Get a Quote
            </a>
          </div>

          <!-- Mobile Menu Button -->
          <button
            type="button"
            class="md:hidden p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-expanded="false"
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
            data-mobile-menu-button
          >
            <!-- Hamburger Icon -->
            <svg 
              class="w-6 h-6" 
              fill="none" 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              aria-hidden="true"
              data-hamburger-icon
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <!-- Mobile Menu (initially hidden) -->
        <div 
          id="mobile-menu" 
          class="md:hidden border-t border-neutral-200 bg-white hidden"
          role="navigation" 
          aria-label="Mobile navigation"
          data-mobile-menu
        >
          <div class="px-2 pt-2 pb-3 space-y-1">
            ${navItems.map(item => `
              <a
                href="${item.href}"
                class="block px-3 py-2 text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                ${item.external ? 'target="_blank" rel="noopener noreferrer"' : ''}
                data-nav-link
              >
                ${item.label}
              </a>
            `).join('')}
            
            <!-- Mobile CTA Buttons -->
            <div class="pt-2 space-y-2 border-t border-neutral-200 mt-3">
              <a
                href="/contact"
                class="block px-3 py-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                data-nav-link
              >
                Contact
              </a>
              <a
                href="#quote"
                class="block w-full text-center bg-primary-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm"
                data-quote-link
                data-nav-link
              >
                Get a Quote
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    return header;
  }

  private initializeEventListeners(): void {
    // Get references to interactive elements
    this.mobileMenuButton = this.element.querySelector('[data-mobile-menu-button]') as HTMLButtonElement;
    this.mobileMenu = this.element.querySelector('[data-mobile-menu]') as HTMLDivElement;

    // Mobile menu toggle
    if (this.mobileMenuButton) {
      this.mobileMenuButton.addEventListener('click', () => {
        this.toggleMobileMenu();
      });
    }

    // Quote link smooth scroll
    const quoteLinks = this.element.querySelectorAll('[data-quote-link]');
    quoteLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        this.handleQuoteClick(event as MouseEvent);
      });
    });

    // Nav link click handling (closes mobile menu)
    const navLinks = this.element.querySelectorAll('[data-nav-link]');
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    });

    // Close mobile menu on escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isMobileMenuOpen) {
        this.closeMobileMenu();
      }
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (event) => {
      if (this.isMobileMenuOpen && !this.element.contains(event.target as Node)) {
        this.closeMobileMenu();
      }
    });
  }

  private toggleMobileMenu(): void {
    if (this.isMobileMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  private openMobileMenu(): void {
    if (this.mobileMenu && this.mobileMenuButton) {
      this.isMobileMenuOpen = true;
      this.mobileMenu.classList.remove('hidden');
      this.mobileMenuButton.setAttribute('aria-expanded', 'true');
      
      // Update icon to close icon
      const icon = this.mobileMenuButton.querySelector('[data-hamburger-icon]');
      if (icon) {
        icon.innerHTML = '<path d="M6 18L18 6M6 6l12 12" />';
      }
    }
  }

  private closeMobileMenu(): void {
    if (this.mobileMenu && this.mobileMenuButton) {
      this.isMobileMenuOpen = false;
      this.mobileMenu.classList.add('hidden');
      this.mobileMenuButton.setAttribute('aria-expanded', 'false');
      
      // Update icon to hamburger icon
      const icon = this.mobileMenuButton.querySelector('[data-hamburger-icon]');
      if (icon) {
        icon.innerHTML = '<path d="M4 6h16M4 12h16M4 18h16" />';
      }
    }
  }

  private handleQuoteClick(event: MouseEvent): void {
    event.preventDefault();
    const quoteSection = document.getElementById('quote');
    if (quoteSection) {
      quoteSection.scrollIntoView({ behavior: 'smooth' });
    }
    // Close mobile menu if open
    this.closeMobileMenu();
  }

  public render(): HTMLElement {
    return this.element;
  }

  public destroy(): void {
    // Clean up event listeners if needed
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

// Factory function for easier usage
export function createHeader(props: HeaderProps = {}): Header {
  return new Header(props);
}

export default Header;