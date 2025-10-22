/**
 * Summary Step Component
 * Displays comprehensive configuration summary before quote submission
 */

import type { ConfiguratorState, StepName } from './index.js';
import { ConfigurationSummary, createSummaryData, SUMMARY_STYLES, type SummaryData } from './summary.js';
import { calculatePriceEstimate } from '../../lib/price.js';

export interface SummaryStepState {
  isValid: boolean;
  errors: string[];
}

export class SummaryStep {
  private element: HTMLElement;
  private state: SummaryStepState;
  private summary?: ConfigurationSummary;
  private onChange: (state: SummaryStepState) => void;
  private onEdit?: (stepId: StepName) => void;
  private onContinue?: () => void;

  constructor(
    container: HTMLElement, 
    onChange: (state: SummaryStepState) => void,
    onEdit?: (stepId: StepName) => void,
    onContinue?: () => void
  ) {
    this.element = container;
    this.onChange = onChange;
    if (onEdit) this.onEdit = onEdit;
    if (onContinue) this.onContinue = onContinue;
    this.state = {
      isValid: true, // Summary is always valid as it's a review step
      errors: []
    };

    this.initializeStyles();
    this.render();
    this.bindEvents();
  }

  /**
   * Initialize CSS styles
   */
  private initializeStyles(): void {
    let styleSheet = document.getElementById('summary-styles') as HTMLStyleElement;
    if (!styleSheet) {
      styleSheet = document.createElement('style');
      styleSheet.id = 'summary-styles';
      styleSheet.textContent = SUMMARY_STYLES;
      document.head.appendChild(styleSheet);
    }
  }

  /**
   * Render the summary step container
   */
  private render(): void {
    this.element.innerHTML = `
      <div class="step-header">
        <h2>Review Your Configuration</h2>
        <p class="step-description">
          Please review your garden room configuration below. You can edit any section by clicking the edit button.
        </p>
      </div>
      
      <div id="summary-content" class="summary-step-content">
        <!-- Summary component will be rendered here -->
      </div>
      
      <div class="step-actions">
        <button type="button" class="btn btn-outline btn-back">
          <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Back to Extras
        </button>
        
        <button type="button" class="btn btn-primary btn-continue" disabled>
          Continue to Quote
          <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    `;
  }

  /**
   * Convert configurator state to price calculation format
   */
  private convertConfigurationForPricing(configuration: Partial<ConfiguratorState>): any {
    const sizeConfig = configuration.size || { widthMm: 0, depthMm: 0 };
    const claddingConfig = configuration.cladding || { color: '', material: '', areaSqm: 0 };
    const openingsConfig = configuration.openings || { windows: [], externalDoors: [], skylights: [] };
    const floorConfig = configuration.floor || { type: 'none', areaSqm: 0 };
    const bathroomConfig = configuration.bathroom || { type: 'none', count: 0 };
    const extrasConfig = configuration.extras || { selectedExtras: [], customExtras: [] };

    return {
      productType: 'garden-room' as const,
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
        switches: 4,  // Default values
        sockets: 6,
        heater: 1
      },
      internalDoors: 1,
      internalWall: {
        finish: 'panel' as const,
        areaSqM: Math.max(0, (sizeConfig.widthMm * sizeConfig.depthMm) / 1_000_000 * 2.5) // Approximate wall area
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
        cost: 500 // Default delivery cost
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
   * Update the summary with configuration data
   */
  updateConfiguration(configuration: Partial<ConfiguratorState>, isVatIncluded: boolean = true): void {
    const summaryContainer = this.element.querySelector('#summary-content') as HTMLElement;
    if (!summaryContainer) return;

    // Convert configuration for price calculation
    const priceConfig = this.convertConfigurationForPricing(configuration);
    
    // Calculate price estimate
    const estimate = calculatePriceEstimate(priceConfig);

    // Create summary data
    const summaryData: SummaryData = createSummaryData(
      configuration,
      {
        subtotal: estimate.subtotalExVat,
        vat: estimate.vatAmount,
        total: isVatIncluded ? estimate.totalIncVat : estimate.subtotalExVat
      },
      isVatIncluded
    );

    // Create or update summary component
    if (this.summary) {
      this.summary.updateSummary(summaryData);
    } else {
      this.summary = new ConfigurationSummary(summaryContainer, summaryData, {
        showEditButtons: true,
        showPricing: true,
        compactMode: false
      });

      // Set up edit callback
      if (this.onEdit) {
        this.summary.onEdit(this.onEdit);
      }

      // Listen for continue event
      summaryContainer.addEventListener('summary:continue', () => {
        if (this.onContinue) {
          this.onContinue();
        }
      });
    }

    // Enable continue button
    const continueBtn = this.element.querySelector('.btn-continue') as HTMLButtonElement;
    if (continueBtn) {
      continueBtn.disabled = false;
    }

    // Update state
    this.state.isValid = true;
    this.state.errors = [];
    this.onChange(this.state);
  }

  /**
   * Get current step state
   */
  getState(): SummaryStepState {
    return { ...this.state };
  }

  /**
   * Set step state (for restoring saved state)
   */
  setState(state: Partial<SummaryStepState>): void {
    this.state = { ...this.state, ...state };
    this.onChange(this.state);
  }

  /**
   * Validate step (always valid for summary)
   */
  validate(): boolean {
    return this.state.isValid;
  }

  /**
   * Bind event listeners
   */
  private bindEvents(): void {
    // Back button
    const backBtn = this.element.querySelector('.btn-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        // Dispatch event to go back to previous step
        this.element.dispatchEvent(new CustomEvent('step:back', {
          bubbles: true,
          detail: { fromStep: 'summary' }
        }));
      });
    }

    // Continue button
    const continueBtn = this.element.querySelector('.btn-continue');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        if (this.onContinue) {
          this.onContinue();
        } else {
          // Dispatch event to continue to next step
          this.element.dispatchEvent(new CustomEvent('step:continue', {
            bubbles: true,
            detail: { fromStep: 'summary' }
          }));
        }
      });
    }
  }
}

// Additional CSS for the summary step
export const SUMMARY_STEP_STYLES = `
.summary-step-content {
  margin: 2rem 0;
}

.step-header {
  margin-bottom: 2rem;
  text-align: center;
}

.step-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.step-description {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

.btn-primary {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
  border-color: #1d4ed8;
}

.btn-primary:disabled {
  background: #9ca3af;
  border-color: #9ca3af;
  cursor: not-allowed;
}

.btn-outline {
  background: transparent;
  color: #374151;
  border-color: #d1d5db;
}

.btn-outline:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

@media (max-width: 768px) {
  .step-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
`;