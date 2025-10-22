/**
 * Progress Bar Component
 * Visual progress indicator for configurator steps with accessibility support
 */

export interface ProgressStep {
  id: string
  title: string
  isComplete: boolean
  isActive: boolean
  isAccessible?: boolean // Can user navigate to this step
}

export class ProgressBar {
  private container: HTMLElement
  private steps: ProgressStep[]
  private onStepClickCallback?: (stepId: string) => void

  constructor(container: HTMLElement) {
    this.container = container
    this.steps = [
      { id: 'size', title: 'Size & Dimensions', isComplete: false, isActive: true, isAccessible: true },
      { id: 'openings', title: 'Windows & Doors', isComplete: false, isActive: false, isAccessible: false },
      { id: 'cladding', title: 'Cladding & Exterior', isComplete: false, isActive: false, isAccessible: false },
      { id: 'bathroom', title: 'Bathroom Options', isComplete: false, isActive: false, isAccessible: false },
      { id: 'floor', title: 'Flooring', isComplete: false, isActive: false, isAccessible: false },
      { id: 'extras', title: 'Extras & Add-ons', isComplete: false, isActive: false, isAccessible: false },
      { id: 'summary', title: 'Review Configuration', isComplete: false, isActive: false, isAccessible: false },
      { id: 'quote', title: 'Get Quote', isComplete: false, isActive: false, isAccessible: false }
    ]
    this.render()
  }

  /**
   * Update progress to a specific step
   */
  updateProgress(activeStepId: string): void {
    let foundActive = false
    
    this.steps.forEach((step, index) => {
      if (step.id === activeStepId) {
        step.isActive = true
        foundActive = true
        step.isAccessible = true
      } else if (!foundActive) {
        step.isComplete = true
        step.isActive = false
        step.isAccessible = true
      } else {
        step.isComplete = false
        step.isActive = false
        // Only next step becomes accessible when current is completed
        if (index === this.steps.findIndex(s => s.id === activeStepId) + 1) {
          step.isAccessible = true
        }
      }
    })
    
    this.render()
  }

  /**
   * Mark a step as complete and advance to next
   */
  completeStep(stepId: string): void {
    const currentIndex = this.steps.findIndex(step => step.id === stepId)
    if (currentIndex === -1) return

    // Mark current step as complete
    this.steps[currentIndex].isComplete = true
    this.steps[currentIndex].isActive = false

    // Activate next step if available
    if (currentIndex + 1 < this.steps.length) {
      this.steps[currentIndex + 1].isActive = true
      this.steps[currentIndex + 1].isAccessible = true
    }

    this.render()
  }

  /**
   * Go to a specific step (if accessible)
   */
  goToStep(stepId: string): boolean {
    const step = this.steps.find(s => s.id === stepId)
    if (!step || !step.isAccessible) return false

    // Clear all active states
    this.steps.forEach(s => s.isActive = false)
    
    // Set new active step
    step.isActive = true
    this.render()
    return true
  }

  /**
   * Get current active step
   */
  getCurrentStep(): ProgressStep | null {
    return this.steps.find(step => step.isActive) || null
  }

  /**
   * Get overall completion percentage
   */
  getCompletionPercentage(): number {
    const completedSteps = this.steps.filter(step => step.isComplete).length
    return Math.round((completedSteps / this.steps.length) * 100)
  }

  /**
   * Set step click handler
   */
  onStepClick(callback: (stepId: string) => void): void {
    this.onStepClickCallback = callback
  }

  /**
   * Get next accessible step
   */
  getNextStep(): ProgressStep | null {
    const currentIndex = this.steps.findIndex(step => step.isActive)
    if (currentIndex === -1) return null

    for (let i = currentIndex + 1; i < this.steps.length; i++) {
      if (this.steps[i].isAccessible) {
        return this.steps[i]
      }
    }
    return null
  }

  /**
   * Get previous accessible step
   */
  getPreviousStep(): ProgressStep | null {
    const currentIndex = this.steps.findIndex(step => step.isActive)
    if (currentIndex === -1) return null

    for (let i = currentIndex - 1; i >= 0; i--) {
      if (this.steps[i].isAccessible) {
        return this.steps[i]
      }
    }
    return null
  }

  /**
   * Render the progress bar UI
   */
  private render(): void {
    const currentStep = this.getCurrentStep()
    const stepNumber = currentStep ? this.steps.findIndex(s => s.id === currentStep.id) + 1 : 1
    
    const progressHtml = `
      <div class="progress-container">
        <!-- Progress bar background -->
        <div class="progress-bar" role="progressbar" 
             aria-valuemin="0" aria-valuemax="100" 
             aria-valuenow="${this.getCompletionPercentage()}"
             aria-label="Configuration progress: ${this.getCompletionPercentage()}% complete">
          <div class="progress-fill" style="width: ${this.getCompletionPercentage()}%"></div>
        </div>
        
        <!-- Screen reader status -->
        <div class="sr-only" aria-live="polite" aria-atomic="true">
          Step ${stepNumber} of ${this.steps.length}: ${currentStep?.title || 'Unknown'}
        </div>
        
        <!-- Step indicators -->
        <ol class="progress-steps" role="list" aria-label="Configuration steps">
          ${this.steps.map((step, index) => this.renderStep(step, index)).join('')}
        </ol>
        
        <!-- Step labels -->
        <div class="progress-labels">
          ${this.steps.map(step => this.renderLabel(step)).join('')}
        </div>
      </div>
    `

    this.container.innerHTML = progressHtml
    this.attachEventListeners()
  }

  /**
   * Render individual step indicator
   */
  private renderStep(step: ProgressStep, index: number): string {
    let stepClass = 'progress-step'
    let stepIcon = (index + 1).toString()
    let ariaLabel = `Step ${index + 1}: ${step.title}`
    let role = 'listitem'
    let tabIndex = -1

    if (step.isComplete) {
      stepClass += ' completed'
      stepIcon = '✓'
      ariaLabel += ' - Completed'
      if (step.isAccessible) {
        role = 'button'
        tabIndex = 0
        ariaLabel += ' (click to revisit)'
      }
    } else if (step.isActive) {
      stepClass += ' active'
      ariaLabel += ' - Current step'
    } else {
      stepClass += ' pending'
      ariaLabel += step.isAccessible ? ' - Available' : ' - Locked'
      if (step.isAccessible) {
        role = 'button'
        tabIndex = 0
        ariaLabel += ' (click to navigate)'
      }
    }

    if (!step.isAccessible) {
      stepClass += ' disabled'
    } else if (step.isAccessible && !step.isActive) {
      stepClass += ' clickable'
    }

    return `
      <li class="${stepClass}" 
          role="${role}"
          ${tabIndex >= 0 ? `tabindex="${tabIndex}"` : ''}
          aria-label="${ariaLabel}"
          data-step-id="${step.id}"
          ${step.isAccessible ? 'aria-pressed="false"' : ''}>
        <span class="step-icon" aria-hidden="true">${stepIcon}</span>
      </li>
    `
  }

  /**
   * Render step label
   */
  private renderLabel(step: ProgressStep): string {
    let labelClass = 'progress-label'
    
    if (step.isComplete) {
      labelClass += ' completed'
    } else if (step.isActive) {
      labelClass += ' active'
    } else {
      labelClass += ' pending'
    }

    if (!step.isAccessible) {
      labelClass += ' disabled'
    }

    return `
      <div class="${labelClass}" data-step-id="${step.id}">
        ${step.title}
      </div>
    `
  }

  /**
   * Attach event listeners for navigation
   */
  private attachEventListeners(): void {
    const clickableSteps = this.container.querySelectorAll('.progress-step.clickable, .progress-step.completed')
    
    clickableSteps.forEach(stepElement => {
      const stepId = stepElement.getAttribute('data-step-id')
      if (!stepId) return

      // Click handler
      stepElement.addEventListener('click', () => {
        if (this.onStepClickCallback) {
          this.onStepClickCallback(stepId)
        }
      })

      // Keyboard handler
      stepElement.addEventListener('keydown', (event) => {
        const keyboardEvent = event as KeyboardEvent
        if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
          keyboardEvent.preventDefault()
          if (this.onStepClickCallback) {
            this.onStepClickCallback(stepId)
          }
        }
      })

      // Focus handler for aria-pressed
      stepElement.addEventListener('focus', () => {
        stepElement.setAttribute('aria-pressed', 'true')
      })

      stepElement.addEventListener('blur', () => {
        stepElement.setAttribute('aria-pressed', 'false')
      })
    })
  }

  /**
   * Legacy method: Enable click navigation to completed or active steps
   * @deprecated Use onStepClick() instead
   */
  enableNavigation(onStepClick: (stepId: string) => void): void {
    this.onStepClick(onStepClick)
  }
}

/**
 * CSS styles for progress bar (to be included in main CSS)
 */
export const progressBarStyles = `
/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.progress-container {
  position: relative;
  margin: 2rem 0;
  padding: 1rem 0;
}

.progress-bar {
  position: relative;
  width: 100%;
  height: 4px;
  background-color: var(--color-neutral-200);
  border-radius: 2px;
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary-500), var(--color-primary-600));
  border-radius: 2px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 8px rgba(var(--color-primary-500-rgb), 0.3);
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  margin: 0;
  padding: 0;
  list-style: none;
  margin-bottom: 0.75rem;
}

.progress-step {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 2px solid var(--color-neutral-300);
  border-radius: 50%;
  background-color: var(--color-neutral-50);
  color: var(--color-neutral-600);
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;
  outline: none;
}

.progress-step.clickable {
  cursor: pointer;
  border-color: var(--color-primary-300);
}

.progress-step.clickable:hover {
  transform: scale(1.05);
  border-color: var(--color-primary-500);
  background-color: var(--color-primary-50);
  box-shadow: 0 2px 8px rgba(var(--color-primary-500-rgb), 0.2);
}

.progress-step.clickable:focus {
  transform: scale(1.05);
  border-color: var(--color-primary-500);
  background-color: var(--color-primary-50);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-500-rgb), 0.3);
}

.progress-step.completed {
  background-color: var(--color-primary-500);
  border-color: var(--color-primary-500);
  color: white;
  cursor: pointer;
}

.progress-step.completed:hover {
  transform: scale(1.05);
  background-color: var(--color-primary-600);
  box-shadow: 0 2px 8px rgba(var(--color-primary-600-rgb), 0.3);
}

.progress-step.completed:focus {
  transform: scale(1.05);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-500-rgb), 0.3);
}

.progress-step.active {
  background-color: var(--color-primary-500);
  border-color: var(--color-primary-500);
  color: white;
  transform: scale(1.1);
  box-shadow: 0 0 0 4px rgba(var(--color-primary-500-rgb), 0.2);
}

.progress-step.pending {
  opacity: 0.6;
}

.progress-step.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.step-icon {
  display: block;
  line-height: 1;
  font-size: inherit;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.progress-label {
  flex: 1;
  text-align: center;
  font-size: 0.75rem;
  color: var(--color-neutral-600);
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.progress-label.completed {
  color: var(--color-primary-600);
  font-weight: 600;
}

.progress-label.active {
  color: var(--color-primary-700);
  font-weight: 700;
  font-size: 0.8125rem;
}

.progress-label.disabled {
  opacity: 0.5;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .progress-container {
    margin: 1.5rem 0;
    padding: 0.75rem 0;
  }
  
  .progress-step {
    width: 32px;
    height: 32px;
    font-size: 0.75rem;
  }
  
  .progress-label {
    font-size: 0.6875rem;
  }
  
  .progress-label.active {
    font-size: 0.75rem;
  }
}

@media (max-width: 640px) {
  .progress-step {
    width: 28px;
    height: 28px;
    font-size: 0.6875rem;
  }
  
  .progress-labels {
    gap: 0.25rem;
  }
  
  .progress-label {
    font-size: 0.625rem;
  }
}

@media (max-width: 480px) {
  .progress-container {
    margin: 1rem 0;
  }
  
  .progress-labels .progress-label:nth-child(even) {
    display: none;
  }
  
  .progress-steps {
    margin-bottom: 1rem;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .progress-step {
    border-width: 3px;
  }
  
  .progress-step.active,
  .progress-step.completed {
    border-color: var(--color-neutral-900);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .progress-fill,
  .progress-step {
    transition: none;
  }
  
  .progress-step:hover,
  .progress-step:focus,
  .progress-step.active {
    transform: none;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .progress-bar {
    background-color: var(--color-neutral-700);
  }
  
  .progress-step {
    border-color: var(--color-neutral-600);
    background-color: var(--color-neutral-800);
    color: var(--color-neutral-300);
  }
  
  .progress-label {
    color: var(--color-neutral-400);
  }
}
`