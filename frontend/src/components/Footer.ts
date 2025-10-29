interface FooterProps {
  /** Optional class name for styling customization */
  className?: string;
}

interface ContactInfo {
  name: string;
  address: string[];
  phone: string;
  email: string;
}

interface QuickLink {
  label: string;
  href: string;
  external?: boolean;
}

interface SocialLink {
  platform: string;
  url: string;
  icon: string; // SVG path or icon identifier
  ariaLabel: string;
}

interface Accreditation {
  name: string;
  logo?: string; // URL or identifier for logo
  url?: string;
}

// Company contact information (NAP data)
const contactInfo: ContactInfo = {
  name: 'Strata Garden Rooms',
  address: [
    '123 Builder\'s Row',
    'Dublin, D02 AB12',
    'Ireland'
  ],
  phone: '+353 1 234 5678',
  email: 'hello@stratagardenrooms.ie'
};

// Quick navigation links
const quickLinks: QuickLink[] = [
  { label: 'Garden Rooms', href: '/garden-rooms' },
  { label: 'Home Extensions', href: '/home-extensions' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'About Us', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms & Conditions', href: '/terms' }
];

// Social media links
const socialLinks: SocialLink[] = [
  {
    platform: 'Facebook',
    url: 'https://facebook.com/stratagardenrooms',
    icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
    ariaLabel: 'Follow us on Facebook'
  },
  {
    platform: 'Instagram',
    url: 'https://instagram.com/stratagardenrooms',
    icon: 'M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM12 16.624c-2.563 0-4.625-2.062-4.625-4.624C7.375 9.437 9.437 7.376 12 7.376s4.625 2.061 4.625 4.624c0 2.562-2.062 4.624-4.625 4.624zM16.874 6.65a1.077 1.077 0 11-2.154 0 1.077 1.077 0 012.154 0z',
    ariaLabel: 'Follow us on Instagram'
  },
  {
    platform: 'LinkedIn',
    url: 'https://linkedin.com/company/stratagardenrooms',
    icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    ariaLabel: 'Connect with us on LinkedIn'
  }
];

// Industry accreditations and certifications
const accreditations: Accreditation[] = [
  {
    name: 'Construction Industry Federation',
    url: 'https://cif.ie'
  },
  {
    name: 'Building Control Authority Registered',
    url: 'https://www.gov.ie/en/service/building-control/'
  },
  {
    name: 'SEAI Registered',
    url: 'https://www.seai.ie'
  }
];

/**
 * Footer component with company NAP, quick links, social links, and accreditations
 * Implements FR-025 from spec
 * 
 * Features:
 * - Company contact information (Name, Address, Phone)
 * - Email contact
 * - Quick navigation links
 * - Social media links with proper ARIA labels
 * - Industry accreditations
 * - Copyright information
 * - Responsive layout
 * - High contrast compliance
 */
export class Footer {
  private element: HTMLElement;

  constructor(props: FooterProps = {}) {
    this.element = this.createElement(props.className || '');
    this.initializeEventListeners();
  }

  private createElement(className: string): HTMLElement {
    const footer = document.createElement('footer');
    footer.className = `bg-neutral-900 text-white ${className}`;
    footer.setAttribute('role', 'contentinfo');

    footer.innerHTML = `
      <div class="container-custom">
        <div class="py-12 md:py-16">
          <!-- Main Footer Content -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            
            <!-- Company Info & NAP -->
            <div class="lg:col-span-2">
              <div class="flex items-center space-x-2 mb-6">
                <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span class="text-white font-bold text-sm" aria-hidden="true">S</span>
                </div>
                <span class="text-xl font-bold">${contactInfo.name}</span>
              </div>
              
              <!-- NAP Information -->
              <div class="space-y-4 text-neutral-300">
                <!-- Address -->
                <div>
                  <h3 class="text-white font-semibold mb-2">Address</h3>
                  <address class="not-italic">
                    ${contactInfo.address.map(line => `<div>${line}</div>`).join('')}
                  </address>
                </div>
                
                <!-- Contact -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 class="text-white font-semibold mb-2">Phone</h3>
                    <a 
                      href="tel:${contactInfo.phone.replace(/\s+/g, '')}" 
                      class="text-primary-400 hover:text-primary-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-neutral-900 rounded-sm"
                    >
                      ${contactInfo.phone}
                    </a>
                  </div>
                  <div>
                    <h3 class="text-white font-semibold mb-2">Email</h3>
                    <a 
                      href="mailto:${contactInfo.email}" 
                      class="text-primary-400 hover:text-primary-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-neutral-900 rounded-sm"
                    >
                      ${contactInfo.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Quick Links -->
            <div>
              <h3 class="text-white font-semibold mb-6">Quick Links</h3>
              <nav aria-label="Footer navigation">
                <ul class="space-y-3">
                  ${quickLinks.map(link => `
                    <li>
                      <a 
                        href="${link.href}" 
                        class="text-neutral-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-neutral-900 rounded-sm"
                        ${link.external ? 'target="_blank" rel="noopener noreferrer"' : ''}
                      >
                        ${link.label}
                      </a>
                    </li>
                  `).join('')}
                </ul>
              </nav>
            </div>
            
            <!-- Social Links & Accreditations -->
            <div>
              <h3 class="text-white font-semibold mb-6">Connect With Us</h3>
              
              <!-- Social Links -->
              <div class="flex space-x-4 mb-8">
                ${socialLinks.map(social => `
                  <a 
                    href="${social.url}" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-primary-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
                    aria-label="${social.ariaLabel}"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="${social.icon}" />
                    </svg>
                  </a>
                `).join('')}
              </div>
              
              <!-- Accreditations -->
              <div>
                <h4 class="text-white font-semibold mb-4">Accreditations</h4>
                <ul class="space-y-2 text-sm text-neutral-300">
                  ${accreditations.map(acc => `
                    <li>
                      ${acc.url ? `
                        <a 
                          href="${acc.url}" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          class="hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-neutral-900 rounded-sm"
                        >
                          ${acc.name}
                        </a>
                      ` : `
                        <span>${acc.name}</span>
                      `}
                    </li>
                  `).join('')}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Copyright Bar -->
        <div class="border-t border-neutral-800 py-6">
          <div class="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p class="text-neutral-400 text-sm">
              © ${new Date().getFullYear()} ${contactInfo.name}. All rights reserved.
            </p>
            <div class="flex space-x-6 text-sm">
              <a 
                href="/privacy" 
                class="text-neutral-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-neutral-900 rounded-sm"
              >
                Privacy Policy
              </a>
              <a 
                href="/terms" 
                class="text-neutral-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-neutral-900 rounded-sm"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    return footer;
  }

  private initializeEventListeners(): void {
    // Add any interactive functionality if needed
    // For now, the footer is primarily informational with standard links
    
    // Handle smooth scrolling for any anchor links (if any are added later)
    const anchorLinks = this.element.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        const href = (event.currentTarget as HTMLAnchorElement).getAttribute('href');
        if (href && href.startsWith('#')) {
          event.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
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
export function createFooter(props: FooterProps = {}): Footer {
  return new Footer(props);
}

export default Footer;