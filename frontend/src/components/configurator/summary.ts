/**
 * Configuration Summary Component
 * Displays a comprehensive summary of all configuration choices before quote submission
 */

import type { ConfiguratorState, StepName } from './index.ts';
import { formatPrice } from '../../lib/price.ts';

export interface SummaryData {
  configuration: Partial<ConfiguratorState>;
  priceEstimate: {
    subtotal: number;
    vat: number;
    total: number;
  };
  isVatIncluded: boolean;
}

export interface SummaryOptions {
  showEditButtons: boolean;
  showPricing: boolean;
  compactMode: boolean;
}

export class ConfigurationSummary {
  private container: HTMLElement;
  private data: SummaryData;
  private options: SummaryOptions;
  private onEditCallback?: (stepId: StepName) => void;

  constructor(
    container: HTMLElement, 
    data: SummaryData, 
    options: Partial<SummaryOptions> = {}
  ) {
    this.container = container;
    this.data = data;
    this.options = {
      showEditButtons: true,
      showPricing: true,
      compactMode: false,
      ...options
    };

    this.render();
  }

  /**
   * Update summary with new data
   */
  updateSummary(data: SummaryData): void {
    this.data = data;
    this.render();
  }

  /**
   * Set callback for edit button clicks
   */
  onEdit(callback: (stepId: StepName) => void): void {
    this.onEditCallback = callback;
  }

  /**
   * Render the complete summary
   */
  private render(): void {

    this.container.innerHTML = `
      <div class="config-summary" role="region" aria-label="Configuration Summary">
        <h2 class="summary-title">Your Garden Room Configuration</h2>
        
        ${this.renderDimensions()}
        ${this.renderOpenings()}
        ${this.renderCladding()}
        ${this.renderBathroom()}
        ${this.renderFlooring()}
        ${this.renderExtras()}
        ${this.options.showPricing ? this.renderPricing() : ''}
        
        <div class="summary-actions">
          ${this.renderActionButtons()}
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  /**
   * Render size and dimensions section
   */
  private renderDimensions(): string {
    const sizeConfig = this.data.configuration.size;
    if (!sizeConfig) return '';

    const width = (sizeConfig.widthMm / 1000).toFixed(1);
    const depth = (sizeConfig.depthMm / 1000).toFixed(1);
    const area = ((sizeConfig.widthMm * sizeConfig.depthMm) / 1_000_000).toFixed(1);

    return `
      <div class="summary-section">
        <div class="summary-section-header">
          <h3>Size & Dimensions</h3>
          ${this.renderEditButton('size')}
        </div>
        <div class="summary-content">
          <div class="dimension-grid">
            <div class="dimension-item">
              <span class="dimension-label">Width:</span>
              <span class="dimension-value">${width}m</span>
            </div>
            <div class="dimension-item">
              <span class="dimension-label">Depth:</span>
              <span class="dimension-value">${depth}m</span>
            </div>
            <div class="dimension-item dimension-total">
              <span class="dimension-label">Floor Area:</span>
              <span class="dimension-value">${area}m²</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render windows and doors section
   */
  private renderOpenings(): string {
    const openingsConfig = this.data.configuration.openings;
    if (!openingsConfig) return '';

    const windowCount = openingsConfig.windows?.length || 0;
    const doorCount = openingsConfig.externalDoors?.length || 0;
    const skylightCount = openingsConfig.skylights?.length || 0;

    return `
      <div class="summary-section">
        <div class="summary-section-header">
          <h3>Windows & Doors</h3>
          ${this.renderEditButton('openings')}
        </div>
        <div class="summary-content">
          <div class="openings-summary">
            <div class="opening-count">
              <span class="count-number">${windowCount}</span>
              <span class="count-label">Window${windowCount !== 1 ? 's' : ''}</span>
            </div>
            <div class="opening-count">
              <span class="count-number">${doorCount}</span>
              <span class="count-label">Door${doorCount !== 1 ? 's' : ''}</span>
            </div>
            <div class="opening-count">
              <span class="count-number">${skylightCount}</span>
              <span class="count-label">Skylight${skylightCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
          ${this.renderOpeningDetails()}
        </div>
      </div>
    `;
  }

  /**
   * Render detailed opening information
   */
  private renderOpeningDetails(): string {
    const openingsConfig = this.data.configuration.openings;
    if (!openingsConfig) return '';

    let details = '';

    // Windows
    if (openingsConfig.windows && openingsConfig.windows.length > 0) {
      details += '<div class="opening-details">';
      details += '<h4>Windows:</h4>';
      details += '<ul class="opening-list">';
      openingsConfig.windows.forEach((window, index) => {
        const width = (window.widthMm / 1000).toFixed(1);
        const height = (window.heightMm / 1000).toFixed(1);
        details += `<li>Window ${index + 1}: ${width}m × ${height}m</li>`;
      });
      details += '</ul></div>';
    }

    // External Doors
    if (openingsConfig.externalDoors && openingsConfig.externalDoors.length > 0) {
      details += '<div class="opening-details">';
      details += '<h4>Doors:</h4>';
      details += '<ul class="opening-list">';
      openingsConfig.externalDoors.forEach((door, index) => {
        const width = (door.widthMm / 1000).toFixed(1);
        const height = (door.heightMm / 1000).toFixed(1);
        details += `<li>Door ${index + 1}: ${width}m × ${height}m</li>`;
      });
      details += '</ul></div>';
    }

    // Skylights
    if (openingsConfig.skylights && openingsConfig.skylights.length > 0) {
      details += '<div class="opening-details">';
      details += '<h4>Skylights:</h4>';
      details += '<ul class="opening-list">';
      openingsConfig.skylights.forEach((skylight, index) => {
        const width = (skylight.widthMm / 1000).toFixed(1);
        const height = (skylight.heightMm / 1000).toFixed(1);
        details += `<li>Skylight ${index + 1}: ${width}m × ${height}m</li>`;
      });
      details += '</ul></div>';
    }

    return details;
  }

  /**
   * Render cladding section
   */
  private renderCladding(): string {
    const claddingConfig = this.data.configuration.cladding;
    if (!claddingConfig) return '';

    const materialLabel = this.getCladdingMaterialLabel(claddingConfig.material);
    const colorLabel = this.getCladdingColorLabel(claddingConfig.color);

    return `
      <div class="summary-section">
        <div class="summary-section-header">
          <h3>Cladding & Exterior</h3>
          ${this.renderEditButton('cladding')}
        </div>
        <div class="summary-content">
          <div class="cladding-choice">
            <div class="choice-item">
              <span class="choice-label">Material:</span>
              <span class="choice-value">${materialLabel}</span>
            </div>
            <div class="choice-item">
              <span class="choice-label">Color:</span>
              <span class="choice-value">${colorLabel}</span>
            </div>
            <div class="choice-item">
              <span class="choice-label">Area:</span>
              <span class="choice-value">${claddingConfig.areaSqm}m²</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render bathroom section
   */
  private renderBathroom(): string {
    const bathroomConfig = this.data.configuration.bathroom;
    if (!bathroomConfig) return '';

    const typeLabel = this.getBathroomTypeLabel(bathroomConfig.type);
    const countLabel = bathroomConfig.count > 1 ? `${bathroomConfig.count} bathrooms` : '1 bathroom';

    return `
      <div class="summary-section">
        <div class="summary-section-header">
          <h3>Bathroom Options</h3>
          ${this.renderEditButton('bathroom')}
        </div>
        <div class="summary-content">
          <div class="bathroom-features">
            <div class="choice-item">
              <span class="choice-label">Type:</span>
              <span class="choice-value">${typeLabel}</span>
            </div>
            ${bathroomConfig.count > 0 ? `
            <div class="choice-item">
              <span class="choice-label">Count:</span>
              <span class="choice-value">${countLabel}</span>
            </div>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render flooring section
   */
  private renderFlooring(): string {
    const floorConfig = this.data.configuration.floor;
    if (!floorConfig) return '';

    const typeLabel = this.getFloorTypeLabel(floorConfig.type);

    return `
      <div class="summary-section">
        <div class="summary-section-header">
          <h3>Flooring</h3>
          ${this.renderEditButton('floor')}
        </div>
        <div class="summary-content">
          <div class="floor-choice">
            <div class="choice-item">
              <span class="choice-label">Type:</span>
              <span class="choice-value">${typeLabel}</span>
            </div>
            <div class="choice-item">
              <span class="choice-label">Area:</span>
              <span class="choice-value">${floorConfig.areaSqm}m²</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render extras section
   */
  private renderExtras(): string {
    const extrasConfig = this.data.configuration.extras;
    if (!extrasConfig) return '';

    const allExtras = [...extrasConfig.selectedExtras, ...extrasConfig.customExtras];
    const totalExtrasValue = allExtras.reduce((sum, extra) => sum + (extra.priceIncVat * extra.quantity), 0);

    return `
      <div class="summary-section">
        <div class="summary-section-header">
          <h3>Extras & Add-ons</h3>
          ${this.renderEditButton('extras')}
        </div>
        <div class="summary-content">
          <div class="extras-list">
            ${allExtras.length > 0
              ? `<ul class="extra-items">${allExtras.map(extra => 
                  `<li>${extra.title} (${extra.quantity} ${extra.unit}) - ${formatPrice(extra.priceIncVat * extra.quantity)}</li>`
                ).join('')}</ul>
                <div class="extras-total">
                  <strong>Total Extras: ${formatPrice(totalExtrasValue)}</strong>
                </div>`
              : '<p class="no-extras">No additional extras selected</p>'
            }
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render pricing section
   */
  private renderPricing(): string {
    const { priceEstimate, isVatIncluded } = this.data;

    return `
      <div class="summary-section summary-pricing">
        <div class="summary-section-header">
          <h3>Price Estimate</h3>
        </div>
        <div class="summary-content">
          <div class="price-breakdown">
            <div class="price-row">
              <span class="price-label">Subtotal:</span>
              <span class="price-value">${formatPrice(priceEstimate.subtotal)}</span>
            </div>
            <div class="price-row">
              <span class="price-label">VAT (23%):</span>
              <span class="price-value">${formatPrice(priceEstimate.vat)}</span>
            </div>
            <div class="price-row price-total">
              <span class="price-label">Total ${isVatIncluded ? '(Inc. VAT)' : '(Ex. VAT)'}:</span>
              <span class="price-value price-total-amount">${formatPrice(priceEstimate.total)}</span>
            </div>
          </div>
          <p class="price-disclaimer">
            *This is an indicative price estimate. Final pricing will be confirmed in your personalized quote.
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Render edit button for a section
   */
  private renderEditButton(stepId: StepName): string {
    if (!this.options.showEditButtons) return '';

    return `
      <button type="button" 
              class="edit-section-btn" 
              data-step="${stepId}"
              aria-label="Edit ${stepId} configuration">
        <svg class="edit-icon" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
        Edit
      </button>
    `;
  }

  /**
   * Render action buttons
   */
  private renderActionButtons(): string {
    return `
      <button type="button" class="btn btn-primary btn-continue">
        Continue to Quote
        <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    `;
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    // Edit button listeners
    if (this.options.showEditButtons && this.onEditCallback) {
      const editButtons = this.container.querySelectorAll('.edit-section-btn');
      editButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const stepId = (e.target as HTMLElement)?.closest('.edit-section-btn')?.getAttribute('data-step') as StepName;
          if (stepId && this.onEditCallback) {
            this.onEditCallback(stepId);
          }
        });
      });
    }

    // Continue button listener  
    const continueBtn = this.container.querySelector('.btn-continue');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        // Dispatch custom event for parent to handle
        this.container.dispatchEvent(new CustomEvent('summary:continue', {
          bubbles: true,
          detail: { data: this.data }
        }));
      });
    }
  }

  // Label mapping methods
  private getCladdingMaterialLabel(material: string): string {
    const labels: Record<string, string> = {
      'timber': 'Natural Timber',
      'composite': 'Composite Cladding', 
      'render': 'Render Finish',
      'brick': 'Brick Effect',
      'metal': 'Metal Cladding',
      'stone': 'Natural Stone'
    };
    return labels[material] || material;
  }

  private getCladdingColorLabel(color: string): string {
    const labels: Record<string, string> = {
      'charcoal': 'Charcoal',
      'sage-green': 'Sage Green',
      'cream': 'Cream', 
      'natural-oak': 'Natural Oak',
      'anthracite': 'Anthracite',
      'white': 'White'
    };
    return labels[color] || color;
  }

  private getBathroomTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'none': 'No Bathroom',
      'half': 'Half Bath (Toilet & Sink)',
      'three-quarter': '3/4 Bath (Toilet, Sink & Shower)'
    };
    return labels[type] || type;
  }

  private getFloorTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'none': 'No Flooring',
      'wooden': 'Wooden Flooring',
      'tile': 'Tile Flooring'
    };
    return labels[type] || type;
  }
}

/**
 * Utility function to create summary from configuration state
 */
export function createSummaryData(
  configuration: Partial<ConfiguratorState>,
  priceEstimate: { subtotal: number; vat: number; total: number },
  isVatIncluded: boolean
): SummaryData {
  return {
    configuration,
    priceEstimate,
    isVatIncluded
  };
}

/**
 * CSS Styles for Configuration Summary
 */
export const SUMMARY_STYLES = `
.config-summary {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.summary-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 2rem;
  text-align: center;
}

.summary-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.summary-section:last-of-type {
  border-bottom: none;
}

.summary-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.summary-section-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.edit-section-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-section-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.edit-icon {
  width: 1rem;
  height: 1rem;
}

.dimension-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.dimension-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 6px;
}

.dimension-total {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  font-weight: 600;
}

.dimension-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.dimension-value {
  color: #1f2937;
  font-weight: 500;
}

.openings-summary {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}

.opening-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  min-width: 100px;
}

.count-number {
  font-size: 2rem;
  font-weight: 700;
  color: #2563eb;
}

.count-label {
  font-size: 0.875rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.opening-details {
  margin-top: 1rem;
}

.opening-details h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.opening-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.opening-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
  color: #6b7280;
}

.cladding-choice,
.floor-choice {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.choice-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 6px;
}

.choice-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.choice-value {
  color: #1f2937;
  font-weight: 500;
}

.bathroom-features,
.extras-list {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 6px;
}

.feature-list,
.extra-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li,
.extra-items li {
  padding: 0.5rem 0;
  color: #374151;
  position: relative;
  padding-left: 1.5rem;
}

.feature-list li::before,
.extra-items li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: #10b981;
  font-weight: bold;
}

.no-features,
.no-extras {
  color: #6b7280;
  font-style: italic;
  margin: 0;
}

.summary-pricing {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 1.5rem;
}

.price-breakdown {
  margin-bottom: 1rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e0e7ff;
}

.price-row:last-child {
  border-bottom: none;
}

.price-total {
  border-top: 2px solid #3b82f6;
  margin-top: 0.5rem;
  padding-top: 1rem;
  font-weight: 600;
  font-size: 1.125rem;
}

.price-label {
  color: #374151;
}

.price-value {
  color: #1f2937;
  font-weight: 500;
}

.price-total-amount {
  color: #2563eb;
  font-weight: 700;
}

.price-disclaimer {
  font-size: 0.875rem;
  color: #6b7280;
  font-style: italic;
  margin: 0;
  text-align: center;
}

.summary-actions {
  margin-top: 2rem;
  text-align: center;
}

.btn-continue {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-continue:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.btn-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .config-summary {
    padding: 1rem;
    margin: 1rem;
  }
  
  .summary-title {
    font-size: 1.5rem;
  }
  
  .dimension-grid {
    grid-template-columns: 1fr;
  }
  
  .openings-summary {
    flex-direction: column;
    gap: 1rem;
  }
  
  .cladding-choice,
  .floor-choice {
    grid-template-columns: 1fr;
  }
  
  .summary-section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

/* Focus and accessibility */
.edit-section-btn:focus,
.btn-continue:focus {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* Print styles */
@media print {
  .edit-section-btn,
  .summary-actions {
    display: none;
  }
  
  .config-summary {
    box-shadow: none;
    padding: 1rem;
  }
}
`;