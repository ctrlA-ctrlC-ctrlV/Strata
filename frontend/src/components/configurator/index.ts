/**
 * Configurator Step Components
 * Exports all step components for the configurator wizard
 */

export { SizeStep, type SizeConfig, type SizeStepState } from './size-step.js';
export { OpeningsStep, type OpeningsConfig, type OpeningsStepState } from './openings-step.js';
export { CladdingStep, type CladdingConfig, type CladdingStepState } from './cladding-step.js';
export { BathroomStep, type BathroomConfig, type BathroomStepState } from './bathroom-step.js';
export { FloorStep, type FloorConfig, type FloorStepState } from './floor-step.js';
export { ExtrasStep, type ExtrasConfig, type ExtrasStepState } from './extras-step.js';
export { SummaryStep, type SummaryStepState } from './summary-step.js';

import type { SizeConfig } from './size-step.js';
import type { OpeningsConfig } from './openings-step.js';
import type { CladdingConfig } from './cladding-step.js';
import type { BathroomConfig } from './bathroom-step.js';
import type { FloorConfig } from './floor-step.js';
import type { ExtrasConfig } from './extras-step.js';
import type { SummaryStepState } from './summary-step.js';

// Combined configuration type for the entire wizard
export interface ConfiguratorState {
  size: SizeConfig;
  openings: OpeningsConfig;
  cladding: CladdingConfig;
  bathroom: BathroomConfig;
  floor: FloorConfig;
  extras: ExtrasConfig;
  summary: SummaryStepState;
  isValid: boolean;
  currentStep: number;
  totalSteps: number;
}

// Step validation state
export interface StepValidation {
  isValid: boolean;
  errors: string[];
}

// Export step names for navigation
export const STEP_NAMES = [
  'size',
  'openings',
  'cladding',
  'bathroom',
  'floor',
  'extras',
  'summary'
] as const;

export type StepName = typeof STEP_NAMES[number];