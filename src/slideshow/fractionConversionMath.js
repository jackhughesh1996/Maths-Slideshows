/** Dependency-free, exact integer arithmetic for fraction conversion. */
export const FRACTION_DENOMINATORS = Object.freeze([2, 3, 4, 5, 6, 7, 8, 9, 10, 12]);
export const FRACTION_MODES = Object.freeze(['build', 'regroup', 'number-line']);
const MAX_WHOLES = 5;

function wholeBound(denominator) {
  return MAX_WHOLES * denominator + denominator - 1;
}

export function mixedToImproper(whole, part, denominator) {
  return whole * denominator + part;
}

export function greatestCommonDivisor(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

export function improperToMixed(numerator, denominator) {
  const whole = Math.floor(numerator / denominator);
  const remainder = numerator % denominator;
  const divisor = greatestCommonDivisor(remainder, denominator);
  return {
    whole,
    remainder,
    denominator,
    simplifiedNumerator: remainder / divisor,
    simplifiedDenominator: denominator / divisor
  };
}

/** Keep conversions within sensible, visible classroom simulation bounds. */
export function normalizeFractionState(config = {}) {
  const mode = FRACTION_MODES.includes(config.mode) ? config.mode : 'build';
  const denominator = FRACTION_DENOMINATORS.includes(config.denominator) ? config.denominator : 4;
  const clamp = (value, min, max, fallback) => {
    if (!Number.isInteger(value)) return fallback;
    return Math.min(max, Math.max(min, value));
  };
  const whole = clamp(config.whole, 0, MAX_WHOLES, 2);
  const part = clamp(config.part, 0, denominator - 1, Math.min(3, denominator - 1));
  const numerator = clamp(config.numerator, mode === 'regroup' ? denominator : 0,
    wholeBound(denominator), Math.max(denominator, 11));
  return { mode, denominator, whole, part, numerator, groupCount: 0, answerVisible: false };
}

