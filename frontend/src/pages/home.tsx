// Home Page Composition - Static-first with TypeScript enhancement
// Assembles all page sections for the landing page

export interface HomePageConfig {
  enableJavaScriptEnhancements?: boolean;
  lazyLoadComponents?: boolean;
}

export class HomePage {
  private config: HomePageConfig;
  private components: {
    header?: any;
    hero?: any;
    footer?: any;
    quoteForm?: any;
    gardenRoomsSection?: any;
    homeExtensionsSection?: any;
    gallery?: any;
    testimonials?: any;
    process?: any;
  } = {};

  constructor(config: HomePageConfig = {}) {
    this.config = {
      enableJavaScriptEnhancements: true,
      lazyLoadComponents: false,
      ...config
    };
  }

  public async initialize(): Promise<void> {
    // Ensure DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.render());
    } else {
      await this.render();
    }
  }

  private async render(): Promise<void> {
    this.setupPageStructure();
    await this.initializeComponents();
    this.setupGlobalStyles();
    this.setupAccessibility();
    
    if (this.config.enableJavaScriptEnhancements) {
      this.addJavaScriptEnhancements();
    }
  }

  private setupPageStructure(): void {
    // Ensure body has the correct structure for landing page
    const body = document.body;
    
    // Add main content wrapper if it doesn't exist
    let main = document.querySelector('#main');
    if (!main) {
      main = document.createElement('main');
      main.id = 'main';
      main.setAttribute('role', 'main');
      main.setAttribute('aria-label', 'Main content');
      
      // Move existing content into main if needed
      const existingContent = body.innerHTML;
      body.innerHTML = '';
      body.appendChild(main);
      main.innerHTML = existingContent;
    }

    // Add page classes
    body.classList.add('page-home', 'landing-page');
    
    // Set up proper document title
    if (!document.title || document.title === 'Vite App') {
      document.title = 'Strata Garden Rooms - Premium Garden Rooms & Home Extensions in Ireland';
    }
  }

  private async initializeComponents(): Promise<void> {
    try {
      // Dynamic imports to avoid compilation issues
      const { default: Header } = await import('../components/Header');
      const { default: Hero } = await import('../components/Hero');
      const { default: Footer } = await import('../components/Footer');
      const { QuoteForm } = await import('../components/QuoteForm');
      const { ProductSectionGardenRooms } = await import('../components/ProductSectionGardenRooms');
      const { ProductSectionHomeExtensions } = await import('../components/ProductSectionHomeExtensions');
      const { default: Gallery } = await import('../components/Gallery');
      const { default: Testimonial } = await import('../components/Testimonial');
      const { default: Process } = await import('../components/Process');

      // Initialize Header
      this.components.header = new Header({
        brandText: 'Strata',
        navItems: [
          { href: '#garden-rooms', text: 'Garden Rooms' },
          { href: '#home-extensions', text: 'Home Extensions' },
          { href: '#gallery', text: 'Projects' },
          { href: '#about', text: 'About' },
          { href: '#contact', text: 'Contact' }
        ],
        ctaText: 'Get a Quote',
        ctaHref: '#quote'
      });
      this.components.header.mount('body');

      // Initialize Hero
      this.components.hero = new Hero({
        headline: 'Transform Your Garden with Premium Garden Rooms & Home Extensions',
        subheading: 'Professional design and construction services for garden rooms, home offices, and extensions across Ireland. Planning permission handled.',
        ctaText: 'Get Your Free Quote',
        ctaHref: '#quote',
        backgroundImage: '/images/hero/garden-room-hero.jpg'
      });
      this.components.hero.mount('#main');

      // Initialize Garden Rooms Section
      this.components.gardenRoomsSection = new ProductSectionGardenRooms({
        imageUrl: '/images/projects/garden-room-hero.jpg',
        imageAlt: 'Modern garden room with glass doors and contemporary design',
        sectionLabel: 'Garden Rooms',
        headingLevel: 'h2',
        heading: 'Transform Your Garden with Premium Garden Rooms',
        subheading: 'Modern, Insulated Garden Rooms',
        brandParagraph: 'Create the perfect garden office, studio, or relaxation space with our professionally designed and constructed garden rooms. Built to the highest standards with full insulation, electrical installations, and planning permission support.',
        primaryCtaText: 'Get Your Garden Room Quote',
        primaryCtaHref: '#quote',
        secondaryHeading: 'Year-Round Comfort',
        supportingParagraph: 'Our garden rooms are designed for year-round use with premium insulation, double-glazed windows, and professional electrical installations. Perfect for home offices, creative studios, or peaceful retreats.',
        detailsLinkText: 'For more details about our garden rooms',
        detailsLinkHref: '#garden-rooms-details'
      });
      this.components.gardenRoomsSection.mount('#main');

      // Initialize Home Extensions Section
      this.components.homeExtensionsSection = new ProductSectionHomeExtensions({
        imageUrl: '/images/projects/home-extension-hero.jpg',
        imageAlt: 'Modern home extension with large windows and contemporary architecture',
        sectionLabel: 'Home Extensions',
        headingLevel: 'h2',
        heading: 'Expand Your Living Space with Premium Home Extensions',
        subheading: 'Single & Double-Storey Extensions',
        brandParagraph: 'Maximize your home\'s potential with our expertly designed and constructed extensions. From kitchen extensions to additional bedrooms, we handle everything from planning permission to final construction with full building regulations compliance.',
        primaryCtaText: 'Get Your Extension Quote',
        primaryCtaHref: '#quote',
        secondaryHeading: 'Full-Service Construction',
        supportingParagraph: 'Our home extensions are delivered with complete project management, architectural design, planning permission support, and full building regulations compliance. We ensure seamless integration with your existing home.',
        detailsLinkText: 'For more details about our home extensions',
        detailsLinkHref: '#home-extensions-details'
      });
      this.components.homeExtensionsSection.mount('#main');

      // Initialize Gallery
      this.components.gallery = new Gallery();
      this.components.gallery.mount(document.querySelector('#main')!);

      // Initialize Testimonials
      this.components.testimonials = new Testimonial({
        showNavigation: true,
        autoRotate: false,
        enableKeyboardNavigation: true
      });
      this.components.testimonials.mount('#main');

      // Initialize Process (before quote form for logical flow)
      this.components.process = new Process({
        title: 'Our Process',
        subtitle: 'From initial consultation to project completion, we guide you through every step of creating your perfect garden room or home extension'
      });
      this.components.process.mount('#main');

      // Initialize QuoteForm
      this.components.quoteForm = new QuoteForm({
        enableJavaScriptEnhancements: this.config.enableJavaScriptEnhancements ?? true,
        apiEndpoint: '/api/quote-leads',
        newsletterEndpoint: '/api/newsletter-subscriptions',
        mailtoFallback: 'quotes@stratagardnerooms.ie'
      });
      await this.components.quoteForm.initialize();

      // Initialize Footer
      this.components.footer = new Footer({
        companyName: 'Strata Garden Rooms',
        address: {
          line1: '123 Business Park',
          line2: 'Unit 4',
          city: 'Dublin',
          county: 'County Dublin',
          postcode: 'D01 A123',
          country: 'Ireland'
        },
        phone: '+353 1 234 5678',
        email: 'info@strata.ie'
      });
      this.components.footer.mount('body');

    } catch (error) {
      console.error('Failed to load components:', error);
      // Fallback: Initialize basic page structure
      this.initializeFallback();
    }
  }

  private initializeFallback(): void {
    // Fallback initialization if dynamic imports fail
    console.log('Using fallback component initialization');
    
    // Add basic page structure manually
    const main = document.querySelector('#main');
    
    if (main && main.innerHTML.trim() === '') {
      main.innerHTML = `
        <section class="hero-fallback">
          <div class="container">
            <h1>Strata Garden Rooms</h1>
            <p>Premium Garden Rooms & Home Extensions in Ireland</p>
            <a href="#quote" class="btn btn--primary">Get Your Free Quote</a>
          </div>
        </section>
      `;
    }
  }

  private setupGlobalStyles(): void {
    // Check if global styles are already added
    if (document.querySelector('#page-global-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'page-global-styles';
    styles.textContent = this.getGlobalStyles();
    document.head.appendChild(styles);
  }

  private setupAccessibility(): void {
    // Set up focus management
    this.setupFocusManagement();
    
    // Set up keyboard navigation
    this.setupKeyboardNavigation();
    
    // Set up ARIA live regions
    this.setupLiveRegions();
  }

  private setupFocusManagement(): void {
    // Ensure proper focus order and visible focus indicators
    const focusableElements = document.querySelectorAll(
      'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
    );

    focusableElements.forEach(element => {
      element.addEventListener('focus', (e) => {
        const target = e.target as HTMLElement;
        target.classList.add('focused');
      });

      element.addEventListener('blur', (e) => {
        const target = e.target as HTMLElement;
        target.classList.remove('focused');
      });
    });
  }

  private setupKeyboardNavigation(): void {
    // Handle escape key for modal/navigation closes
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Close any open mobile menus
        const openMenus = document.querySelectorAll('[aria-expanded="true"]');
        openMenus.forEach(menu => {
          menu.setAttribute('aria-expanded', 'false');
          const nav = document.querySelector('.header__nav');
          if (nav) {
            nav.classList.remove('header__nav--open');
          }
        });
      }
    });

    // Handle smooth scroll for anchor links
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href^="#"]') as HTMLAnchorElement;
      
      if (link && link.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId!);
        
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Set focus if it's a focusable element
          if (targetElement instanceof HTMLElement && targetElement.hasAttribute('tabindex')) {
            targetElement.focus();
          }
        }
      }
    });
  }

  private setupLiveRegions(): void {
    // Create live region for dynamic announcements
    const liveRegion = document.createElement('div');
    liveRegion.id = 'live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
  }

  private addJavaScriptEnhancements(): void {
    // Add progressive enhancement features
    this.addLazyLoading();
    this.addSmoothAnimations();
    this.addFormEnhancements();
  }

  private addLazyLoading(): void {
    // Set up intersection observer for lazy loading images
    const images = document.querySelectorAll('img[data-src]');
    
    if (images.length === 0) return;

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.getAttribute('data-src');
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  private addSmoothAnimations(): void {
    // Respect reduced motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (prefersReducedMotion.matches) {
      document.body.classList.add('reduce-motion');
      return;
    }

    // Add scroll-triggered animations
    const animatedElements = document.querySelectorAll('[data-animate]');
    
    if (animatedElements.length === 0) return;

    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const animationType = element.getAttribute('data-animate');
          element.classList.add(`animate-${animationType}`, 'animate-visible');
          animationObserver.unobserve(element);
        }
      });
    }, { threshold: 0.1 });

    animatedElements.forEach(element => animationObserver.observe(element));
  }

  private addFormEnhancements(): void {
    // Progressive enhancement for forms will be added when form components are created
    // This is a placeholder for form validation and AJAX submission enhancements
    console.log('Form enhancements will be added with form components');
  }

  private getGlobalStyles(): string {
    return `
      /* Global page styles */
      html {
        scroll-behavior: smooth;
        scroll-padding-top: 4rem; /* Account for sticky header */
      }

      @media (prefers-reduced-motion: reduce) {
        html {
          scroll-behavior: auto;
        }
      }

      body {
        margin: 0;
        padding: 0;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #1a1a1a;
        background-color: #ffffff;
      }

      .page-home {
        /* Page-specific styles */
      }

      .landing-page {
        /* Landing page specific styles */
      }

      /* Ensure main content fills available space */
      #main {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      /* Focus management */
      .focused {
        outline: 2px solid #2563eb;
        outline-offset: 2px;
        border-radius: 0.25rem;
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

      /* Animation classes for progressive enhancement */
      .animate-fade-in {
        opacity: 0;
        transition: opacity 0.6s ease;
      }

      .animate-fade-in.animate-visible {
        opacity: 1;
      }

      .animate-slide-up {
        opacity: 0;
        transform: translateY(2rem);
        transition: opacity 0.6s ease, transform 0.6s ease;
      }

      .animate-slide-up.animate-visible {
        opacity: 1;
        transform: translateY(0);
      }

      /* Disable animations for reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .reduce-motion *,
        .reduce-motion *::before,
        .reduce-motion *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      }

      /* High contrast mode support */
      @media (prefers-contrast: high) {
        body {
          background-color: #000000;
          color: #ffffff;
        }
      }

      /* Print styles */
      @media print {
        .hero {
          background-image: none !important;
          color: #000000;
        }
        
        .header,
        .footer {
          display: none;
        }
        
        body {
          font-size: 12pt;
          line-height: 1.5;
        }
      }
    `;
  }
}

export default HomePage;