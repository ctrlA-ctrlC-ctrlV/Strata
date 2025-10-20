export type ConfigState = {
  widthM: number;
  depthM: number;
  vat: boolean;
  openings: { windows: number; doors: number; skylights: number };
  cladding: 'panel' | 'timber' | 'render';
  bathroom: 'none' | 'half' | 'three_quarter';
  floor: 'none' | 'wooden' | 'tile';
  extras: Set<string>;
};

export type OnChange = (patch: Partial<ConfigState>) => void;
