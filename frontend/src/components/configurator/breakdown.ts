/**
 * Price Breakdown Component
 * Provides gated price breakdown with lead capture form
 */

export interface PriceBreakdown {
  subtotal: number;
  vatAmount: number;
  vatRate: number;
  total: number;
  items: PriceBreakdownItem[];
  discounts?: PriceDiscount[];
}

export interface PriceBreakdownItem {
  category: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit?: string;
  notes?: string;
}

export interface PriceDiscount {
  description: string;
  amount: number;
  type: 'fixed' | 'percentage';
}

export interface LeadCaptureData {
  name: string;
  email: string;
  phone?: string | undefined;
  postcode: string;
  interest: 'immediate' | 'exploring' | 'future';
}

export interface BreakdownOptions {
  showDetailedItems: boolean;
  requireCapture: boolean;
  captureTitle?: string;
  captureMessage?: string;
  onCaptureComplete?: (data: LeadCaptureData) => void;
  onBreakdownRevealed?: () => void;
}

/**
 * Gated price breakdown component
 */
export class PriceBreakdownComponent {
  private container: HTMLElement;
  private breakdown: PriceBreakdown;
  private options: BreakdownOptions;
  private isRevealed = false;

  constructor(
    container: HTMLElement, 
    breakdown: PriceBreakdown,
    options: BreakdownOptions = {
      showDetailedItems: true,
      requireCapture: true
    }
  ) {
    this.container = container;
    this.breakdown = breakdown;
    this.options = {
      captureTitle: 'Get Detailed Pricing',
      captureMessage: 'Enter your details to see the full price breakdown and receive a personalized quote.',
      ...options
    };

    this.render();
    this.bindEvents();
  }

  /**
   * Update the breakdown data
   */
  public updateBreakdown(breakdown: PriceBreakdown): void {
    this.breakdown = breakdown;
    if (this.isRevealed) {
      this.renderBreakdown();
    } else {
      this.renderSummary();
    }
  }

  /**
   * Force reveal without capture (for already qualified leads)
   */
  public revealBreakdown(): void {
    if (!this.isRevealed) {
      this.isRevealed = true;
      this.renderBreakdown();
      this.options.onBreakdownRevealed?.();
    }
  }

  /**
   * Render the component
   */
  private render(): void {
    if (this.options.requireCapture && !this.isRevealed) {
      this.renderCaptureGate();
    } else {
      this.renderBreakdown();
    }
  }

  /**
   * Render the capture gate with summary pricing
   */
  private renderCaptureGate(): void {
    this.container.innerHTML = `
      <div class="price-breakdown-gate">
        <div class="price-summary">
          ${this.renderSummary()}
        </div>
        
        <div class="capture-form-container">
          <div class="capture-header">
            <h3 class="capture-title">${this.options.captureTitle}</h3>
            <p class="capture-message">${this.options.captureMessage}</p>
          </div>
          
          <form class="capture-form" novalidate>
            <div class="form-row">
              <div class="form-field">
                <label for="capture-name">Full Name *</label>
                <input 
                  type="text" 
                  id="capture-name" 
                  name="name" 
                  required 
                  autocomplete="name"
                  aria-describedby="name-error"
                />
                <div class="field-error" id="name-error" role="alert"></div>
              </div>
              
              <div class="form-field">
                <label for="capture-email">Email Address *</label>
                <input 
                  type="email" 
                  id="capture-email" 
                  name="email" 
                  required 
                  autocomplete="email"
                  aria-describedby="email-error"
                />
                <div class="field-error" id="email-error" role="alert"></div>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-field">
                <label for="capture-phone">Phone Number</label>
                <input 
                  type="tel" 
                  id="capture-phone" 
                  name="phone" 
                  autocomplete="tel"
                  placeholder="Optional"
                />
              </div>
              
              <div class="form-field">
                <label for="capture-postcode">Postcode *</label>
                <input 
                  type="text" 
                  id="capture-postcode" 
                  name="postcode" 
                  required 
                  autocomplete="postal-code"
                  pattern="[A-Za-z]{1,2}[0-9Rr][0-9A-Za-z]? [0-9][ABD-HJLNP-UW-Zabd-hjlnp-uw-z]{2}"
                  aria-describedby="postcode-error"
                />
                <div class="field-error" id="postcode-error" role="alert"></div>
              </div>
            </div>
            
            <div class="form-field">
              <label for="capture-interest">Project Timeline</label>
              <select id="capture-interest" name="interest" required>
                <option value="">Please select...</option>
                <option value="immediate">Ready to start (0-3 months)</option>
                <option value="exploring">Exploring options (3-12 months)</option>
                <option value="future">Future project (12+ months)</option>
              </select>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-primary capture-submit">
                View Detailed Breakdown
              </button>
            </div>
            
            <p class="privacy-note">
              Your information is secure and will only be used to provide your quote. 
              We won't share your details or send unwanted emails.
            </p>
          </form>
        </div>
      </div>
    `;
  }

  /**
   * Render price summary (teaser)
   */
  private renderSummary(): string {
    const { subtotal, vatAmount, total } = this.breakdown;
    
    return `
      <div class="price-summary-content">
        <div class="summary-header">
          <h3>Estimated Investment</h3>
        </div>
        
        <div class="price-display">
          <div class="price-line">
            <span class="price-label">Subtotal (ex VAT)</span>
            <span class="price-value">£${subtotal.toLocaleString()}</span>
          </div>
          <div class="price-line">
            <span class="price-label">VAT (${(this.breakdown.vatRate * 100)}%)</span>
            <span class="price-value">£${vatAmount.toLocaleString()}</span>
          </div>
          <div class="price-line price-total">
            <span class="price-label">Total Investment</span>
            <span class="price-value">£${total.toLocaleString()}</span>
          </div>
        </div>
        
        <div class="breakdown-teaser">
          <p>This includes ${this.breakdown.items.length} components and services.</p>
          <p class="breakdown-note">
            Complete the form to see the full itemized breakdown and receive 
            a personalized quote with optional upgrades.
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Render full breakdown
   */
  private renderBreakdown(): void {
    const { subtotal, vatAmount, total, items, discounts } = this.breakdown;
    
    this.container.innerHTML = `
      <div class="price-breakdown-full">
        <div class="breakdown-header">
          <h3>Detailed Price Breakdown</h3>
          <p>Your personalized quote breakdown</p>
        </div>
        
        ${this.options.showDetailedItems ? this.renderDetailedItems(items) : ''}
        
        <div class="breakdown-summary">
          <div class="summary-calculations">
            <div class="calc-line">
              <span class="calc-label">Subtotal</span>
              <span class="calc-value">£${subtotal.toLocaleString()}</span>
            </div>
            
            ${discounts && discounts.length > 0 ? this.renderDiscounts(discounts) : ''}
            
            <div class="calc-line">
              <span class="calc-label">VAT (${(this.breakdown.vatRate * 100)}%)</span>
              <span class="calc-value">£${vatAmount.toLocaleString()}</span>
            </div>
            
            <div class="calc-line calc-total">
              <span class="calc-label">Total Investment</span>
              <span class="calc-value">£${total.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div class="breakdown-notes">
          <h4>Important Notes</h4>
          <ul>
            <li>Prices are estimates based on your configuration</li>
            <li>Final pricing may vary based on site conditions and specific requirements</li>
            <li>Installation and delivery charges may apply</li>
            <li>Prices are valid for 30 days from quote date</li>
          </ul>
        </div>
        
        <div class="breakdown-actions">
          <button class="btn btn-primary btn-large" type="button" id="proceed-to-quote">
            Proceed to Full Quote
          </button>
          <button class="btn btn-secondary" type="button" id="email-breakdown">
            Email This Breakdown
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Render detailed line items
   */
  private renderDetailedItems(items: PriceBreakdownItem[]): string {
    const categorized = this.categorizeItems(items);
    
    return `
      <div class="breakdown-items">
        ${Object.entries(categorized).map(([category, categoryItems]) => `
          <div class="item-category">
            <h4 class="category-title">${category}</h4>
            <div class="category-items">
              ${categoryItems.map(item => `
                <div class="breakdown-item">
                  <div class="item-description">
                    <span class="item-name">${item.description}</span>
                    ${item.notes ? `<small class="item-notes">${item.notes}</small>` : ''}
                  </div>
                  <div class="item-quantity">
                    ${item.quantity} ${item.unit || 'item(s)'}
                  </div>
                  <div class="item-unit-price">
                    £${item.unitPrice.toLocaleString()}
                  </div>
                  <div class="item-total-price">
                    £${item.totalPrice.toLocaleString()}
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="category-subtotal">
              <span class="subtotal-label">${category} Subtotal:</span>
              <span class="subtotal-value">£${categoryItems.reduce((sum, item) => sum + item.totalPrice, 0).toLocaleString()}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Render discounts
   */
  private renderDiscounts(discounts: PriceDiscount[]): string {
    return discounts.map(discount => `
      <div class="calc-line calc-discount">
        <span class="calc-label">${discount.description}</span>
        <span class="calc-value">-£${discount.amount.toLocaleString()}</span>
      </div>
    `).join('');
  }

  /**
   * Categorize items by category
   */
  private categorizeItems(items: PriceBreakdownItem[]): Record<string, PriceBreakdownItem[]> {
    return items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, PriceBreakdownItem[]>);
  }

  /**
   * Bind event handlers
   */
  private bindEvents(): void {
    // Handle capture form submission
    const captureForm = this.container.querySelector('.capture-form') as HTMLFormElement;
    if (captureForm) {
      captureForm.addEventListener('submit', (e) => this.handleCaptureSubmit(e));
      
      // Real-time validation
      const inputs = captureForm.querySelectorAll('input, select');
      inputs.forEach(input => {
        input.addEventListener('blur', () => this.validateField(input as HTMLInputElement));
        input.addEventListener('input', () => this.clearFieldError(input as HTMLInputElement));
      });
    }

    // Handle breakdown actions
    const proceedBtn = this.container.querySelector('#proceed-to-quote');
    const emailBtn = this.container.querySelector('#email-breakdown');

    proceedBtn?.addEventListener('click', () => {
      // Dispatch custom event for parent to handle
      this.container.dispatchEvent(new CustomEvent('proceedToQuote', {
        bubbles: true,
        detail: { breakdown: this.breakdown }
      }));
    });

    emailBtn?.addEventListener('click', () => {
      // Dispatch custom event for parent to handle
      this.container.dispatchEvent(new CustomEvent('emailBreakdown', {
        bubbles: true,
        detail: { breakdown: this.breakdown }
      }));
    });
  }

  /**
   * Handle capture form submission
   */
  private handleCaptureSubmit(e: Event): void {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Validate form
    if (!this.validateForm(form)) {
      return;
    }

    const phoneValue = formData.get('phone') as string;
    const captureData: LeadCaptureData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: phoneValue && phoneValue.trim() ? phoneValue : undefined,
      postcode: formData.get('postcode') as string,
      interest: formData.get('interest') as LeadCaptureData['interest']
    };

    // Disable form during submission
    const submitBtn = form.querySelector('.capture-submit') as HTMLButtonElement;
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';

    // Handle capture completion
    Promise.resolve(this.options.onCaptureComplete?.(captureData))
      .then(() => {
        this.isRevealed = true;
        this.renderBreakdown();
        this.options.onBreakdownRevealed?.();
      })
      .catch((error) => {
        console.error('Capture form submission failed:', error);
        // Show error message
        this.showFormError('Failed to process your request. Please try again.');
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      });
  }

  /**
   * Validate entire form
   */
  private validateForm(form: HTMLFormElement): boolean {
    const inputs = form.querySelectorAll('input[required], select[required]') as NodeListOf<HTMLInputElement>;
    let isValid = true;

    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * Validate individual field
   */
  private validateField(field: HTMLInputElement): boolean {
    const value = field.value.trim();
    const fieldName = field.name;
    let error = '';

    // Clear previous error
    this.clearFieldError(field);

    // Required field validation
    if (field.required && !value) {
      error = 'This field is required';
    }
    // Email validation
    else if (fieldName === 'email' && value && !this.isValidEmail(value)) {
      error = 'Please enter a valid email address';
    }
    // Postcode validation
    else if (fieldName === 'postcode' && value && !this.isValidPostcode(value)) {
      error = 'Please enter a valid UK postcode';
    }

    if (error) {
      this.showFieldError(field, error);
      return false;
    }

    return true;
  }

  /**
   * Show field error
   */
  private showFieldError(field: HTMLInputElement, message: string): void {
    field.classList.add('field-invalid');
    field.setAttribute('aria-invalid', 'true');
    
    const errorElement = document.getElementById(`${field.name}-error`);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  /**
   * Clear field error
   */
  private clearFieldError(field: HTMLInputElement): void {
    field.classList.remove('field-invalid');
    field.setAttribute('aria-invalid', 'false');
    
    const errorElement = document.getElementById(`${field.name}-error`);
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }

  /**
   * Show general form error
   */
  private showFormError(message: string): void {
    // Remove existing error
    const existingError = this.container.querySelector('.form-error');
    if (existingError) {
      existingError.remove();
    }

    // Add new error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.setAttribute('role', 'alert');
    errorDiv.textContent = message;

    const form = this.container.querySelector('.capture-form');
    if (form) {
      form.insertBefore(errorDiv, form.firstChild);
    }
  }

  /**
   * Email validation
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * UK postcode validation
   */
  private isValidPostcode(postcode: string): boolean {
    const postcodeRegex = /^[A-Za-z]{1,2}[0-9Rr][0-9A-Za-z]? [0-9][ABD-HJLNP-UW-Zabd-hjlnp-uw-z]{2}$/;
    return postcodeRegex.test(postcode);
  }
}

/**
 * CSS Styles for price breakdown component
 */
export const PRICE_BREAKDOWN_STYLES = `
.price-breakdown-gate {
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.price-summary {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  padding: 2rem;
}

.price-summary-content .summary-header h3 {
  margin: 0 0 1rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.price-display .price-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 1.125rem;
}

.price-display .price-total {
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  padding-top: 0.75rem;
  margin-top: 0.75rem;
  font-weight: 600;
  font-size: 1.25rem;
}

.breakdown-teaser {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}

.breakdown-teaser p {
  margin: 0 0 0.5rem;
  opacity: 0.9;
}

.capture-form-container {
  padding: 2rem;
}

.capture-header {
  text-align: center;
  margin-bottom: 2rem;
}

.capture-title {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}

.capture-message {
  margin: 0;
  color: #6b7280;
  line-height: 1.6;
}

.capture-form .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.capture-form .form-field {
  margin-bottom: 1rem;
}

.capture-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.capture-form input,
.capture-form select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.capture-form input:focus,
.capture-form select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.capture-form input.field-invalid {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.field-error {
  display: none;
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-error {
  background: #fef2f2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  border-left: 4px solid #ef4444;
}

.form-actions {
  margin-top: 1.5rem;
}

.capture-submit {
  width: 100%;
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.capture-submit:hover:not(:disabled) {
  background: #1d4ed8;
}

.capture-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.privacy-note {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
  line-height: 1.5;
}

/* Full breakdown styles */
.price-breakdown-full {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.breakdown-header {
  background: #f8f9fa;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.breakdown-header h3 {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}

.breakdown-header p {
  margin: 0;
  color: #6b7280;
}

.breakdown-items {
  padding: 1.5rem 2rem;
}

.item-category {
  margin-bottom: 2rem;
}

.category-title {
  margin: 0 0 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.breakdown-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
  align-items: center;
}

.item-description .item-name {
  font-weight: 500;
  color: #111827;
}

.item-description .item-notes {
  display: block;
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.item-quantity,
.item-unit-price,
.item-total-price {
  text-align: right;
  font-weight: 500;
}

.item-total-price {
  color: #059669;
  font-weight: 600;
}

.category-subtotal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  margin-top: 0.75rem;
  border-top: 1px solid #d1d5db;
  font-weight: 600;
  color: #374151;
}

.breakdown-summary {
  padding: 1.5rem 2rem;
  background: #f8f9fa;
  border-top: 1px solid #e5e7eb;
}

.summary-calculations .calc-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 1.125rem;
}

.summary-calculations .calc-total {
  border-top: 2px solid #374151;
  padding-top: 0.75rem;
  margin-top: 0.75rem;
  font-weight: 600;
  font-size: 1.25rem;
  color: #059669;
}

.calc-discount {
  color: #dc2626;
}

.breakdown-notes {
  padding: 1.5rem 2rem;
  background: #fffbeb;
  border-top: 1px solid #fbbf24;
}

.breakdown-notes h4 {
  margin: 0 0 1rem;
  color: #92400e;
}

.breakdown-notes ul {
  margin: 0;
  padding-left: 1.25rem;
  color: #92400e;
}

.breakdown-notes li {
  margin-bottom: 0.5rem;
}

.breakdown-actions {
  padding: 1.5rem 2rem;
  background: #f8f9fa;
  display: flex;
  gap: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  text-decoration: none;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.btn-primary:hover {
  background: #1d4ed8;
  border-color: #1d4ed8;
}

.btn-secondary {
  background: white;
  color: #374151;
  border-color: #d1d5db;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

/* Mobile styles */
@media (max-width: 768px) {
  .capture-form .form-row {
    grid-template-columns: 1fr;
  }
  
  .breakdown-item {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    text-align: left;
  }
  
  .item-quantity,
  .item-unit-price,
  .item-total-price {
    text-align: left;
  }
  
  .breakdown-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .price-summary {
    background: black;
    color: white;
    border: 2px solid white;
  }
  
  .price-breakdown-full {
    border: 2px solid black;
  }
}
`;