// Footer Component - Static-first with TypeScript enhancement
// Provides NAP (Name, Address, Phone) info and social links

export interface FooterConfig {
  companyName?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    county?: string;
    postcode: string;
    country?: string;
  };
  phone?: string;
  email?: string;
  socialLinks?: Array<{
    platform: string;
    url: string;
    icon?: string;
    ariaLabel: string;
  }>;
  legalLinks?: Array<{
    href: string;
    text: string;
  }>;
  copyrightYear?: number;
}

export class Footer {
  private element: HTMLElement | null = null;

  constructor(private config: FooterConfig = {}) {
    this.config = {
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
      email: 'info@strata.ie',
      socialLinks: [
        {
          platform: 'Facebook',
          url: 'https://facebook.com/strata',
          icon: '📘',
          ariaLabel: 'Follow us on Facebook'
        },
        {
          platform: 'Instagram',
          url: 'https://instagram.com/strata',
          icon: '📷',
          ariaLabel: 'Follow us on Instagram'
        },
        {
          platform: 'LinkedIn',
          url: 'https://linkedin.com/company/strata',
          icon: '💼',
          ariaLabel: 'Connect with us on LinkedIn'
        }
      ],
      legalLinks: [
        { href: '/privacy-policy.html', text: 'Privacy Policy' },
        { href: '/terms-of-service.html', text: 'Terms of Service' },
        { href: '/cookie-policy.html', text: 'Cookie Policy' }
      ],
      copyrightYear: new Date().getFullYear(),
      ...config
    };
  }

  public render(): string {
    return `
      <footer class="footer" data-testid="footer">
        <div class="container">
          <div class="footer__content">
            <!-- Company Info Section -->
            <div class="footer__section footer__company">
              <h3 class="footer__heading">Contact</h3>
              <div class="footer__nap">
                <div class="footer__company-name">
                  <strong>${this.config.companyName}</strong>
                </div>
                
                <address class="footer__address">
                  <div>${this.config.address?.line1}</div>
                  ${this.config.address?.line2 ? `<div>${this.config.address.line2}</div>` : ''}
                  <div>${this.config.address?.city}${this.config.address?.county ? `, ${this.config.address.county}` : ''}</div>
                  <div>${this.config.address?.postcode}</div>
                  ${this.config.address?.country ? `<div>${this.config.address.country}</div>` : ''}
                </address>

                <div class="footer__contact-details">
                  <div class="footer__phone">
                    <a href="tel:${this.config.phone?.replace(/\s+/g, '')}" class="footer__contact-link">
                      <span class="footer__contact-icon">📞</span>
                      <span class="footer__contact-text">${this.config.phone}</span>
                    </a>
                  </div>
                  
                  <div class="footer__email">
                    <a href="mailto:${this.config.email}" class="footer__contact-link">
                      <span class="footer__contact-icon">✉️</span>
                      <span class="footer__contact-text">${this.config.email}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Services Section -->
            <div class="footer__section footer__services">
              <h3 class="footer__heading">Services</h3>
              <ul class="footer__links">
                <li><a href="#garden-rooms" class="footer__link">Garden Rooms</a></li>
                <li><a href="#home-extensions" class="footer__link">Home Extensions</a></li>
                <li><a href="#gallery" class="footer__link">Projects Gallery</a></li>
                <li><a href="#quote" class="footer__link">Get a Quote</a></li>
              </ul>
            </div>

            <!-- Social Links Section -->
            <div class="footer__section footer__social">
              <h3 class="footer__heading">Social</h3>
              <div class="footer__social-links">
                ${this.config.socialLinks?.map(social => `
                  <a 
                    href="${social.url}" 
                    class="footer__social-link" 
                    aria-label="${social.ariaLabel}"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <span class="footer__social-icon" aria-hidden="true">${social.icon}</span>
                    <span class="footer__social-text">${social.platform}</span>
                  </a>
                `).join('') || ''}
              </div>
            </div>

            <!-- Newsletter Section -->
            <div class="footer__section footer__newsletter">
              <h3 class="footer__heading">Stay Updated</h3>
              <p class="footer__newsletter-text">Get the latest news and offers</p>
              <div class="footer__newsletter-form">
                <div id="newsletter" class="newsletter-placeholder">
                  <p class="footer__newsletter-cta">
                    <a href="#newsletter" class="footer__link">Subscribe to Newsletter</a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Legal Footer -->
          <div class="footer__legal">
            <div class="footer__legal-content">
              <nav class="footer__legal-nav" aria-label="Legal">
                <ul class="footer__legal-list">
                  ${this.config.legalLinks?.map(link => `
                    <li class="footer__legal-item">
                      <a href="${link.href}" class="footer__legal-link">${link.text}</a>
                    </li>
                  `).join('') || ''}
                </ul>
              </nav>
              
              <div class="footer__copyright">
                <p>&copy; ${this.config.copyrightYear} ${this.config.companyName}. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  public mount(targetSelector: string = 'body'): void {
    const target = document.querySelector(targetSelector);
    if (!target) {
      console.warn(`Footer: Target element '${targetSelector}' not found`);
      return;
    }

    target.insertAdjacentHTML('beforeend', this.render());
    this.element = document.querySelector('.footer');
    
    if (this.element) {
      this.initialize();
    }
  }

  private initialize(): void {
    if (!this.element) return;

    this.addStyles();
    this.bindEvents();
  }

  private bindEvents(): void {
    // Bind smooth scroll for internal links
    const footerLinks = this.element?.querySelectorAll('a[href^="#"]');
    if (!footerLinks) return;

    footerLinks.forEach(link => {
      link.addEventListener('click', (e: Event) => {
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
    });
  }

  private addStyles(): void {
    // Check if styles are already added
    if (document.querySelector('#footer-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'footer-styles';
    styles.textContent = this.getStyles();
    document.head.appendChild(styles);
  }

  private getStyles(): string {
    return `
      .footer {
        background-color: #1f2937;
        color: #e5e7eb;
        margin-top: auto;
      }

      .footer__content {
        display: grid;
        grid-template-columns: 1fr;
        gap: 2rem;
        padding: 3rem 0;
      }

      @media (min-width: 640px) {
        .footer__content {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (min-width: 1024px) {
        .footer__content {
          grid-template-columns: repeat(4, 1fr);
        }
      }

      .footer__section {
        min-width: 0; /* Prevent grid overflow */
      }

      .footer__heading {
        font-size: 1.125rem;
        font-weight: 600;
        color: #ffffff;
        margin-bottom: 1rem;
        margin-top: 0;
      }

      .footer__company-name {
        font-size: 1.125rem;
        margin-bottom: 1rem;
        color: #ffffff;
      }

      .footer__address {
        font-style: normal;
        line-height: 1.6;
        margin-bottom: 1rem;
        color: #d1d5db;
      }

      .footer__contact-details {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .footer__contact-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #e5e7eb;
        text-decoration: none;
        transition: color 0.2s ease;
      }

      .footer__contact-link:hover,
      .footer__contact-link:focus {
        color: #60a5fa;
        outline: 2px solid #60a5fa;
        outline-offset: 2px;
      }

      .footer__contact-icon {
        font-size: 1rem;
        flex-shrink: 0;
      }

      .footer__links {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .footer__link {
        color: #d1d5db;
        text-decoration: none;
        transition: color 0.2s ease;
        display: inline-block;
        padding: 0.25rem 0;
      }

      .footer__link:hover,
      .footer__link:focus {
        color: #60a5fa;
        outline: 2px solid #60a5fa;
        outline-offset: 2px;
      }

      .footer__social-links {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      @media (min-width: 640px) {
        .footer__social-links {
          flex-direction: row;
          flex-wrap: wrap;
        }
      }

      @media (min-width: 1024px) {
        .footer__social-links {
          flex-direction: column;
        }
      }

      .footer__social-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #d1d5db;
        text-decoration: none;
        transition: color 0.2s ease;
        padding: 0.25rem 0;
      }

      .footer__social-link:hover,
      .footer__social-link:focus {
        color: #60a5fa;
        outline: 2px solid #60a5fa;
        outline-offset: 2px;
      }

      .footer__social-icon {
        font-size: 1.25rem;
        flex-shrink: 0;
      }

      .footer__newsletter-text {
        color: #d1d5db;
        margin-bottom: 1rem;
        line-height: 1.5;
      }

      .footer__newsletter-cta {
        margin: 0;
      }

      .footer__legal {
        border-top: 1px solid #374151;
        padding: 1.5rem 0;
      }

      .footer__legal-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;
      }

      @media (min-width: 768px) {
        .footer__legal-content {
          flex-direction: row;
          justify-content: space-between;
        }
      }

      .footer__legal-list {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        list-style: none;
        margin: 0;
        padding: 0;
        justify-content: center;
      }

      @media (min-width: 768px) {
        .footer__legal-list {
          justify-content: flex-start;
        }
      }

      .footer__legal-link {
        color: #9ca3af;
        text-decoration: none;
        font-size: 0.875rem;
        transition: color 0.2s ease;
      }

      .footer__legal-link:hover,
      .footer__legal-link:focus {
        color: #d1d5db;
        outline: 2px solid #60a5fa;
        outline-offset: 2px;
      }

      .footer__copyright {
        color: #9ca3af;
        font-size: 0.875rem;
        text-align: center;
      }

      @media (min-width: 768px) {
        .footer__copyright {
          text-align: right;
        }
      }

      .footer__copyright p {
        margin: 0;
      }

      @media (prefers-reduced-motion: reduce) {
        .footer__contact-link,
        .footer__link,
        .footer__social-link,
        .footer__legal-link {
          transition: none;
        }
      }
    `;
  }
}

export default Footer;