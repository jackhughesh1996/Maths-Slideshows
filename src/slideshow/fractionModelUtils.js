/**
 * @file fractionModelUtils.js
 * Dependency-free utilities for parsing, validating, and calculating
 * fraction area models. Safe for direct Node.js and browser imports.
 */

export const MAX_FRACTION_DENOMINATOR = 12;

/**
 * Compute greatest common divisor using Euclidean algorithm.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function gcd(a, b) {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

/**
 * Parse a single fraction from various author formats:
 * - Object: { numerator, denominator } or { num, den } or { n, d }
 * - String: "1/3" or " 1 / 3 "
 * - Array: [1, 3]
 *
 * @param {*} value
 * @returns {{ valid: boolean, numerator?: number, denominator?: number, error?: string }}
 */
export function parseFraction(value) {
  if (value === null || value === undefined) {
    return { valid: false, error: 'Fraction value is missing.' };
  }

  let num;
  let den;

  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      if (value.length !== 2) {
        return { valid: false, error: `Fraction array must have [numerator, denominator], got length ${value.length}.` };
      }
      [num, den] = value;
    } else {
      num = value.numerator !== undefined ? value.numerator : (value.num !== undefined ? value.num : value.n);
      den = value.denominator !== undefined ? value.denominator : (value.den !== undefined ? value.den : value.d);
    }
  } else if (typeof value === 'string') {
    const trimmed = value.trim();
    const match = trimmed.match(/^([+-]?\d+)\s*\/\s*([+-]?\d+)$/);
    if (!match) {
      return { valid: false, error: `Invalid fraction format '${value}'. Expected format 'n/d'.` };
    }
    num = Number(match[1]);
    den = Number(match[2]);
  } else {
    return { valid: false, error: `Fraction must be an object { numerator, denominator }, string 'n/d', or [num, den] array.` };
  }

  if (typeof num !== 'number' || !Number.isFinite(num) || !Number.isInteger(num)) {
    return { valid: false, error: `Fraction numerator must be an integer (got ${String(num)}).` };
  }
  if (typeof den !== 'number' || !Number.isFinite(den) || !Number.isInteger(den)) {
    return { valid: false, error: `Fraction denominator must be an integer (got ${String(den)}).` };
  }
  if (den <= 0) {
    return { valid: false, error: `Fraction denominator must be a positive integer > 0 (got ${den}).` };
  }
  if (num < 0) {
    return { valid: false, error: `Fraction numerator must be a non-negative integer >= 0 (got ${num}).` };
  }
  if (num > den) {
    return { valid: false, error: `Fraction must be a proper fraction (numerator ${num} cannot exceed denominator ${den}).` };
  }
  if (den > MAX_FRACTION_DENOMINATOR) {
    return { valid: false, error: `Fraction denominator ${den} exceeds maximum supported grid limit of ${MAX_FRACTION_DENOMINATOR} for classroom legibility.` };
  }

  return { valid: true, numerator: num, denominator: den };
}

/**
 * Extract and validate row and column fractions from block configuration.
 * Supports:
 * - fraction1 & fraction2
 * - firstFraction & secondFraction
 * - fractions: [f1, f2]
 * - rows, cols, selectedRows, selectedCols
 *
 * @param {Object} block
 * @returns {{ valid: boolean, rowFraction?: { numerator: number, denominator: number }, colFraction?: { numerator: number, denominator: number }, errors: string[] }}
 */
export function parseFractionModelData(block) {
  const errors = [];
  if (!block || typeof block !== 'object') {
    return { valid: false, errors: ['Block must be an object.'] };
  }

  let rawRow = block.fraction1 ?? block.firstFraction;
  let rawCol = block.fraction2 ?? block.secondFraction;

  if (block.fractions !== undefined) {
    if (!Array.isArray(block.fractions)) {
      errors.push("'fractions' must be an array of two fractions.");
    } else if (block.fractions.length !== 2) {
      errors.push(`'fractions' array must contain exactly 2 fractions, got ${block.fractions.length}.`);
    } else {
      if (rawRow === undefined) rawRow = block.fractions[0];
      if (rawCol === undefined) rawCol = block.fractions[1];
    }
  }

  // Fallback to explicit rows/cols representation
  if (rawRow === undefined && rawCol === undefined && (block.rows !== undefined || block.cols !== undefined || block.columns !== undefined)) {
    const totalRows = block.rows;
    const totalCols = block.cols ?? block.columns;
    const selRows = block.selectedRows ?? 1;
    const selCols = block.selectedCols ?? 1;

    rawRow = { numerator: selRows, denominator: totalRows };
    rawCol = { numerator: selCols, denominator: totalCols };
  }

  if (rawRow === undefined || rawCol === undefined) {
    errors.push("Fraction area model requires two fractions (e.g. 'fraction1' and 'fraction2', or 'fractions' array).");
    return { valid: false, errors };
  }

  const parsedRow = parseFraction(rawRow);
  if (!parsedRow.valid) {
    errors.push(`Row fraction (Fraction 1): ${parsedRow.error}`);
  }

  const parsedCol = parseFraction(rawCol);
  if (!parsedCol.valid) {
    errors.push(`Column fraction (Fraction 2): ${parsedCol.error}`);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Cross-check if explicit rows/cols were also provided and ensure they agree
  if (block.rows !== undefined && block.rows !== parsedRow.denominator) {
    errors.push(`Explicit 'rows' (${block.rows}) contradicts Fraction 1 denominator (${parsedRow.denominator}).`);
  }
  const explicitCols = block.cols ?? block.columns;
  if (explicitCols !== undefined && explicitCols !== parsedCol.denominator) {
    errors.push(`Explicit columns (${explicitCols}) contradicts Fraction 2 denominator (${parsedCol.denominator}).`);
  }
  if (block.selectedRows !== undefined && block.selectedRows !== parsedRow.numerator) {
    errors.push(`Explicit 'selectedRows' (${block.selectedRows}) contradicts Fraction 1 numerator (${parsedRow.numerator}).`);
  }
  if (block.selectedCols !== undefined && block.selectedCols !== parsedCol.numerator) {
    errors.push(`Explicit 'selectedCols' (${block.selectedCols}) contradicts Fraction 2 numerator (${parsedCol.numerator}).`);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    rowFraction: { numerator: parsedRow.numerator, denominator: parsedRow.denominator },
    colFraction: { numerator: parsedCol.numerator, denominator: parsedCol.denominator },
    errors: []
  };
}
