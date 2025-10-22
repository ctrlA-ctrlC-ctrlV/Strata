/**
 * API Client for Frontend-Backend Communication
 * Handles HTTP requests to the backend API with proper error handling and type safety
 */

import { QuoteFormData, QuoteSubmissionResponse } from '../components/configurator/types.ts';

/**
 * Base API configuration
 */
interface APIConfig {
  baseURL: string;
  timeout: number;
  retries: number;
}

/**
 * HTTP response wrapper
 */
interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  status: number;
  headers: Headers;
}

/**
 * API error class for structured error handling
 */
export class APIError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details: Record<string, string>;

  constructor(message: string, status: number, code?: string, details?: Record<string, string>) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code || '';
    this.details = details || {};
  }
}

/**
 * Network timeout error
 */
export class NetworkTimeoutError extends Error {
  constructor(timeout: number) {
    super(`Request timed out after ${timeout}ms`);
    this.name = 'NetworkTimeoutError';
  }
}

/**
 * Network connection error
 */
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * API client class for handling backend requests
 */
class APIClient {
  private config: APIConfig;

  constructor(config: Partial<APIConfig> = {}) {
    this.config = {
      baseURL: config.baseURL || this.getDefaultBaseURL(),
      timeout: config.timeout || 30000, // 30 second timeout
      retries: config.retries || 3
    };
  }

  /**
   * Get default base URL based on environment
   */
  private getDefaultBaseURL(): string {
    if (typeof window !== 'undefined') {
      // Browser environment - use current origin for production, or localhost for development
      const { protocol, hostname } = window.location;
      
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Development environment - backend typically runs on port 3001
        return `${protocol}//${hostname}:3001/api`;
      }
      
      // Production environment - assume API is on same origin
      return `${protocol}//${hostname}/api`;
    }
    
    // Development environment fallback
    return 'http://localhost:3001/api';
  }

  /**
   * Make HTTP request with retry logic and timeout
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 1
  ): Promise<APIResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`;
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers
        }
      });

      clearTimeout(timeoutId);

      const success = response.ok;
      let data: T;
      let error: string | undefined;

      // Try to parse JSON response
      try {
        const json = await response.json();
        if (success) {
          data = json as T;
        } else {
          error = json.message || json.error || `HTTP ${response.status}`;
        }
      } catch {
        // Not JSON response
        if (!success) {
          error = `HTTP ${response.status}: ${response.statusText}`;
        }
      }

      if (!success) {
        throw new APIError(
          error || `Request failed with status ${response.status}`,
          response.status
        );
      }

      // data will be defined here because success is true
      return {
        success: true,
        data: data!,
        status: response.status,
        headers: response.headers
      };

    } catch (err) {
      clearTimeout(timeoutId);

      // Handle timeout
      if (err instanceof Error && err.name === 'AbortError') {
        throw new NetworkTimeoutError(this.config.timeout);
      }

      // Handle network errors
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new NetworkError('Network connection failed');
      }

      // Re-throw API errors
      if (err instanceof APIError) {
        // Retry logic for server errors (5xx) and specific client errors
        if (
          attempt < this.config.retries && 
          (err.status >= 500 || err.status === 429) // Server error or rate limit
        ) {
          const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeRequest<T>(endpoint, options, attempt + 1);
        }
        
        throw err;
      }

      // Unknown error
      throw new NetworkError('Unknown network error occurred');
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.config.baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await this.makeRequest<T>(endpoint + url.search);
    return response.data!;
  }

  /**
   * POST request
   */
  async post<T, U = any>(endpoint: string, data?: U): Promise<T> {
    const requestOptions: RequestInit = {
      method: 'POST'
    };
    
    if (data) {
      requestOptions.body = JSON.stringify(data);
    }
    
    const response = await this.makeRequest<T>(endpoint, requestOptions);
    return response.data!;
  }

  /**
   * PUT request
   */
  async put<T, U = any>(endpoint: string, data?: U): Promise<T> {
    const requestOptions: RequestInit = {
      method: 'PUT'
    };
    
    if (data) {
      requestOptions.body = JSON.stringify(data);
    }
    
    const response = await this.makeRequest<T>(endpoint, requestOptions);
    return response.data!;
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.makeRequest<T>(endpoint, {
      method: 'DELETE'
    });
    return response.data!;
  }

  /**
   * Check API health/connectivity
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health');
      return true;
    } catch {
      return false;
    }
  }
}

// Create default client instance
const apiClient = new APIClient();

/**
 * Quote submission payload for API request
 */
export interface QuoteSubmissionPayload {
  // Customer information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  county: string;
  eircode: string;

  // Configuration and pricing
  includeVat: boolean;
  basePrice: number;
  vatAmount: number;
  totalPrice: number;
  configurationData: string; // JSON string of configurator state
  
  // Additional info
  desiredInstallTimeframe?: string;
  marketingConsent: boolean;
  termsAccepted: boolean;

  // Metadata
  source: string; // Where the quote originated (configurator, contact form, etc.)
  userAgent: string;
  referrer: string;
}

/**
 * Submit a quote request to the backend
 */
export async function submitQuote(quoteData: QuoteFormData): Promise<QuoteSubmissionResponse> {
  try {
    // Prepare payload
    const payload: QuoteSubmissionPayload = {
      firstName: quoteData.firstName,
      lastName: quoteData.lastName,
      email: quoteData.email,
      phone: quoteData.phone,
      address: quoteData.address,
      city: quoteData.city,
      county: quoteData.county,
      eircode: quoteData.eircode,
      includeVat: quoteData.includeVat,
      basePrice: quoteData.basePrice,
      vatAmount: quoteData.vatAmount,
      totalPrice: quoteData.totalPrice,
      configurationData: quoteData.configurationData,
      marketingConsent: quoteData.marketingConsent,
      termsAccepted: quoteData.termsAccepted,
      source: 'configurator',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      referrer: typeof document !== 'undefined' ? document.referrer : ''
    };

    // Submit to backend
    const response = await apiClient.post<QuoteSubmissionResponse>('/quotes', payload);
    
    return {
      success: true,
      quoteId: response.quoteId || '',
      message: response.message || 'Quote submitted successfully'
    };

  } catch (error) {
    console.error('Quote submission failed:', error);

    if (error instanceof APIError) {
      return {
        success: false,
        message: error.message,
        errors: error.details
      };
    }

    if (error instanceof NetworkTimeoutError) {
      return {
        success: false,
        message: 'Request timed out. Please check your connection and try again.'
      };
    }

    if (error instanceof NetworkError) {
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    }

    return {
      success: false,
      message: 'An unexpected error occurred. Please try again later.'
    };
  }
}

/**
 * Contact form submission payload
 */
export interface ContactSubmissionPayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  source: string;
  marketingConsent?: boolean;
}

/**
 * Contact form response
 */
export interface ContactSubmissionResponse {
  success: boolean;
  message: string;
  contactId?: string;
  errors?: Record<string, string>;
}

/**
 * Submit a contact form request
 */
export async function submitContact(contactData: ContactSubmissionPayload): Promise<ContactSubmissionResponse> {
  try {
    const response = await apiClient.post<ContactSubmissionResponse>('/contact', contactData);
    
    return {
      success: true,
      contactId: response.contactId || '',
      message: response.message || 'Message sent successfully'
    };

  } catch (error) {
    console.error('Contact submission failed:', error);

    if (error instanceof APIError) {
      return {
        success: false,
        message: error.message,
        errors: error.details
      };
    }

    if (error instanceof NetworkTimeoutError) {
      return {
        success: false,
        message: 'Request timed out. Please check your connection and try again.'
      };
    }

    if (error instanceof NetworkError) {
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    }

    return {
      success: false,
      message: 'An unexpected error occurred. Please try again later.'
    };
  }
}

/**
 * Get quote status by ID
 */
export async function getQuoteStatus(quoteId: string): Promise<{
  status: string;
  lastUpdated: string;
  details?: Record<string, unknown>;
}> {
  return apiClient.get(`/quotes/${quoteId}/status`);
}

/**
 * Send configuration via email (for "Email Design" feature)
 */
export interface EmailDesignPayload {
  email: string;
  configurationData: string;
  message?: string;
}

export async function emailConfiguration(data: EmailDesignPayload): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const response = await apiClient.post<{ success: boolean; message: string }>('/email-configuration', data);
    return response;
  } catch (error) {
    console.error('Email configuration failed:', error);
    return {
      success: false,
      message: error instanceof APIError ? error.message : 'Failed to send configuration'
    };
  }
}

/**
 * Utility function to check if API is available
 */
export async function checkAPIAvailability(): Promise<boolean> {
  return apiClient.healthCheck();
}

/**
 * Export API client for direct use if needed
 */
export { apiClient };