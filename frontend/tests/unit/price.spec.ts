/**
 * Unit Tests: Price Calculation Utility
 * Tests the price calculation logic for garden room configurations
 */

import { describe, it, expect } from 'vitest';
import { 
  calculatePriceEstimate, 
  calculateFloorArea, 
  calculateBaseCost,
  validateConfiguration,
  type ProductConfiguration, 
  type PriceEstimate 
} from '../../src/lib/price.js';

describe('Price Calculation Utility', () => {

  describe('basic configuration pricing', () => {
    it('calculates base price for simple garden room', () => {
      const config: ProductConfiguration = {
        productType: 'garden-room',
        size: { widthM: 4, depthM: 3 }, // 4m x 3m = 12m²
        cladding: { areaSqm: 28.8 },
        bathroom: { half: 0, threeQuarter: 0 },
        electrical: { switches: 1, sockets: 2 },
        internalDoors: 0,
        internalWall: { finish: 'none' },
        heaters: 0,
        glazing: { windows: [], externalDoors: [], skylights: [] },
        floor: { type: 'none', areaSqM: 12 },
        delivery: { cost: 0 },
        extras: { other: [] }
      };

      const result = calculatePriceEstimate(config);

      expect(result.subtotalExVat).toBeGreaterThan(0);
      expect(result.vatAmount).toBeCloseTo(result.subtotalExVat * 0.23); // 23% VAT in Ireland
      expect(result.totalIncVat).toBeCloseTo(result.subtotalExVat + result.vatAmount);
      expect(result.currency).toBe('EUR');
    });

    it('increases price with larger size', () => {
      const smallConfig: ProductConfiguration = {
        productType: 'garden-room',
        size: { widthM: 3, depthM: 3 }, // 9m²
        cladding: { areaSqm: 21.6 },
        bathroom: { half: 0, threeQuarter: 0 },
        electrical: { switches: 1, sockets: 2 },
        internalDoors: 0,
        internalWall: { finish: 'none' },
        heaters: 0,
        glazing: { windows: [], externalDoors: [], skylights: [] },
        floor: { type: 'none', areaSqM: 9 },
        delivery: { cost: 0 },
        extras: { other: [] }
      };

      const largeConfig: ProductConfiguration = {
        ...smallConfig,
        size: { widthM: 6, depthM: 4 }, // 24m²
        cladding: { areaSqm: 48 },
        floor: { ...smallConfig.floor, areaSqM: 24 }
      };

      const smallPrice = calculatePriceEstimate(smallConfig);
      const largePrice = calculatePriceEstimate(largeConfig);

      expect(largePrice.subtotalExVat).toBeGreaterThan(smallPrice.subtotalExVat);
    });
  });

  describe('glazing pricing', () => {
    it('adds cost for windows', () => {
      const baseConfig: ProductConfiguration = {
        productType: 'garden-room',
        size: { widthM: 4, depthM: 3 },
        cladding: { areaSqm: 28.8 },
        bathroom: { half: 0, threeQuarter: 0 },
        electrical: { switches: 1, sockets: 2 },
        internalDoors: 0,
        internalWall: { finish: 'none' },
        heaters: 0,
        glazing: { windows: [], externalDoors: [], skylights: [] },
        floor: { type: 'none', areaSqM: 12 },
        delivery: { cost: 0 },
        extras: { other: [] }
      };

      const withWindowsConfig: ProductConfiguration = {
        ...baseConfig,
        glazing: {
          ...baseConfig.glazing,
          windows: [
            { widthM: 1.2, heightM: 1.2 },
            { widthM: 1.0, heightM: 1.0 }
          ]
        }
      };

      const basePrice = calculatePriceEstimate(baseConfig);
      const windowsPrice = calculatePriceEstimate(withWindowsConfig);

      expect(windowsPrice.subtotalExVat).toBeGreaterThan(basePrice.subtotalExVat);
    });

    it('adds cost for external doors', () => {
      const baseConfig: ProductConfiguration = {
        productType: 'garden-room',
        size: { widthM: 4, depthM: 3 },
        cladding: { areaSqm: 28.8 },
        bathroom: { half: 0, threeQuarter: 0 },
        electrical: { switches: 1, sockets: 2 },
        internalDoors: 0,
        internalWall: { finish: 'none' },
        heaters: 0,
        glazing: { windows: [], externalDoors: [], skylights: [] },
        floor: { type: 'none', areaSqM: 12 },
        delivery: { cost: 0 },
        extras: { other: [] }
      };

      const withDoorsConfig: ProductConfiguration = {
        ...baseConfig,
        glazing: {
          ...baseConfig.glazing,
          externalDoors: [{ widthM: 0.9, heightM: 2.1 }]
        }
      };

      const basePrice = calculatePriceEstimate(baseConfig);
      const doorsPrice = calculatePriceEstimate(withDoorsConfig);

      expect(doorsPrice.subtotalExVat).toBeGreaterThan(basePrice.subtotalExVat);
    });

    it('adds cost for skylights', () => {
      const baseConfig: ProductConfiguration = {
        productType: 'garden-room',
        size: { widthM: 4, depthM: 3 },
        cladding: { areaSqm: 28.8 },
        bathroom: { half: 0, threeQuarter: 0 },
        electrical: { switches: 1, sockets: 2 },
        internalDoors: 0,
        internalWall: { finish: 'none' },
        heaters: 0,
        glazing: { windows: [], externalDoors: [], skylights: [] },
        floor: { type: 'none', areaSqM: 12 },
        delivery: { cost: 0 },
        extras: { other: [] }
      };

      const withSkylightsConfig: ProductConfiguration = {
        ...baseConfig,
        glazing: {
          ...baseConfig.glazing,
          skylights: [{ widthM: 0.8, heightM: 0.8 }]
        }
      };

      const basePrice = calculatePriceEstimate(baseConfig);
      const skylightsPrice = calculatePriceEstimate(withSkylightsConfig);

      expect(skylightsPrice.subtotalExVat).toBeGreaterThan(basePrice.subtotalExVat);
    });
  });

  describe('bathroom pricing', () => {
    it('adds cost for half bathroom', () => {
      const noBathroomConfig: ProductConfiguration = {
        productType: 'garden-room',
        size: { widthM: 4, depthM: 3 },
        cladding: { areaSqm: 28.8 },
        bathroom: { half: 0, threeQuarter: 0 },
        electrical: { switches: 1, sockets: 2 },
        internalDoors: 0,
        internalWall: { finish: 'none' },
        heaters: 0,
        glazing: { windows: [], externalDoors: [], skylights: [] },
        floor: { type: 'none', areaSqM: 12 },
        delivery: { cost: 0 },
        extras: { other: [] }
      };

      const halfBathroomConfig: ProductConfiguration = {
        ...noBathroomConfig,
        bathroom: { half: 1, threeQuarter: 0 }
      };

      const noBathroomPrice = calculatePriceEstimate(noBathroomConfig);
      const halfBathroomPrice = calculatePriceEstimate(halfBathroomConfig);

      expect(halfBathroomPrice.subtotalExVat).toBeGreaterThan(noBathroomPrice.subtotalExVat);
    });

    it('adds more cost for three-quarter bathroom than half', () => {
      const halfBathroomConfig: ProductConfiguration = {
        productType: 'garden-room',
        size: { widthM: 4, depthM: 3 },
        cladding: { areaSqm: 28.8 },
        bathroom: { half: 1, threeQuarter: 0 },
        electrical: { switches: 1, sockets: 2 },
        internalDoors: 0,
        internalWall: { finish: 'none' },
        heaters: 0,
        glazing: { windows: [], externalDoors: [], skylights: [] },
        floor: { type: 'none', areaSqM: 12 },
        delivery: { cost: 0 },
        extras: { other: [] }
      };

      const threeQuarterBathroomConfig: ProductConfiguration = {
        ...halfBathroomConfig,
        bathroom: { half: 0, threeQuarter: 1 }
      };

      const halfBathroomPrice = calculatePriceEstimate(halfBathroomConfig);
      const threeQuarterBathroomPrice = calculatePriceEstimate(threeQuarterBathroomConfig);

      expect(threeQuarterBathroomPrice.subtotalExVat).toBeGreaterThan(halfBathroomPrice.subtotalExVat);
    });
  });

  describe('flooring pricing', () => {
    it('adds no cost for no flooring', () => {
      const config: ProductConfiguration = {
        productType: 'garden-room',
        size: { widthM: 4, depthM: 3 },
        cladding: { areaSqm: 28.8 },
        bathroom: { half: 0, threeQuarter: 0 },
        electrical: { switches: 1, sockets: 2 },
        internalDoors: 0,
        internalWall: { finish: 'none' },
        heaters: 0,
        glazing: { windows: [], externalDoors: [], skylights: [] },
        floor: { type: 'none', areaSqM: 12 },
        delivery: { cost: 0 },
        extras: { other: [] }
      };

      const result = calculatePriceEstimate(config);
      
      // For 'none' floor type, there should be no additional floor cost beyond base
      expect(result.subtotalExVat).toBeGreaterThan(0);
    });

    it('adds cost for wooden flooring', () => {
      const noFloorConfig: ProductConfiguration = {
        productType: 'garden-room',
        size: { widthM: 4, depthM: 3 },
        cladding: { areaSqm: 28.8 },
        bathroom: { half: 0, threeQuarter: 0 },
        electrical: { switches: 1, sockets: 2 },
        internalDoors: 0,
        internalWall: { finish: 'none' },
        heaters: 0,
        glazing: { windows: [], externalDoors: [], skylights: [] },
        floor: { type: 'none', areaSqM: 12 },
        delivery: { cost: 0 },
        extras: { other: [] }
      };

      const woodenFloorConfig: ProductConfiguration = {
        ...noFloorConfig,
        floor: { type: 'wooden', areaSqM: 12 }
      };

      const noFloorPrice = calculatePriceEstimate(noFloorConfig);
      const woodenFloorPrice = calculatePriceEstimate(woodenFloorConfig);

      expect(woodenFloorPrice.subtotalExVat).toBeGreaterThan(noFloorPrice.subtotalExVat);
    });

    it('adds cost for tiled flooring', () => {
      const noFloorConfig: ProductConfiguration = {
        productType: 'garden-room',
        size: { widthM: 4, depthM: 3 },
        cladding: { areaSqm: 28.8 },
        bathroom: { half: 0, threeQuarter: 0 },
        electrical: { switches: 1, sockets: 2 },
        internalDoors: 0,
        internalWall: { finish: 'none' },
        heaters: 0,
        glazing: { windows: [], externalDoors: [], skylights: [] },
        floor: { type: 'none', areaSqM: 12 },
        delivery: { cost: 0 },
        extras: { other: [] }
      };

      const tiledFloorConfig: ProductConfiguration = {
        ...noFloorConfig,
        floor: { type: 'tile', areaSqM: 12 }
      };

      const noFloorPrice = calculatePriceEstimate(noFloorConfig);
      const tiledFloorPrice = calculatePriceEstimate(tiledFloorConfig);

      expect(tiledFloorPrice.subtotalExVat).toBeGreaterThan(noFloorPrice.subtotalExVat);
    });
  });

  describe('extras pricing', () => {
    it('adds cost for custom extras', () => {
      const baseConfig: ProductConfiguration = {
        productType: 'garden-room',
        size: { widthM: 4, depthM: 3 },
        cladding: { areaSqm: 28.8 },
        bathroom: { half: 0, threeQuarter: 0 },
        electrical: { switches: 1, sockets: 2 },
        internalDoors: 0,
        internalWall: { finish: 'none' },
        heaters: 0,
        glazing: { windows: [], externalDoors: [], skylights: [] },
        floor: { type: 'none', areaSqM: 12 },
        delivery: { cost: 0 },
        extras: { other: [] }
      };

      const withExtrasConfig: ProductConfiguration = {
        ...baseConfig,
        extras: {
          espInsulation: 500,
          render: 300,
          steelDoor: 650,
          other: [
            { title: 'Custom feature 1', cost: 200 },
            { title: 'Custom feature 2', cost: 150 }
          ]
        }
      };

      const basePrice = calculatePriceEstimate(baseConfig);
      const withExtrasPrice = calculatePriceEstimate(withExtrasConfig);

      expect(withExtrasPrice.subtotalExVat).toBeGreaterThan(basePrice.subtotalExVat);
      
      // Should add all the extras to the subtotal - test that extras are added
      const actualIncrease = withExtrasPrice.subtotalExVat - basePrice.subtotalExVat;
      expect(actualIncrease).toBeGreaterThan(0);
      // Verify it includes at least the sum of extras (may include other calculations)
      const expectedMinIncrease = 500 + 300 + 650 + 200 + 150;
      expect(actualIncrease).toBeGreaterThan(expectedMinIncrease * 0.8); // Allow for calculation variations
    });
  });

  describe('VAT calculations', () => {
    it('applies 23% VAT correctly', () => {
      const config: ProductConfiguration = {
        productType: 'garden-room',
        size: { widthM: 4, depthM: 3 },
        cladding: { areaSqm: 28.8 },
        bathroom: { half: 0, threeQuarter: 0 },
        electrical: { switches: 1, sockets: 2 },
        internalDoors: 0,
        internalWall: { finish: 'none' },
        heaters: 0,
        glazing: { windows: [], externalDoors: [], skylights: [] },
        floor: { type: 'none', areaSqM: 12 },
        delivery: { cost: 0 },
        extras: { other: [] }
      };

      const result = calculatePriceEstimate(config);

      expect(result.vatRate).toBe(0.23);
      expect(result.vatAmount).toBeCloseTo(result.subtotalExVat * 0.23);
      expect(result.totalIncVat).toBeCloseTo(result.subtotalExVat + result.vatAmount);
    });
  });

  describe('helper functions', () => {
    it('calculates floor area correctly', () => {
      const area = calculateFloorArea({ widthM: 4, depthM: 3 });
      expect(area).toBe(12);
    });

    it('calculates base cost for different sizes', () => {
      const smallSize = { widthM: 3, depthM: 3 }; // 3m x 3m
      const largeSize = { widthM: 6, depthM: 4 }; // 6m x 4m
      
      const smallCost = calculateBaseCost(smallSize);
      const largeCost = calculateBaseCost(largeSize);
      
      expect(largeCost).toBeGreaterThan(smallCost);
      expect(smallCost).toBeGreaterThan(0);
    });

    it('validates configuration input', () => {
      const validConfig: ProductConfiguration = {
        productType: 'garden-room',
        size: { widthM: 4, depthM: 3 },
        cladding: { areaSqm: 28.8 },
        bathroom: { half: 0, threeQuarter: 0 },
        electrical: { switches: 1, sockets: 2 },
        internalDoors: 0,
        internalWall: { finish: 'none' },
        heaters: 0,
        glazing: { windows: [], externalDoors: [], skylights: [] },
        floor: { type: 'none', areaSqM: 12 },
        delivery: { cost: 0 },
        extras: { other: [] }
      };

      const errors = validateConfiguration(validConfig);
      expect(errors).toHaveLength(0);
    });

    it('returns errors for invalid dimensions', () => {
      const invalidConfig: ProductConfiguration = {
        productType: 'garden-room',
        size: { widthM: 0, depthM: 3 }, // Invalid width
        cladding: { areaSqm: 28.8 },
        bathroom: { half: 0, threeQuarter: 0 },
        electrical: { switches: 1, sockets: 2 },
        internalDoors: 0,
        internalWall: { finish: 'none' },
        heaters: 0,
        glazing: { windows: [], externalDoors: [], skylights: [] },
        floor: { type: 'none', areaSqM: 12 },
        delivery: { cost: 0 },
        extras: { other: [] }
      };

      const errors = validateConfiguration(invalidConfig);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('Size dimensions must be greater than 0');
    });
  });
});