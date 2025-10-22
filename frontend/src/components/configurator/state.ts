/**
 * Configuration State Persistence
 * Handles saving and restoring configurator state to sessionStorage
 */

import type { ConfiguratorState } from './index.js';

const STORAGE_KEY = 'strata_configurator_state';
const STORAGE_VERSION = '1.0';

interface StoredConfigState {
  version: string;
  timestamp: number;
  data: Partial<ConfiguratorState>;
  currentStep?: number;
  sessionId?: string;
}

export class ConfiguratorStatePersistence {
  private static instance: ConfiguratorStatePersistence;
  private sessionId: string;
  private resumeCallback?: (state: Partial<ConfiguratorState>, step: number) => void;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  public static getInstance(): ConfiguratorStatePersistence {
    if (!ConfiguratorStatePersistence.instance) {
      ConfiguratorStatePersistence.instance = new ConfiguratorStatePersistence();
    }
    return ConfiguratorStatePersistence.instance;
  }

  /**
   * Generate a unique session identifier
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save current configuration state
   */
  public saveState(state: Partial<ConfiguratorState>, currentStep: number = 0): void {
    try {
      const stateData: StoredConfigState = {
        version: STORAGE_VERSION,
        timestamp: Date.now(),
        data: this.sanitizeState(state),
        currentStep,
        sessionId: this.sessionId
      };

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateData));
    } catch (error) {
      console.warn('Failed to save configurator state:', error);
    }
  }

  /**
   * Load saved configuration state
   */
  public loadState(): StoredConfigState | null {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const stateData: StoredConfigState = JSON.parse(stored);
      
      // Version compatibility check
      if (stateData.version !== STORAGE_VERSION) {
        console.warn('Stored state version mismatch, clearing...');
        this.clearState();
        return null;
      }

      // Age check (24 hours max)
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      if (Date.now() - stateData.timestamp > maxAge) {
        console.info('Stored state expired, clearing...');
        this.clearState();
        return null;
      }

      return stateData;
    } catch (error) {
      console.warn('Failed to load configurator state:', error);
      this.clearState();
      return null;
    }
  }

  /**
   * Check if there's a saved state and show resume prompt
   */
  public checkForResume(onResume: (state: Partial<ConfiguratorState>, step: number) => void): boolean {
    const savedState = this.loadState();
    if (!savedState) return false;

    this.resumeCallback = onResume;
    this.showResumePrompt(savedState);
    return true;
  }

  /**
   * Show resume prompt to user
   */
  private showResumePrompt(savedState: StoredConfigState): void {
    const prompt = document.createElement('div');
    prompt.className = 'configurator-resume-prompt';
    prompt.setAttribute('role', 'dialog');
    prompt.setAttribute('aria-labelledby', 'resume-title');
    prompt.setAttribute('aria-describedby', 'resume-description');

    const timeAgo = this.formatTimeAgo(savedState.timestamp);
    const stepName = this.getStepName(savedState.currentStep || 0);

    prompt.innerHTML = `
      <div class="resume-overlay"></div>
      <div class="resume-modal">
        <div class="resume-header">
          <h3 id="resume-title">Resume Configuration</h3>
          <button class="resume-close" aria-label="Close dialog">&times;</button>
        </div>
        <div class="resume-content">
          <p id="resume-description">
            We found a saved configuration from ${timeAgo}. 
            You were on the <strong>${stepName}</strong> step.
          </p>
          <p>Would you like to resume where you left off or start fresh?</p>
        </div>
        <div class="resume-actions">
          <button class="btn btn-secondary resume-new">Start Fresh</button>
          <button class="btn btn-primary resume-continue">Resume Configuration</button>
        </div>
      </div>
    `;

    // Add to page
    document.body.appendChild(prompt);

    // Focus management
    const modal = prompt.querySelector('.resume-modal') as HTMLElement;
    const firstButton = modal.querySelector('.resume-continue') as HTMLButtonElement;
    firstButton.focus();

    // Event handlers
    const handleResume = () => {
      if (this.resumeCallback) {
        this.resumeCallback(savedState.data, savedState.currentStep || 0);
      }
      this.removePrompt();
    };

    const handleNew = () => {
      this.clearState();
      this.removePrompt();
    };

    const handleClose = () => {
      this.removePrompt();
    };

    // Bind events
    prompt.querySelector('.resume-continue')?.addEventListener('click', handleResume);
    prompt.querySelector('.resume-new')?.addEventListener('click', handleNew);
    prompt.querySelector('.resume-close')?.addEventListener('click', handleClose);
    prompt.querySelector('.resume-overlay')?.addEventListener('click', handleClose);

    // Keyboard handling
    prompt.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'Tab') {
        this.trapFocus(e, modal);
      }
    });
  }

  /**
   * Remove resume prompt from DOM
   */
  private removePrompt(): void {
    const prompt = document.querySelector('.configurator-resume-prompt');
    if (prompt) {
      document.body.removeChild(prompt);
    }
  }

  /**
   * Trap focus within modal
   */
  private trapFocus(event: KeyboardEvent, container: HTMLElement): void {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  /**
   * Clear stored state
   */
  public clearState(): void {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear configurator state:', error);
    }
  }

  /**
   * Sanitize state data before storage (remove sensitive data)
   */
  private sanitizeState(state: Partial<ConfiguratorState>): Partial<ConfiguratorState> {
    const sanitized = { ...state };
    
    // Remove any sensitive or temporary data that shouldn't be persisted
    if (sanitized.summary) {
      // Don't persist summary state as it's derived
      delete sanitized.summary;
    }

    return sanitized;
  }

  /**
   * Format timestamp as human-readable time ago
   */
  private formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) {
      return 'just now';
    } else if (minutes < 60) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return new Date(timestamp).toLocaleDateString();
    }
  }

  /**
   * Get human-readable step name
   */
  private getStepName(stepIndex: number): string {
    const stepNames = [
      'Size Selection',
      'Windows & Doors',
      'Cladding',
      'Bathroom',
      'Flooring',
      'Extras',
      'Summary'
    ];

    return stepNames[stepIndex] || 'Configuration';
  }

  /**
   * Auto-save functionality - call this when state changes
   */
  public autoSave(state: Partial<ConfiguratorState>, currentStep: number): void {
    // Debounce auto-save to avoid excessive storage operations
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }

    this.autoSaveTimeout = setTimeout(() => {
      this.saveState(state, currentStep);
    }, 1000); // Save after 1 second of inactivity
  }

  private autoSaveTimeout?: number;

  /**
   * Check if browser supports sessionStorage
   */
  public static isSupported(): boolean {
    try {
      const test = '__storage_test__';
      sessionStorage.setItem(test, 'test');
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * CSS styles for resume prompt
 */
export const RESUME_PROMPT_STYLES = `
.configurator-resume-prompt {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.resume-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.resume-modal {
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  max-width: 480px;
  width: 100%;
  overflow: hidden;
  animation: resumeModalIn 0.3s ease-out;
}

@keyframes resumeModalIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.resume-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.resume-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.resume-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.resume-close:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.resume-content {
  padding: 1rem 1.5rem 1.5rem;
}

.resume-content p {
  margin: 0 0 1rem;
  color: #4b5563;
  line-height: 1.6;
}

.resume-content p:last-child {
  margin-bottom: 0;
}

.resume-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  background: #f9fafb;
  justify-content: flex-end;
}

.resume-actions .btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.resume-actions .btn-secondary {
  background: white;
  color: #374151;
  border-color: #d1d5db;
}

.resume-actions .btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.resume-actions .btn-primary {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.resume-actions .btn-primary:hover {
  background: #1d4ed8;
  border-color: #1d4ed8;
}

.resume-actions .btn:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Mobile styles */
@media (max-width: 640px) {
  .configurator-resume-prompt {
    padding: 1rem;
  }
  
  .resume-modal {
    max-width: none;
  }
  
  .resume-actions {
    flex-direction: column;
  }
  
  .resume-actions .btn {
    width: 100%;
  }
}
`;