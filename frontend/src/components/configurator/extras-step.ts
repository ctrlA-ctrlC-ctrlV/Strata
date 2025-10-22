/**
 * Extras Selection Step Component
 * Handles additional options and upgrades
 */

export interface ExtraItem {
  code: string;
  title: string;
  description: string;
  priceIncVat: number;
  quantity: number;
  unit: string; // 'm2', 'item', 'linear-m'
  category: string;
}

export interface ExtrasConfig {
  selectedExtras: ExtraItem[];
  customExtras: ExtraItem[];
}

export interface ExtrasStepState {
  config: ExtrasConfig;
  isValid: boolean;
  errors: string[];
}

const EXTRA_OPTIONS = [
  {
    category: 'Insulation',
    items: [
      {
        code: 'esp-insulation',
        title: 'ESP Insulation Upgrade',
        description: 'Enhanced thermal insulation for better energy efficiency',
        pricePerM2: 25,
        unit: 'm2',
        maxQuantity: 200
      }
    ]
  },
  {
    category: 'Exterior Finishes',
    items: [
      {
        code: 'exterior-render',
        title: 'Exterior Render',
        description: 'Smooth render finish over external walls',
        pricePerM2: 35,
        unit: 'm2',
        maxQuantity: 200
      }
    ]
  },
  {
    category: 'Security',
    items: [
      {
        code: 'steel-door',
        title: 'Steel Security Door',
        description: 'High-security steel entrance door with multi-point locking',
        pricePerItem: 650,
        unit: 'item',
        maxQuantity: 3
      }
    ]
  },
  {
    category: 'Electrical',
    items: [
      {
        code: 'extra-sockets',
        title: 'Additional Double Sockets',
        description: 'Extra electrical double sockets beyond standard provision',
        pricePerItem: 45,
        unit: 'item',
        maxQuantity: 20
      },
      {
        code: 'extra-switches',
        title: 'Additional Light Switches',
        description: 'Extra light switches beyond standard provision',
        pricePerItem: 35,
        unit: 'item',
        maxQuantity: 15
      },
      {
        code: 'electric-heater',
        title: 'Electric Panel Heaters',
        description: 'Wall-mounted electric panel heaters for additional heating',
        pricePerItem: 180,
        unit: 'item',
        maxQuantity: 6
      }
    ]
  },
  {
    category: 'Internal Features',
    items: [
      {
        code: 'internal-doors',
        title: 'Additional Internal Doors',
        description: 'Extra internal doors for room division',
        pricePerItem: 120,
        unit: 'item',
        maxQuantity: 8
      }
    ]
  }
];

export class ExtrasStep {
  private element: HTMLElement;
  private state: ExtrasStepState;
  private onChange: (state: ExtrasStepState) => void;
  private buildingAreaM2: number;

  constructor(
    container: HTMLElement, 
    onChange: (state: ExtrasStepState) => void,
    buildingAreaM2: number = 0
  ) {
    this.element = container;
    this.onChange = onChange;
    this.buildingAreaM2 = buildingAreaM2;
    this.state = {
      config: { selectedExtras: [], customExtras: [] },
      isValid: true, // Valid by default (no extras required)
      errors: []
    };
    this.render();
    this.bindEvents();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="step-content">
        <h2>Optional Extras</h2>
        <p class="step-description">Add optional features and upgrades to your building</p>
        
        <div class="extras-categories">
          ${EXTRA_OPTIONS.map(category => `
            <div class="extras-category">
              <h3>${category.category}</h3>
              <div class="extras-items">
                ${category.items.map(item => this.renderExtraItem(item, category.category)).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="custom-extras-section">
          <h3>Custom Requirements</h3>
          <p>Need something not listed? Add a custom requirement:</p>
          <div class="add-custom-extra">
            <div class="custom-extra-form">
              <input type="text" placeholder="Description" class="custom-description" />
              <input type="number" placeholder="Est. Price (€)" class="custom-price" min="0" step="1" />
              <button type="button" class="add-custom-btn">Add</button>
            </div>
          </div>
          
          <div class="custom-extras-list">
            ${this.state.config.customExtras.map((extra, index) => this.renderCustomExtra(extra, index)).join('')}
          </div>
        </div>

        <div class="extras-summary">
          <h4>Selected Extras Summary</h4>
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

  private renderExtraItem(item: any, _category: string): string {
    const selectedExtra = this.state.config.selectedExtras.find(e => e.code === item.code);
    const quantity = selectedExtra ? selectedExtra.quantity : 0;
    const priceKey = item.pricePerM2 ? 'pricePerM2' : 'pricePerItem';
    const price = item[priceKey];
    // Total price calculation removed as it's currently unused in UI

    return `
      <div class="extra-item ${quantity > 0 ? 'selected' : ''}">
        <div class="extra-header">
          <h4>${item.title}</h4>
          <div class="extra-price">
            €${price}${item.unit === 'm2' ? '/m²' : item.unit === 'item' ? ' each' : '/m'}
          </div>
        </div>
        
        <p class="extra-description">${item.description}</p>
        
        <div class="extra-controls">
          <div class="quantity-control">
            <label>Quantity:</label>
            <div class="quantity-input">
              <button type="button" class="qty-btn decrease" data-code="${item.code}" ${quantity <= 0 ? 'disabled' : ''}>-</button>
              <span class="qty-display">${quantity}</span>
              <button type="button" class="qty-btn increase" data-code="${item.code}" ${quantity >= item.maxQuantity ? 'disabled' : ''}>+</button>
            </div>
            <small class="qty-unit">${item.unit === 'm2' ? 'm² (max ' + Math.min(item.maxQuantity, this.buildingAreaM2) + ')' : item.unit + ' (max ' + item.maxQuantity + ')'}</small>
          </div>
          
          ${quantity > 0 ? `
            <div class="extra-total">
              <strong>Total: €${(quantity * (item.unit === 'm2' ? price : price)).toFixed(0)}</strong>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  private renderCustomExtra(extra: ExtraItem, index: number): string {
    return `
      <div class="custom-extra-item">
        <div class="custom-extra-content">
          <div class="custom-extra-text">
            <strong>${extra.title}</strong>
            <span class="custom-extra-price">€${extra.priceIncVat.toFixed(0)}</span>
          </div>
          <button type="button" class="remove-custom-btn" data-index="${index}">Remove</button>
        </div>
      </div>
    `;
  }

  private renderSummary(): string {
    const totalExtras = this.state.config.selectedExtras.length + this.state.config.customExtras.length;
    
    if (totalExtras === 0) {
      return '<p>No extras selected</p>';
    }

    let html = '<div class="extras-list">';
    
    // Standard extras
    this.state.config.selectedExtras.forEach(extra => {
      html += `
        <div class="summary-extra">
          <span class="extra-name">${extra.title} × ${extra.quantity}</span>
          <span class="extra-cost">€${(extra.priceIncVat * extra.quantity).toFixed(0)}</span>
        </div>
      `;
    });

    // Custom extras
    this.state.config.customExtras.forEach(extra => {
      html += `
        <div class="summary-extra">
          <span class="extra-name">${extra.title}</span>
          <span class="extra-cost">€${extra.priceIncVat.toFixed(0)}</span>
        </div>
      `;
    });

    const totalCost = this.getTotalExtrasCost();
    html += `
      </div>
      <div class="extras-total">
        <strong>Total Extras: €${totalCost.toFixed(0)}</strong>
      </div>
    `;

    return html;
  }

  private bindEvents(): void {
    // Quantity controls
    this.element.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const code = target.dataset.code!;
        const isIncrease = target.classList.contains('increase');
        
        this.updateExtraQuantity(code, isIncrease);
      });
    });

    // Add custom extra
    const addCustomBtn = this.element.querySelector('.add-custom-btn');
    addCustomBtn?.addEventListener('click', () => {
      this.addCustomExtra();
    });

    // Remove custom extra
    this.element.querySelectorAll('.remove-custom-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt((e.target as HTMLElement).dataset.index!);
        this.removeCustomExtra(index);
      });
    });

    // Enter key on custom form
    const customForm = this.element.querySelector('.custom-extra-form');
    customForm?.addEventListener('keypress', (e) => {
      const keyboardEvent = e as KeyboardEvent;
      if (keyboardEvent.key === 'Enter') {
        e.preventDefault();
        this.addCustomExtra();
      }
    });
  }

  private updateExtraQuantity(code: string, increase: boolean): void {
    const extraOption = this.findExtraOption(code);
    if (!extraOption) return;

    let selectedExtra = this.state.config.selectedExtras.find(e => e.code === code);
    
    if (!selectedExtra && increase) {
      // Add new extra
      const priceKey = extraOption.pricePerM2 ? 'pricePerM2' : 'pricePerItem';
      const unitPrice = extraOption[priceKey];
      
      selectedExtra = {
        code: extraOption.code,
        title: extraOption.title,
        description: extraOption.description,
        priceIncVat: unitPrice,
        quantity: 0,
        unit: extraOption.unit,
        category: this.findCategoryForCode(code)
      };
      this.state.config.selectedExtras.push(selectedExtra);
    }

    if (selectedExtra) {
      if (increase && selectedExtra.quantity < extraOption.maxQuantity) {
        selectedExtra.quantity++;
      } else if (!increase && selectedExtra.quantity > 0) {
        selectedExtra.quantity--;
      }

      // Remove if quantity becomes 0
      if (selectedExtra.quantity === 0) {
        this.state.config.selectedExtras = this.state.config.selectedExtras.filter(e => e.code !== code);
      }
    }

    this.validate();
    this.render();
    this.bindEvents();
    this.onChange(this.state);
  }

  private addCustomExtra(): void {
    const descInput = this.element.querySelector('.custom-description') as HTMLInputElement;
    const priceInput = this.element.querySelector('.custom-price') as HTMLInputElement;

    const description = descInput.value.trim();
    const price = parseFloat(priceInput.value) || 0;

    if (description && price > 0) {
      const customExtra: ExtraItem = {
        code: `custom-${Date.now()}`,
        title: description,
        description: `Custom requirement: ${description}`,
        priceIncVat: price,
        quantity: 1,
        unit: 'item',
        category: 'Custom'
      };

      this.state.config.customExtras.push(customExtra);
      
      // Clear form
      descInput.value = '';
      priceInput.value = '';

      this.validate();
      this.render();
      this.bindEvents();
      this.onChange(this.state);
    }
  }

  private removeCustomExtra(index: number): void {
    this.state.config.customExtras.splice(index, 1);
    this.validate();
    this.render();
    this.bindEvents();
    this.onChange(this.state);
  }

  private findExtraOption(code: string): any {
    for (const category of EXTRA_OPTIONS) {
      const item = category.items.find(item => item.code === code);
      if (item) return item;
    }
    return null;
  }

  private findCategoryForCode(code: string): string {
    for (const category of EXTRA_OPTIONS) {
      if (category.items.find(item => item.code === code)) {
        return category.category;
      }
    }
    return 'Other';
  }

  private validate(): void {
    const errors: string[] = [];

    // Validate selected extras quantities
    this.state.config.selectedExtras.forEach(extra => {
      const option = this.findExtraOption(extra.code);
      if (option && extra.quantity > option.maxQuantity) {
        errors.push(`${extra.title}: Maximum quantity is ${option.maxQuantity}`);
      }
    });

    // Validate custom extras
    this.state.config.customExtras.forEach(extra => {
      if (!extra.title.trim()) {
        errors.push('Custom extra description cannot be empty');
      }
      if (extra.priceIncVat <= 0) {
        errors.push('Custom extra price must be greater than 0');
      }
    });

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

  getState(): ExtrasStepState {
    return { ...this.state };
  }

  setState(config: ExtrasConfig): void {
    this.state.config = { ...config };
    this.validate();
    this.render();
    this.bindEvents();
  }

  updateBuildingArea(buildingAreaM2: number): void {
    this.buildingAreaM2 = buildingAreaM2;
    // Re-render to update area-based calculations
    this.render();
    this.bindEvents();
    this.onChange(this.state);
  }

  getTotalExtrasCost(): number {
    let total = 0;

    // Standard extras
    this.state.config.selectedExtras.forEach(extra => {
      total += extra.priceIncVat * extra.quantity;
    });

    // Custom extras
    this.state.config.customExtras.forEach(extra => {
      total += extra.priceIncVat;
    });

    return total;
  }

  getSelectedExtras(): ExtraItem[] {
    return [...this.state.config.selectedExtras, ...this.state.config.customExtras];
  }

  getElectricalExtras(): { switches: number; sockets: number; heaters: number } {
    const switchesExtra = this.state.config.selectedExtras.find(e => e.code === 'extra-switches');
    const socketsExtra = this.state.config.selectedExtras.find(e => e.code === 'extra-sockets');
    const heatersExtra = this.state.config.selectedExtras.find(e => e.code === 'electric-heater');

    return {
      switches: switchesExtra ? switchesExtra.quantity : 0,
      sockets: socketsExtra ? socketsExtra.quantity : 0,
      heaters: heatersExtra ? heatersExtra.quantity : 0
    };
  }

  getInternalDoorsCount(): number {
    const doorsExtra = this.state.config.selectedExtras.find(e => e.code === 'internal-doors');
    return doorsExtra ? doorsExtra.quantity : 0;
  }
}