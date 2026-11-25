export type RoiField = 'employees' | 'attritionPct' | 'ctcLakh' | 'replacementPct' | 'reductionPp' | 'pricePerMonth';
export type RoiInputs = Record<RoiField, number>;

export const ROI_DEFAULTS: RoiInputs = {
  employees: 500,
  attritionPct: 18,
  ctcLakh: 12,
  replacementPct: 50,
  reductionPp: 2,
  pricePerMonth: 300,
};

export const ROI_LIMITS: Record<RoiField, { min: number; max: number; step: number; integer?: boolean }> = {
  employees: { min: 1, max: 1_000_000, step: 1, integer: true },
  attritionPct: { min: 0, max: 100, step: 0.5 },
  ctcLakh: { min: 0, max: 500, step: 0.5 },
  replacementPct: { min: 0, max: 400, step: 5 },
  reductionPp: { min: 0, max: 100, step: 0.5 },
  pricePerMonth: { min: 0, max: 100_000, step: 10 },
};

const LAKH = 100_000;

export type RoiResult = {
  currentAttritionCost: number;
  estimatedSavings: number;
  subscriptionCost: number;
  /** null when the subscription cost is zero (coverage is undefined). */
  coveragePct: number | null;
  /** Attrition reduction (percentage points) at which savings equal subscription cost; null if undefined. */
  breakEvenReductionPp: number | null;
};

/** All monetary results are in rupees. Percentage inputs are converted to decimals here. */
export function calculateRoi(inputs: RoiInputs): RoiResult {
  const ctcRupees = inputs.ctcLakh * LAKH;
  const replacement = inputs.replacementPct / 100;
  const costPerLeaver = ctcRupees * replacement;
  const currentAttritionCost = inputs.employees * (inputs.attritionPct / 100) * costPerLeaver;
  const estimatedSavings = inputs.employees * (inputs.reductionPp / 100) * costPerLeaver;
  const subscriptionCost = inputs.employees * inputs.pricePerMonth * 12;
  const perPointSaving = inputs.employees * 0.01 * costPerLeaver;
  return {
    currentAttritionCost,
    estimatedSavings,
    subscriptionCost,
    coveragePct: subscriptionCost > 0 ? (estimatedSavings / subscriptionCost) * 100 : null,
    breakEvenReductionPp: perPointSaving > 0 ? subscriptionCost / perPointSaving : null,
  };
}

/** Returns an error message, or null when the raw input is valid for the field. */
export function validateRoiField(field: RoiField, raw: string, attritionPct?: number): string | null {
  if (raw.trim() === '') return 'Enter a value.';
  const value = Number(raw);
  if (!Number.isFinite(value)) return 'Enter a valid number.';
  const limits = ROI_LIMITS[field];
  if (value < 0) return 'Value cannot be negative.';
  if (limits.integer && !Number.isInteger(value)) return 'Enter a whole number.';
  if (value < limits.min) return `Minimum is ${limits.min.toLocaleString('en-IN')}.`;
  if (value > limits.max) return `Maximum is ${limits.max.toLocaleString('en-IN')}.`;
  if (field === 'reductionPp' && attritionPct !== undefined && value > attritionPct) return 'Reduction cannot exceed the current attrition rate.';
  return null;
}

/** Formats rupees as ₹ crore / ₹ lakh / ₹ with Indian digit grouping. */
export function formatInr(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '−' : '';
  if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toLocaleString('en-IN', { maximumFractionDigits: 2 })} crore`;
  if (abs >= LAKH) return `${sign}₹${(abs / LAKH).toLocaleString('en-IN', { maximumFractionDigits: 2 })} lakh`;
  return `${sign}₹${Math.round(abs).toLocaleString('en-IN')}`;
}
