// Newsletter Component - Phase 9
// User Story 6: Subscribe for Offers (Newsletter)

export interface NewsletterConfig {
  title?: string;
  subtitle?: string;
  placeholder?: string;
  submitText?: string;
  successMessage?: string;
  errorMessage?: string;
  policyText?: string;
  policyLink?: string;
  enableJavaScriptEnhancements?: boolean;
  apiEndpoint?: string;
  contactEmail?: string;
}

export interface SubscriptionResponse {
  success: boolean;
  message: string;
  email?: string;
}

export class Newsletter {
  private element: HTMLElement | null = null;
  private form: HTMLFormElement | null = null;
  private emailInput: HTMLInputElement | null = null;
  private submitButton: HTMLButtonElement | null = null;
  private isSubmitting: boolean = false;

  constructor(private config: NewsletterConfig = {}) {
    this.config = {
      title: 'Stay Updated',
      subtitle: 'Get the latest offers and updates on garden rooms and home extensions',
      placeholder: 'Enter your email address',
      submitText: 'Subscribe',
      successMessage: 'Thank you! You\'ve been successfully subscribed to our newsletter.',
      errorMessage: 'Please enter a valid email address.',
      policyText: 'By subscribing, you agree to our Privacy Policy and Terms of Service.',
      policyLink: '/privacy-policy',
      enableJavaScriptEnhancements: true,
      apiEndpoint: '/api/newsletter-subscriptions',
      contactEmail: 'hello@stratagardnerooms.ie',
      ...config
    };
  }

  public render(): string {
    const titleId = 'newsletter-title';
    const subtitleId = 'newsletter-subtitle';
    const emailId = 'newsletter-email';
    const errorId = 'newsletter-error';
    const successId = 'newsletter-success';
    const formId = 'newsletter-form';

    return `
      <section 
        class="newsletter section" 
        data-testid="newsletter" 
        role="region" 
        aria-labelledby="${titleId}"
      >
        <style>
          .newsletter {
            --newsletter-input-height: 48px;
            --newsletter-button-height: 48px;
            --newsletter-transition-duration: 0.3s;
          }
          
          @media (prefers-reduced-motion: reduce) {
            .newsletter {
              --newsletter-transition-duration: 0s;
            }
            .newsletter--reduced-motion {
              animation: none !important;
              transition: none !important;
            }
            .newsletter * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
          
          .newsletter__input {
            min-height: var(--newsletter-input-height) !important;
            height: var(--newsletter-input-height) !important;
            padding: 12px 16px !important;
            transition: all var(--newsletter-transition-duration) ease;
            box-sizing: border-box !important;
          }
          
          .newsletter__submit {
            min-height: var(--newsletter-button-height) !important;
            height: var(--newsletter-button-height) !important;
            min-width: 120px !important;
            padding: 12px 24px !important;
            transition: all var(--newsletter-transition-duration) ease;
            box-sizing: border-box !important;
          }
          
          @media (max-width: 768px) {
            .newsletter {
              --newsletter-input-height: 44px;
              --newsletter-button-height: 44px;
            }
            .newsletter__input,
            .newsletter__submit {
              font-size: 16px !important;
            }
          }
          
          .newsletter__form {
            display: flex !important;
            gap: 8px !important;
            align-items: flex-start !important;
          }
          
          @media (max-width: 600px) {
            .newsletter__form {
              flex-direction: column !important;
            }
            .newsletter__input,
            .newsletter__submit {
              width: 100% !important;
            }
          }
        </style>
        <div class="newsletter__container">
          <div class="newsletter__header">
            <h2 class="newsletter__title" id="${titleId}">
              ${this.config.title}
            </h2>
            ${this.config.subtitle ? `
              <p class="newsletter__subtitle" id="${subtitleId}">
                ${this.config.subtitle}
              </p>
            ` : ''}
          </div>

          <form 
            class="newsletter__form" 
            id="${formId}"
            action="mailto:${this.config.contactEmail}?subject=Newsletter Subscription&body=Please subscribe me to your newsletter."
            method="get"
            novalidate
          >
            <div class="newsletter__input-group">
              <label class="newsletter__label" for="${emailId}">
                Email Address
                <span class="newsletter__required" aria-label="required">*</span>
              </label>
              <div class="newsletter__input-wrapper">
                <input
                  type="email"
                  id="${emailId}"
                  name="email"
                  class="newsletter__input"
                  placeholder="${this.config.placeholder}"
                  required
                  aria-describedby="${errorId} newsletter-policy"
                  autocomplete="email"
                  autocapitalize="none"
                  spellcheck="false"
                />
                <button
                  type="submit"
                  class="newsletter__submit"
                  aria-describedby="newsletter-policy"
                >
                  <span class="newsletter__submit-text">${this.config.submitText}</span>
                  <span class="newsletter__submit-spinner" aria-hidden="true"></span>
                </button>
              </div>
            </div>

            <div class="newsletter__policy" id="newsletter-policy">
              <p class="newsletter__policy-text">
                ${this.config.policyText}
                <a href="${this.config.policyLink}" class="newsletter__policy-link" target="_blank" rel="noopener">
                  Learn more
                </a>
              </p>
            </div>

            <div class="newsletter__messages" aria-live="polite" aria-atomic="true">
              <div class="newsletter__error" id="${errorId}" role="alert" style="display: none;">
                <span class="newsletter__error-icon" aria-hidden="true">⚠</span>
                <span class="newsletter__error-text"></span>
              </div>
              <div class="newsletter__success" id="${successId}" role="status" style="display: none;">
                <span class="newsletter__success-icon" aria-hidden="true">✓</span>
                <span class="newsletter__success-text"></span>
              </div>
            </div>

            <noscript>
              <div class="newsletter__noscript">
                <p>JavaScript is not enabled. To subscribe to our newsletter, please email us at 
                  <a href="mailto:${this.config.contactEmail}?subject=Newsletter Subscription">
                    ${this.config.contactEmail}
                  </a>
                  with "Newsletter Subscription" in the subject line.
                </p>
              </div>
            </noscript>
          </form>
        </div>
      </section>
    `;
  }

  public mount(targetSelector: string = '#main'): void {
    const target = document.querySelector(targetSelector);
    if (!target) {
      console.warn(`Newsletter: Target element '${targetSelector}' not found`);
      return;
    }

    target.insertAdjacentHTML('beforeend', this.render());
    this.element = document.querySelector('.newsletter');
    
    if (this.element) {
      this.initialize();
    }
  }

  private initialize(): void {
    if (!this.element) return;

    // Apply reduced motion preferences
    this.handleReducedMotion();

    // Cache DOM elements
    this.form = this.element.querySelector('.newsletter__form');
    this.emailInput = this.element.querySelector('.newsletter__input');
    this.submitButton = this.element.querySelector('.newsletter__submit');

    if (!this.form || !this.emailInput || !this.submitButton) {
      console.warn('Newsletter: Required form elements not found');
      return;
    }

    this.setupEventListeners();
    this.injectStyles();
    
    // Apply reduced motion preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.element.classList.add('newsletter--reduced-motion');
    }
  }

  private setupEventListeners(): void {
    if (!this.form || !this.emailInput || !this.submitButton) return;

    // Form submission
    this.form.addEventListener('submit', this.handleSubmit.bind(this));

    // Real-time validation
    this.emailInput.addEventListener('input', this.handleInput.bind(this));
    this.emailInput.addEventListener('blur', this.handleBlur.bind(this));

    // Enhanced keyboard support
    this.emailInput.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private handleSubmit(event: Event): void {
    event.preventDefault();
    
    if (!this.emailInput || this.isSubmitting) return;

    const email = this.emailInput.value.trim();
    
    // Validate email
    if (!this.isValidEmail(email)) {
      this.showError(this.config.errorMessage || 'Please enter a valid email address.');
      this.emailInput.focus();
      return;
    }

    // Clear any previous messages
    this.clearMessages();

    if (this.config.enableJavaScriptEnhancements) {
      this.submitWithAPI(email);
    } else {
      this.submitWithFallback(email);
    }
  }

  private handleInput(): void {
    if (!this.emailInput) return;
    
    // Clear error state on input
    this.clearError();
    this.emailInput.setAttribute('aria-invalid', 'false');
  }

  private handleBlur(): void {
    if (!this.emailInput) return;
    
    const email = this.emailInput.value.trim();
    if (email && !this.isValidEmail(email)) {
      this.showError('Please enter a valid email address.');
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.handleSubmit(event);
    }
  }

  private async submitWithAPI(email: string): Promise<void> {
    if (!this.submitButton || !this.config.apiEndpoint) return;

    this.isSubmitting = true;
    this.setLoadingState(true);

    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data: SubscriptionResponse = await response.json();

      if (response.ok && data.success) {
        this.showSuccess(data.message || this.config.successMessage || 'Successfully subscribed!');
        this.resetForm();
      } else {
        this.showError(data.message || 'Subscription failed. Please try again.');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      this.showError('Network error. Please check your connection and try again.');
    } finally {
      this.isSubmitting = false;
      this.setLoadingState(false);
    }
  }

  private submitWithFallback(email: string): void {
    // For no-JS or fallback, modify the mailto action with the email
    if (this.form) {
      const subject = encodeURIComponent('Newsletter Subscription');
      const body = encodeURIComponent(`Please subscribe ${email} to your newsletter.`);
      this.form.setAttribute('action', `mailto:${this.config.contactEmail}?subject=${subject}&body=${body}`);
      
      // Show instructions to user
      this.showSuccess('Please check your email client to complete the subscription request.');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254; // RFC 5321 limit
  }

  private showError(message: string): void {
    if (!this.emailInput) return;

    const errorElement = this.element?.querySelector('.newsletter__error') as HTMLElement;
    const errorText = this.element?.querySelector('.newsletter__error-text') as HTMLElement;
    
    if (errorElement && errorText) {
      errorText.textContent = message;
      errorElement.style.display = 'flex';
      
      // Update ARIA attributes
      this.emailInput.setAttribute('aria-invalid', 'true');
      this.emailInput.setAttribute('aria-describedby', 'newsletter-error newsletter-policy');
    }
  }

  private showSuccess(message: string): void {
    const successElement = this.element?.querySelector('.newsletter__success') as HTMLElement;
    const successText = this.element?.querySelector('.newsletter__success-text') as HTMLElement;
    
    if (successElement && successText) {
      successText.textContent = message;
      successElement.style.display = 'flex';
    }
  }

  private clearMessages(): void {
    this.clearError();
    this.clearSuccess();
  }

  private clearError(): void {
    const errorElement = this.element?.querySelector('.newsletter__error') as HTMLElement;
    if (errorElement) {
      errorElement.style.display = 'none';
    }
  }

  private clearSuccess(): void {
    const successElement = this.element?.querySelector('.newsletter__success') as HTMLElement;
    if (successElement) {
      successElement.style.display = 'none';
    }
  }

  private setLoadingState(isLoading: boolean): void {
    if (!this.submitButton || !this.emailInput) return;

    if (isLoading) {
      this.submitButton.classList.add('newsletter__submit--loading');
      this.submitButton.disabled = true;
      this.emailInput.disabled = true;
      
      // Announce loading state to screen readers
      this.announceToScreenReader('Subscribing, please wait...');
    } else {
      this.submitButton.classList.remove('newsletter__submit--loading');
      this.submitButton.disabled = false;
      this.emailInput.disabled = false;
    }
  }

  private resetForm(): void {
    if (this.form) {
      this.form.reset();
    }
    this.clearMessages();
    
    if (this.emailInput) {
      this.emailInput.setAttribute('aria-invalid', 'false');
      this.emailInput.setAttribute('aria-describedby', 'newsletter-policy');
    }
  }

  private announceToScreenReader(message: string): void {
    // Create a temporary live region for announcements
    let liveRegion = document.querySelector('#newsletter-live-region') as HTMLElement;
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'newsletter-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }
    
    liveRegion.textContent = message;
  }

  private injectStyles(): void {
    if (document.querySelector('#newsletter-styles')) return;

    const style = document.createElement('style');
    style.id = 'newsletter-styles';
    style.textContent = this.getStyles();
    document.head.appendChild(style);
  }

  private handleReducedMotion(): void {
    if (!this.element) return;
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      this.element.classList.add('newsletter--reduced-motion');
    }
    
    // Listen for changes in motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', (e) => {
      if (e.matches) {
        this.element?.classList.add('newsletter--reduced-motion');
      } else {
        this.element?.classList.remove('newsletter--reduced-motion');
      }
    });
  }

  private getStyles(): string {
    return `
      /* Newsletter Component Styles */
      .newsletter {
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        padding: 4rem 2rem;
        margin: 2rem 0;
        border-radius: 1rem;
        border: 1px solid #e2e8f0;
      }

      .newsletter__container {
        max-width: 32rem;
        margin: 0 auto;
        text-align: center;
      }

      .newsletter__title {
        font-size: 2rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 1rem 0;
        line-height: 1.2;
      }

      .newsletter__subtitle {
        font-size: 1.125rem;
        color: #64748b;
        margin: 0 0 2rem 0;
        line-height: 1.5;
      }

      .newsletter__form {
        text-align: left;
      }

      .newsletter__label {
        display: block;
        font-weight: 600;
        color: #374151;
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
      }

      .newsletter__required {
        color: #dc2626;
        margin-left: 0.25rem;
      }

      .newsletter__input-wrapper {
        display: flex;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }

      .newsletter__input {
        flex: 1;
        padding: 0.875rem 1rem;
        border: 2px solid #d1d5db;
        border-radius: 0.5rem;
        font-size: 1rem;
        transition: all 0.2s ease;
        background: white;
        min-height: 44px;
        height: 44px;
        box-sizing: border-box;
      }

      .newsletter__input:focus {
        outline: none;
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }

      .newsletter__input:invalid {
        border-color: #dc2626;
      }

      .newsletter__input[aria-invalid="true"] {
        border-color: #dc2626;
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
      }

      .newsletter__submit {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #2563eb;
        color: white;
        border: none;
        padding: 0.875rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 600;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 120px;
        min-height: 44px;
        height: 44px;
        box-sizing: border-box;
      }

      .newsletter__submit:hover:not(:disabled) {
        background: #1d4ed8;
        transform: translateY(-1px);
        box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.39);
      }

      .newsletter__submit:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.5);
      }

      .newsletter__submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .newsletter__submit-spinner {
        display: none;
        width: 1rem;
        height: 1rem;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-left: 0.5rem;
      }

      .newsletter__submit--loading .newsletter__submit-text {
        opacity: 0.7;
      }

      .newsletter__submit--loading .newsletter__submit-spinner {
        display: inline-block;
      }

      .newsletter__policy {
        margin-bottom: 1rem;
      }

      .newsletter__policy-text {
        font-size: 0.75rem;
        color: #6b7280;
        margin: 0;
        line-height: 1.4;
      }

      .newsletter__policy-link {
        color: #2563eb;
        text-decoration: underline;
        font-weight: 500;
      }

      .newsletter__policy-link:hover {
        color: #1d4ed8;
      }

      .newsletter__policy-link:focus {
        outline: 2px solid #2563eb;
        outline-offset: 2px;
        border-radius: 2px;
      }

      .newsletter__messages {
        min-height: 1.5rem;
      }

      .newsletter__error,
      .newsletter__success {
        display: none;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
        margin-top: 0.5rem;
      }

      .newsletter__error {
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #dc2626;
      }

      .newsletter__success {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        color: #16a34a;
      }

      .newsletter__error-icon,
      .newsletter__success-icon {
        font-weight: bold;
        font-size: 1rem;
      }

      .newsletter__noscript {
        background: #fffbeb;
        border: 1px solid #fed7aa;
        color: #92400e;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-top: 1rem;
        font-size: 0.875rem;
      }

      .newsletter__noscript a {
        color: #2563eb;
        font-weight: 600;
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

      /* Reduced motion support */
      .newsletter--reduced-motion .newsletter__submit {
        transition: none;
      }

      .newsletter--reduced-motion .newsletter__submit:hover {
        transform: none;
      }

      .newsletter--reduced-motion .newsletter__submit-spinner {
        animation: none;
      }

      /* Mobile responsive */
      @media (max-width: 640px) {
        .newsletter {
          padding: 2rem 1rem;
          margin: 1rem 0;
          border-radius: 0.5rem;
        }

        .newsletter__title {
          font-size: 1.5rem;
        }

        .newsletter__subtitle {
          font-size: 1rem;
        }

        .newsletter__input-wrapper {
          flex-direction: column;
          gap: 0.5rem;
        }

        .newsletter__submit {
          width: 100%;
        }
      }

      /* High contrast mode support */
      @media (prefers-contrast: high) {
        .newsletter__input {
          border-width: 3px;
        }

        .newsletter__submit {
          border: 2px solid currentColor;
        }
      }

      /* Animations */
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* Focus within form for better UX */
      .newsletter__form:focus-within .newsletter__input {
        border-color: #93c5fd;
      }
    `;
  }
}

// Auto-initialize if DOM is ready (removed to prevent conflicts with page composition)
// Newsletter will be explicitly initialized by the home page