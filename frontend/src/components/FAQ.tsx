// FAQ Component - Static-first with TypeScript enhancement
// Uses native <details><summary> for accessibility baseline

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  isOpen?: boolean;
  ariaLabel?: string;
}

export interface FAQConfig {
  title?: string;
  subtitle?: string;
  items?: FAQItem[];
  allowMultipleOpen?: boolean;
}

export class FAQ {
  private element: HTMLElement | null = null;

  constructor(private config: FAQConfig = {}) {
    this.config = {
      title: 'Frequently Asked Questions',
      subtitle: 'Get answers to common questions about garden rooms and home extensions',
      allowMultipleOpen: true,
      items: [
        {
          id: 'planning-permission',
          question: 'Do I need planning permission for a garden room or home extension?',
          answer: 'Most garden rooms under 25m² and single-storey home extensions under 40m² fall under Permitted Development Rights in Ireland and don\'t require planning permission if they meet specific criteria including distance from boundaries, height restrictions, and site coverage limits. However, extensions over 40m² or garden rooms that don\'t meet size/placement criteria require full planning permission. We provide a free assessment of your specific situation and handle all planning applications when required, ensuring compliance with local authority requirements.',
          ariaLabel: 'Planning permission requirements for garden rooms and home extensions in Ireland'
        },
        {
          id: 'building-regulations',
          question: 'What building regulations and compliance certificates are required?',
          answer: 'All garden rooms and home extensions in Ireland must comply with Building Regulations 2014 covering structural safety, thermal performance, fire safety, and accessibility standards. Extensions require a Commencement Notice to the local authority before work begins, and a Certificate of Compliance on Completion (CoCC) after finishing. We manage all building control applications, structural engineer reports, and certification processes to ensure full regulatory compliance throughout your project.',
          ariaLabel: 'Irish building regulations and certification requirements for extensions'
        },
        {
          id: 'timeline-costs-planning',
          question: 'What are the typical costs, timelines, and planning considerations?',
          answer: 'Garden rooms typically cost €15,000-€35,000 and take 2-4 weeks to complete, while home extensions range from €25,000-€60,000+ and require 8-16 weeks depending on size and complexity. Planning permission (if required) adds 8-12 weeks to the timeline. Key considerations include site access, ground conditions, proximity to boundaries, drainage requirements, and coordination with ESB/utilities. We provide detailed fixed-price quotes and project timelines following our initial site survey and planning assessment.',
          ariaLabel: 'Costs, timelines and planning considerations for Irish garden room and extension projects'
        }
      ],
      ...config
    };
  }

  public render(): string {
    return `
      <section class="faq section" data-testid="faq" role="region" aria-labelledby="faq-title">
        <div class="container">
          <div class="faq__header">
            <h2 id="faq-title" class="faq__title">${this.config.title}</h2>
            <p class="faq__subtitle">${this.config.subtitle}</p>
          </div>

          <div class="faq__list">
            ${this.config.items?.map((item) => `
              <details class="faq__item" data-faq-id="${item.id}" ${item.isOpen ? 'open' : ''}>
                <summary class="faq__question" 
                         id="faq-question-${item.id}"
                         aria-controls="faq-answer-${item.id}"
                         ${item.ariaLabel ? `aria-label="${item.ariaLabel}"` : ''}>
                  <span class="faq__question-text">${item.question}</span>
                  <span class="faq__question-icon" aria-hidden="true">
                    <svg class="faq__icon-closed" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM7 3.5a.5.5 0 0 1 1 0v4h4a.5.5 0 0 1 0 1H8v4a.5.5 0 0 1-1 0v-4H3a.5.5 0 0 1 0-1h4v-4z"/>
                    </svg>
                    <svg class="faq__icon-open" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM3 7.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5z"/>
                    </svg>
                  </span>
                </summary>
                <div class="faq__answer" 
                     id="faq-answer-${item.id}"
                     aria-labelledby="faq-question-${item.id}">
                  <div class="faq__answer-content">
                    ${item.answer}
                  </div>
                </div>
              </details>
            `).join('') || ''}
          </div>
        </div>
      </section>
    `;
  }

  public mount(targetSelector: string = '#main'): void {
    const target = document.querySelector(targetSelector);
    if (!target) {
      console.warn(`FAQ: Target element '${targetSelector}' not found`);
      return;
    }

    target.insertAdjacentHTML('beforeend', this.render());
    this.element = document.querySelector('.faq');
    
    if (this.element) {
      this.initialize();
    }
  }

  private initialize(): void {
    if (!this.element) return;

    this.addStyles();
    this.setupAccessibility();
    this.setupInteractions();
    this.setupAnimations();
  }

  private setupAccessibility(): void {
    // Enhanced accessibility for screen readers
    const faqItems = this.element?.querySelectorAll('.faq__item');
    faqItems?.forEach((item) => {
      const summary = item.querySelector('summary');
      const details = item as HTMLDetailsElement;
      
      if (summary) {
        // Add keyboard support
        summary.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            details.open = !details.open;
            this.announceStateChange(details, summary as HTMLElement);
          }
        });

        // Handle mouse clicks
        summary.addEventListener('click', () => {
          // Let the browser handle the toggle, then announce
          setTimeout(() => {
            this.announceStateChange(details, summary as HTMLElement);
          }, 10);
        });
      }
    });
  }

  private announceStateChange(details: HTMLDetailsElement, summary: HTMLElement): void {
    // Create announcement for screen readers
    const announcement = details.open ? 'expanded' : 'collapsed';
    const questionText = summary.querySelector('.faq__question-text')?.textContent || 'FAQ item';
    
    this.announceToScreenReader(`${questionText} ${announcement}`);
  }

  private announceToScreenReader(message: string): void {
    // Use live region for announcements
    let liveRegion = document.querySelector('#faq-live-region') as HTMLElement;
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'faq-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }
    
    liveRegion.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  }

  private setupInteractions(): void {
    // Set up contact button behavior
    const contactButton = this.element?.querySelector('.faq__contact-button');
    if (contactButton) {
      contactButton.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = (contactButton as HTMLAnchorElement).getAttribute('href');
        if (targetId) {
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
            
            // Focus the first form field if it's a form
            const firstInput = targetElement.querySelector('input, textarea, select') as HTMLElement;
            if (firstInput) {
              setTimeout(() => {
                firstInput.focus();
              }, 500);
            }
          }
        }
      });
    }

    // Handle accordion behavior configuration
    // By default, allowMultipleOpen is true, enabling multiple FAQ items to be expanded simultaneously
    // This provides better UX as users can compare answers across different questions
    if (!this.config.allowMultipleOpen) {
      // Only implement accordion behavior (close others) when explicitly disabled
      const faqItems = this.element?.querySelectorAll('.faq__item');
      faqItems?.forEach((item) => {
        const summary = item.querySelector('summary');
        summary?.addEventListener('click', () => {
          // Close other items if multiple open is not allowed
          setTimeout(() => {
            if ((item as HTMLDetailsElement).open) {
              faqItems.forEach((otherItem) => {
                if (otherItem !== item) {
                  (otherItem as HTMLDetailsElement).open = false;
                }
              });
            }
          }, 10);
        });
      });
    }
    // When allowMultipleOpen is true (default), native <details> behavior allows multiple items open
  }

  private setupAnimations(): void {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
      this.element?.classList.add('faq--reduced-motion');
      return;
    }

    // Set up intersection observer for staggered animations
    const faqItems = this.element?.querySelectorAll('.faq__item');
    if (!faqItems || faqItems.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const item = entry.target as HTMLElement;
            const index = Array.from(faqItems).indexOf(item);
            
            setTimeout(() => {
              item.classList.add('faq__item--visible');
            }, index * 100); // Stagger animations

            observer.unobserve(entry.target);
          }
        });
      },
      { 
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    faqItems.forEach(item => {
      observer.observe(item);
    });
  }

  private addStyles(): void {
    // Check if styles are already added
    if (document.querySelector('#faq-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'faq-styles';
    styles.textContent = this.getStyles();
    document.head.appendChild(styles);
  }

  private getStyles(): string {
    return `
      .faq {
        background: #ffffff;
        border-top: 1px solid #e2e8f0;
        border-bottom: 1px solid #e2e8f0;
      }

      .faq__header {
        text-align: center;
        margin-bottom: 3rem;
        max-width: 800px;
        margin-left: auto;
        margin-right: auto;
      }

      .faq__title {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
        color: #1e293b;
        line-height: 1.2;
      }

      @media (max-width: 768px) {
        .faq__title {
          font-size: 2rem;
        }
      }

      .faq__subtitle {
        font-size: 1.25rem;
        color: #64748b;
        line-height: 1.6;
        margin: 0;
      }

      @media (max-width: 768px) {
        .faq__subtitle {
          font-size: 1.125rem;
        }
      }

      .faq__list {
        max-width: 800px;
        margin: 0 auto 3rem auto;
      }

      .faq__item {
        border: 1px solid #e2e8f0;
        border-radius: 0.75rem;
        margin-bottom: 1rem;
        background: white;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        opacity: 0;
        transform: translateY(1rem);
      }

      .faq__item--visible {
        opacity: 1;
        transform: translateY(0);
      }

      .faq__item:hover {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        border-color: #cbd5e1;
      }

      .faq__item:last-child {
        margin-bottom: 0;
      }

      .faq__item[open] {
        border-color: #3b82f6;
      }

      .faq__question {
        padding: 1.5rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        font-weight: 600;
        color: #1e293b;
        font-size: 1.125rem;
        line-height: 1.5;
        list-style: none;
        transition: all 0.2s ease;
        position: relative;
        min-height: 44px; /* WCAG touch target size */
      }

      .faq__question::-webkit-details-marker {
        display: none;
      }

      .faq__question::marker {
        display: none;
      }

      .faq__question:hover {
        background-color: #f8fafc;
        color: #3b82f6;
      }

      .faq__question:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
        background-color: #eff6ff;
      }

      .faq__question-text {
        flex: 1;
        text-align: left;
      }

      .faq__question-icon {
        flex-shrink: 0;
        color: #64748b;
        transition: transform 0.2s ease, color 0.2s ease;
      }

      .faq__item[open] .faq__question-icon {
        transform: rotate(180deg);
        color: #3b82f6;
      }

      .faq__icon-open {
        display: none;
      }

      .faq__item[open] .faq__icon-closed {
        display: none;
      }

      .faq__item[open] .faq__icon-open {
        display: block;
      }

      .faq__answer {
        border-top: 1px solid #e2e8f0;
        background-color: #f8fafc;
      }

      .faq__answer-content {
        padding: 1.5rem;
        color: #475569;
        line-height: 1.7;
        font-size: 1rem;
      }

      .faq__contact {
        text-align: center;
        padding: 3rem 0;
        background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
        margin-left: -2rem;
        margin-right: -2rem;
        border-radius: 1rem;
      }

      @media (min-width: 768px) {
        .faq__contact {
          margin-left: -4rem;
          margin-right: -4rem;
        }
      }

      .faq__contact-text {
        font-size: 1.25rem;
        font-weight: 500;
        color: #1e293b;
        margin-bottom: 1.5rem;
      }

      .faq__contact-button {
        display: inline-block;
        background: white;
        color: #3b82f6;
        border: 2px solid #3b82f6;
        padding: 0.875rem 2rem;
        text-decoration: none;
        border-radius: 0.5rem;
        font-weight: 600;
        font-size: 1.125rem;
        transition: all 0.3s ease;
        min-height: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .faq__contact-button:hover,
      .faq__contact-button:focus {
        background: #3b82f6;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.39);
        text-decoration: none;
      }

      .faq__contact-button:focus {
        outline: 2px solid #1d4ed8;
        outline-offset: 2px;
      }

      .faq__contact-description {
        color: #64748b;
        font-size: 0.875rem;
        margin-top: 1rem;
        margin-bottom: 0;
        line-height: 1.4;
      }

      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        .faq--reduced-motion .faq__item,
        .faq--reduced-motion .faq__question-icon,
        .faq--reduced-motion .faq__contact-button {
          transition: none;
        }

        .faq--reduced-motion .faq__item {
          opacity: 1;
          transform: none;
        }
      }

      /* High contrast mode support */
      @media (prefers-contrast: high) {
        .faq__item {
          border: 2px solid #000;
        }

        .faq__question {
          background: #fff;
          color: #000;
        }

        .faq__question:hover,
        .faq__question:focus {
          background: #000;
          color: #fff;
        }

        .faq__answer {
          background: #fff;
          border-top: 2px solid #000;
        }

        .faq__answer-content {
          color: #000;
        }

        .faq__contact-button {
          background: #fff;
          color: #000;
          border: 2px solid #000;
        }

        .faq__contact-button:hover,
        .faq__contact-button:focus {
          background: #000;
          color: #fff;
        }
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

      /* Print styles */
      @media print {
        .faq {
          background: white;
          border: none;
        }

        .faq__item {
          break-inside: avoid;
          box-shadow: none;
          border: 1px solid #ccc;
        }

        .faq__item[open] .faq__answer {
          display: block;
        }

        .faq__question-icon {
          display: none;
        }

        .faq__contact {
          background: white;
          border: 1px solid #ccc;
        }

        .faq__contact-button {
          background: white;
          color: black;
          border: 1px solid black;
        }
      }
    `;
  }
}

export default FAQ;