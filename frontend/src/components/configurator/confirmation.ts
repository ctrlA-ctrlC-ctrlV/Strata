/**
 * Confirmation step component for the configurator
 * Shows success message after quote submission with human-readable summary
 */

import type { QuoteSubmissionResponse } from './types.js';
import type { ProductConfiguration } from '../../lib/price.js';

export interface ConfirmationOptions {
  container: HTMLElement;
  quoteResponse: QuoteSubmissionResponse;
  configuration: ProductConfiguration;
  onStartNew?: () => void;
}

export class ConfirmationComponent {
  private container: HTMLElement;
  private quoteResponse: QuoteSubmissionResponse;
  private configuration: ProductConfiguration;
  private onStartNew: (() => void) | undefined;

  constructor(options: ConfirmationOptions) {
    this.container = options.container;
    this.quoteResponse = options.quoteResponse;
    this.configuration = options.configuration;
    this.onStartNew = options.onStartNew;
  }

  /**
   * Initialize the confirmation display
   */
  init(): void {
    this.render();
    this.attachEventListeners();
    
    // Scroll to top to show the confirmation
    this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Render the confirmation UI
   */
  private render(): void {
    const html = `
      <div class="confirmation-wrapper">
        <div class="confirmation-header">
          <div class="success-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="32" cy="32" r="32" fill="#10B981"/>
              <path d="M20 32L28 40L44 24" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h1>Quote Submitted Successfully!</h1>
          <p class="confirmation-subtitle">
            ${this.quoteResponse.quoteId ? `Your quote reference: <strong>${this.quoteResponse.quoteId}</strong>` : ''}
          </p>
        </div>

        <div class="confirmation-content">
          <div class="confirmation-message">
            <p>${this.quoteResponse.message}</p>
          </div>

          <div class="quote-summary-card">
            <h2>Your Configuration Summary</h2>
            ${this.renderConfigurationSummary()}
          </div>

          <div class="next-steps">
            <h3>What happens next?</h3>
            <ol class="next-steps-list">
              <li>
                <strong>Email Confirmation:</strong>
                You'll receive a detailed quote by email within 15 minutes
              </li>
              <li>
                <strong>Site Survey:</strong>
                We'll contact you within 24 hours to arrange a free site survey
              </li>
              <li>
                <strong>Final Quote:</strong>
                After the survey, you'll receive your final detailed quote
              </li>
            </ol>
          </div>

          <div class="confirmation-actions">
            <button type="button" class="btn btn-primary" data-action="start-new">
              Configure Another Quote
            </button>
            <button type="button" class="btn btn-secondary" data-action="print-summary">
              Print Summary
            </button>
          </div>
        </div>

        <div class="contact-info">
          <p>Questions? Contact us at <a href="mailto:quotes@stratagardenrooms.ie">quotes@stratagardenrooms.ie</a> or call <a href="tel:+353-1-234-5678">+353 1 234 5678</a></p>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  /**
   * Render a human-readable configuration summary
   */
  private renderConfigurationSummary(): string {
    const config = this.configuration;
    let html = '<div class="config-summary">';

    // Product type
    html += `<div class="summary-row">
      <span class="summary-label">Product:</span>
      <span class="summary-value">${this.formatProductType(config.productType)}</span>
    </div>`;

    // Size
    if (config.size) {
      html += `<div class="summary-row">
        <span class="summary-label">Size:</span>
        <span class="summary-value">${config.size.widthM}m × ${config.size.depthM}m</span>
      </div>`;
    }

    // Glazing (windows and doors)
    if (config.glazing) {
      const totalWindows = config.glazing.windows.length;
      const totalDoors = config.glazing.externalDoors.length;
      const totalSkylights = config.glazing.skylights.length;
      
      if (totalWindows > 0 || totalDoors > 0 || totalSkylights > 0) {
        html += `<div class="summary-row">
          <span class="summary-label">Openings:</span>
          <span class="summary-value">${totalDoors} door(s), ${totalWindows} window(s)${totalSkylights > 0 ? `, ${totalSkylights} skylight(s)` : ''}</span>
        </div>`;
      }
    }

    // Cladding
    if (config.cladding) {
      html += `<div class="summary-row">
        <span class="summary-label">Cladding:</span>
        <span class="summary-value">${config.cladding.areaSqm.toFixed(1)} m²</span>
      </div>`;
    }

    // Bathroom
    if (config.bathroom && (config.bathroom.half > 0 || config.bathroom.threeQuarter > 0)) {
      const bathroomType = config.bathroom.threeQuarter > 0 ? 'Full bathroom' : 'Half bathroom';
      html += `<div class="summary-row">
        <span class="summary-label">Bathroom:</span>
        <span class="summary-value">${bathroomType}</span>
      </div>`;
    }

    // Floor
    if (config.floor && config.floor.type !== 'none') {
      html += `<div class="summary-row">
        <span class="summary-label">Floor:</span>
        <span class="summary-value">${this.formatFloorType(config.floor.type)} (${config.floor.areaSqM.toFixed(1)} m²)</span>
      </div>`;
    }

    // Extras
    const extrasCount = (config.extras?.espInsulation ? 1 : 0) + 
                       (config.extras?.render ? 1 : 0) + 
                       (config.extras?.steelDoor ? 1 : 0) + 
                       (config.extras?.other?.length || 0);
    
    if (extrasCount > 0) {
      html += `<div class="summary-row">
        <span class="summary-label">Extras:</span>
        <span class="summary-value">${extrasCount} additional option(s)</span>
      </div>`;
    }

    html += '</div>';
    return html;
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
   * Attach event listeners
   */
  private attachEventListeners(): void {
    // Start new configuration
    const startNewBtn = this.container.querySelector('[data-action="start-new"]') as HTMLButtonElement;
    if (startNewBtn) {
      startNewBtn.addEventListener('click', () => {
        if (this.onStartNew) {
          this.onStartNew();
        }
      });
    }

    // Print summary
    const printBtn = this.container.querySelector('[data-action="print-summary"]') as HTMLButtonElement;
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        this.printSummary();
      });
    }
  }

  /**
   * Print the quote summary
   */
  private printSummary(): void {
    // Create a print-friendly version
    const printContent = `
      <html>
        <head>
          <title>Quote Summary - ${this.quoteResponse.quoteId || 'Strata Garden Rooms'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 40px; }
            .summary-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 5px 0; }
            .summary-label { font-weight: bold; }
            .summary-price { border-top: 1px solid #ccc; margin-top: 20px; padding-top: 10px; font-size: 1.2em; }
            .price { color: #059669; font-weight: bold; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Quote Summary</h1>
            ${this.quoteResponse.quoteId ? `<p>Reference: <strong>${this.quoteResponse.quoteId}</strong></p>` : ''}
            <p>Date: ${new Date().toLocaleDateString('en-IE')}</p>
          </div>
          ${this.renderConfigurationSummary()}
          <div class="footer" style="margin-top: 40px; text-align: center; color: #666;">
            <p>This is an estimate only. Final pricing subject to site survey.</p>
            <p>Strata Garden Rooms | quotes@stratagardenrooms.ie | +353 1 234 5678</p>
          </div>
        </body>
      </html>
    `;

    // Open print dialog
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  }

  /**
   * Destroy the component
   */
  destroy(): void {
    this.container.innerHTML = '';
  }
}