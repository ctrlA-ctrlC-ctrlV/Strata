// ProductSectionHomeExtensions.tsx - Home Extensions product section with 2-column layout

export interface HomeExtensionsConfig {
  imageUrl?: string;
  imageAlt?: string;
  sectionLabel?: string;
  headingLevel?: 'h2' | 'h3';
  heading?: string;
  subheading?: string;
  brandParagraph?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryHeading?: string;
  supportingParagraph?: string;
  detailsLinkText?: string;
  detailsLinkHref?: string;
}

export class ProductSectionHomeExtensions {
  private config: HomeExtensionsConfig;
  private mountPoint: string;

  constructor(config: HomeExtensionsConfig = {}) {
    this.config = {
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
      detailsLinkHref: '#home-extensions-details',
      ...config
    };
    this.mountPoint = '';
  }

  public mount(selector: string): void {
    this.mountPoint = selector;
    this.render();
  }

  private render(): void {
    const container = document.querySelector(this.mountPoint);
    if (!container) {
      console.error(`ProductSectionHomeExtensions: Mount point ${this.mountPoint} not found`);
      return;
    }

    const section = this.createElement();
    
    // Replace the existing home-extensions section if it exists
    const existingSection = container.querySelector('#home-extensions');
    if (existingSection) {
      existingSection.replaceWith(section);
    } else {
      container.appendChild(section);
    }

    this.bindEvents();
  }

  private createElement(): HTMLElement {
    const section = document.createElement('section');
    section.id = 'home-extensions';
    section.className = 'product-section home-extensions-section';
    section.setAttribute('data-testid', 'home-extensions-section');
    section.setAttribute('aria-labelledby', 'home-extensions-heading');

    section.innerHTML = `
      <div class="product-section__container">
        <div class="product-section__layout">
          <!-- Content Column (Left for Home Extensions) -->
          <div class="product-section__content-column content-column" data-column="content">
            <div class="product-section__content">
              <!-- Section Label -->
              <div class="product-section__label">
                ${this.config.sectionLabel}
              </div>

              <!-- Main Heading -->
              <${this.config.headingLevel} 
                id="home-extensions-heading" 
                class="product-section__heading"
              >
                ${this.config.heading}
              </${this.config.headingLevel}>

              <!-- Subheading -->
              <h3 class="product-section__subheading">
                ${this.config.subheading}
              </h3>

              <!-- Brand Paragraph -->
              <p class="product-section__brand-paragraph">
                ${this.config.brandParagraph}
              </p>

              <!-- Primary CTA -->
              <div class="product-section__cta-wrapper">
                <a 
                  href="${this.config.primaryCtaHref}" 
                  class="btn-primary product-section__cta"
                  data-testid="home-extensions-cta"
                  role="button"
                  aria-describedby="home-extensions-heading"
                >
                  ${this.config.primaryCtaText}
                </a>
              </div>

              <!-- Secondary Content -->
              <div class="product-section__secondary">
                <h4 class="product-section__secondary-heading">
                  ${this.config.secondaryHeading}
                </h4>
                
                <p class="product-section__supporting-paragraph">
                  ${this.config.supportingParagraph}
                </p>

                <!-- Details Link -->
                <a 
                  href="${this.config.detailsLinkHref}" 
                  class="product-section__details-link"
                  data-testid="home-extensions-details"
                >
                  ${this.config.detailsLinkText}
                </a>
              </div>
            </div>
          </div>

          <!-- Image Column (Right for Home Extensions) -->
          <div class="product-section__image-column image-column" data-column="image">
            <div class="product-section__image-wrapper">
              <img 
                src="${this.config.imageUrl}" 
                alt="${this.config.imageAlt}"
                class="product-section__image"
                loading="lazy"
                width="600"
                height="400"
              />
            </div>
          </div>
        </div>
      </div>
    `;

    return section;
  }

  private bindEvents(): void {
    const section = document.querySelector('#home-extensions');
    if (!section) return;

    // Handle CTA click with smooth scroll
    const ctaButton = section.querySelector('[data-testid="home-extensions-cta"]') as HTMLAnchorElement;
    if (ctaButton) {
      ctaButton.addEventListener('click', (e) => {
        e.preventDefault();
        const targetHref = ctaButton.getAttribute('href');
        if (targetHref?.startsWith('#')) {
          const targetElement = document.querySelector(targetHref);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
            
            // Focus the first form field if it's the quote section
            if (targetHref === '#quote') {
              setTimeout(() => {
                const firstInput = targetElement.querySelector('input, textarea, select') as HTMLElement;
                if (firstInput) {
                  firstInput.focus();
                }
              }, 500); // Wait for scroll to complete
            }
          }
        }
      });
    }

    // Handle details link click
    const detailsLink = section.querySelector('[data-testid="home-extensions-details"]') as HTMLAnchorElement;
    if (detailsLink) {
      detailsLink.addEventListener('click', (e) => {
        const targetHref = detailsLink.getAttribute('href');
        if (targetHref?.startsWith('#')) {
          e.preventDefault();
          const targetElement = document.querySelector(targetHref);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
        // If it's an external link, let it navigate normally
      });
    }

    // Add keyboard navigation support
    this.setupKeyboardNavigation(section);
  }

  private setupKeyboardNavigation(section: Element): void {
    const focusableElements = section.querySelectorAll(
      'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
    );

    focusableElements.forEach((element) => {
      element.addEventListener('keydown', (e) => {
        const event = e as KeyboardEvent;
        
        // Handle Enter and Space for links and buttons
        if (event.key === 'Enter' || event.key === ' ') {
          if (element.tagName === 'A' || element.tagName === 'BUTTON') {
            event.preventDefault();
            (element as HTMLElement).click();
          }
        }
      });
    });
  }

  // Public methods for dynamic updates
  public updateConfig(newConfig: Partial<HomeExtensionsConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (this.mountPoint) {
      this.render();
    }
  }

  public destroy(): void {
    const section = document.querySelector('#home-extensions');
    if (section) {
      section.remove();
    }
  }
}

export default ProductSectionHomeExtensions;