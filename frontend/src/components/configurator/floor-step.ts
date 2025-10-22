/**
 * Floor Selection Step Component
 * Handles floor type and finish selection
 */

export interface FloorConfig {
  type: 'none' | 'wooden' | 'tile';
  areaSqm: number;
}

export interface FloorStepState {
  config: FloorConfig;
  isValid: boolean;
  errors: string[];
}

const FLOOR_OPTIONS = [
  {
    value: 'none',
    label: 'No Flooring',
    description: 'Bare concrete slab - you arrange your own flooring',
    features: ['Concrete slab base', 'Level surface', 'Ready for your flooring choice'],
    priceNote: 'Lowest cost option'
  },
  {
    value: 'wooden',
    label: 'Wooden Flooring',
    description: 'Engineered wood planks with underfloor heating compatibility',
    features: ['Engineered wood planks', 'Moisture resistant', 'Underfloor heating ready', 'Professional installation'],
    priceNote: 'Premium option'
  },
  {
    value: 'tile',
    label: 'Tiled Flooring',
    description: 'Ceramic or porcelain tiles suitable for all areas including bathrooms',
    features: ['Ceramic/porcelain tiles', 'Waterproof', 'Easy maintenance', 'Professional installation'],
    priceNote: 'Mid-range option'
  }
];

export class FloorStep {
  private element: HTMLElement;
  private state: FloorStepState;
  private onChange: (state: FloorStepState) => void;
  // floorAreaM2 is tracked in state.config.areaSqm

  constructor(
    container: HTMLElement, 
    onChange: (state: FloorStepState) => void,
    floorAreaM2: number = 0
  ) {
    this.element = container;
    this.onChange = onChange;
    // floorAreaM2 stored in state.config.areaSqm
    this.state = {
      config: { 
        type: 'none', 
        areaSqm: floorAreaM2 
      },
      isValid: true, // Valid by default (no flooring is valid)
      errors: []
    };
    this.render();
    this.bindEvents();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="step-content">
        <h2>Choose Your Flooring</h2>
        <p class="step-description">Select the floor finish for your building</p>
        
        <div class="floor-area-info">
          <strong>Floor Area: ${this.state.config.areaSqm.toFixed(1)} m²</strong>
          <small>Total internal floor space</small>
        </div>
        
        <div class="floor-options">
          ${FLOOR_OPTIONS.map(option => `
            <div class="floor-option ${this.state.config.type === option.value ? 'selected' : ''}">
              <input 
                type="radio" 
                id="floor-${option.value}" 
                name="floor-type" 
                value="${option.value}"
                ${this.state.config.type === option.value ? 'checked' : ''}
              />
              <label for="floor-${option.value}">
                <div class="option-header">
                  <h3>${option.label}</h3>
                  <div class="price-note">${option.priceNote}</div>
                </div>
                
                <div class="option-visual">
                  <div class="floor-sample floor-${option.value}">
                    ${this.renderFloorPattern(option.value)}
                  </div>
                </div>
                
                <p class="option-description">${option.description}</p>
                
                <div class="features-list">
                  <h4>Features:</h4>
                  <ul>
                    ${option.features.map(feature => `<li>${feature}</li>`).join('')}
                  </ul>
                </div>
                
                ${option.value !== 'none' ? `
                  <div class="coverage-info">
                    <small>Covers ${this.state.config.areaSqm.toFixed(1)} m² floor area</small>
                  </div>
                ` : ''}
              </label>
            </div>
          `).join('')}
        </div>

        <div class="floor-preview">
          <h4>Floor Preview</h4>
          <div class="room-preview">
            <div class="room-outline">
              <div class="floor-surface floor-${this.state.config.type}">
                <span class="preview-label">
                  ${this.getSelectedFloorLabel()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="floor-summary">
          <h4>Selection Summary</h4>
          <div class="summary-content">
            ${this.renderSummary()}
          </div>
        </div>

        <div class="validation-messages" role="alert" aria-live="polite">
          ${this.state.errors.map(error => `<div class="error-message">${error}</div>`).join('')}
        </div>
      </div>
    `;
  }

  private renderFloorPattern(type: string): string {
    switch (type) {
      case 'none':
        return '<div class="concrete-pattern">Concrete</div>';
      case 'wooden':
        return `
          <div class="wood-plank"></div>
          <div class="wood-plank"></div>
          <div class="wood-plank"></div>
        `;
      case 'tile':
        return `
          <div class="tile-grid">
            <div class="tile"></div>
            <div class="tile"></div>
            <div class="tile"></div>
            <div class="tile"></div>
          </div>
        `;
      default:
        return '';
    }
  }

  private renderSummary(): string {
    const option = FLOOR_OPTIONS.find(opt => opt.value === this.state.config.type);
    
    return `
      <p><strong>${option?.label}</strong></p>
      <p>${option?.description}</p>
      ${this.state.config.type !== 'none' ? `
        <p>Coverage: ${this.state.config.areaSqm.toFixed(1)} m²</p>
      ` : ''}
    `;
  }

  private bindEvents(): void {
    // Floor type selection
    this.element.querySelectorAll('input[name="floor-type"]').forEach(input => {
      input.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.checked) {
          this.state.config.type = target.value as 'none' | 'wooden' | 'tile';
          this.validate();
          this.updatePreview();
          this.onChange(this.state);
        }
      });
    });
  }

  private updatePreview(): void {
    // Update selected states
    this.element.querySelectorAll('.floor-option').forEach(option => {
      const input = option.querySelector('input') as HTMLInputElement;
      option.classList.toggle('selected', input.checked);
    });

    // Update preview surface
    const previewSurface = this.element.querySelector('.floor-surface');
    if (previewSurface) {
      previewSurface.className = `floor-surface floor-${this.state.config.type}`;
      const label = previewSurface.querySelector('.preview-label');
      if (label) {
        label.textContent = this.getSelectedFloorLabel();
      }
    }

    // Update summary
    const summaryContent = this.element.querySelector('.summary-content');
    if (summaryContent) {
      summaryContent.innerHTML = this.renderSummary();
    }
  }

  private getSelectedFloorLabel(): string {
    const option = FLOOR_OPTIONS.find(opt => opt.value === this.state.config.type);
    return option ? option.label : 'Select Flooring';
  }

  private validate(): void {
    const errors: string[] = [];

    // No specific validation needed - all options are valid
    // Could add future validations here (e.g., area limits)

    this.state.errors = errors;
    this.state.isValid = errors.length === 0;

    // Update validation display
    const validationContainer = this.element.querySelector('.validation-messages');
    if (validationContainer) {
      validationContainer.innerHTML = errors.map(error => 
        `<div class="error-message">${error}</div>`
      ).join('');
    }
  }

  getState(): FloorStepState {
    return { ...this.state };
  }

  setState(config: FloorConfig): void {
    this.state.config = { ...config };
    this.validate();
    this.render();
    this.bindEvents();
  }

  updateFloorArea(floorAreaM2: number): void {
    // Update area in state  
    this.state.config.areaSqm = floorAreaM2;
    
    // Update area display
    const areaInfo = this.element.querySelector('.floor-area-info strong');
    if (areaInfo) {
      areaInfo.textContent = `Floor Area: ${floorAreaM2.toFixed(1)} m²`;
    }
    
    // Update coverage info in options
    this.element.querySelectorAll('.coverage-info small').forEach(elem => {
      elem.textContent = `Covers ${floorAreaM2.toFixed(1)} m² floor area`;
    });
    
    this.onChange(this.state);
  }

  getFloorAreaM2(): number {
    return this.state.config.areaSqm;
  }

  getFloorType(): 'none' | 'wooden' | 'tile' {
    return this.state.config.type;
  }
}