import { describe, it, expect } from 'vitest';

const EIRCODE_REGEX = /^(?:D6W|[AC-FHKNPRTV-Y][0-9]{2})\s?[0-9AC-FHKNPRTV-Y]{4}$/i;

describe('validators', () => {
  it('validates EIRCODE format', () => {
    const valid = ['A65 F4E2', 'D6W 1W23', 'A65F4E2'];
    const invalid = ['ZZZ 1234', '12345', 'A6 5F4E2', ''];
    for (const v of valid) expect(EIRCODE_REGEX.test(v)).toBe(true);
    for (const v of invalid) expect(EIRCODE_REGEX.test(v)).toBe(false);
  });
});
