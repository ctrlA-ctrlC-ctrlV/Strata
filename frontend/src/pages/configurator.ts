/**
 * Configurator Page Controller
 * Handles the main configurator flow, step navigation, and state management
 */

import { 
  SizeStep, 
  OpeningsStep, 
  CladdingStep, 
  BathroomStep, 
  FloorStep, 
  ExtrasStep,
  SummaryStep,
  STEP_NAMES,
  type ConfiguratorState,
  type SizeConfig,
  type OpeningsConfig,
  type CladdingConfig,
  type BathroomConfig,
  type FloorConfig,
  type ExtrasConfig,
  type SummaryStepState
} from '../components/configurator/index.js';

type ConfiguratorStep = SizeStep | OpeningsStep | CladdingStep | BathroomStep | FloorStep | ExtrasStep | SummaryStep;

type StepConfig = SizeConfig | OpeningsConfig | CladdingConfig | BathroomConfig | FloorConfig | ExtrasConfig;

interface StepStateWithConfig {
  config: StepConfig;
  isValid: boolean;
  errors: string[];
}

interface StepStateWithoutConfig {
  isValid: boolean;
  errors: string[];
}

type StepState = StepStateWithConfig | StepStateWithoutConfig;
import { calculatePriceEstimate, type ProductConfiguration } from '../lib/price.js';
import { analytics } from '../analytics/events.js';
import { ProgressBar } from '../components/progress.js';
import { initializePriceIntegration, type PriceIntegration } from '../lib/price-integration.js';
import { ConfiguratorStatePersistence, RESUME_PROMPT_STYLES } from '../components/configurator/state.js';

class ConfiguratorController {
  private currentStepIndex = 0;
  private steps: ConfiguratorStep[] = [];
  private state: Partial<ConfiguratorState> = {};
  private stepContainer!: HTMLElement;
  private progressBar!: ProgressBar;
  private priceIntegration!: PriceIntegration;
  private statePersistence!: ConfiguratorStatePersistence;
  private analyticsState = {
    priceThreshold50k: false
  };
  private priceElements!: {
    subtotal: HTMLElement;
    vat: HTMLElement;
    total: HTMLElement;
    loading: HTMLElement;
    breakdown: HTMLElement;
  };
  private navigationElements!: {
    prevBtn: HTMLButtonElement;
    nextBtn: HTMLButtonElement;
    getQuoteBtn: HTMLButtonElement;
    currentStep: HTMLElement;
    totalSteps: HTMLElement;
    progressBar: HTMLElement;
    progressSteps: NodeListOf<HTMLElement>;
  };

  constructor() {
    this.initializeElements();
    this.initializePriceIntegration();
    this.initializeProgressBar();
    this.initializeSteps();
    this.initializeStatePersistence();
    this.bindEvents();
    this.loadSavedState();
    this.showCurrentStep();
  }

  private initializeElements(): void {
    this.stepContainer = document.getElementById('step-container')!;
    
    // Price elements
    this.priceElements = {
      subtotal: document.getElementById('price-subtotal')!,
      vat: document.getElementById('price-vat')!,
      total: document.getElementById('price-total')!,
      loading: document.querySelector('.price-loading')!,
      breakdown: document.querySelector('.price-breakdown')!
    };

    // Navigation elements
    this.navigationElements = {
      prevBtn: document.getElementById('prev-step') as HTMLButtonElement,
      nextBtn: document.getElementById('next-step') as HTMLButtonElement,
      getQuoteBtn: document.getElementById('get-quote') as HTMLButtonElement,
      currentStep: document.getElementById('current-step')!,
      totalSteps: document.getElementById('total-steps')!,
      progressBar: document.querySelector('.progress-fill') as HTMLElement,
      progressSteps: document.querySelectorAll('.progress-steps .step')
    };

    this.navigationElements.totalSteps.textContent = STEP_NAMES.length.toString();
  }

  private initializePriceIntegration(): void {
    // Initialize price integration with VAT toggle
    this.priceIntegration = initializePriceIntegration('#price-display')!;
    
    if (!this.priceIntegration) {
      console.error('Failed to initialize price integration');
      return;
    }

    // Subscribe to price updates for analytics
    this.priceIntegration.getConfigState().subscribe((config) => {
      this.onConfigurationChange(config);
    });
  }

  private initializeProgressBar(): void {
    const progressContainer = document.querySelector('#progress-container') as HTMLElement;
    if (!progressContainer) {
      console.warn('Progress container not found');
      return;
    }

    this.progressBar = new ProgressBar(progressContainer);
    
    // Enable step navigation through progress bar
    this.progressBar.onStepClick((stepId) => {
      const stepIndex = STEP_NAMES.findIndex(name => name.toLowerCase().replace(' ', '') === stepId);
      if (stepIndex >= 0 && stepIndex <= this.currentStepIndex) {
        this.goToStep(stepIndex);
      }
    });
  }

  private initializeSteps(): void {
    // Create step instances
    this.steps = [
      new SizeStep(this.stepContainer, (state) => this.onStepChange('size', state)),
      new OpeningsStep(this.stepContainer, (state) => this.onStepChange('openings', state)),
      new CladdingStep(this.stepContainer, (state) => this.onStepChange('cladding', state), 0),
      new BathroomStep(this.stepContainer, (state) => this.onStepChange('bathroom', state)),
      new FloorStep(this.stepContainer, (state) => this.onStepChange('floor', state), 0),
      new ExtrasStep(this.stepContainer, (state) => this.onStepChange('extras', state), 0),
      new SummaryStep(
        this.stepContainer, 
        (state) => this.onStepChange('summary', state),
        (stepId) => this.goToStep(STEP_NAMES.indexOf(stepId)), // Edit callback
        () => this.nextStep() // Continue callback
      )
    ];
  }

  private initializeStatePersistence(): void {
    this.statePersistence = ConfiguratorStatePersistence.getInstance();
    
    // Add styles for resume prompt
    if (!document.querySelector('#resume-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'resume-styles';
      styleElement.textContent = RESUME_PROMPT_STYLES;
      document.head.appendChild(styleElement);
    }
  }

  private bindEvents(): void {
    // Navigation buttons
    this.navigationElements.prevBtn.addEventListener('click', () => this.previousStep());
    this.navigationElements.nextBtn.addEventListener('click', () => this.nextStep());
    this.navigationElements.getQuoteBtn.addEventListener('click', () => this.proceedToQuote());

    // VAT toggle
    const vatToggle = document.getElementById('vat-inclusive') as HTMLInputElement;
    vatToggle?.addEventListener('change', () => this.updatePriceDisplay());

    // Progress step navigation
    this.navigationElements.progressSteps.forEach((step, index) => {
      step.addEventListener('click', () => {
        if (this.canNavigateToStep(index)) {
          this.goToStep(index);
        }
      });
    });

    // Auto-save on visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.saveState();
      }
    });

    // Save on page unload
    window.addEventListener('beforeunload', () => {
      this.saveState();
    });
  }

  private onStepChange(stepName: string, stepState: StepState): void {
    // Type-safe assignment of step config to state
    if (stepName === 'size' && 'config' in stepState) {
      this.state.size = stepState.config as SizeConfig;
    } else if (stepName === 'openings' && 'config' in stepState) {
      this.state.openings = stepState.config as OpeningsConfig;
    } else if (stepName === 'cladding' && 'config' in stepState) {
      this.state.cladding = stepState.config as CladdingConfig;
    } else if (stepName === 'bathroom' && 'config' in stepState) {
      this.state.bathroom = stepState.config as BathroomConfig;
    } else if (stepName === 'floor' && 'config' in stepState) {
      this.state.floor = stepState.config as FloorConfig;
    } else if (stepName === 'extras' && 'config' in stepState) {
      this.state.extras = stepState.config as ExtrasConfig;
    } else if (stepName === 'summary') {
      // SummaryStep doesn't have a config, it uses the overall state
      this.state.summary = stepState as SummaryStepState;
    }
    
    // Update dependent steps with new calculations
    this.updateDependentSteps();
    
    // Update price integration with new state
    if (this.priceIntegration && 'config' in stepState) {
      this.priceIntegration.updateFromComponent(stepName, stepState.config);
    }
    
    // Update navigation state
    this.updateNavigationState();
    
    // Auto-save state (debounced)
    this.statePersistence.autoSave(this.state, this.currentStepIndex);

    // Track analytics
    analytics.configuratorStep(stepName, 'garden-room', (this.currentStepIndex + 1) / STEP_NAMES.length);
  }

  private onConfigurationChange(_config: ProductConfiguration): void {
    // This method is called whenever the configuration changes via price integration
    // We can use it for additional tracking, validation, or UI updates
    
    // Track significant price changes for analytics
    const estimate = this.priceIntegration?.getPriceDisplay().getCurrentEstimate();
    if (estimate) {
      // Log major price milestones
      const total = estimate.totalIncVat;
      if (total >= 50000 && !this.analyticsState.priceThreshold50k) {
        analytics.configuratorStep('price-milestone-50k', 'garden-room', 1.0);
        this.analyticsState.priceThreshold50k = true;
      }
    }
  }

  private updateDependentSteps(): void {
    const sizeConfig = this.state.size;
    if (!sizeConfig) return;

    const floorAreaM2 = (sizeConfig.widthMm * sizeConfig.depthMm) / 1_000_000;
    const wallAreaM2 = this.calculateWallArea();

    // Update cladding step with wall area
    if (this.steps[2] && this.currentStepIndex >= 2) {
      (this.steps[2] as CladdingStep).updateWallArea(wallAreaM2);
    }

    // Update floor step with floor area
    if (this.steps[4] && this.currentStepIndex >= 4) {
      (this.steps[4] as FloorStep).updateFloorArea(floorAreaM2);
    }

    // Update extras step with building area
    if (this.steps[5] && this.currentStepIndex >= 5) {
      (this.steps[5] as ExtrasStep).updateBuildingArea(floorAreaM2);
    }
  }

  private calculateWallArea(): number {
    const sizeConfig = this.state.size;
    const openingsConfig = this.state.openings;
    
    if (!sizeConfig) return 0;

    const widthM = sizeConfig.widthMm / 1000;
    const depthM = sizeConfig.depthMm / 1000;
    const height = 2.4; // Standard height
    const perimeterArea = 2 * (widthM + depthM) * height;

    // Subtract openings area
    let openingsArea = 0;
    if (openingsConfig) {
      [...openingsConfig.windows, ...openingsConfig.externalDoors, ...openingsConfig.skylights]
        .forEach(opening => {
          openingsArea += (opening.widthMm * opening.heightMm) / 1_000_000;
        });
    }

    return Math.max(0, perimeterArea - openingsArea);
  }

  private updatePriceDisplay(): void {
    try {
      const vatInclusive = (document.getElementById('vat-inclusive') as HTMLInputElement)?.checked ?? true;
      
      if (!this.isConfigurationValid()) {
        this.priceElements.loading.style.display = 'block';
        this.priceElements.breakdown.style.display = 'none';
        return;
      }

      const configInput = this.buildConfigurationInput();
      const pricing = calculatePriceEstimate(configInput, vatInclusive);

      // Update price display
      this.priceElements.subtotal.textContent = `€${pricing.subtotalExVat.toLocaleString()}`;
      this.priceElements.vat.textContent = `€${pricing.vatAmount.toLocaleString()}`;
      this.priceElements.total.textContent = `€${(vatInclusive ? pricing.totalIncVat : pricing.subtotalExVat).toLocaleString()}`;

      this.priceElements.loading.style.display = 'none';
      this.priceElements.breakdown.style.display = 'block';

      // Update summary if visible
      this.updateConfigurationSummary();

    } catch (error) {
      console.error('Price calculation error:', error);
      this.priceElements.loading.style.display = 'block';
      this.priceElements.breakdown.style.display = 'none';
    }
  }

  private buildConfigurationInput(): ProductConfiguration {
    const sizeConfig = this.state.size || { widthMm: 0, depthMm: 0 };
    const openingsConfig = this.state.openings || { windows: [], externalDoors: [], skylights: [] };
    const bathroomConfig = this.state.bathroom || { type: 'none', count: 0 };
    const extrasConfig = this.state.extras || { selectedExtras: [], customExtras: [] };
    
    // Convert configurator state to ProductConfiguration format
    return {
      productType: 'garden-room',
      size: { 
        widthM: sizeConfig.widthMm / 1000, 
        depthM: sizeConfig.depthMm / 1000 
      },
      cladding: {
        areaSqm: this.state.cladding?.areaSqm || 0
      },
      bathroom: {
        half: bathroomConfig.type === 'half' ? bathroomConfig.count : 0,
        threeQuarter: bathroomConfig.type === 'three-quarter' ? bathroomConfig.count : 0
      },
      electrical: {
        switches: 2, // Default switches
        sockets: 4,  // Default sockets
        heater: 0
      },
      internalDoors: 0,
      internalWall: {
        finish: 'none'
      },
      heaters: 0,
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
        type: this.state.floor?.type || 'none',
        areaSqM: this.state.floor?.areaSqm || 0
      },
      delivery: {
        cost: 0 // Will be calculated based on address
      },
      extras: {
        other: [...extrasConfig.selectedExtras, ...extrasConfig.customExtras].map(e => ({
          title: e.title,
          cost: e.priceIncVat * e.quantity
        }))
      }
    };
  }

  private isConfigurationValid(): boolean {
    return !!(this.state.size && 
              this.state.size.widthMm > 0 && 
              this.state.size.depthMm > 0);
  }

  private updateConfigurationSummary(): void {
    const summaryContainer = document.getElementById('config-summary-items');
    if (!summaryContainer) return;

    const items: string[] = [];

    if (this.state.size) {
      const widthM = (this.state.size.widthMm / 1000).toFixed(1);
      const depthM = (this.state.size.depthMm / 1000).toFixed(1);
      items.push(`Size: ${widthM}m × ${depthM}m`);
    }

    if (this.state.cladding && this.state.cladding.material && this.state.cladding.color) {
      items.push(`Cladding: ${this.state.cladding.material} - ${this.state.cladding.color}`);
    }

    if (this.state.bathroom && this.state.bathroom.type !== 'none') {
      items.push(`Bathroom: ${this.state.bathroom.count} ${this.state.bathroom.type}`);
    }

    if (this.state.floor && this.state.floor.type !== 'none') {
      items.push(`Floor: ${this.state.floor.type}`);
    }

    summaryContainer.innerHTML = items.map(item => `<div class="summary-item">${item}</div>`).join('');
    
    // Show summary if we have items
    const summaryCard = document.querySelector('.config-summary') as HTMLElement;
    if (summaryCard) {
      summaryCard.style.display = items.length > 0 ? 'block' : 'none';
    }
  }

  private showCurrentStep(): void {
    // Hide all steps first
    this.stepContainer.innerHTML = '';

    // Show current step
    if (this.steps[this.currentStepIndex]) {
      const stepName = STEP_NAMES[this.currentStepIndex];
      
      // Special handling for summary step
      if (stepName === 'summary') {
        const summaryStep = this.steps[this.currentStepIndex] as SummaryStep;
        summaryStep.updateConfiguration(this.state, true); // Pass current configuration
      } else {
        // Re-render current step if it has previous state
        const stepState = this.state[stepName];
        if (stepState) {
          // Use type assertion for now to avoid complex type intersection issues
          (this.steps[this.currentStepIndex] as any).setState?.(stepState);
        }
      }
    }

    // Update progress bar with new component
    if (this.progressBar) {
      // Map step index to step ID - add 'quote' as the final step
      const stepIds = [...STEP_NAMES, 'quote'];
      const currentStepId = stepIds[this.currentStepIndex];
      if (currentStepId) {
        this.progressBar.updateProgress(currentStepId);
      }
    }

    this.updateNavigationState();
    this.updatePriceDisplay();

    // Track step view
    analytics.configuratorStep(STEP_NAMES[this.currentStepIndex], 'garden-room', (this.currentStepIndex + 1) / STEP_NAMES.length);
  }

  // Note: This method is currently unused but may be needed for future progress tracking
  // private updateProgress(): void {
  //   const progress = ((this.currentStepIndex + 1) / STEP_NAMES.length) * 100;
  //   this.navigationElements.progressBar.style.width = `${progress}%`;
  //   
  //   // Update progress bar ARIA
  //   const progressContainer = document.querySelector('.progress-container');
  //   progressContainer?.setAttribute('aria-valuenow', (this.currentStepIndex + 1).toString());
  //
  //   // Update step indicators
  //   this.navigationElements.progressSteps.forEach((step, index) => {
  //     step.classList.toggle('active', index === this.currentStepIndex);
  //     step.classList.toggle('completed', index < this.currentStepIndex);
  //   });
  //
  //   this.navigationElements.currentStep.textContent = (this.currentStepIndex + 1).toString();
  // }

  private updateNavigationState(): void {
    // Previous button
    this.navigationElements.prevBtn.disabled = this.currentStepIndex === 0;

    // Next/Get Quote buttons
    const isLastStep = this.currentStepIndex === STEP_NAMES.length - 1;
    const currentStepValid = this.isCurrentStepValid();

    if (isLastStep) {
      this.navigationElements.nextBtn.style.display = 'none';
      this.navigationElements.getQuoteBtn.style.display = 'inline-flex';
      this.navigationElements.getQuoteBtn.disabled = !this.isConfigurationComplete();
    } else {
      this.navigationElements.nextBtn.style.display = 'inline-flex';
      this.navigationElements.getQuoteBtn.style.display = 'none';
      this.navigationElements.nextBtn.disabled = !currentStepValid;
    }
  }

  private isCurrentStepValid(): boolean {
    const step = this.steps[this.currentStepIndex];
    return step && step.getState ? step.getState().isValid : true;
  }

  private isConfigurationComplete(): boolean {
    // Minimum requirements: size and cladding
    return !!(this.state.size && 
              this.state.cladding && 
              this.state.cladding.material && 
              this.state.cladding.color);
  }

  private canNavigateToStep(targetIndex: number): boolean {
    // Can go backwards to any previous step
    if (targetIndex < this.currentStepIndex) return true;
    
    // Can go forward only if all previous steps are valid
    for (let i = 0; i < targetIndex; i++) {
      if (this.steps[i] && this.steps[i].getState && !this.steps[i].getState().isValid) {
        return false;
      }
    }
    return true;
  }

  private goToStep(stepIndex: number): void {
    if (stepIndex >= 0 && stepIndex < STEP_NAMES.length && this.canNavigateToStep(stepIndex)) {
      this.currentStepIndex = stepIndex;
      this.showCurrentStep();
    }
  }

  private previousStep(): void {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.showCurrentStep();
    }
  }

  private nextStep(): void {
    if (this.currentStepIndex < STEP_NAMES.length - 1 && this.isCurrentStepValid()) {
      this.currentStepIndex++;
      this.showCurrentStep();
    }
  }

  private proceedToQuote(): void {
    if (!this.isConfigurationComplete()) return;

    // Save final state
    this.saveState();

    // Track conversion
    const configInput = this.buildConfigurationInput();
    const pricing = calculatePriceEstimate(configInput, true);
    analytics.configuratorComplete('garden-room', 
      `config-${Date.now()}`, 
      pricing.totalIncVat);

    // Navigate to quote form (will be implemented in quote-form component)
    window.location.href = '/quote-form.html';
  }

  private saveState(): void {
    this.statePersistence.saveState(this.state, this.currentStepIndex);
  }

  private loadSavedState(): void {
    // Check for existing state and show resume prompt if available
    this.statePersistence.checkForResume((savedState, savedStep) => {
      this.resumeFromSavedState(savedState, savedStep);
    });
  }

  private resumeFromSavedState(savedState: Partial<ConfiguratorState>, savedStep: number): void {
    // Restore state
    this.state = { ...savedState };
    this.currentStepIndex = Math.min(savedStep, this.steps.length - 1);

    // Restore each step's state
    this.restoreStepStates();

    // Navigate to the saved step
    this.showCurrentStep();
    this.updatePriceDisplay();

    // Update progress bar
    this.progressBar.goToStep(STEP_NAMES[this.currentStepIndex]);

    // Analytics tracking
    analytics.configuratorStep(
      STEP_NAMES[this.currentStepIndex], 
      'garden-room', 
      ((this.currentStepIndex + 1) / this.steps.length) * 100
    );
  }

  private restoreStepStates(): void {
    // Restore state for each step using type-safe casting
    if (this.state.size && this.steps[0]) {
      (this.steps[0] as any).setState?.(this.state.size);
    }

    if (this.state.openings && this.steps[1]) {
      (this.steps[1] as any).setState?.(this.state.openings);
    }

    if (this.state.cladding && this.steps[2]) {
      (this.steps[2] as any).setState?.(this.state.cladding);
    }

    if (this.state.bathroom && this.steps[3]) {
      (this.steps[3] as any).setState?.(this.state.bathroom);
    }

    if (this.state.floor && this.steps[4]) {
      (this.steps[4] as any).setState?.(this.state.floor);
    }

    if (this.state.extras && this.steps[5]) {
      (this.steps[5] as any).setState?.(this.state.extras);
    }
  }

  private clearState(): void {
    this.state = {};
    this.statePersistence.clearState();
  }
}

// Initialize configurator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ConfiguratorController();
});