/**
 * Bathroom Selection Step Component
 * Handles bathroom options (none, half, three-quarter)
 */

export interface BathroomConfig {
  type: 'none' | 'half' | 'three-quarter';
  count: number;
}

export interface BathroomStepState {
  config: BathroomConfig;
  isValid: boolean;
  errors: string[];
}

const BATHROOM_OPTIONS = [
  {
    value: 'none',
    label: 'No Bathroom',
    description: 'No bathroom facilities included',
    features: [],
    priceNote: 'No additional cost'
  },
  {
    value: 'half',
    label: 'Half Bathroom',
    description: 'Toilet and sink only',
    features: ['Toilet', 'Sink', 'Under-sink heater included'],
    priceNote: 'Standard pricing'
  },
  {
    value: 'three-quarter',
    label: 'Three-Quarter Bathroom',
    description: 'Toilet, sink, and shower',
    features: ['Toilet', 'Sink', 'Shower', 'Electric boiler included'],
    priceNote: 'Premium option'
  }
];

export class BathroomStep {
  private element: HTMLElement;
  private state: BathroomStepState;
  private onChange: (state: BathroomStepState) => void;

  constructor(container: HTMLElement, onChange: (state: BathroomStepState) => void) {
    this.element = container;
    this.onChange = onChange;
    this.state = {
      config: { type: 'none', count: 0 },
      isValid: true, // Valid by default (no bathroom is a valid choice)
      errors: []
    };
    this.render();
    this.bindEvents();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="step-content">
        <h2>Bathroom Options</h2>
        <p class="step-description">Choose bathroom facilities for your building</p>
        
        <div class="bathroom-options">
          ${BATHROOM_OPTIONS.map(option => `
            <div class="bathroom-option ${this.state.config.type === option.value ? 'selected' : ''}">
              <input 
                type="radio" 
                id="bathroom-${option.value}" 
                name="bathroom-type" 
                value="${option.value}"
                ${this.state.config.type === option.value ? 'checked' : ''}
              />
              <label for="bathroom-${option.value}">
                <div class="option-header">
                  <h3>${option.label}</h3>
                  <div class="price-note">${option.priceNote}</div>
                </div>
                <p class="option-description">${option.description}</p>
                
                ${option.features.length > 0 ? `
                  <div class="features-list">
                    <h4>Includes:</h4>
                    <ul>
                      ${option.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
                
                <div class="option-visual">
                  <div class="bathroom-layout bathroom-${option.value}">
                    ${this.renderBathroomLayout(option.value)}
                  </div>
                </div>
              </label>
            </div>
          `).join('')}
        </div>

        ${this.state.config.type !== 'none' ? `
          <div class="bathroom-count-section">
            <h3>Number of Bathrooms</h3>
            <div class="count-controls">
              <button type="button" class="count-btn decrease" ${this.state.config.count <= 1 ? 'disabled' : ''}>-</button>
              <span class="count-display">${this.state.config.count}</span>
              <button type="button" class="count-btn increase" ${this.state.config.count >= 2 ? 'disabled' : ''}>+</button>
            </div>
            <small class="count-help">Maximum 2 bathrooms per building</small>
          </div>
        ` : ''}

        <div class="bathroom-summary">
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

  private renderBathroomLayout(type: string): string {
    switch (type) {
      case 'none':
        return '<div class="no-bathroom">No bathroom facilities</div>';
      case 'half':
        return `
          <div class="fixture toilet">T</div>
          <div class="fixture sink">S</div>
          <div class="fixture-label">Toilet & Sink</div>
        `;
      case 'three-quarter':
        return `
          <div class="fixture toilet">T</div>
          <div class="fixture sink">S</div>
          <div class="fixture shower">Sh</div>
          <div class="fixture-label">Toilet, Sink & Shower</div>
        `;
      default:
        return '';
    }
  }

  private renderSummary(): string {
    if (this.state.config.type === 'none') {
      return '<p>No bathroom selected</p>';
    }

    const option = BATHROOM_OPTIONS.find(opt => opt.value === this.state.config.type);
    const plural = this.state.config.count > 1 ? 's' : '';
    
    return `
      <p><strong>${this.state.config.count} ${option?.label}${plural}</strong></p>
      <p>${option?.description}</p>
      ${option?.features.length ? `
        <ul class="features-summary">
          ${option.features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
      ` : ''}
    `;
  }

  private bindEvents(): void {
    // Bathroom type selection
    this.element.querySelectorAll('input[name="bathroom-type"]').forEach(input => {
      input.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.checked) {
          this.state.config.type = target.value as 'none' | 'half' | 'three-quarter';
          this.state.config.count = this.state.config.type === 'none' ? 0 : 1;
          this.validate();
          this.render();
          this.bindEvents();
          this.onChange(this.state);
        }
      });
    });

    // Count controls
    const decreaseBtn = this.element.querySelector('.count-btn.decrease');
    const increaseBtn = this.element.querySelector('.count-btn.increase');

    decreaseBtn?.addEventListener('click', () => {
      if (this.state.config.count > 1) {
        this.state.config.count--;
        this.updateCountDisplay();
        this.onChange(this.state);
      }
    });

    increaseBtn?.addEventListener('click', () => {
      if (this.state.config.count < 2) {
        this.state.config.count++;
        this.updateCountDisplay();
        this.onChange(this.state);
      }
    });
  }

  private updateCountDisplay(): void {
    const countDisplay = this.element.querySelector('.count-display');
    const decreaseBtn = this.element.querySelector('.count-btn.decrease') as HTMLButtonElement;
    const increaseBtn = this.element.querySelector('.count-btn.increase') as HTMLButtonElement;

    if (countDisplay) {
      countDisplay.textContent = this.state.config.count.toString();
    }

    if (decreaseBtn) {
      decreaseBtn.disabled = this.state.config.count <= 1;
    }

    if (increaseBtn) {
      increaseBtn.disabled = this.state.config.count >= 2;
    }

    // Update summary
    const summaryContent = this.element.querySelector('.summary-content');
    if (summaryContent) {
      summaryContent.innerHTML = this.renderSummary();
    }
  }

  private validate(): void {
    const errors: string[] = [];

    if (this.state.config.type !== 'none' && this.state.config.count < 1) {
      errors.push('Number of bathrooms must be at least 1');
    }

    if (this.state.config.count > 2) {
      errors.push('Maximum 2 bathrooms allowed per building');
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

  getState(): BathroomStepState {
    return { ...this.state };
  }

  setState(config: BathroomConfig): void {
    this.state.config = { ...config };
    this.validate();
    this.render();
    this.bindEvents();
  }

  getBathroomCount(): { half: number; threeQuarter: number } {
    if (this.state.config.type === 'half') {
      return { half: this.state.config.count, threeQuarter: 0 };
    } else if (this.state.config.type === 'three-quarter') {
      return { half: 0, threeQuarter: this.state.config.count };
    }
    return { half: 0, threeQuarter: 0 };
  }

  getBathroomType(): 'none' | 'half' | 'three-quarter' {
    return this.state.config.type;
  }

  getTotalBathrooms(): number {
    return this.state.config.type === 'none' ? 0 : this.state.config.count;
  }
}