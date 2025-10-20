// Price calculation utility scaffold
export type Config = {
  widthM?: number; // meters
  depthM?: number; // meters
  vat?: boolean;
  extras?: { key: string; price: number }[];
};

const BASE_RATE_EUR_PER_SQM = 1200; // placeholder; refine via catalog
const VAT_RATE = 0.23;

export function estimate(config: Config): { subtotal: number; vat: number; total: number } {
  const area = Math.max(0, (config.widthM || 0) * (config.depthM || 0));
  const base = area * BASE_RATE_EUR_PER_SQM;
  const extras = (config.extras || []).reduce((s, e) => s + (e.price || 0), 0);
  const subtotal = base + extras;
  const vat = config.vat ? subtotal * VAT_RATE : 0;
  const total = subtotal + vat;
  return { subtotal: round2(subtotal), vat: round2(vat), total: round2(total) };
}

function round2(n: number) { return Math.round(n * 100) / 100; }
