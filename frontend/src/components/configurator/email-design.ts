/**
 * Email Design component for the configurator
 * Allows users to email their design configuration to themselves or others
 */

import type { ProductConfiguration } from '../../lib/price.js';
import { submitContact } from '../../lib/api.js';

export interface EmailDesignOptions {
  container: HTMLElement;
  configuration: ProductConfiguration;
  onClose?: () => void;
}

export class EmailDesignComponent {
  private container: HTMLElement;
  private configuration: ProductConfiguration;
  private onClose: (() => void) | undefined;
  private isSubmitting = false;

  constructor(options: EmailDesignOptions) {
    this.container = options.container;
    this.configuration = options.configuration;
    this.onClose = options.onClose;
  }

  /**
   * Initialize the email design component
   */
  init(): void {
    this.render();
    this.attachEventListeners();
    
    // Focus on the email input
    const emailInput = this.container.querySelector('#email-design-email') as HTMLInputElement;
    if (emailInput) {
      emailInput.focus();
    }
  }

  /**
   * Render the email design form
   */
  private render(): void {
    const html = `
      <div class="email-design-overlay" data-action="close-overlay">
        <div class="email-design-modal" data-action="prevent-close">
          <div class="email-design-header">
            <h2>Email Your Design</h2>
            <button type="button" class="close-button" data-action="close" aria-label="Close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <div class="email-design-content">
            <p class="email-design-description">
              Send a snapshot of your current configuration to yourself or share it with others.
              This includes your size, options, and estimated pricing.
            </p>

            <form class="email-design-form" novalidate>
              <div class="form-group">
                <label for="email-design-email" class="form-label required">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email-design-email"
                  name="email"
                  class="form-input"
                  required
                  placeholder="your@email.com"
                  autocomplete="email"
                />
                <span class="field-error" data-field="email"></span>
              </div>

              <div class="form-group">
                <label for="email-design-name" class="form-label">
                  Your Name (optional)
                </label>
                <input
                  type="text"
                  id="email-design-name"
                  name="name"
                  class="form-input"
                  placeholder="Your name"
                  autocomplete="name"
                />
                <span class="field-error" data-field="name"></span>
              </div>

              <div class="form-group">
                <label for="email-design-message" class="form-label">
                  Add a message (optional)
                </label>
                <textarea
                  id="email-design-message"
                  name="message"
                  class="form-textarea"
                  rows="3"
                  placeholder="Any notes about your design..."
                ></textarea>
                <span class="field-error" data-field="message"></span>
              </div>

              <div class="design-preview">
                <h3>Configuration Summary</h3>
                ${this.renderConfigurationPreview()}
              </div>

              <div class="email-design-actions">
                <button type="button" class="btn btn-secondary" data-action="close">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary" data-action="send-email">
                  <span class="btn-text">Send Email</span>
                  <span class="btn-loading" style="display: none;">
                    <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-dasharray="32" stroke-dashoffset="32" opacity="0.3">
                        <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                      </circle>
                    </svg>
                    Sending...
                  </span>
                </button>
              </div>
            </form>

            <div class="email-success" style="display: none;">
              <div class="success-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <circle cx="24" cy="24" r="24" fill="#10B981"/>
                  <path d="M15 24L21 30L33 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h3>Email Sent!</h3>
              <p>Your design configuration has been sent to <span class="sent-email"></span></p>
              <button type="button" class="btn btn-primary" data-action="close">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  /**
   * Render a preview of the configuration
   */
  private renderConfigurationPreview(): string {
    const config = this.configuration;
    let html = '<div class="config-preview">';

    // Product type
    html += `<div class="preview-item">
      <strong>Product:</strong> ${this.formatProductType(config.productType)}
    </div>`;

    // Size
    if (config.size) {
      html += `<div class="preview-item">
        <strong>Size:</strong> ${config.size.widthM}m × ${config.size.depthM}m
      </div>`;
    }

    // Area
    const area = config.size ? config.size.widthM * config.size.depthM : 0;
    if (area > 0) {
      html += `<div class="preview-item">
        <strong>Floor area:</strong> ${area.toFixed(1)} m²
      </div>`;
    }

    // Glazing summary
    if (config.glazing) {
      const totalOpenings = config.glazing.windows.length + config.glazing.externalDoors.length + config.glazing.skylights.length;
      if (totalOpenings > 0) {
        html += `<div class="preview-item">
          <strong>Openings:</strong> ${config.glazing.externalDoors.length} doors, ${config.glazing.windows.length} windows
          ${config.glazing.skylights.length > 0 ? `, ${config.glazing.skylights.length} skylights` : ''}
        </div>`;
      }
    }

    // Bathroom
    if (config.bathroom && (config.bathroom.half > 0 || config.bathroom.threeQuarter > 0)) {
      const bathroomType = config.bathroom.threeQuarter > 0 ? 'Full bathroom' : 'Half bathroom';
      html += `<div class="preview-item">
        <strong>Bathroom:</strong> ${bathroomType}
      </div>`;
    }

    // Floor
    if (config.floor && config.floor.type !== 'none') {
      html += `<div class="preview-item">
        <strong>Flooring:</strong> ${this.formatFloorType(config.floor.type)}
      </div>`;
    }

    html += '</div>';
    return html;
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    // Close handlers
    const closeButtons = this.container.querySelectorAll('[data-action="close"], [data-action="close-overlay"]');
    closeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
          this.handleClose();
        }
      });
    });

    // Prevent modal close when clicking inside
    const modal = this.container.querySelector('[data-action="prevent-close"]');
    if (modal) {
      modal.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // Form submission
    const form = this.container.querySelector('.email-design-form') as HTMLFormElement;
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }

    // Escape key handler
    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.handleClose();
      }
    };
    
    document.addEventListener('keydown', escapeHandler);
    
    // Store the handler so we can remove it later
    (this.container as HTMLElement & { __escapeHandler?: (e: KeyboardEvent) => void }).__escapeHandler = escapeHandler;
  }

  /**
   * Handle form submission
   */
  private async handleSubmit(): Promise<void> {
    if (this.isSubmitting) return;

    const form = this.container.querySelector('.email-design-form') as HTMLFormElement;
    const formData = new FormData(form);
    
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const message = formData.get('message') as string;

    // Clear previous errors
    this.clearErrors();

    // Validate
    const errors = this.validateForm({ email, name, message });
    if (Object.keys(errors).length > 0) {
      this.displayErrors(errors);
      return;
    }

    // Set loading state
    this.setSubmittingState(true);

    try {
      // Prepare the email content
      const configSummary = this.generateConfigurationSummary();
      const fullMessage = `Design Configuration Request

${message ? `Message: ${message}\n\n` : ''}Configuration Details:
${configSummary}

This configuration was generated using the Strata Garden Rooms online configurator.`;

      // Submit via contact API
      await submitContact({
        name: name || 'Design Configuration Request',
        email: email,
        phone: '',
        message: fullMessage,
        source: 'email-design'
      });

      // Show success
      this.showSuccess(email);

    } catch (error) {
      console.error('Email design failed:', error);
      this.displayErrors({ general: 'Failed to send email. Please try again.' });
      this.setSubmittingState(false);
    }
  }

  /**
   * Validate the form
   */
  private validateForm(data: { email: string; name: string; message: string }): Record<string, string> {
    const errors: Record<string, string> = {};

    // Email validation
    if (!data.email) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }

    return errors;
  }

  /**
   * Generate a text summary of the configuration
   */
  private generateConfigurationSummary(): string {
    const config = this.configuration;
    let summary = '';

    summary += `Product Type: ${this.formatProductType(config.productType)}\n`;
    
    if (config.size) {
      const area = config.size.widthM * config.size.depthM;
      summary += `Size: ${config.size.widthM}m × ${config.size.depthM}m (${area.toFixed(1)} m²)\n`;
    }

    if (config.glazing) {
      summary += `Openings: ${config.glazing.externalDoors.length} doors, ${config.glazing.windows.length} windows`;
      if (config.glazing.skylights.length > 0) {
        summary += `, ${config.glazing.skylights.length} skylights`;
      }
      summary += '\n';
    }

    if (config.bathroom && (config.bathroom.half > 0 || config.bathroom.threeQuarter > 0)) {
      const bathroomType = config.bathroom.threeQuarter > 0 ? 'Full bathroom' : 'Half bathroom';
      summary += `Bathroom: ${bathroomType}\n`;
    }

    if (config.floor && config.floor.type !== 'none') {
      summary += `Flooring: ${this.formatFloorType(config.floor.type)} (${config.floor.areaSqM.toFixed(1)} m²)\n`;
    }

    if (config.cladding) {
      summary += `Cladding: ${config.cladding.areaSqm.toFixed(1)} m²\n`;
    }

    // Count extras
    const extrasCount = (config.extras?.espInsulation ? 1 : 0) + 
                       (config.extras?.render ? 1 : 0) + 
                       (config.extras?.steelDoor ? 1 : 0) + 
                       (config.extras?.other?.length || 0);
    
    if (extrasCount > 0) {
      summary += `Additional options: ${extrasCount} selected\n`;
    }

    return summary;
  }

  /**
   * Display form errors
   */
  private displayErrors(errors: Record<string, string>): void {
    Object.entries(errors).forEach(([field, message]) => {
      const errorElement = this.container.querySelector(`[data-field="${field}"]`) as HTMLElement;
      if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
      }
      
      // Add error class to input
      const input = this.container.querySelector(`[name="${field}"]`) as HTMLElement;
      if (input) {
        input.classList.add('error');
      }
    });
  }

  /**
   * Clear form errors
   */
  private clearErrors(): void {
    const errorElements = this.container.querySelectorAll('.field-error');
    errorElements.forEach(element => {
      (element as HTMLElement).style.display = 'none';
      (element as HTMLElement).textContent = '';
    });

    const inputs = this.container.querySelectorAll('.form-input, .form-textarea');
    inputs.forEach(input => {
      input.classList.remove('error');
    });
  }

  /**
   * Set submitting state
   */
  private setSubmittingState(submitting: boolean): void {
    this.isSubmitting = submitting;
    
    const button = this.container.querySelector('[data-action="send-email"]') as HTMLButtonElement;
    const buttonText = button.querySelector('.btn-text') as HTMLElement;
    const buttonLoading = button.querySelector('.btn-loading') as HTMLElement;
    
    if (submitting) {
      button.disabled = true;
      buttonText.style.display = 'none';
      buttonLoading.style.display = 'inline-flex';
    } else {
      button.disabled = false;
      buttonText.style.display = 'inline';
      buttonLoading.style.display = 'none';
    }
  }

  /**
   * Show success message
   */
  private showSuccess(email: string): void {
    const form = this.container.querySelector('.email-design-form') as HTMLElement;
    const success = this.container.querySelector('.email-success') as HTMLElement;
    const sentEmailSpan = success.querySelector('.sent-email') as HTMLElement;
    
    form.style.display = 'none';
    success.style.display = 'block';
    sentEmailSpan.textContent = email;
  }

  /**
   * Handle close
   */
  private handleClose(): void {
    if (this.onClose) {
      this.onClose();
    }
    this.destroy();
  }

  /**
   * Format product type for display
   */
  private formatProductType(productType: string): string {
    switch (productType) {
      case 'garden-room':
        return 'Garden Room';
      case 'house-extension':
        return 'House Extension';
      case 'house-build':
        return 'House Build';
      default:
        return productType;
    }
  }

  /**
   * Format floor type for display
   */
  private formatFloorType(floorType: string): string {
    switch (floorType) {
      case 'wooden':
        return 'Wooden Flooring';
      case 'tile':
        return 'Tile Flooring';
      case 'none':
        return 'No Flooring';
      default:
        return floorType;
    }
  }

  /**
   * Destroy the component
   */
  destroy(): void {
    // Remove escape key handler
    const containerWithHandler = this.container as HTMLElement & { __escapeHandler?: (e: KeyboardEvent) => void };
    const escapeHandler = containerWithHandler.__escapeHandler;
    if (escapeHandler) {
      document.removeEventListener('keydown', escapeHandler);
      delete containerWithHandler.__escapeHandler;
    }
    
    this.container.innerHTML = '';
  }
}