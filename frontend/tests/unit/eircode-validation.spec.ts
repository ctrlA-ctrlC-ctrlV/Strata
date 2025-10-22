/**
 * Eircode Validation Tests
 * Tests for county/eircode constraint validation logic
 */

import { describe, it, expect } from 'vitest';

// County to Eircode routing key mapping (from quote-form.ts)
const COUNTY_EIRCODE_MAP = {
  'Dublin': ['D', 'A', 'K'],
  'Wicklow': ['A'],
  'Kildare': ['W', 'R']
};

/**
 * Validate Eircode format
 */
function isValidEircode(eircode: string): boolean {
  const normalized = eircode.replace(/\s/g, '').toUpperCase();
  // Irish Eircode format: 1 letter + 2 digits + 4 alphanumeric
  const eircodeRegex = /^[A-Z][0-9]{2}[A-Z0-9]{4}$/;
  return eircodeRegex.test(normalized) && normalized.length === 7;
}

/**
 * Validate Eircode against selected county
 */
function validateEircodeForCounty(eircode: string, county: string): { isValid: boolean; message: string } {
  if (!eircode || !county) {
    return { isValid: true, message: '' };
  }

  const normalized = eircode.replace(/\s/g, '').toUpperCase();
  const routingKey = normalized.charAt(0);

  // Get allowed routing keys for the county
  const allowedKeys = COUNTY_EIRCODE_MAP[county as keyof typeof COUNTY_EIRCODE_MAP];
  
  if (!allowedKeys) {
    return { isValid: false, message: 'County not in service area' };
  }

  if (!allowedKeys.includes(routingKey)) {
    return { 
      isValid: false, 
      message: `This Eircode doesn't match ${county}. ${county} Eircodes start with: ${allowedKeys.join(', ')}` 
    };
  }

  return { isValid: true, message: '' };
}

describe('Eircode Validation Logic', () => {
  describe('Eircode Format Validation', () => {
    it('should accept valid Eircode formats', () => {
      expect(isValidEircode('D02 XY45')).toBe(true);
      expect(isValidEircode('A63 B7C8')).toBe(true);
      expect(isValidEircode('W23 F1G2')).toBe(true);
      expect(isValidEircode('R51 H3J4')).toBe(true);
      // Test without space
      expect(isValidEircode('D02XY45')).toBe(true);
      // Test lowercase
      expect(isValidEircode('d02xy45')).toBe(true);
    });

    it('should reject invalid Eircode formats', () => {
      expect(isValidEircode('INVALID')).toBe(false);
      expect(isValidEircode('12345')).toBe(false);
      expect(isValidEircode('ABC')).toBe(false);
      expect(isValidEircode('D02 XY4')).toBe(false); // Too short
      expect(isValidEircode('D02 XY456')).toBe(false); // Too long
      expect(isValidEircode('')).toBe(false);
    });
  });

  describe('County/Eircode Consistency Validation', () => {
    it('should accept matching Dublin Eircodes', () => {
      expect(validateEircodeForCounty('D02 XY45', 'Dublin').isValid).toBe(true);
      expect(validateEircodeForCounty('A94 X5Y6', 'Dublin').isValid).toBe(true);
      expect(validateEircodeForCounty('K67 Z8W9', 'Dublin').isValid).toBe(true);
    });

    it('should accept matching Wicklow Eircodes', () => {
      expect(validateEircodeForCounty('A63 B7C8', 'Wicklow').isValid).toBe(true);
      expect(validateEircodeForCounty('A67 D9E0', 'Wicklow').isValid).toBe(true);
    });

    it('should accept matching Kildare Eircodes', () => {
      expect(validateEircodeForCounty('W23 F1G2', 'Kildare').isValid).toBe(true);
      expect(validateEircodeForCounty('R51 H3J4', 'Kildare').isValid).toBe(true);
    });

    it('should reject mismatched county and Eircode combinations', () => {
      // Dublin county with Kildare-only Eircode (W starts with Kildare)
      const dublinWithKildareResult = validateEircodeForCounty('W23 XY45', 'Dublin');
      expect(dublinWithKildareResult.isValid).toBe(false);
      expect(dublinWithKildareResult.message).toContain("doesn't match Dublin");
      expect(dublinWithKildareResult.message).toContain('D, A, K');

      // Wicklow county with Dublin-only Eircode (D is Dublin-only)
      const wicklowWithDublinResult = validateEircodeForCounty('D02 XY45', 'Wicklow');
      expect(wicklowWithDublinResult.isValid).toBe(false);
      expect(wicklowWithDublinResult.message).toContain("doesn't match Wicklow");
      expect(wicklowWithDublinResult.message).toContain('A');

      // Kildare county with Dublin-only Eircode  
      const kildareWithDublinResult = validateEircodeForCounty('D02 XY45', 'Kildare');
      expect(kildareWithDublinResult.isValid).toBe(false);
      expect(kildareWithDublinResult.message).toContain("doesn't match Kildare");
      expect(kildareWithDublinResult.message).toContain('W, R');
    });

    it('should handle unsupported counties', () => {
      const result = validateEircodeForCounty('C15 ABC1', 'Cork');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('County not in service area');
    });

    it('should return valid for empty inputs', () => {
      expect(validateEircodeForCounty('', 'Dublin').isValid).toBe(true);
      expect(validateEircodeForCounty('D02 XY45', '').isValid).toBe(true);
      expect(validateEircodeForCounty('', '').isValid).toBe(true);
    });

    it('should handle case-insensitive Eircode inputs', () => {
      expect(validateEircodeForCounty('d02xy45', 'Dublin').isValid).toBe(true);
      expect(validateEircodeForCounty('a63 b7c8', 'Wicklow').isValid).toBe(true);
      expect(validateEircodeForCounty('w23f1g2', 'Kildare').isValid).toBe(true);
    });

    it('should handle Eircode with and without spaces', () => {
      expect(validateEircodeForCounty('D02XY45', 'Dublin').isValid).toBe(true);
      expect(validateEircodeForCounty('D02 XY45', 'Dublin').isValid).toBe(true);
      expect(validateEircodeForCounty('A63B7C8', 'Wicklow').isValid).toBe(true);
      expect(validateEircodeForCounty('A63 B7C8', 'Wicklow').isValid).toBe(true);
    });
  });
});