/**
 * Quote Form Component
 * Collects customer information and submits quote request with configuration data
 */

import type { ConfiguratorState } from './index.js';
import { calculatePriceEstimate, type ProductConfiguration } from '../../lib/price.js';
import { 
  CustomerInfo, 
  QuoteFormData
} from './types.js';
import { QUOTE_FORM_STYLES } from './quote-form-styles.js';
// Eircode utilities not needed - using local validation methods
import { submitQuote, APIError, NetworkTimeoutError, NetworkError } from '../../lib/api.js';

// Local interfaces for internal form state
interface InternalQuoteFormData {
  customer: CustomerInfo;
  desiredInstallTimeframe: string;
  configuration: Partial<ConfiguratorState>;
  estimate: {
    subtotalExVat: number;
    vatRate: number;
    vatAmount: number;
    totalIncVat: number;
  };
}

export interface QuoteFormState {
  isValid: boolean;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

export interface QuoteFormOptions {
  showPricing: boolean;
  allowedCounties: string[];
  onSubmit?: (data: InternalQuoteFormData) => Promise<void>;
  onCancel?: () => void;
}

export class QuoteForm {
  private container: HTMLElement;
  private state: QuoteFormState;
  private configuration: Partial<ConfiguratorState>;
  private options: QuoteFormOptions;
  private onSubmitCallback?: (data: InternalQuoteFormData) => Promise<void>;
  private onCancelCallback?: () => void;

  // Allowed counties for service (from research.md)
  private readonly ALLOWED_COUNTIES = ['Dublin', 'Wicklow', 'Kildare'];

  // County to Eircode routing key mapping
  private readonly COUNTY_EIRCODE_MAP = {
    'Dublin': ['D', 'A', 'K'],
    'Wicklow': ['A'],
    'Kildare': ['W', 'R']
  };
  
  // Phone country prefixes
  private readonly COUNTRY_PREFIXES = [
    { code: '+353', label: 'Ireland (+353)', flag: '🇮🇪' },
    { code: '+44', label: 'UK (+44)', flag: '🇬🇧' },
    { code: '+1', label: 'US/Canada (+1)', flag: '🇺🇸' },
    { code: '+33', label: 'France (+33)', flag: '🇫🇷' },
    { code: '+49', label: 'Germany (+49)', flag: '🇩🇪' }
  ];

  // Installation timeframes
  private readonly TIMEFRAMES = [
    { value: 'asap', label: 'As soon as possible' },
    { value: '1-3months', label: '1-3 months' },
    { value: '3-6months', label: '3-6 months' },
    { value: '6-12months', label: '6-12 months' },
    { value: 'planning', label: 'Just planning/exploring' }
  ];

  constructor(
    container: HTMLElement, 
    configuration: Partial<ConfiguratorState>, 
    options: Partial<QuoteFormOptions> = {}
  ) {
    this.container = container;
    this.configuration = configuration;
    this.options = {
      showPricing: true,
      allowedCounties: this.ALLOWED_COUNTIES,
      ...options
    };
    
    this.state = {
      isValid: false,
      errors: {},
      isSubmitting: false
    };

    if (options.onSubmit) this.onSubmitCallback = options.onSubmit;
    if (options.onCancel) this.onCancelCallback = options.onCancel;

    this.injectStyles();
    this.render();
    this.bindEvents();
  }

  /**
   * Inject CSS styles
   */
  private injectStyles(): void {
    const styleId = 'quote-form-styles';
    
    // Check if styles are already injected
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = QUOTE_FORM_STYLES;
    document.head.appendChild(style);
  }

  /**
   * Render the quote form
   */
  private render(): void {
    // Calculate current price estimate
    const estimate = this.calculateEstimate();

    this.container.innerHTML = `
      <div class="quote-form-container">
        <div class="quote-form-header">
          <h2>Get Your Quote</h2>
          <p class="quote-form-description">
            We'll prepare a detailed quote based on your configuration and get back to you within 24 hours.
          </p>
          ${this.options.showPricing ? this.renderPricingSummary(estimate) : ''}
        </div>

        <form class="quote-form" novalidate>
          <fieldset class="form-section">
            <legend>Personal Information</legend>
            
            <div class="form-row">
              <div class="form-group">
                <label for="firstName" class="required">First Name</label>
                <input 
                  type="text" 
                  id="firstName" 
                  name="firstName" 
                  required 
                  autocomplete="given-name"
                  aria-describedby="firstName-error"
                />
                <div id="firstName-error" class="field-error" role="alert"></div>
              </div>
              
              <div class="form-group">
                <label for="lastName" class="required">Last Name</label>
                <input 
                  type="text" 
                  id="lastName" 
                  name="lastName" 
                  required 
                  autocomplete="family-name"
                  aria-describedby="lastName-error"
                />
                <div id="lastName-error" class="field-error" role="alert"></div>
              </div>
            </div>

            <div class="form-group">
              <label for="email" class="required">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required 
                autocomplete="email"
                aria-describedby="email-error email-help"
              />
              <div id="email-help" class="field-help">We'll send your quote and updates to this address</div>
              <div id="email-error" class="field-error" role="alert"></div>
            </div>

            <div class="form-group">
              <label for="phone" class="required">Phone Number</label>
              <div class="phone-input-group">
                <select 
                  id="phonePrefix" 
                  name="phonePrefix" 
                  class="phone-prefix"
                  aria-label="Country code"
                >
                  ${this.COUNTRY_PREFIXES.map(p => 
                    `<option value="${p.code}" ${p.code === '+353' ? 'selected' : ''}>${p.flag} ${p.code}</option>`
                  ).join('')}
                </select>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  required 
                  autocomplete="tel-national"
                  placeholder="87 123 4567"
                  aria-describedby="phone-error phone-help"
                />
              </div>
              <div id="phone-help" class="field-help">We'll call to discuss your project details</div>
              <div id="phone-error" class="field-error" role="alert"></div>
            </div>
          </fieldset>

          <fieldset class="form-section">
            <legend>Project Location</legend>
            
            <div class="form-group">
              <label for="addressLine1" class="required">Address Line 1</label>
              <input 
                type="text" 
                id="addressLine1" 
                name="addressLine1" 
                required 
                autocomplete="address-line1"
                placeholder="123 Main Street"
                aria-describedby="addressLine1-error"
              />
              <div id="addressLine1-error" class="field-error" role="alert"></div>
            </div>

            <div class="form-group">
              <label for="addressLine2">Address Line 2</label>
              <input 
                type="text" 
                id="addressLine2" 
                name="addressLine2" 
                autocomplete="address-line2"
                placeholder="Apartment, suite, unit, building, floor, etc."
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="town">Town/City</label>
                <input 
                  type="text" 
                  id="town" 
                  name="town" 
                  autocomplete="address-level2"
                  placeholder="Dublin"
                />
              </div>
              
              <div class="form-group">
                <label for="county" class="required">County</label>
                <select 
                  id="county" 
                  name="county" 
                  required 
                  aria-describedby="county-error county-help"
                >
                  <option value="">Select county...</option>
                  ${this.options.allowedCounties.map(county => 
                    `<option value="${county}">${county}</option>`
                  ).join('')}
                </select>
                <div id="county-help" class="field-help">We currently service ${this.options.allowedCounties.join(', ')}</div>
                <div id="county-error" class="field-error" role="alert"></div>
              </div>
            </div>

            <div class="form-group">
              <label for="eircode" class="required">Eircode</label>
              <input 
                type="text" 
                id="eircode" 
                name="eircode" 
                required 
                autocomplete="postal-code"
                placeholder="D02 XY45"
                pattern="[A-Za-z0-9]{3}\\s?[A-Za-z0-9]{4}"
                maxlength="8"
                aria-describedby="eircode-error eircode-help"
              />
              <div id="eircode-help" class="field-help">Irish postal code (e.g., D02 XY45)</div>
              <div id="eircode-error" class="field-error" role="alert"></div>
            </div>
          </fieldset>

          <fieldset class="form-section">
            <legend>Project Timeline</legend>
            
            <div class="form-group">
              <label for="timeframe" class="required">When would you like to start?</label>
              <select 
                id="timeframe" 
                name="timeframe" 
                required 
                aria-describedby="timeframe-error"
              >
                <option value="">Select timeframe...</option>
                ${this.TIMEFRAMES.map(tf => 
                  `<option value="${tf.value}">${tf.label}</option>`
                ).join('')}
              </select>
              <div id="timeframe-error" class="field-error" role="alert"></div>
            </div>
          </fieldset>

          <div class="form-actions">
            <button type="button" class="btn btn-outline btn-cancel">
              <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
              </svg>
              Back to Summary
            </button>
            
            <button type="submit" class="btn btn-primary btn-submit" disabled>
              <span class="btn-text">Get My Quote</span>
              <svg class="btn-icon btn-arrow" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              <div class="btn-spinner" style="display: none;">
                <div class="spinner"></div>
              </div>
            </button>
          </div>
        </form>

        <div class="quote-form-footer">
          <p class="privacy-notice">
            <svg class="privacy-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
            </svg>
            Your information is secure and will only be used to prepare your quote. 
            We don't share personal details with third parties.
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Render pricing summary section
   */
  private renderPricingSummary(estimate: any): string {
    return `
      <div class="pricing-summary">
        <h3>Quote Summary</h3>
        <div class="price-breakdown">
          <div class="price-row">
            <span class="price-label">Subtotal (Ex. VAT):</span>
            <span class="price-value">€${estimate.subtotalExVat.toLocaleString('en-IE')}</span>
          </div>
          <div class="price-row">
            <span class="price-label">VAT (${(estimate.vatRate * 100).toFixed(0)}%):</span>
            <span class="price-value">€${estimate.vatAmount.toLocaleString('en-IE')}</span>
          </div>
          <div class="price-row price-total">
            <span class="price-label">Total (Inc. VAT):</span>
            <span class="price-value">€${estimate.totalIncVat.toLocaleString('en-IE')}</span>
          </div>
        </div>
        <p class="price-disclaimer">
          This is an indicative estimate. Final pricing will be confirmed in your detailed quote.
        </p>
      </div>
    `;
  }

  /**
   * Calculate price estimate from configuration
   */
  private calculateEstimate(): any {
    // Convert configurator state to price calculation format
    const priceConfig = this.convertConfigurationForPricing();
    return calculatePriceEstimate(priceConfig);
  }

  /**
   * Convert configurator state to price calculation format
   */
  private convertConfigurationForPricing(): ProductConfiguration {
    const sizeConfig = this.configuration.size || { widthMm: 0, depthMm: 0 };
    const claddingConfig = this.configuration.cladding || { color: '', material: '', areaSqm: 0 };
    const openingsConfig = this.configuration.openings || { windows: [], externalDoors: [], skylights: [] };
    const floorConfig = this.configuration.floor || { type: 'none', areaSqm: 0 };
    const bathroomConfig = this.configuration.bathroom || { type: 'none', count: 0 };
    const extrasConfig = this.configuration.extras || { selectedExtras: [], customExtras: [] };

    return {
      productType: 'garden-room',
      size: {
        widthM: sizeConfig.widthMm / 1000,
        depthM: sizeConfig.depthMm / 1000
      },
      cladding: {
        areaSqm: claddingConfig.areaSqm
      },
      bathroom: {
        half: bathroomConfig.type === 'half' ? bathroomConfig.count : 0,
        threeQuarter: bathroomConfig.type === 'three-quarter' ? bathroomConfig.count : 0
      },
      electrical: {
        switches: 4,
        sockets: 6,
        heater: 1
      },
      internalDoors: 1,
      internalWall: {
        finish: 'panel',
        areaSqM: Math.max(0, (sizeConfig.widthMm * sizeConfig.depthMm) / 1_000_000 * 2.5)
      },
      heaters: 1,
      glazing: {
        windows: openingsConfig.windows.map(w => ({
          widthM: w.widthMm / 1000,
          heightM: w.heightMm / 1000
        })),
        externalDoors: openingsConfig.externalDoors.map(d => ({
          widthM: d.widthMm / 1000,
          heightM: d.heightMm / 1000
        })),
        skylights: openingsConfig.skylights.map(s => ({
          widthM: s.widthMm / 1000,
          heightM: s.heightMm / 1000
        }))
      },
      floor: {
        type: floorConfig.type,
        areaSqM: floorConfig.areaSqm
      },
      delivery: {
        cost: 500
      },
      extras: {
        other: [
          ...extrasConfig.selectedExtras.map(e => ({
            title: e.title,
            cost: e.priceIncVat * e.quantity
          })),
          ...extrasConfig.customExtras.map(e => ({
            title: e.title,
            cost: e.priceIncVat * e.quantity
          }))
        ]
      }
    };
  }

  /**
   * Bind event listeners
   */
  private bindEvents(): void {
    const form = this.container.querySelector('.quote-form') as HTMLFormElement;
    const cancelBtn = this.container.querySelector('.btn-cancel') as HTMLButtonElement;

    // Form validation on input
    form.addEventListener('input', this.handleFormInput.bind(this));
    form.addEventListener('change', this.handleFormInput.bind(this));

    // County change handler for dynamic Eircode help
    const countySelect = form.querySelector('#county') as HTMLSelectElement;
    if (countySelect) {
      countySelect.addEventListener('change', this.updateEircodeHelp.bind(this));
    }

    // Form submission
    form.addEventListener('submit', this.handleSubmit.bind(this));

    // Cancel button
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        if (this.onCancelCallback) {
          this.onCancelCallback();
        }
      });
    }

    // Eircode formatting and validation
    const eircodeInput = form.querySelector('#eircode') as HTMLInputElement;
    if (eircodeInput) {
      eircodeInput.addEventListener('input', this.formatEircode.bind(this));
      eircodeInput.addEventListener('paste', (e) => {
        // Allow paste to complete then format and validate
        setTimeout(() => {
          this.formatEircode(e);
          this.handleFormInput(e);
        }, 0);
      });
    }

    // Phone formatting
    const phoneInput = form.querySelector('#phone') as HTMLInputElement;
    if (phoneInput) {
      phoneInput.addEventListener('input', this.formatPhone.bind(this));
    }
  }

  /**
   * Handle form input changes and validation
   */
  private handleFormInput(event: Event): void {
    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    
    // Validate individual field if it was the target
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'SELECT') {
      this.validateField(target as HTMLInputElement | HTMLSelectElement, formData);
    }

    // Update overall form validity
    this.updateFormValidity(form);
  }

  /**
   * Validate individual form field
   */
  private validateField(field: HTMLInputElement | HTMLSelectElement, formData: FormData): void {
    const name = field.name;
    const value = formData.get(name) as string;
    const errorElement = this.container.querySelector(`#${name}-error`) as HTMLElement;
    
    let error = '';

    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) {
          error = `${name === 'firstName' ? 'First' : 'Last'} name is required`;
        } else if (value.trim().length < 2) {
          error = `${name === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`;
        }
        break;

      case 'email':
        if (!value.trim()) {
          error = 'Email address is required';
        } else if (!this.isValidEmail(value)) {
          error = 'Please enter a valid email address';
        }
        break;

      case 'phone':
        if (!value.trim()) {
          error = 'Phone number is required';
        } else if (!this.isValidPhone(value)) {
          error = 'Please enter a valid phone number (at least 7 digits)';
        }
        break;

      case 'addressLine1':
        if (!value.trim()) {
          error = 'Address is required';
        } else if (value.trim().length < 5) {
          error = 'Please enter a complete address';
        }
        break;

      case 'county':
        if (!value.trim()) {
          error = 'County is required';
        } else if (!this.options.allowedCounties.includes(value)) {
          error = `We currently only service ${this.options.allowedCounties.join(', ')}`;
        } else {
          // Check eircode/county consistency if eircode is filled
          const eircodeValue = formData.get('eircode') as string;
          if (eircodeValue && eircodeValue.trim()) {
            const eircodeValidation = this.validateEircodeForCounty(eircodeValue, value);
            if (!eircodeValidation.isValid) {
              // Set error on eircode field instead to avoid confusion
              this.setFieldError('eircode', eircodeValidation.message);
            }
          }
        }
        break;

      case 'eircode':
        if (!value.trim()) {
          error = 'Eircode is required';
        } else if (!this.isValidEircode(value)) {
          error = 'Please enter a valid Eircode (e.g., D02 XY45)';
        } else {
          // Check county/eircode consistency
          const selectedCounty = formData.get('county') as string;
          const eircodeValidation = this.validateEircodeForCounty(value, selectedCounty);
          if (!eircodeValidation.isValid) {
            error = eircodeValidation.message;
          }
        }
        break;

      case 'timeframe':
        if (!value.trim()) {
          error = 'Please select your preferred timeframe';
        }
        break;
    }

    // Update error state
    this.state.errors[name] = error;

    // Update UI
    if (errorElement) {
      errorElement.textContent = error;
      errorElement.style.display = error ? 'block' : 'none';
    }

    // Update field styling
    field.classList.toggle('error', !!error);
    field.setAttribute('aria-invalid', error ? 'true' : 'false');
  }

  /**
   * Update overall form validity and submit button state
   */
  private updateFormValidity(form: HTMLFormElement): void {
    const formData = new FormData(form);
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'addressLine1', 'county', 'eircode', 'timeframe'];
    
    // Validate all required fields
    let hasErrors = false;
    for (const fieldName of requiredFields) {
      const field = form.querySelector(`[name="${fieldName}"]`) as HTMLInputElement | HTMLSelectElement;
      if (field) {
        this.validateField(field, formData);
        if (this.state.errors[fieldName]) {
          hasErrors = true;
        }
      }
    }

    // Update form validity
    this.state.isValid = !hasErrors && requiredFields.every(field => {
      const value = formData.get(field) as string;
      return value && value.trim();
    });

    // Update submit button
    const submitBtn = this.container.querySelector('.btn-submit') as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.disabled = !this.state.isValid || this.state.isSubmitting;
    }
  }

  /**
   * Handle form submission
   */
  private async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Final validation
    this.updateFormValidity(form);
    
    if (!this.state.isValid) {
      // Focus first error field
      const firstErrorField = form.querySelector('.error') as HTMLElement;
      if (firstErrorField) {
        firstErrorField.focus();
      }
      return;
    }

    // Start submission
    this.state.isSubmitting = true;
    this.updateSubmissionState(true);

    try {
      // Prepare quote data
      const quoteData: InternalQuoteFormData = {
        customer: {
          firstName: formData.get('firstName') as string,
          lastName: formData.get('lastName') as string,
          email: formData.get('email') as string,
          phone: `${formData.get('phonePrefix')} ${formData.get('phone')}`,
          address: formData.get('addressLine1') as string,
          city: formData.get('town') as string || '',
          county: formData.get('county') as string,
          eircode: formData.get('eircode') as string
        },
        desiredInstallTimeframe: formData.get('timeframe') as string,
        configuration: this.configuration,
        estimate: this.calculateEstimate()
      };

      // Prepare API payload matching QuoteFormData interface
      const apiPayload: QuoteFormData = {
        ...quoteData.customer,
        includeVat: true, // Based on current estimate calculation
        basePrice: quoteData.estimate.subtotalExVat,
        vatAmount: quoteData.estimate.vatAmount,
        totalPrice: quoteData.estimate.totalIncVat,
        configurationData: JSON.stringify(quoteData.configuration),
        marketingConsent: (formData.get('marketingConsent') as string) === 'on',
        termsAccepted: (formData.get('termsAccepted') as string) === 'on'
      };

      // Submit quote via API
      const response = await submitQuote(apiPayload);

      if (response.success) {
        // Success - dispatch success event
        this.container.dispatchEvent(new CustomEvent('quote:success', {
          bubbles: true,
          detail: { quoteId: response.quoteId, message: response.message }
        }));
        
        // Clear form or redirect to confirmation
        this.handleSubmissionSuccess(response);
      } else {
        // Handle API errors
        throw new Error(response.message || 'Quote submission failed');
      }

    } catch (error) {
      console.error('Quote submission failed:', error);
      
      let errorMessage = 'Failed to submit quote. Please try again or contact us directly.';
      
      // Handle specific API errors
      if (error instanceof APIError) {
        errorMessage = error.message;
        
        // Handle validation errors by showing field-specific messages
        if (error.details && error.status === 400) {
          this.handleValidationErrors(error.details);
        }
      } else if (error instanceof NetworkTimeoutError) {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (error instanceof NetworkError) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Show error message
      this.showSubmissionError(errorMessage);
    } finally {
      this.state.isSubmitting = false;
      this.updateSubmissionState(false);
    }
  }

  /**
   * Handle validation errors from API response
   */
  private handleValidationErrors(errors: Record<string, string>): void {
    // Clear existing errors first
    Object.keys(this.state.errors).forEach(field => {
      this.clearFieldError(field);
    });

    // Apply API validation errors
    Object.entries(errors).forEach(([field, message]) => {
      this.setFieldError(field, message);
    });

    // Focus first error field
    const firstErrorField = this.container.querySelector('.error') as HTMLElement;
    if (firstErrorField) {
      firstErrorField.focus();
    }
  }

  /**
   * Set error state for a specific field
   */
  private setFieldError(fieldName: string, message: string): void {
    this.state.errors[fieldName] = message;
    
    const field = this.container.querySelector(`[name="${fieldName}"]`) as HTMLInputElement;
    const errorElement = this.container.querySelector(`#${fieldName}-error`) as HTMLElement;
    
    if (field) {
      field.classList.add('error');
      field.setAttribute('aria-invalid', 'true');
    }
    
    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  /**
   * Clear error state for a specific field
   */
  private clearFieldError(fieldName: string): void {
    delete this.state.errors[fieldName];
    
    const field = this.container.querySelector(`[name="${fieldName}"]`) as HTMLInputElement;
    const errorElement = this.container.querySelector(`#${fieldName}-error`) as HTMLElement;
    
    if (field) {
      field.classList.remove('error');
      field.removeAttribute('aria-invalid');
    }
    
    if (errorElement) {
      errorElement.textContent = '';
    }
  }

  /**
   * Handle successful quote submission
   */
  private handleSubmissionSuccess(response: { quoteId?: string; message: string }): void {
    // Show success message
    this.showSuccessMessage(response.message, response.quoteId);
    
    // Reset form if configured to do so
    const form = this.container.querySelector('.quote-form') as HTMLFormElement;
    if (form) {
      form.reset();
      this.state.isValid = false;
      this.state.errors = {};
    }

    // Execute callback if provided
    if (this.onSubmitCallback) {
      // For backward compatibility, still call the callback if provided
      // This allows external handlers to perform additional actions
      const quoteData = this.getFormData();
      if (quoteData?.customer) {
        this.onSubmitCallback(quoteData as InternalQuoteFormData);
      }
    }
  }

  /**
   * Show success message to user
   */
  private showSuccessMessage(message: string, quoteId?: string): void {
    // Create success banner
    const successHTML = `
      <div class="submission-success">
        <div class="success-content">
          <svg class="success-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <div>
            <p class="success-message">${message}</p>
            ${quoteId ? `<p class="quote-id">Quote Reference: <strong>${quoteId}</strong></p>` : ''}
          </div>
          <button type="button" class="success-close" aria-label="Close success message">&times;</button>
        </div>
      </div>
    `;

    // Insert success banner
    const form = this.container.querySelector('.quote-form');
    if (form) {
      form.insertAdjacentHTML('beforebegin', successHTML);
      
      // Add close handler
      const closeBtn = this.container.querySelector('.success-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          const banner = closeBtn.closest('.submission-success');
          if (banner) {
            banner.remove();
          }
        });
      }

      // Auto-hide after 10 seconds
      setTimeout(() => {
        const banner = this.container.querySelector('.submission-success');
        if (banner) {
          banner.remove();
        }
      }, 10000);
    }
  }

  /**
   * Update submission state UI
   */
  private updateSubmissionState(isSubmitting: boolean): void {
    const submitBtn = this.container.querySelector('.btn-submit') as HTMLButtonElement;
    const btnText = submitBtn.querySelector('.btn-text') as HTMLElement;
    const btnArrow = submitBtn.querySelector('.btn-arrow') as HTMLElement;
    const btnSpinner = submitBtn.querySelector('.btn-spinner') as HTMLElement;

    if (isSubmitting) {
      submitBtn.disabled = true;
      btnText.textContent = 'Submitting...';
      btnArrow.style.display = 'none';
      btnSpinner.style.display = 'inline-block';
    } else {
      submitBtn.disabled = !this.state.isValid;
      btnText.textContent = 'Get My Quote';
      btnArrow.style.display = 'inline-block';
      btnSpinner.style.display = 'none';
    }
  }

  /**
   * Show submission error message
   */
  private showSubmissionError(message: string): void {
    // Create or update error banner
    let errorBanner = this.container.querySelector('.submission-error') as HTMLElement;
    if (!errorBanner) {
      errorBanner = document.createElement('div');
      errorBanner.className = 'submission-error';
      errorBanner.setAttribute('role', 'alert');
      
      const form = this.container.querySelector('.quote-form') as HTMLElement;
      form.insertAdjacentElement('beforebegin', errorBanner);
    }

    errorBanner.innerHTML = `
      <div class="error-content">
        <svg class="error-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <span class="error-message">${message}</span>
        <button type="button" class="error-close" aria-label="Dismiss error">×</button>
      </div>
    `;

    // Bind close button
    const closeBtn = errorBanner.querySelector('.error-close') as HTMLButtonElement;
    closeBtn.addEventListener('click', () => {
      errorBanner.remove();
    });
  }

  /**
   * Format Eircode input
   */
  private formatEircode(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\s/g, '').toUpperCase();
    
    // Add space after 3rd character
    if (value.length > 3) {
      value = value.slice(0, 3) + ' ' + value.slice(3, 7);
    }
    
    input.value = value;
  }

  /**
   * Format phone number input
   */
  private formatPhone(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, ''); // Remove non-digits
    
    // Format as groups for Irish numbers
    let formatted = value;
    if (value.length > 2) {
      formatted = value.slice(0, 2) + ' ' + value.slice(2);
    }
    if (value.length > 5) {
      formatted = value.slice(0, 2) + ' ' + value.slice(2, 5) + ' ' + value.slice(5, 9);
    }
    
    input.value = formatted;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number
   */
  private isValidPhone(phone: string): boolean {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 7;
  }

  /**
   * Validate Eircode format
   */
  private isValidEircode(eircode: string): boolean {
    const normalized = eircode.replace(/\s/g, '').toUpperCase();
    const eircodeRegex = /^[A-Z0-9]{3}[A-Z0-9]{4}$/;
    return eircodeRegex.test(normalized);
  }

  /**
   * Validate Eircode against selected county
   */
  private validateEircodeForCounty(eircode: string, county: string): { isValid: boolean; message: string } {
    if (!eircode || !county) {
      return { isValid: true, message: '' };
    }

    const normalized = eircode.replace(/\s/g, '').toUpperCase();
    const routingKey = normalized.charAt(0);

    // Get allowed routing keys for the county
    const allowedKeys = this.COUNTY_EIRCODE_MAP[county as keyof typeof this.COUNTY_EIRCODE_MAP];
    
    if (!allowedKeys) {
      // County not in our service area - this should be caught by county validation
      return { isValid: false, message: 'County not in service area' };
    }

    if (!allowedKeys.includes(routingKey)) {
      // Generate helpful error message
      const countyExamples = this.generateEircodeExamplesForCounty(county);
      return { 
        isValid: false, 
        message: `This Eircode doesn't match ${county}. ${county} Eircodes start with: ${allowedKeys.join(', ')} (e.g., ${countyExamples})` 
      };
    }

    return { isValid: true, message: '' };
  }

  /**
   * Generate example Eircodes for a county
   */
  private generateEircodeExamplesForCounty(county: string): string {
    const examples: Record<string, string[]> = {
      'Dublin': ['D01 A1B2', 'D02 C3D4', 'A94 X5Y6'],
      'Wicklow': ['A63 B7C8', 'A67 D9E0'],
      'Kildare': ['W23 F1G2', 'R51 H3J4']
    };

    const countyExamples = examples[county] || ['ABC D1E2'];
    return countyExamples.slice(0, 2).join(', ');
  }

  /**
   * Update Eircode help text based on selected county
   */
  private updateEircodeHelp(event: Event): void {
    const countySelect = event.target as HTMLSelectElement;
    const selectedCounty = countySelect.value;
    const eircodeHelp = this.container.querySelector('#eircode-help') as HTMLElement;
    
    if (!eircodeHelp) return;

    if (selectedCounty && this.COUNTY_EIRCODE_MAP[selectedCounty as keyof typeof this.COUNTY_EIRCODE_MAP]) {
      const allowedKeys = this.COUNTY_EIRCODE_MAP[selectedCounty as keyof typeof this.COUNTY_EIRCODE_MAP];
      const examples = this.generateEircodeExamplesForCounty(selectedCounty);
      eircodeHelp.textContent = `${selectedCounty} Eircodes start with: ${allowedKeys.join(', ')} (e.g., ${examples})`;
    } else {
      eircodeHelp.textContent = 'Irish postal code (e.g., D02 XY45)';
    }
  }

  /**
   * Get current form data
   */
  getFormData(): Partial<InternalQuoteFormData> | null {
    const form = this.container.querySelector('.quote-form') as HTMLFormElement;
    if (!form) return null;

    const formData = new FormData(form);
    return {
      customer: {
        firstName: formData.get('firstName') as string || '',
        lastName: formData.get('lastName') as string || '',
        email: formData.get('email') as string || '',
        phone: `${formData.get('phonePrefix') || '+353'} ${formData.get('phone') || ''}`.trim(),
        address: formData.get('addressLine1') as string || '',
        city: formData.get('town') as string || '',
        county: formData.get('county') as string || '',
        eircode: formData.get('eircode') as string || ''
      },
      desiredInstallTimeframe: formData.get('timeframe') as string || '',
      configuration: this.configuration
    };
  }

  /**
   * Update configuration data
   */
  updateConfiguration(configuration: Partial<ConfiguratorState>): void {
    this.configuration = configuration;
    
    // Re-render pricing if shown
    if (this.options.showPricing) {
      const pricingSection = this.container.querySelector('.pricing-summary');
      if (pricingSection) {
        const estimate = this.calculateEstimate();
        pricingSection.innerHTML = this.renderPricingSummary(estimate).replace(/<div class="pricing-summary">|<\/div>$/g, '');
      }
    }
  }

  /**
   * Set form data (for restoring saved state)
   */
  setFormData(data: Partial<InternalQuoteFormData>): void {
    const form = this.container.querySelector('.quote-form') as HTMLFormElement;
    if (!form || !data.customer) return;

    const customer = data.customer;
    
    // Set form values
    const setFieldValue = (name: string, value: string) => {
      const field = form.querySelector(`[name="${name}"]`) as HTMLInputElement | HTMLSelectElement;
      if (field && value) {
        field.value = value;
      }
    };

    setFieldValue('firstName', customer.firstName);
    setFieldValue('lastName', customer.lastName);
    setFieldValue('email', customer.email);
    
    // Parse phone number back to prefix and number
    const phoneParts = customer.phone.split(' ', 2);
    if (phoneParts.length >= 2) {
      setFieldValue('phonePrefix', phoneParts[0]);
      setFieldValue('phone', phoneParts.slice(1).join(' '));
    }
    
    setFieldValue('addressLine1', customer.address);
    setFieldValue('town', customer.city);
    setFieldValue('county', customer.county);
    setFieldValue('eircode', customer.eircode);
    
    if (data.desiredInstallTimeframe) {
      setFieldValue('timeframe', data.desiredInstallTimeframe);
    }

    // Trigger validation
    this.updateFormValidity(form);
  }

  /**
   * Get current state
   */
  getState(): QuoteFormState {
    return { ...this.state };
  }

  /**
   * Check if form is valid
   */
  isValid(): boolean {
    return this.state.isValid;
  }
}

export default QuoteForm;