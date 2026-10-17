/** Numeric consistency only; structural and LaTeX syntax checks live elsewhere. */
const EPSILON = 1e-9;
const close = (a, b, tolerance = 0) => Math.abs(a - b) <= tolerance + EPSILON * Math.max(1, Math.abs(a), Math.abs(b));
const sum = (values) => values.reduce((a, b) => a + b, 0);
const NUMBER = '[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)';
const SIMPLE_FRACTION = new RegExp(`^([+-]?)\\\\(?:frac|dfrac|tfrac)\\s*\\{\\s*(${NUMBER})\\s*\\}\\s*\\{\\s*(${NUMBER})\\s*\\}$`);

// No evaluation, substitutions, macros or symbolic algebra. Undefined means
// unknown; NaN means a recognised numeric fraction has an invalid denominator.
export function simpleFraction(value) {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return undefined;
  const text = value.trim();
  if (new RegExp(`^${NUMBER}$`).test(text)) return Number(text);
  const match = text.match(SIMPLE_FRACTION);
  if (!match) return undefined;
  return Number(match[3]) === 0 ? NaN : (match[1] === '-' ? -1 : 1) * Number(match[2]) / Number(match[3]);
}

// Rounded decimal fractions may describe counts approximately, but they must
// still form a complete graph. Exact rational LaTeX is compared without this
// allowance; coarse one-digit fractions are not treated as rounded estimates.
function fractionRounding(value) {
  const text = String(value);
  if (!new RegExp(`^${NUMBER}$`).test(text)) return 0;
  const digits = text.split('.')[1]?.length || 0;
  return digits >= 2 ? 0.5 * 10 ** -digits : 0;
}

function simpleCalculation(text) {
  if (typeof text !== 'string') return undefined;
  const match = text.trim().match(/^(.*?)\s*(?:\\times|\\cdot|\*)\s*360(?:\s*\^(?:\\circ|\{\\circ\}))?$/);
  if (!match) return undefined;
  const fraction = simpleFraction(match[1]);
  return fraction === undefined ? undefined : fraction * 360;
}

/** Mirrors the three renderers' precedence and defaults, not their SVG code. */
export function graphConsistency(block, type) {
  const issues = [];
  const report = (path, observed, expected, message) => issues.push({ path, observed, expected, message });
  const sector = type === 'sector-graph';
  const construction = type === 'sector-construction';
  const bar = type === 'measured-bar';
  const key = sector ? 'items' : (block.categories ? 'categories' : 'items');
  const items = block[key];
  if (!Array.isArray(items) || !items.length) return issues;
  const at = (index, prop) => `${key}[${index}].${prop}`;
  const totalLength = bar ? (block.totalLength || block.totalLengthCm || 20) : undefined;
  const numericFields = sector ? ['amount', 'fraction', 'angle'] : construction
    ? ['value', 'amount', 'angle'] : ['value', 'amount', 'length', 'fraction'];
  // Defensive guards also make this pure helper safe to call independently.
  if (items.some((item) => !item || typeof item !== 'object' || Array.isArray(item) ||
      numericFields.some((prop) => item[prop] !== undefined && !Number.isFinite(item[prop])))) return issues;
  for (const prop of bar ? ['total', 'totalLength', 'totalLengthCm'] : ['total']) {
    if (block[prop] !== undefined && (!Number.isFinite(block[prop]) || block[prop] <= 0)) {
      report(prop, block[prop], 'a finite positive number', 'Invalid graph denominator or scale.');
    }
  }
  if (issues.length) return issues;

  const weightKey = (item) => sector ? (item.amount !== undefined ? 'amount' : undefined)
    : item.value !== undefined ? 'value' : item.amount !== undefined ? 'amount'
      : bar && item.length !== undefined ? 'length' : undefined;
  const weights = items.map((item) => item[weightKey(item)] ?? 0);
  const hasWeight = items.map((item) => weightKey(item) !== undefined);
  const total = block.total || sum(weights) || (construction ? 24 : bar ? totalLength : 0);
  const fractions = items.map((item) => simpleFraction(item.fraction));
  const calculations = items.map((item) => construction ? simpleCalculation(item.calculation) : undefined);
  items.forEach((item, index) => {
    for (const prop of numericFields) {
      if (item[prop] < 0) report(at(index, prop), item[prop], '>= 0', 'Graph values cannot be negative.');
    }
    if (construction && fractions[index] !== undefined && !Number.isFinite(fractions[index])) {
      report(at(index, 'fraction'), item.fraction, 'a finite fraction with nonzero denominator', 'Undefined numeric fraction.');
    } else if (construction && fractions[index] < 0) {
      report(at(index, 'fraction'), item.fraction, '>= 0', 'Graph proportions cannot be negative.');
    }
  });
  if (issues.length) return issues;
  if (hasWeight.every(Boolean) && block.total !== undefined && !close(sum(weights), total)) {
    report('total', sum(weights), total, 'Category weights must sum to the stated total.');
    return issues; // Do not cascade denominator errors into every category.
  }
  if (!construction && total <= 0 && (hasWeight.some(Boolean) || items.some((item) => item.fraction === undefined))) {
    report('total', total, '> 0', 'Cannot derive proportions from a zero total.');
    return issues;
  }
  const proportions = items.map((item, index) => construction
    ? hasWeight[index] ? weights[index] / total : fractions[index] ??
      (Number.isFinite(calculations[index]) ? calculations[index] / 360 : undefined)
    : item.fraction !== undefined ? item.fraction : weights[index] / total);

  items.forEach((item, index) => {
    if (item.value !== undefined && item.amount !== undefined && !close(item.amount, item.value)) {
      report(at(index, 'amount'), item.amount, item.value, 'Alternative category counts disagree (value takes precedence).');
    }
    if (hasWeight[index] && fractions[index] !== undefined && !close(fractions[index], weights[index] / total, fractionRounding(item.fraction))) {
      report(at(index, 'fraction'), item.fraction, weights[index] / total, 'Fraction must agree with the category weight divided by total.');
    }
    // length is a fallback weight, not a centimetre override. When supplied
    // alongside a preferred count, compare equivalent rendered lengths. The
    // bar displays lengths to one decimal place, so allow half a display unit.
    if (bar && item.length !== undefined && weightKey(item) !== 'length' &&
        !close(item.length / total * totalLength, weights[index] / total * totalLength, 0.05)) {
      report(at(index, 'length'), item.length, weights[index], 'length is an alternative category weight; its scaled bar length disagrees with the preferred count.');
    }
  });
  if (issues.length) return issues;

  if (!construction) {
    const proportionSum = sum(proportions);
    if (!close(proportionSum, 1)) {
      report(key, proportionSum, 1, 'Rendered category proportions must sum to 1.');
      return issues;
    }
    if (bar) {
      // Both names describe the same scale. Do not silently accept contradictory
      // annotations merely because totalLength takes precedence in the renderer.
      if (block.totalLength !== undefined && block.totalLengthCm !== undefined && !close(block.totalLengthCm, totalLength, 0.05)) {
        report('totalLengthCm', block.totalLengthCm, totalLength, 'Alternative total bar lengths disagree.');
      }
      return issues;
    }
  }

  // Sector graph angle is an annotation only; sector construction uses explicit
  // angles or rounded count-derived angles as its actual geometry.
  const angles = items.map((item, index) => item.angle ?? (construction
    ? Math.round(weights[index] / total * 360) : proportions[index] * 360));
  const angleSum = sum(angles);
  const known = proportions.filter((value) => value !== undefined);
  const largest = Math.max(...known);
  const correction = known.length === items.length && close(sum(known), 1)
    ? 360 - sum(known.map((proportion) => Math.round(proportion * 360))) : 0;
  const rounding = (index) => Number.isInteger(angles[index]) && proportions[index] !== undefined ? 0.5 : 0;
  items.forEach((item, index) => {
    const expected = proportions[index] === undefined ? undefined : proportions[index] * 360;
    // A largest-sector adjustment can close a rounded circle. Only accept
    // the exact residual from rounding every category, and a total of 360.
    const adjustment = expected !== undefined && close(angleSum, 360) && proportions[index] === largest &&
      angles[index] === Math.round(expected) + correction ? Math.abs(correction) : 0;
    if (expected !== undefined && !close(angles[index], expected, rounding(index) + adjustment)) {
      report(at(index, 'angle'), angles[index], expected, 'Sector angle must agree with its proportion × 360 (allowing whole-degree rounding).');
    }
    const calculation = calculations[index];
    if (calculation !== undefined) {
      const target = expected ?? angles[index];
      if (!Number.isFinite(calculation) || !close(calculation, target, rounding(index) + adjustment)) {
        report(at(index, 'calculation'), item.calculation, target, 'Numeric angle calculation disagrees with the category proportion or angle.');
      }
    }
  });
  if (issues.length) return issues;
  const roundingBudget = sum(angles.map((_, index) => rounding(index)));
  if (!close(angleSum, 360, roundingBudget)) {
    report(key, angleSum, 360, 'Effective sector angles must cover a complete circle.');
  }
  return issues;
}
