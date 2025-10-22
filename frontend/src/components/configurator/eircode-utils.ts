/**
 * Eircode Utilities
 * Validation and formatting functions for Irish postcodes (Eircodes)
 */

import { CountyData } from './types';

// Valid Irish counties with their Eircode routing keys
export const IRISH_COUNTIES: CountyData[] = [
  { code: 'A', name: 'Dublin', routingKeys: ['A41', 'A42', 'A63', 'A65', 'A67', 'A75', 'A81', 'A86', 'A91', 'A92', 'A94', 'A96', 'A98'] },
  { code: 'D', name: 'Dublin', routingKeys: ['D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'D11', 'D12', 'D13', 'D14', 'D15', 'D16', 'D17', 'D18', 'D20', 'D22', 'D24'] },
  { code: 'C', name: 'Cork', routingKeys: ['C15'] },
  { code: 'P', name: 'Cork', routingKeys: ['P12', 'P14', 'P17', 'P24', 'P25', 'P31', 'P32', 'P36', 'P43', 'P47', 'P51', 'P56', 'P61', 'P67', 'P72', 'P75', 'P81', 'P85'] },
  { code: 'T', name: 'Cork/Tipperary', routingKeys: ['T12', 'T23', 'T34', 'T45', 'T56'] },
  { code: 'V', name: 'Cork', routingKeys: ['V13', 'V14', 'V15', 'V23', 'V31', 'V35', 'V42', 'V92', 'V93', 'V94', 'V95'] },
  { code: 'X', name: 'Cork/Kerry', routingKeys: ['X35', 'X42', 'X91'] },
  { code: 'E', name: 'Galway/Mayo', routingKeys: ['E25', 'E32', 'E34', 'E41', 'E45', 'E53', 'E91'] },
  { code: 'F', name: 'Galway/Mayo/Cork', routingKeys: ['F12', 'F23', 'F28', 'F31', 'F35', 'F42', 'F45', 'F52', 'F56', 'F91', 'F92', 'F93', 'F94'] },
  { code: 'H', name: 'Galway/Clare/Limerick', routingKeys: ['H12', 'H14', 'H16', 'H18', 'H23', 'H53', 'H54', 'H62', 'H65', 'H71', 'H91'] },
  { code: 'K', name: 'Kildare/Kilkenny/Kerry', routingKeys: ['K32', 'K34', 'K36', 'K45', 'K56', 'K67', 'K78'] },
  { code: 'N', name: 'Limerick/Clare/Tipperary', routingKeys: ['N37', 'N39', 'N41', 'N91'] },
  { code: 'R', name: 'Kilkenny/Tipperary/Waterford/Wexford', routingKeys: ['R14', 'R21', 'R25', 'R32', 'R35', 'R42', 'R51', 'R56', 'R93', 'R95'] },
  { code: 'S', name: 'Wexford/Waterford/Kilkenny', routingKeys: ['S21', 'S39', 'S41', 'S75', 'S91'] },
  { code: 'W', name: 'Wexford/Waterford/Wicklow/Westmeath/Carlow', routingKeys: ['W12', 'W21', 'W23', 'W34', 'W81', 'W85', 'W91'] },
  { code: 'Y', name: 'Wexford/Wicklow', routingKeys: ['Y14', 'Y21', 'Y25', 'Y34', 'Y35'] },
  { code: 'B', name: 'Wicklow/Wexford/Laois', routingKeys: ['B78', 'B81'] },
  { code: 'L', name: 'Laois/Longford/Louth', routingKeys: ['L39', 'L78'] },
  { code: 'M', name: 'Meath/Westmeath/Offaly/Longford/Louth', routingKeys: ['M34', 'M50', 'M83', 'M84'] },
  { code: 'G', name: 'Meath/Cavan', routingKeys: ['G15'] },
  { code: 'J', name: 'Meath/Kildare', routingKeys: ['J15'] },
  { code: 'O', name: 'Offaly/Roscommon', routingKeys: ['O53'] },
  { code: 'I', name: 'Sligo/Leitrim/Roscommon', routingKeys: ['I43', 'I91'] }
];

/**
 * Format an Eircode string with proper spacing
 * @param eircode The raw Eircode input
 * @returns Formatted Eircode string
 */
export function formatEircode(eircode: string): string {
  if (!eircode) return '';
  
  // Remove all non-alphanumeric characters and convert to uppercase
  const cleaned = eircode.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  
  // If less than 4 characters, return as-is
  if (cleaned.length <= 3) return cleaned;
  
  // Format as XXX XXXX (3 chars space 4 chars)
  const routingKey = cleaned.slice(0, 3);
  const uniqueId = cleaned.slice(3, 7);
  
  return `${routingKey} ${uniqueId}`;
}

/**
 * Validate if an Eircode is properly formatted and valid
 * @param eircode The Eircode to validate
 * @returns true if valid, false otherwise
 */
export function isValidEircode(eircode: string): boolean {
  if (!eircode) return false;
  
  // Remove spaces and convert to uppercase
  const cleaned = eircode.replace(/\s/g, '').toUpperCase();
  
  // Check basic format: 3 alphanumeric + 4 alphanumeric
  const eircodePattern = /^[A-Z0-9]{3}[A-Z0-9]{4}$/;
  if (!eircodePattern.test(cleaned)) return false;
  
  // Extract routing key (first 3 characters)
  const routingKey = cleaned.slice(0, 3);
  
  // Check if routing key exists in our county data
  return IRISH_COUNTIES.some(county => 
    county.routingKeys.includes(routingKey)
  );
}

/**
 * Get county information for a given Eircode
 * @param eircode The Eircode to look up
 * @returns County information or null if not found
 */
export function getCountyForEircode(eircode: string): CountyData | null {
  if (!eircode) return null;
  
  const cleaned = eircode.replace(/\s/g, '').toUpperCase();
  if (cleaned.length < 3) return null;
  
  const routingKey = cleaned.slice(0, 3);
  
  return IRISH_COUNTIES.find(county => 
    county.routingKeys.includes(routingKey)
  ) || null;
}

/**
 * Get all valid routing keys for autocomplete/suggestions
 * @returns Array of all routing keys
 */
export function getAllRoutingKeys(): string[] {
  return IRISH_COUNTIES.flatMap(county => county.routingKeys).sort();
}

/**
 * Get suggestions for partial Eircode input
 * @param partial Partial Eircode input
 * @returns Array of suggested routing keys
 */
export function getEircodeSuggestions(partial: string): string[] {
  if (!partial) return [];
  
  const cleaned = partial.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  if (cleaned.length === 0) return [];
  
  const allKeys = getAllRoutingKeys();
  return allKeys.filter(key => key.startsWith(cleaned)).slice(0, 10);
}

/**
 * Validate Eircode with detailed error messages
 * @param eircode The Eircode to validate
 * @returns Validation result with specific error message
 */
export function validateEircode(eircode: string): { isValid: boolean; error?: string } {
  if (!eircode) {
    return { isValid: false, error: 'Eircode is required' };
  }
  
  const cleaned = eircode.replace(/\s/g, '').toUpperCase();
  
  if (cleaned.length < 7) {
    return { isValid: false, error: 'Eircode must be at least 7 characters' };
  }
  
  if (cleaned.length > 7) {
    return { isValid: false, error: 'Eircode must be exactly 7 characters' };
  }
  
  const eircodePattern = /^[A-Z0-9]{3}[A-Z0-9]{4}$/;
  if (!eircodePattern.test(cleaned)) {
    return { isValid: false, error: 'Eircode format must be XXX XXXX (letters and numbers only)' };
  }
  
  const routingKey = cleaned.slice(0, 3);
  const isValidRouting = IRISH_COUNTIES.some(county => 
    county.routingKeys.includes(routingKey)
  );
  
  if (!isValidRouting) {
    return { isValid: false, error: 'Invalid Eircode routing key' };
  }
  
  return { isValid: true };
}

/**
 * Check if an Eircode is in a specific county
 * @param eircode The Eircode to check
 * @param countyName The county name to match against
 * @returns true if the Eircode is in the specified county
 */
export function isEircodeInCounty(eircode: string, countyName: string): boolean {
  const county = getCountyForEircode(eircode);
  return county ? county.name.toLowerCase().includes(countyName.toLowerCase()) : false;
}

/**
 * Get all unique county names from the Eircode system
 * @returns Array of unique county names
 */
export function getAllCounties(): string[] {
  const counties = new Set<string>();
  IRISH_COUNTIES.forEach(county => {
    // Handle counties with multiple names (e.g., "Cork/Kerry")
    county.name.split('/').forEach((name: string) => counties.add(name.trim()));
  });
  return Array.from(counties).sort();
}

/**
 * Format Eircode input as user types (for real-time formatting)
 * @param input Current input value
 * @param previousValue Previous input value (for handling deletions)
 * @returns Formatted input value
 */
export function formatEircodeInput(input: string, previousValue: string = ''): string {
  if (!input) return '';
  
  // Remove all non-alphanumeric characters
  const cleaned = input.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  
  // Handle deletion - if user deleted the space, allow it
  if (input.length < previousValue.length && input.length === 3) {
    return cleaned;
  }
  
  // Limit to 7 characters maximum
  const limited = cleaned.slice(0, 7);
  
  // Auto-format with space after 3 characters
  if (limited.length > 3) {
    return `${limited.slice(0, 3)} ${limited.slice(3)}`;
  }
  
  return limited;
}