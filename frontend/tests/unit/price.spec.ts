import { describe, it, expect } from 'vitest';
import { estimate } from '../../src/lib/price';

describe('price.estimate', () => {
  it('computes subtotal, vat, total', () => {
    const r = estimate({ widthM: 3, depthM: 4, vat: true, extras: [{ key: 'x', price: 100 }] });
    expect(r.subtotal).toBeGreaterThan(0);
    expect(r.total).toBeGreaterThan(r.subtotal);
  });
});
