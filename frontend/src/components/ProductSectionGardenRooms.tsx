// ProductSectionGardenRooms.tsx - Garden Rooms product section with 2-column layout

export interface GardenRoomsConfig {
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

export class ProductSectionGardenRooms {
  private config: GardenRoomsConfig;
  private mountPoint: string;

  constructor(config: GardenRoomsConfig = {}) {
    this.config = {
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
      detailsLinkHref: '#garden-rooms-details',
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
      console.error(`ProductSectionGardenRooms: Mount point ${this.mountPoint} not found`);
      return;
    }

    const section = this.createElement();
    
    // Replace the existing garden-rooms section if it exists
    const existingSection = container.querySelector('#garden-rooms');
    if (existingSection) {
      existingSection.replaceWith(section);
    } else {
      container.appendChild(section);
    }

    this.bindEvents();
  }

  private createElement(): HTMLElement {
    const section = document.createElement('section');
    section.id = 'garden-rooms';
    section.className = 'product-section garden-rooms-section';
    section.setAttribute('data-testid', 'garden-rooms-section');
    section.setAttribute('aria-labelledby', 'garden-rooms-heading');

    section.innerHTML = `
      <div class="product-section__container">
        <div class="product-section__layout">
          <!-- Image Column (Left) -->
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

          <!-- Content Column (Right) -->
          <div class="product-section__content-column content-column" data-column="content">
            <div class="product-section__content">
              <!-- Section Label -->
              <div class="product-section__label">
                ${this.config.sectionLabel}
              </div>

              <!-- Main Heading -->
              <${this.config.headingLevel} 
                id="garden-rooms-heading" 
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
                  data-testid="garden-rooms-cta"
                  role="button"
                  aria-describedby="garden-rooms-heading"
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
                  data-testid="garden-rooms-details"
                >
                  ${this.config.detailsLinkText}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    return section;
  }

  private bindEvents(): void {
    const section = document.querySelector('#garden-rooms');
    if (!section) return;

    // Handle CTA click with smooth scroll
    const ctaButton = section.querySelector('[data-testid="garden-rooms-cta"]') as HTMLAnchorElement;
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
    const detailsLink = section.querySelector('[data-testid="garden-rooms-details"]') as HTMLAnchorElement;
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
  public updateConfig(newConfig: Partial<GardenRoomsConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (this.mountPoint) {
      this.render();
    }
  }

  public destroy(): void {
    const section = document.querySelector('#garden-rooms');
    if (section) {
      section.remove();
    }
  }
}

export default ProductSectionGardenRooms;