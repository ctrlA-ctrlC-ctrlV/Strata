// QuoteForm Component - Static-first with progressive enhancement
// Implements quote request form with no-JS fallback and enhanced submission

export interface QuoteFormData {
  firstName: string;
  secondName?: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  eircode: string;
  note?: string;
  newsletter?: boolean;
}

export interface ValidationErrors {
  firstName?: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  eircode?: string;
  general?: string;
}

export interface QuoteFormConfig {
  enableJavaScriptEnhancements?: boolean;
  apiEndpoint?: string;
  newsletterEndpoint?: string;
  mailtoFallback?: string;
}

export class QuoteForm {
  private config: QuoteFormConfig;
  private formElement: HTMLFormElement | null = null;
  private validationErrors: ValidationErrors = {};
  private isSubmitting = false;
  private liveRegion: HTMLElement | null = null;

  constructor(config: QuoteFormConfig = {}) {
    this.config = {
      enableJavaScriptEnhancements: true,
      apiEndpoint: '/api/quote-leads',
      newsletterEndpoint: '/api/newsletter-subscriptions',
      mailtoFallback: 'quotes@stratagardnerooms.ie',
      ...config
    };
  }

  public async initialize(): Promise<void> {
    this.createFormHTML();
    this.addStyles();
    
    if (this.config.enableJavaScriptEnhancements) {
      await this.setupEnhancements();
    }
  }

  private createFormHTML(): void {
    const container = document.querySelector('#quote');
    if (!container) {
      console.warn('Quote form container not found');
      return;
    }

    const mailtoBody = this.createMailtoTemplate();

    container.innerHTML = `
      <section data-testid="quote-section" class="quote-section">
        <div class="container">
          <div class="quote-section__content">
            <div class="quote-section__header">
              <h2 class="quote-section__title">Get Your Free Quote</h2>
              <p class="quote-section__subtitle">
                Tell us about your project and we'll provide a personalized quote within 24 hours.
              </p>
            </div>

            <form 
              data-testid="quote-form" 
              class="quote-form"
              action="mailto:${this.config.mailtoFallback}?subject=${encodeURIComponent('Garden Room Quote Request')}&body=${encodeURIComponent(mailtoBody)}"
              method="post"
              enctype="text/plain"
              novalidate
            >
              <!-- Live region for announcing validation messages -->
              <div class="sr-only" aria-live="assertive" data-testid="live-region"></div>
              <!-- Form fields will be added in next task -->
              <div class="quote-form__fields">
                <!-- Personal Information -->
                <fieldset class="quote-form__fieldset">
                  <legend class="quote-form__legend">Personal Information</legend>
                  
                  <div class="quote-form__field-group">
                    <div class="quote-form__field">
                      <label for="firstName" class="quote-form__label">
                        First Name <span class="quote-form__required">*</span>
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        data-testid="first-name-field"
                        class="quote-form__input"
                        required
                        aria-required="true"
                        autocomplete="given-name"
                      />
                      <div id="firstName-error" data-testid="first-name-error" class="quote-form__error-message" role="alert"></div>
                    </div>

                    <div class="quote-form__field">
                      <label for="secondName" class="quote-form__label">
                        Surname
                      </label>
                      <input
                        type="text"
                        id="secondName"
                        name="secondName"
                        data-testid="second-name-field"
                        class="quote-form__input"
                        autocomplete="family-name"
                      />
                    </div>
                  </div>
                </fieldset>

                <!-- Contact Information -->
                <fieldset class="quote-form__fieldset">
                  <legend class="quote-form__legend">Contact Information</legend>
                  
                  <div class="quote-form__field-group">
                    <div class="quote-form__field">
                      <label for="phone" class="quote-form__label">
                        Phone Number <span class="quote-form__required">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        data-testid="phone-field"
                        class="quote-form__input"
                        required
                        aria-required="true"
                        autocomplete="tel"
                        placeholder="087 123 4567"
                      />
                      <div id="phone-error" data-testid="phone-error" class="quote-form__error-message" role="alert"></div>
                    </div>

                    <div class="quote-form__field">
                      <label for="email" class="quote-form__label">
                        Email Address <span class="quote-form__required">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        data-testid="email-field"
                        class="quote-form__input"
                        required
                        aria-required="true"
                        autocomplete="email"
                        placeholder="your@email.com"
                      />
                      <div id="email-error" data-testid="email-error" class="quote-form__error-message" role="alert"></div>
                    </div>
                  </div>
                </fieldset>

                <!-- Address Information -->
                <fieldset class="quote-form__fieldset">
                  <legend class="quote-form__legend">Project Address</legend>
                  
                  <div class="quote-form__field-group">
                    <div class="quote-form__field quote-form__field--full">
                      <label for="addressLine1" class="quote-form__label">
                        Address Line 1 <span class="quote-form__required">*</span>
                      </label>
                      <input
                        type="text"
                        id="addressLine1"
                        name="addressLine1"
                        data-testid="address-line1-field"
                        class="quote-form__input"
                        required
                        aria-required="true"
                        autocomplete="address-line1"
                        placeholder="123 Main Street"
                      />
                      <div id="addressLine1-error" data-testid="address-line1-error" class="quote-form__error-message" role="alert"></div>
                    </div>

                    <div class="quote-form__field quote-form__field--full">
                      <label for="addressLine2" class="quote-form__label">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        id="addressLine2"
                        name="addressLine2"
                        data-testid="address-line2-field"
                        class="quote-form__input"
                        autocomplete="address-line2"
                        placeholder="Apartment, suite, etc. (optional)"
                      />
                    </div>

                    <div class="quote-form__field">
                      <label for="eircode" class="quote-form__label">
                        Eircode <span class="quote-form__required">*</span>
                      </label>
                      <input
                        type="text"
                        id="eircode"
                        name="eircode"
                        data-testid="eircode-field"
                        class="quote-form__input"
                        required
                        aria-required="true"
                        autocomplete="postal-code"
                        placeholder="D02 XY45"
                        pattern="[A-Z0-9]{3}\\s?[A-Z0-9]{4}"
                        title="Irish Eircode format: A12 B345"
                      />
                      <div id="eircode-error" data-testid="eircode-error" class="quote-form__error-message" role="alert"></div>
                    </div>
                  </div>
                </fieldset>

                <!-- Project Details -->
                <fieldset class="quote-form__fieldset">
                  <legend class="quote-form__legend">Project Details</legend>
                  
                  <div class="quote-form__field quote-form__field--full">
                    <label for="note" class="quote-form__label">
                      Tell us about your project
                    </label>
                    <textarea
                      id="note"
                      name="note"
                      data-testid="note-field"
                      class="quote-form__textarea"
                      rows="4"
                      placeholder="Describe your garden room or extension requirements, preferred timeline, budget considerations, etc."
                    ></textarea>
                    <div class="quote-form__field-hint">
                      This helps us provide a more accurate quote
                    </div>
                  </div>
                </fieldset>

                <!-- Newsletter Subscription -->
                <fieldset class="quote-form__fieldset">
                  <legend class="quote-form__legend">Stay Updated</legend>
                  
                  <div class="quote-form__field quote-form__field--checkbox">
                    <input
                      type="checkbox"
                      id="newsletter"
                      name="newsletter"
                      data-testid="newsletter-checkbox"
                      class="quote-form__checkbox"
                      value="true"
                    />
                    <label for="newsletter" class="quote-form__checkbox-label">
                      Yes, I'd like to receive occasional updates about new products and special offers
                    </label>
                    <div class="quote-form__field-hint">
                      You can unsubscribe at any time. See our <a href="/privacy-policy.html">Privacy Policy</a>.
                    </div>
                  </div>
                </fieldset>
              </div>

              <!-- Success/Error Messages -->
              <div data-testid="success-message" class="quote-form__success" role="status" aria-live="polite" style="display: none;">
                <h3 class="quote-form__success-title">Thank you for your request!</h3>
                <p class="quote-form__success-lead">We'll get back to you within 24 hours with your personalized quote.</p>
                <div class="quote-form__next-steps">
                  <h4 class="quote-form__next-steps-title">What happens next?</h4>
                  <ol class="quote-form__next-steps-list">
                    <li>You'll receive a confirmation email shortly.</li>
                    <li>Our team will review your details and prepare your quote.</li>
                    <li>We may contact you for any clarifications.</li>
                  </ol>
                  <p class="quote-form__next-steps-help">Need to chat sooner? Email <a href="mailto:${this.config.mailtoFallback}">${this.config.mailtoFallback}</a> or call us.</p>
                </div>
                <div class="quote-form__post-actions">
                  <a href="#garden-rooms" class="quote-form__link">Explore Garden Rooms</a>
                  <a href="#home-extensions" class="quote-form__link">Explore Home Extensions</a>
                </div>
              </div>

              <div data-testid="error-message" class="quote-form__error" style="display: none;">
                <h3>Something went wrong</h3>
                <p>Please try again or contact us directly.</p>
              </div>

              <!-- Submit Button -->
              <div class="quote-form__actions">
                <button 
                  type="submit" 
                  data-testid="submit-button"
                  class="btn btn--primary quote-form__submit"
                  disabled
                >
                  Get My Free Quote
                </button>
              </div>

              <!-- Terms Notice -->
              <div data-testid="terms-privacy-notice" class="quote-form__terms">
                <p class="quote-form__terms-text">
                  By submitting this form, you confirm that you have read our 
                  <a href="/terms-of-service.html" data-testid="terms-link" class="quote-form__terms-link">Terms of Service</a>
                  and 
                  <a href="/privacy-policy.html" data-testid="privacy-link" class="quote-form__terms-link">Privacy Policy</a>.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    `;

    this.formElement = container.querySelector('[data-testid="quote-form"]');
    this.liveRegion = container.querySelector('[data-testid="live-region"]') as HTMLElement | null;
  }

  private createMailtoTemplate(): string {
    return `Hi there!

I would like to request a quote for a garden room/home extension project.

Please find my contact details below:

Name: [Please fill in your name]
Phone: [Please fill in your phone number]  
Email: [Please fill in your email address]
Address: [Please fill in your project address]
Eircode: [Please fill in your Eircode]

Project Details:
[Please describe your requirements, preferred timeline, and any other relevant information]

I look forward to hearing from you soon.

Thank you!

---
This enquiry was submitted via the Strata Garden Rooms website quote form.`;
  }

  private async setupEnhancements(): Promise<void> {
    if (!this.formElement) return;

    // Override form submission for JS enhancement
    this.formElement.addEventListener('submit', this.handleSubmit.bind(this));
    
    // Enable submit button (disabled by default for no-JS fallback)
    const submitButton = this.formElement.querySelector('[data-testid="submit-button"]') as HTMLButtonElement;
    if (submitButton) {
      submitButton.disabled = false;
    }

    // Add real-time validation
    this.setupValidation();

    console.log('QuoteForm: JavaScript enhancements enabled');
  }

  private setupValidation(): void {
    if (!this.formElement) return;

    // Add validation listeners to required fields
    const requiredFields = [
      { name: 'firstName', validator: this.validateRequired },
      { name: 'phone', validator: this.validatePhone },
      { name: 'email', validator: this.validateEmail },
      { name: 'addressLine1', validator: this.validateRequired },
      { name: 'eircode', validator: this.validateEircode }
    ];

    requiredFields.forEach(({ name, validator }) => {
      const field = this.formElement!.querySelector(`[name="${name}"]`) as HTMLInputElement;
      if (field) {
        // Validate on blur and input (with debounce)
        field.addEventListener('blur', () => this.validateField(name, validator));
        
        let timeout: number;
        field.addEventListener('input', () => {
          clearTimeout(timeout);
          timeout = setTimeout(() => this.validateField(name, validator), 300) as unknown as number;
        });
      }
    });
  }

  private validateField(fieldName: string, validator: (value: string) => string | null): void {
    const field = this.formElement!.querySelector(`[name="${fieldName}"]`) as HTMLInputElement;
    const errorElement = document.getElementById(`${fieldName}-error`);
    
    if (!field || !errorElement) return;

    const error = validator.call(this, field.value.trim());
    
    if (error) {
      this.validationErrors[fieldName as keyof ValidationErrors] = error;
      this.showFieldError(fieldName, error);
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', `${fieldName}-error`);
    } else {
      delete this.validationErrors[fieldName as keyof ValidationErrors];
      this.clearFieldError(fieldName);
      field.setAttribute('aria-invalid', 'false');
      field.removeAttribute('aria-describedby');
    }
  }

  private validateRequired(value: string): string | null {
    return value.length === 0 ? 'This field is required.' : null;
  }

  private validateEmail(value: string): string | null {
    if (value.length === 0) return 'Email address is required.';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Please enter a valid email address.';
  }

  private validatePhone(value: string): string | null {
    if (value.length === 0) return 'Phone number is required.';
    
    // Irish phone number formats: +353, 0xx, or mobile 08x
    const phoneRegex = /^(\+353|0)[0-9\s\-\(\)]{8,12}$/;
    return phoneRegex.test(value.replace(/\s/g, '')) ? null : 'Please enter a valid Irish phone number.';
  }

  private validateEircode(value: string): string | null {
    if (value.length === 0) return 'Eircode is required.';
    
    // Irish Eircode format: A12 B345 or A12B345
    const eircodeRegex = /^[A-Z0-9]{3}\s?[A-Z0-9]{4}$/i;
    return eircodeRegex.test(value) ? null : 'Please enter a valid Irish Eircode (e.g., D02 XY45).';
  }

  private validateForm(): boolean {
    const formData = this.getFormData();
    this.validationErrors = {};

    // Validate all required fields
    const validations = [
      { field: 'firstName', value: formData.firstName, validator: this.validateRequired },
      { field: 'phone', value: formData.phone, validator: this.validatePhone },
      { field: 'email', value: formData.email, validator: this.validateEmail },
      { field: 'addressLine1', value: formData.addressLine1, validator: this.validateRequired },
      { field: 'eircode', value: formData.eircode, validator: this.validateEircode }
    ];

    validations.forEach(({ field, value, validator }) => {
      const error = validator.call(this, value);
      if (error) {
        this.validationErrors[field as keyof ValidationErrors] = error;
        this.showFieldError(field, error);
      } else {
        this.clearFieldError(field);
      }
    });

    const isValid = Object.keys(this.validationErrors).length === 0;

    if (!isValid && this.liveRegion) {
      const errorCount = Object.keys(this.validationErrors).length;
      this.liveRegion.textContent = `Please correct ${errorCount} field${errorCount === 1 ? '' : 's'}.`;
    } else if (isValid && this.liveRegion) {
      this.liveRegion.textContent = '';
    }

    return isValid;
  }

  private showFieldError(fieldName: string, message: string): void {
    const errorElement = document.getElementById(`${fieldName}-error`);
    const field = this.formElement!.querySelector(`[name="${fieldName}"]`) as HTMLInputElement;
    
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
    
    if (field) {
      field.classList.add('quote-form__input--error');
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', `${fieldName}-error`);
    }
  }

  private clearFieldError(fieldName: string): void {
    const errorElement = document.getElementById(`${fieldName}-error`);
    const field = this.formElement!.querySelector(`[name="${fieldName}"]`) as HTMLInputElement;
    
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
    
    if (field) {
      field.classList.remove('quote-form__input--error');
      field.setAttribute('aria-invalid', 'false');
      field.removeAttribute('aria-describedby');
    }
  }

  private getFormData(): QuoteFormData {
    if (!this.formElement) {
      throw new Error('Form element not found');
    }

    const fd = new FormData(this.formElement);

    const result: QuoteFormData = {
      firstName: (fd.get('firstName') as string) || '',
      phone: (fd.get('phone') as string) || '',
      email: (fd.get('email') as string) || '',
      addressLine1: (fd.get('addressLine1') as string) || '',
      eircode: (fd.get('eircode') as string) || '',
      newsletter: fd.get('newsletter') === 'true'
    };

    const secondNameVal = (fd.get('secondName') as string) || '';
    if (secondNameVal) {
      result.secondName = secondNameVal;
    }

    const addressLine2Val = (fd.get('addressLine2') as string) || '';
    if (addressLine2Val) {
      result.addressLine2 = addressLine2Val;
    }

    const noteVal = (fd.get('note') as string) || '';
    if (noteVal) {
      result.note = noteVal;
    }

    return result;
  }

  private async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    
    if (this.isSubmitting) return;
    
    this.clearMessages();

    // Validate form before submission
    if (!this.validateForm()) {
      // Focus first field with error
      const firstErrorField = this.formElement!.querySelector('.quote-form__input--error') as HTMLElement;
      if (firstErrorField) {
        firstErrorField.focus();
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    this.isSubmitting = true;
    const submitButton = this.formElement!.querySelector('[data-testid="submit-button"]') as HTMLButtonElement;
    const originalButtonText = submitButton.textContent;
    
    try {
      // Update button state
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';

      // Get form data
      const formData = this.getFormData();
      
      // Submit to API
      await this.submitToAPI(formData);
      
      // Handle newsletter subscription if checked
      if (formData.newsletter) {
        await this.submitNewsletterSubscription(formData.email);
      }
      
      this.showSuccessMessage();
      this.clearForm();
      
    } catch (error) {
      console.error('Quote submission failed:', error);
      this.showErrorMessage('There was a problem submitting your request. Please try again or contact us directly.');
    } finally {
      this.isSubmitting = false;
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  }

  private async submitToAPI(formData: QuoteFormData): Promise<void> {
    const response = await fetch(this.config.apiEndpoint!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: formData.firstName,
        secondName: formData.secondName,
        phone: formData.phone,
        email: formData.email,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        eircode: formData.eircode,
        note: formData.note
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  private async submitNewsletterSubscription(email: string): Promise<void> {
    if (!this.config.newsletterEndpoint) return;
    
    try {
      const response = await fetch(this.config.newsletterEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        console.warn('Newsletter subscription failed, but quote was submitted successfully');
      }
    } catch (error) {
      console.warn('Newsletter subscription error:', error);
      // Don't throw - newsletter failure shouldn't prevent quote submission success
    }
  }

  private clearForm(): void {
    if (!this.formElement) return;
    
    this.formElement.reset();
    
    // Clear all validation states
    Object.keys(this.validationErrors).forEach(fieldName => {
      this.clearFieldError(fieldName);
    });
    this.validationErrors = {};
  }

  private clearMessages(): void {
    const successMessage = document.querySelector('[data-testid="success-message"]') as HTMLElement;
    const errorMessage = document.querySelector('[data-testid="error-message"]') as HTMLElement;
    
    if (successMessage) successMessage.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
    if (this.liveRegion) this.liveRegion.textContent = '';
  }

  private showSuccessMessage(): void {
    const successMessage = document.querySelector('[data-testid="success-message"]') as HTMLElement;
    if (successMessage) {
      successMessage.style.display = 'block';
      successMessage.scrollIntoView({ behavior: 'smooth' });
    }
  }

  private showErrorMessage(message?: string): void {
    const errorMessage = document.querySelector('[data-testid="error-message"]') as HTMLElement;
    if (errorMessage) {
      if (message) {
        const errorText = errorMessage.querySelector('p');
        if (errorText) errorText.textContent = message;
      }
      errorMessage.style.display = 'block';
      errorMessage.scrollIntoView({ behavior: 'smooth' });
      
      // Focus the error message for screen readers
      errorMessage.setAttribute('tabindex', '-1');
      errorMessage.focus();
    }
  }

  public destroy(): void {
    if (this.formElement) {
      this.formElement.removeEventListener('submit', this.handleSubmit.bind(this));
    }
  }

  private addStyles(): void {
    if (document.querySelector('#quote-form-styles')) return;
    const styles = document.createElement('style');
    styles.id = 'quote-form-styles';
    styles.textContent = `
      .quote-form__input, .quote-form__textarea {
        display: block;
        width: 100%;
        padding: 0.5rem 0.75rem;
        border: 1px solid #D1D5DB;
        border-radius: 0.375rem;
        background-color: #fff;
        color: #111827;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      @media (prefers-reduced-motion: reduce) {
        .quote-form__input, .quote-form__textarea {
          transition: none;
        }
      }

      .quote-form__input:focus, .quote-form__textarea:focus {
        outline: 2px solid #2563eb;
        outline-offset: 2px;
        border-color: #2563eb;
        box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
      }

      .quote-form__input--error {
        border-color: #DC2626;
      }

      .quote-form__error-message {
        color: #B91C1C;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }

      .quote-form__checkbox:focus + .quote-form__checkbox-label,
      .quote-form__checkbox:focus {
        outline: 2px solid #2563eb;
        outline-offset: 2px;
      }

      .quote-form__success {
        border: 1px solid #34D399;
        background: #ECFDF5;
        color: #065F46;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-top: 1rem;
      }

      .quote-form__error {
        border: 1px solid #FCA5A5;
        background: #FEF2F2;
        color: #991B1B;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-top: 1rem;
      }

      .quote-form__link {
        display: inline-block;
        margin-right: 1rem;
        color: #2563eb;
        text-decoration: underline;
      }

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
    `;
    document.head.appendChild(styles);
  }
}