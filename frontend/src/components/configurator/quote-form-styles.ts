/**
 * Quote Form Styles
 * Comprehensive styling for the quote form component with accessibility and responsive design
 */

export const QUOTE_FORM_STYLES = `
/* Quote Form Container */
.quote-form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.quote-form-header {
  margin-bottom: 2rem;
  text-align: center;
}

.quote-form-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.quote-form-description {
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
}

/* Pricing Summary */
.pricing-summary {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.pricing-summary h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.price-breakdown {
  margin-bottom: 1rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e0e7ff;
}

.price-row:last-child {
  border-bottom: none;
}

.price-total {
  border-top: 2px solid #3b82f6;
  margin-top: 0.5rem;
  padding-top: 1rem;
  font-weight: 600;
  font-size: 1.125rem;
}

.price-label {
  color: #374151;
}

.price-value {
  color: #1f2937;
  font-weight: 500;
}

.price-total .price-value {
  color: #2563eb;
  font-weight: 700;
}

.price-disclaimer {
  font-size: 0.875rem;
  color: #6b7280;
  font-style: italic;
  margin: 0;
  text-align: center;
}

/* Form Styling */
.quote-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 0;
}

.form-section legend {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  padding: 0 0.75rem;
  margin-bottom: 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

/* Labels */
label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  display: block;
}

label.required::after {
  content: ' *';
  color: #dc2626;
}

/* Form Controls */
input, select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
}

input:focus, select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

input.error, select.error {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

input::placeholder {
  color: #9ca3af;
}

/* Phone Input Group */
.phone-input-group {
  display: flex;
  gap: 0.5rem;
}

.phone-prefix {
  flex: 0 0 120px;
  background: #f9fafb;
  border-right: none;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.phone-input-group input {
  flex: 1;
  border-left: none;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

/* Help Text */
.field-help {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

/* Error Messages */
.field-error {
  font-size: 0.875rem;
  color: #dc2626;
  margin-top: 0.25rem;
  display: none;
}

.field-error:not(:empty) {
  display: block;
}

/* Submission Messages */
.submission-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.submission-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.error-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #dc2626;
  flex-shrink: 0;
}

.error-message {
  flex: 1;
  color: #7f1d1d;
  font-weight: 500;
}

.error-close {
  background: none;
  border: none;
  color: #dc2626;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.error-close:hover {
  background: rgba(220, 38, 38, 0.1);
}

.success-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.success-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #16a34a;
  flex-shrink: 0;
}

.success-message {
  flex: 1;
  color: #15803d;
  font-weight: 500;
  margin: 0;
}

.quote-id {
  font-size: 0.875rem;
  color: #166534;
  margin: 0.25rem 0 0 0;
}

.success-close {
  background: none;
  border: none;
  color: #16a34a;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.success-close:hover {
  background: rgba(22, 163, 74, 0.1);
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  min-height: 3rem;
  position: relative;
}

.btn-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.btn-primary {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
  border-color: #1d4ed8;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: #9ca3af;
  border-color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.btn-outline {
  background: transparent;
  color: #374151;
  border-color: #d1d5db;
}

.btn-outline:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

/* Button Loading State */
.btn-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Footer */
.quote-form-footer {
  margin-top: 2rem;
  text-align: center;
}

.privacy-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.privacy-icon {
  width: 1rem;
  height: 1rem;
  color: #10b981;
  flex-shrink: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .quote-form-container {
    margin: 1rem;
    padding: 1rem;
  }
  
  .quote-form-header h2 {
    font-size: 1.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .phone-input-group {
    flex-direction: column;
  }
  
  .phone-prefix {
    flex: 1;
    border-radius: 6px;
    border-right: 1px solid #d1d5db;
  }
  
  .phone-input-group input {
    border-left: 1px solid #d1d5db;
    border-radius: 6px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  
  .privacy-notice {
    flex-direction: column;
    text-align: center;
    padding: 0.75rem;
  }
}

/* Focus Styles for Accessibility */
input:focus-visible,
select:focus-visible,
button:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  .form-section {
    border-width: 2px;
  }
  
  input, select {
    border-width: 2px;
  }
  
  .btn {
    border-width: 2px;
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Print Styles */
@media print {
  .quote-form-container {
    box-shadow: none;
    border: 1px solid #000;
  }
  
  .form-actions,
  .btn {
    display: none;
  }
  
  .pricing-summary {
    background: none;
    border: 1px solid #000;
  }
}

/* Dark Mode Support (if enabled) */
@media (prefers-color-scheme: dark) {
  .quote-form-container {
    background: #1f2937;
    color: #f9fafb;
  }
  
  .quote-form-header h2 {
    color: #f9fafb;
  }
  
  .quote-form-description,
  .field-help {
    color: #d1d5db;
  }
  
  .form-section {
    border-color: #374151;
    background: #111827;
  }
  
  .form-section legend {
    color: #f9fafb;
  }
  
  label {
    color: #f9fafb;
  }
  
  input, select {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
  
  input::placeholder {
    color: #9ca3af;
  }
  
  .phone-prefix {
    background: #4b5563;
  }
  
  .privacy-notice {
    background: #374151;
    color: #d1d5db;
  }
  
  .pricing-summary {
    background: #1e3a8a;
    border-color: #3b82f6;
  }
  
  .price-row {
    border-color: #374151;
  }
  
  .price-total {
    border-color: #60a5fa;
  }
}
`;