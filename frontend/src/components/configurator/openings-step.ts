/**
 * Openings Selection Step Component
 * Handles doors, windows, and skylights configuration
 */

import { addTooltip, addImagePreview } from './ui-helpers.js';

export interface OpeningItem {
  widthMm: number;
  heightMm: number;
}

export interface OpeningsConfig {
  windows: OpeningItem[];
  externalDoors: OpeningItem[];
  skylights: OpeningItem[];
}

export interface OpeningsStepState {
  config: OpeningsConfig;
  isValid: boolean;
  errors: string[];
}

export class OpeningsStep {
  private element: HTMLElement;
  private state: OpeningsStepState;
  private onChange: (state: OpeningsStepState) => void;

  constructor(container: HTMLElement, onChange: (state: OpeningsStepState) => void) {
    this.element = container;
    this.onChange = onChange;
    this.state = {
      config: { windows: [], externalDoors: [], skylights: [] },
      isValid: true, // Valid by default (no openings required)
      errors: []
    };
    this.render();
    this.bindEvents();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="step-content">
        <h2>Configure Openings</h2>
        <p class="step-description">Add windows, doors, and skylights as needed</p>
        
        <div class="openings-sections">
          <div class="opening-section">
            <h3>Windows</h3>
            <div class="opening-list" data-type="windows">
              ${this.renderOpeningsList('windows')}
            </div>
            <button type="button" class="add-opening-btn" data-type="windows">
              <span class="icon">+</span> Add Window
            </button>
          </div>

          <div class="opening-section">
            <h3>External Doors</h3>
            <div class="opening-list" data-type="externalDoors">
              ${this.renderOpeningsList('externalDoors')}
            </div>
            <button type="button" class="add-opening-btn" data-type="externalDoors">
              <span class="icon">+</span> Add External Door
            </button>
          </div>

          <div class="opening-section">
            <h3>Skylights</h3>
            <div class="opening-list" data-type="skylights">
              ${this.renderOpeningsList('skylights')}
            </div>
            <button type="button" class="add-opening-btn" data-type="skylights">
              <span class="icon">+</span> Add Skylight
            </button>
          </div>
        </div>

        <div class="openings-summary">
          <h4>Summary</h4>
          <div class="summary-stats">
            <div class="stat">
              <span class="label">Windows:</span>
              <span class="value">${this.state.config.windows.length}</span>
            </div>
            <div class="stat">
              <span class="label">External Doors:</span>
              <span class="value">${this.state.config.externalDoors.length}</span>
            </div>
            <div class="stat">
              <span class="label">Skylights:</span>
              <span class="value">${this.state.config.skylights.length}</span>
            </div>
          </div>
        </div>

        <div class="validation-messages" role="alert" aria-live="polite">
          ${this.state.errors.map(error => `<div class="error-message">${error}</div>`).join('')}
        </div>
      </div>
    `;
  }

  private renderOpeningsList(type: keyof OpeningsConfig): string {
    const openings = this.state.config[type];
    return openings.map((opening, index) => `
      <div class="opening-item" data-index="${index}">
        <div class="opening-controls">
          <div class="dimension-input">
            <label>Width</label>
            <input 
              type="number" 
              class="width-input" 
              value="${opening.widthMm / 1000}" 
              min="0.3" 
              max="3" 
              step="0.1"
              data-type="${type}"
              data-index="${index}"
              data-dimension="width"
            />
            <span class="unit">m</span>
          </div>
          <div class="dimension-input">
            <label>Height</label>
            <input 
              type="number" 
              class="height-input" 
              value="${opening.heightMm / 1000}" 
              min="0.3" 
              max="3" 
              step="0.1"
              data-type="${type}"
              data-index="${index}"
              data-dimension="height"
            />
            <span class="unit">m</span>
          </div>
          <button 
            type="button" 
            class="remove-opening-btn" 
            data-type="${type}" 
            data-index="${index}"
            aria-label="Remove this ${type.slice(0, -1)}"
          >
            ×
          </button>
        </div>
        <div class="opening-preview">
          ${this.getOpeningTypeLabel(type)} - ${(opening.widthMm / 1000).toFixed(1)}m × ${(opening.heightMm / 1000).toFixed(1)}m
        </div>
      </div>
    `).join('');
  }

  private getOpeningTypeLabel(type: keyof OpeningsConfig): string {
    switch (type) {
      case 'windows': return 'Window';
      case 'externalDoors': return 'External Door';
      case 'skylights': return 'Skylight';
      default: return 'Opening';
    }
  }

  private bindEvents(): void {
    // Add opening buttons
    this.element.querySelectorAll('.add-opening-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = (e.target as HTMLElement).dataset.type as keyof OpeningsConfig;
        this.addOpening(type);
      });
    });

    // Remove opening buttons
    this.element.querySelectorAll('.remove-opening-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = (e.target as HTMLElement).dataset.type as keyof OpeningsConfig;
        const index = parseInt((e.target as HTMLElement).dataset.index || '0');
        this.removeOpening(type, index);
      });
    });

    // Add UI helpers for openings
    this.addUIHelpers();

    // Dimension inputs
    this.element.querySelectorAll('input[data-dimension]').forEach(input => {
      input.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const type = target.dataset.type as keyof OpeningsConfig;
        const index = parseInt(target.dataset.index || '0');
        const dimension = target.dataset.dimension as 'width' | 'height';
        const value = parseFloat(target.value) || 0;
        
        this.updateOpeningDimension(type, index, dimension, value * 1000);
      });
    });
  }

  private addOpening(type: keyof OpeningsConfig): void {
    const defaultSizes = {
      windows: { widthMm: 1200, heightMm: 1200 },
      externalDoors: { widthMm: 900, heightMm: 2100 },
      skylights: { widthMm: 800, heightMm: 800 }
    };

    this.state.config[type].push(defaultSizes[type]);
    this.validate();
    this.render();
    this.bindEvents();
    this.onChange(this.state);
  }

  private removeOpening(type: keyof OpeningsConfig, index: number): void {
    this.state.config[type].splice(index, 1);
    this.validate();
    this.render();
    this.bindEvents();
    this.onChange(this.state);
  }

  private updateOpeningDimension(
    type: keyof OpeningsConfig, 
    index: number, 
    dimension: 'width' | 'height', 
    valueMm: number
  ): void {
    if (this.state.config[type][index]) {
      if (dimension === 'width') {
        this.state.config[type][index].widthMm = valueMm;
      } else {
        this.state.config[type][index].heightMm = valueMm;
      }
      this.validate();
      this.onChange(this.state);
    }
  }

  private validate(): void {
    const errors: string[] = [];

    // Validate all openings
    ['windows', 'externalDoors', 'skylights'].forEach(type => {
      const openings = this.state.config[type as keyof OpeningsConfig];
      openings.forEach((opening, index) => {
        const widthM = opening.widthMm / 1000;
        const heightM = opening.heightMm / 1000;

        if (widthM < 0.3 || widthM > 3) {
          errors.push(`${this.getOpeningTypeLabel(type as keyof OpeningsConfig)} ${index + 1}: Width must be between 0.3m and 3m`);
        }
        if (heightM < 0.3 || heightM > 3) {
          errors.push(`${this.getOpeningTypeLabel(type as keyof OpeningsConfig)} ${index + 1}: Height must be between 0.3m and 3m`);
        }
      });
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

  getState(): OpeningsStepState {
    return { ...this.state };
  }

  setState(config: OpeningsConfig): void {
    this.state.config = { ...config };
    this.validate();
    this.render();
    this.bindEvents();
  }

  getTotalOpeningsArea(): number {
    let totalArea = 0;
    
    ['windows', 'externalDoors', 'skylights'].forEach(type => {
      const openings = this.state.config[type as keyof OpeningsConfig];
      openings.forEach(opening => {
        const widthM = opening.widthMm / 1000;
        const heightM = opening.heightMm / 1000;
        totalArea += widthM * heightM;
      });
    });

    return totalArea;
  }

  private addUIHelpers(): void {
    // Add tooltips to opening type sections
    const windowsSection = this.element.querySelector('.opening-type[data-type="windows"]');
    const doorsSection = this.element.querySelector('.opening-type[data-type="externalDoors"]'); 
    const skylightsSection = this.element.querySelector('.opening-type[data-type="skylights"]');

    if (windowsSection) {
      addTooltip(windowsSection as HTMLElement,
        'Windows provide natural light and ventilation. Consider orientation and privacy when positioning.',
        {
          position: 'top',
          maxWidth: 300,
          trigger: 'hover'
        }
      );

      // Add image preview for window examples
      const windowAddBtn = windowsSection.querySelector('.add-opening-btn');
      if (windowAddBtn) {
        addImagePreview(
          windowAddBtn as HTMLElement,
          '/images/openings/window-options.jpg',
          'Window options and styles available',
          {
            caption: 'Various window styles and sizes available for your garden room',
            zoomable: true,
            lazyLoad: true
          }
        );
      }
    }

    if (doorsSection) {
      addTooltip(doorsSection as HTMLElement,
        'External doors provide access and can include bi-fold or French door options for indoor-outdoor living.',
        {
          position: 'top',
          maxWidth: 320,
          trigger: 'hover'
        }
      );

      // Add image preview for door examples  
      const doorAddBtn = doorsSection.querySelector('.add-opening-btn');
      if (doorAddBtn) {
        addImagePreview(
          doorAddBtn as HTMLElement,
          '/images/openings/door-options.jpg',
          'Door options including bi-fold and French doors',
          {
            caption: 'Door styles from single doors to full-width bi-fold options',
            zoomable: true,
            lazyLoad: true
          }
        );
      }
    }

    if (skylightsSection) {
      addTooltip(skylightsSection as HTMLElement,
        'Skylights add overhead natural light and create an open feeling. Consider rainwater drainage.',
        {
          position: 'top', 
          maxWidth: 300,
          trigger: 'hover'
        }
      );

      // Add image preview for skylight examples
      const skylightAddBtn = skylightsSection.querySelector('.add-opening-btn');
      if (skylightAddBtn) {
        addImagePreview(
          skylightAddBtn as HTMLElement,
          '/images/openings/skylight-options.jpg',
          'Skylight options for natural overhead lighting',
          {
            caption: 'Skylight styles including fixed and opening roof windows',
            zoomable: true,
            lazyLoad: true
          }
        );
      }
    }

    // Add tooltips to dimension inputs
    this.element.querySelectorAll('input[data-dimension]').forEach(input => {
      const dimension = (input as HTMLElement).dataset.dimension;
      const openingItem = (input as HTMLElement).closest('.opening-item') as HTMLElement;
      const openingType = openingItem?.dataset.type;
      
      if (dimension && openingType) {
        const tooltipContent = this.getDimensionTooltip(dimension, openingType);
        if (tooltipContent) {
          addTooltip(input as HTMLElement, tooltipContent, {
            position: 'bottom',
            maxWidth: 250,
            trigger: 'focus'
          });
        }
      }
    });
  }

  private getDimensionTooltip(dimension: string, openingType: string): string {
    const tooltips: Record<string, Record<string, string>> = {
      windows: {
        width: 'Standard window widths range from 600mm to 2400mm. Consider proportions to your room size.',
        height: 'Window heights typically range from 1000mm to 1500mm. Higher windows bring in more light.'
      },
      externalDoors: {
        width: 'Door widths: 800mm (single), 1200mm (wide single), 1800mm+ (bi-fold). Consider furniture access.',
        height: 'Standard door height is 2100mm. Taller doors create a more dramatic entrance.'
      },
      skylights: {
        width: 'Skylight width should consider roof structure and rafter spacing (typically 400mm-1200mm).',
        height: 'Skylight depth affects light spread. Deeper skylights (800mm-1500mm) provide more light.'
      }
    };

    return tooltips[openingType]?.[dimension] || '';
  }
}