/**
 * Size Selection Step Component
 * Handles width and depth selection for garden rooms/house extensions/house builds
 */

import { addTooltip, addImagePreview } from './ui-helpers.js';

export interface SizeConfig {
  widthMm: number;
  depthMm: number;
}

export interface SizeStepState {
  config: SizeConfig;
  isValid: boolean;
  errors: string[];
}

export class SizeStep {
  private element: HTMLElement;
  private state: SizeStepState;
  private onChange: (state: SizeStepState) => void;

  constructor(container: HTMLElement, onChange: (state: SizeStepState) => void) {
    this.element = container;
    this.onChange = onChange;
    this.state = {
      config: { widthMm: 0, depthMm: 0 },
      isValid: false,
      errors: []
    };
    this.render();
    this.bindEvents();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="step-content">
        <h2>Choose Your Size</h2>
        <p class="step-description">Select the dimensions for your project</p>
        
        <div class="size-controls">
          <div class="dimension-control">
            <label for="width-input">Width (metres)</label>
            <div class="input-group">
              <input 
                type="number" 
                id="width-input" 
                min="2" 
                max="12" 
                step="0.1" 
                value="${this.state.config.widthMm / 1000}"
                aria-describedby="width-help"
              />
              <span class="unit">m</span>
            </div>
            <small id="width-help" class="help-text">Between 2m and 12m</small>
          </div>

          <div class="dimension-control">
            <label for="depth-input">Depth (metres)</label>
            <div class="input-group">
              <input 
                type="number" 
                id="depth-input" 
                min="2" 
                max="8" 
                step="0.1" 
                value="${this.state.config.depthMm / 1000}"
                aria-describedby="depth-help"
              />
              <span class="unit">m</span>
            </div>
            <small id="depth-help" class="help-text">Between 2m and 8m</small>
          </div>
        </div>

        <div class="size-preview">
          <div class="dimension-visual">
            <div class="shape-preview" style="aspect-ratio: ${this.getAspectRatio()}">
              <span class="dimension-label width-label">${(this.state.config.widthMm / 1000).toFixed(1)}m</span>
              <span class="dimension-label depth-label">${(this.state.config.depthMm / 1000).toFixed(1)}m</span>
            </div>
          </div>
          <div class="area-display">
            <strong>Floor Area: ${this.getFloorArea().toFixed(1)} m²</strong>
          </div>
        </div>

        <div class="validation-messages" role="alert" aria-live="polite">
          ${this.state.errors.map(error => `<div class="error-message">${error}</div>`).join('')}
        </div>
      </div>
    `;
  }

  private bindEvents(): void {
    const widthInput = this.element.querySelector('#width-input') as HTMLInputElement;
    const depthInput = this.element.querySelector('#depth-input') as HTMLInputElement;

    widthInput?.addEventListener('input', () => this.updateWidth(widthInput.value));
    depthInput?.addEventListener('input', () => this.updateDepth(depthInput.value));

    // Add tooltips and image previews
    this.addUIHelpers();
  }

  private addUIHelpers(): void {
    // Add tooltips to dimension inputs
    const widthControl = this.element.querySelector('.dimension-control:first-child');
    const depthControl = this.element.querySelector('.dimension-control:last-child');

    if (widthControl) {
      addTooltip(widthControl as HTMLElement, 
        'Width determines how wide your garden room will be. Consider your available space and intended use.', 
        { 
          position: 'top',
          maxWidth: 300,
          trigger: 'hover'
        }
      );
    }

    if (depthControl) {
      addTooltip(depthControl as HTMLElement, 
        'Depth determines how far your garden room extends. Ensure adequate clearance from property boundaries.', 
        { 
          position: 'top', 
          maxWidth: 300,
          trigger: 'hover'
        }
      );
    }

    // Add image preview to the size preview
    const shapePreview = this.element.querySelector('.shape-preview');
    if (shapePreview) {
      addImagePreview(
        shapePreview as HTMLElement,
        '/images/size-examples/garden-room-dimensions.jpg',
        'Garden room dimension examples showing different sizes',
        {
          caption: 'Example garden room dimensions and layouts',
          zoomable: true,
          lazyLoad: true,
          thumbnailSrc: '/images/size-examples/garden-room-dimensions-thumb.jpg'
        }
      );
    }

    // Add tooltips to help text for additional context
    const widthHelp = this.element.querySelector('#width-help');
    const depthHelp = this.element.querySelector('#depth-help');

    if (widthHelp) {
      addTooltip(widthHelp as HTMLElement,
        'Building regulations may apply for structures over certain sizes. Consult local planning requirements.',
        {
          position: 'bottom',
          maxWidth: 280,
          trigger: 'click'
        }
      );
    }

    if (depthHelp) {
      addTooltip(depthHelp as HTMLElement,
        'Consider access routes, landscaping, and proximity to neighbors when selecting depth.',
        {
          position: 'bottom', 
          maxWidth: 280,
          trigger: 'click'
        }
      );
    }
  }

  private updateWidth(value: string): void {
    const widthM = parseFloat(value) || 0;
    this.state.config.widthMm = widthM * 1000;
    this.validate();
    this.updatePreview();
    this.onChange(this.state);
  }

  private updateDepth(value: string): void {
    const depthM = parseFloat(value) || 0;
    this.state.config.depthMm = depthM * 1000;
    this.validate();
    this.updatePreview();
    this.onChange(this.state);
  }

  private validate(): void {
    const errors: string[] = [];
    const widthM = this.state.config.widthMm / 1000;
    const depthM = this.state.config.depthMm / 1000;

    if (widthM < 2) errors.push('Width must be at least 2 metres');
    if (widthM > 12) errors.push('Width cannot exceed 12 metres');
    if (depthM < 2) errors.push('Depth must be at least 2 metres');
    if (depthM > 8) errors.push('Depth cannot exceed 8 metres');

    this.state.errors = errors;
    this.state.isValid = errors.length === 0 && widthM > 0 && depthM > 0;

    // Update validation display
    const validationContainer = this.element.querySelector('.validation-messages');
    if (validationContainer) {
      validationContainer.innerHTML = errors.map(error => 
        `<div class="error-message">${error}</div>`
      ).join('');
    }
  }

  private updatePreview(): void {
    const preview = this.element.querySelector('.shape-preview') as HTMLElement;
    const widthLabel = this.element.querySelector('.width-label');
    const depthLabel = this.element.querySelector('.depth-label');
    const areaDisplay = this.element.querySelector('.area-display strong');

    if (preview) {
      preview.style.aspectRatio = this.getAspectRatio();
    }
    if (widthLabel) {
      widthLabel.textContent = `${(this.state.config.widthMm / 1000).toFixed(1)}m`;
    }
    if (depthLabel) {
      depthLabel.textContent = `${(this.state.config.depthMm / 1000).toFixed(1)}m`;
    }
    if (areaDisplay) {
      areaDisplay.textContent = `Floor Area: ${this.getFloorArea().toFixed(1)} m²`;
    }
  }

  private getAspectRatio(): string {
    const width = this.state.config.widthMm || 1000;
    const depth = this.state.config.depthMm || 1000;
    return `${width} / ${depth}`;
  }

  private getFloorArea(): number {
    const widthM = this.state.config.widthMm / 1000;
    const depthM = this.state.config.depthMm / 1000;
    return widthM * depthM;
  }

  getState(): SizeStepState {
    return { ...this.state };
  }

  setState(config: SizeConfig): void {
    this.state.config = { ...config };
    this.validate();
    this.render();
    this.bindEvents();
  }

  getFloorAreaM2(): number {
    return this.getFloorArea();
  }

  getCladingAreaM2(): number {
    // Calculate external wall area (simplified - assuming 2.4m height)
    const widthM = this.state.config.widthMm / 1000;
    const depthM = this.state.config.depthMm / 1000;
    const height = 2.4; // Standard height
    return 2 * (widthM + depthM) * height;
  }
}