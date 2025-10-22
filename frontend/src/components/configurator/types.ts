/**
 * Type Definitions for Quote Form Components
 * Shared interfaces and types for the configurator quote system
 */

/**
 * County data structure for Eircode validation
 */
export interface CountyData {
  /** Single letter county code */
  code: string;
  /** Full county name (may include multiple counties separated by /) */
  name: string;
  /** Array of valid 3-character routing keys for this county */
  routingKeys: string[];
}

/**
 * Customer contact information
 */
export interface CustomerInfo {
  /** Customer's first name */
  firstName: string;
  /** Customer's last name */
  lastName: string;
  /** Customer's email address */
  email: string;
  /** Customer's phone number */
  phone: string;
  /** Customer's street address */
  address: string;
  /** Customer's city/town */
  city: string;
  /** Customer's county */
  county: string;
  /** Customer's Eircode (Irish postal code) */
  eircode: string;
}

/**
 * Complete quote form data structure
 */
export interface QuoteFormData extends CustomerInfo {
  /** Indicates VAT inclusion preference */
  includeVat: boolean;
  /** Base price before VAT */
  basePrice: number;
  /** VAT amount */
  vatAmount: number;
  /** Total price including VAT if selected */
  totalPrice: number;
  /** Quote configuration data as JSON string */
  configurationData: string;
  /** Marketing consent flag */
  marketingConsent: boolean;
  /** Terms and conditions acceptance */
  termsAccepted: boolean;
}

/**
 * Form validation result
 */
export interface ValidationResult {
  /** Whether the field is valid */
  isValid: boolean;
  /** Error message if validation failed */
  error?: string;
}

/**
 * Form field validation state
 */
export interface FieldValidation {
  /** Whether the field has been touched by the user */
  touched: boolean;
  /** Whether the field is currently valid */
  valid: boolean;
  /** Current error message for the field */
  error: string;
}

/**
 * Complete form validation state
 */
export interface FormValidationState {
  [fieldName: string]: FieldValidation;
}

/**
 * Quote submission response from the API
 */
export interface QuoteSubmissionResponse {
  /** Whether the submission was successful */
  success: boolean;
  /** Unique quote reference ID */
  quoteId?: string;
  /** Human-readable message */
  message: string;
  /** Any validation errors returned by the server */
  errors?: Record<string, string>;
}

/**
 * Configuration data structure for pricing calculations
 */
export interface ConfigurationData {
  /** Project type (apartment, house, etc.) */
  projectType: string;
  /** Square meters of coverage */
  squareMeters: number;
  /** Insulation type selected */
  insulationType: string;
  /** Additional options selected */
  options: string[];
  /** Calculated base price */
  basePrice: number;
  /** Region-specific pricing adjustments */
  regionMultiplier?: number;
}

/**
 * Phone number validation options
 */
export interface PhoneValidationOptions {
  /** Whether to allow international numbers */
  allowInternational?: boolean;
  /** Default country code */
  defaultCountryCode?: string;
  /** Required format (national or international) */
  requiredFormat?: 'national' | 'international';
}

/**
 * Email validation options
 */
export interface EmailValidationOptions {
  /** Whether to allow disposable email domains */
  allowDisposable?: boolean;
  /** List of blocked domains */
  blockedDomains?: string[];
  /** Whether to perform DNS validation */
  checkDns?: boolean;
}

/**
 * Form submission state
 */
export interface SubmissionState {
  /** Whether form is currently being submitted */
  isSubmitting: boolean;
  /** Whether submission was successful */
  submitted: boolean;
  /** Any submission error */
  error: string | null;
  /** Number of submission attempts */
  attempts: number;
}

/**
 * Form configuration options
 */
export interface QuoteFormConfig {
  /** Whether to show VAT toggle */
  showVatToggle: boolean;
  /** Whether to require phone number */
  requirePhone: boolean;
  /** Whether to show marketing consent checkbox */
  showMarketingConsent: boolean;
  /** Custom validation rules */
  customValidation?: Record<string, (value: string) => ValidationResult>;
  /** Form submission endpoint */
  submitEndpoint: string;
  /** Success redirect URL */
  successUrl?: string;
}

/**
 * Event types for form interactions
 */
export type QuoteFormEvent = 
  | 'field_focus'
  | 'field_blur'
  | 'field_change'
  | 'validation_error'
  | 'form_submit'
  | 'form_success'
  | 'form_error'
  | 'vat_toggle'
  | 'eircode_suggestion';

/**
 * Form event data structure
 */
export interface FormEventData {
  /** Type of event */
  event: QuoteFormEvent;
  /** Field name (if applicable) */
  field?: string;
  /** Event value */
  value?: string | number | boolean | object | null;
  /** Additional event metadata */
  metadata?: Record<string, string | number | boolean>;
  /** Timestamp of the event */
  timestamp: number;
}

/**
 * Eircode suggestion result
 */
export interface EircodeSuggestion {
  /** The suggested routing key */
  routingKey: string;
  /** Associated county name */
  county: string;
  /** Display text for the suggestion */
  displayText: string;
}

/**
 * Form field definition for dynamic form generation
 */
export interface FormFieldDefinition {
  /** Field name/id */
  name: string;
  /** Field type */
  type: 'text' | 'email' | 'tel' | 'select' | 'checkbox';
  /** Display label */
  label: string;
  /** Whether field is required */
  required: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Help text */
  helpText?: string;
  /** Validation rules */
  validation?: ValidationResult[];
  /** Options for select fields */
  options?: { value: string; label: string }[];
  /** Field group for layout */
  group?: string;
}

/**
 * Response from price calculation service
 */
export interface PriceCalculationResponse {
  /** Base price before VAT */
  basePrice: number;
  /** VAT rate (as decimal, e.g., 0.23 for 23%) */
  vatRate: number;
  /** VAT amount in euros */
  vatAmount: number;
  /** Total price including VAT */
  totalPrice: number;
  /** Price breakdown by component */
  breakdown: {
    materials: number;
    labor: number;
    equipment: number;
    margin: number;
  };
  /** Any applied discounts */
  discounts?: {
    type: string;
    amount: number;
    description: string;
  }[];
}