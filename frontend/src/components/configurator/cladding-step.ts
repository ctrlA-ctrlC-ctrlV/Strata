/**
 * Cladding Selection Step Component
 * Handles cladding color and material selection
 */

export interface CladdingConfig {
  color: string;
  material: string;
  areaSqm: number; // Calculated from building dimensions minus openings
}

export interface CladdingStepState {
  config: CladdingConfig;
  isValid: boolean;
  errors: string[];
}

const CLADDING_OPTIONS = {
  colors: [
    { value: 'charcoal', label: 'Charcoal', description: 'Modern dark grey finish' },
    { value: 'sage-green', label: 'Sage Green', description: 'Natural green tone' },
    { value: 'cream', label: 'Cream', description: 'Classic light finish' },
    { value: 'black', label: 'Black', description: 'Contemporary dark finish' },
    { value: 'white', label: 'White', description: 'Clean bright finish' },
    { value: 'natural-wood', label: 'Natural Wood', description: 'Cedar wood finish' }
  ],
  materials: [
    { value: 'composite', label: 'Composite', description: 'Low maintenance composite boards' },
    { value: 'cedar', label: 'Cedar Wood', description: 'Natural cedar timber' },
    { value: 'fiber-cement', label: 'Fiber Cement', description: 'Durable fiber cement boards' }
  ]
};

export class CladdingStep {
  private element: HTMLElement;
  private state: CladdingStepState;
  private onChange: (state: CladdingStepState) => void;
  // wallAreaM2 is tracked in state.config.areaSqm

  constructor(
    container: HTMLElement, 
    onChange: (state: CladdingStepState) => void,
    wallAreaM2: number = 0
  ) {
    this.element = container;
    this.onChange = onChange;
    // wallAreaM2 stored in state.config.areaSqm
    this.state = {
      config: { 
        color: '', 
        material: '', 
        areaSqm: wallAreaM2 
      },
      isValid: false,
      errors: []
    };
    this.render();
    this.bindEvents();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="step-content">
        <h2>Choose Your Cladding</h2>
        <p class="step-description">Select the exterior finish for your building</p>
        
        <div class="cladding-area-info">
          <strong>Cladding Area: ${this.state.config.areaSqm.toFixed(1)} m²</strong>
          <small>This is calculated from your building size minus openings</small>
        </div>

        <div class="cladding-selection">
          <div class="material-section">
            <h3>Material</h3>
            <div class="material-options">
              ${CLADDING_OPTIONS.materials.map(material => `
                <div class="material-option ${this.state.config.material === material.value ? 'selected' : ''}">
                  <input 
                    type="radio" 
                    id="material-${material.value}" 
                    name="cladding-material" 
                    value="${material.value}"
                    ${this.state.config.material === material.value ? 'checked' : ''}
                  />
                  <label for="material-${material.value}">
                    <div class="material-preview"></div>
                    <div class="material-info">
                      <h4>${material.label}</h4>
                      <p>${material.description}</p>
                    </div>
                  </label>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="color-section">
            <h3>Color</h3>
            <div class="color-options">
              ${CLADDING_OPTIONS.colors.map(color => `
                <div class="color-option ${this.state.config.color === color.value ? 'selected' : ''}">
                  <input 
                    type="radio" 
                    id="color-${color.value}" 
                    name="cladding-color" 
                    value="${color.value}"
                    ${this.state.config.color === color.value ? 'checked' : ''}
                  />
                  <label for="color-${color.value}">
                    <div class="color-swatch color-${color.value}"></div>
                    <div class="color-info">
                      <h4>${color.label}</h4>
                      <p>${color.description}</p>
                    </div>
                  </label>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="cladding-preview">
          <h4>Preview</h4>
          <div class="building-preview">
            <div class="building-outline">
              <div class="cladding-surface ${this.state.config.material} ${this.state.config.color}">
                <span class="preview-label">
                  ${this.getSelectedMaterialLabel()} - ${this.getSelectedColorLabel()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="validation-messages" role="alert" aria-live="polite">
          ${this.state.errors.map(error => `<div class="error-message">${error}</div>`).join('')}
        </div>
      </div>
    `;
  }

  private bindEvents(): void {
    // Material selection
    this.element.querySelectorAll('input[name="cladding-material"]').forEach(input => {
      input.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.checked) {
          this.state.config.material = target.value;
          this.validate();
          this.updatePreview();
          this.onChange(this.state);
        }
      });
    });

    // Color selection
    this.element.querySelectorAll('input[name="cladding-color"]').forEach(input => {
      input.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.checked) {
          this.state.config.color = target.value;
          this.validate();
          this.updatePreview();
          this.onChange(this.state);
        }
      });
    });
  }

  private validate(): void {
    const errors: string[] = [];

    if (!this.state.config.material) {
      errors.push('Please select a cladding material');
    }

    if (!this.state.config.color) {
      errors.push('Please select a cladding color');
    }

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

  private updatePreview(): void {
    // Update selected states
    this.element.querySelectorAll('.material-option').forEach(option => {
      const input = option.querySelector('input') as HTMLInputElement;
      option.classList.toggle('selected', input.checked);
    });

    this.element.querySelectorAll('.color-option').forEach(option => {
      const input = option.querySelector('input') as HTMLInputElement;
      option.classList.toggle('selected', input.checked);
    });

    // Update preview surface
    const previewSurface = this.element.querySelector('.cladding-surface');
    if (previewSurface) {
      previewSurface.className = `cladding-surface ${this.state.config.material} ${this.state.config.color}`;
      const label = previewSurface.querySelector('.preview-label');
      if (label) {
        label.textContent = `${this.getSelectedMaterialLabel()} - ${this.getSelectedColorLabel()}`;
      }
    }
  }

  private getSelectedMaterialLabel(): string {
    const material = CLADDING_OPTIONS.materials.find(m => m.value === this.state.config.material);
    return material ? material.label : 'Select Material';
  }

  private getSelectedColorLabel(): string {
    const color = CLADDING_OPTIONS.colors.find(c => c.value === this.state.config.color);
    return color ? color.label : 'Select Color';
  }

  getState(): CladdingStepState {
    return { ...this.state };
  }

  setState(config: CladdingConfig): void {
    this.state.config = { ...config };
    this.validate();
    this.render();
    this.bindEvents();
  }

  updateWallArea(wallAreaM2: number): void {
    // Update area in state
    this.state.config.areaSqm = wallAreaM2;
    
    // Update area display
    const areaInfo = this.element.querySelector('.cladding-area-info strong');
    if (areaInfo) {
      areaInfo.textContent = `Cladding Area: ${wallAreaM2.toFixed(1)} m²`;
    }
    
    this.onChange(this.state);
  }

  getCladdingAreaM2(): number {
    return this.state.config.areaSqm;
  }

  getSelectedMaterial(): string {
    return this.state.config.material;
  }

  getSelectedColor(): string {
    return this.state.config.color;
  }
}