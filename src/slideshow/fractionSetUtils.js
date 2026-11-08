/**
 * @file fractionSetUtils.js
 * Dependency-free utilities for parsing and validating fraction-of-set data.
 * Safe for direct Node.js and browser imports.
 */

import { parseFraction } from './fractionModelUtils.js';

export const MAX_SET_TOTAL = 100;
export const MAX_SET_DENOMINATOR = 12;

/**
 * Extract and validate fraction-of-set configuration.
 * Accepts:
 * - total: number of items (positive integer, <= 100)
 * - numerator / denominator directly, or fraction: "n/d" or { numerator, denominator }
 * - checks that total is divisible by denominator
 * - checks that 0 <= numerator <= denominator
 *
 * @param {Object} block
 * @returns {{ valid: boolean, total?: number, numerator?: number, denominator?: number, groups?: number, itemsPerGroup?: number, highlightedCount?: number, errors: string[] }}
 */
export function parseFractionOfSetData(block) {
  const errors = [];

  if (!block || typeof block !== 'object') {
    return { valid: false, errors: ['Block must be an object.'] };
  }

  // 1. Validate total
  const total = block.total;
  if (total === undefined || total === null) {
    errors.push("Missing required property 'total'.");
  } else if (typeof total !== 'number' || !Number.isFinite(total) || !Number.isInteger(total)) {
    errors.push(`'total' must be an integer, got ${String(total)}.`);
  } else if (total <= 0) {
    errors.push(`'total' must be a positive integer > 0, got ${total}.`);
  } else if (total > MAX_SET_TOTAL) {
    errors.push(`'total' (${total}) exceeds maximum limit of ${MAX_SET_TOTAL} for classroom legibility.`);
  }

  // 2. Validate fraction / numerator / denominator
  let num = block.numerator;
  let den = block.denominator;

  if (block.fraction !== undefined) {
    const parsedF = parseFraction(block.fraction);
    if (!parsedF.valid) {
      errors.push(`Invalid 'fraction': ${parsedF.error}`);
    } else {
      if (num === undefined) num = parsedF.numerator;
      if (den === undefined) den = parsedF.denominator;
    }
  }

  if (num === undefined || den === undefined) {
    errors.push("Fraction of set requires numerator and denominator (provide 'numerator' and 'denominator', or 'fraction').");
    return { valid: false, errors };
  }

  if (typeof num !== 'number' || !Number.isFinite(num) || !Number.isInteger(num)) {
    errors.push(`'numerator' must be an integer, got ${String(num)}.`);
  }
  if (typeof den !== 'number' || !Number.isFinite(den) || !Number.isInteger(den)) {
    errors.push(`'denominator' must be an integer, got ${String(den)}.`);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  if (den <= 0) {
    errors.push(`'denominator' must be a positive integer > 0, got ${den}.`);
  } else if (den > MAX_SET_DENOMINATOR) {
    errors.push(`'denominator' (${den}) exceeds maximum supported limit of ${MAX_SET_DENOMINATOR} for classroom legibility.`);
  }

  if (num < 0) {
    errors.push(`'numerator' must be a non-negative integer >= 0, got ${num}.`);
  } else if (num > den) {
    errors.push(`'numerator' (${num}) cannot exceed 'denominator' (${den}) for proper fraction of set.`);
  }

  // 3. Mathematical divisibility constraint: total must be divisible by denominator
  if (total !== undefined && den > 0 && total % den !== 0) {
    errors.push(`Total quantity (${total}) is not divisible into ${den} equal groups (remainder ${total % den}).`);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const groups = den;
  const itemsPerGroup = total / den;
  const highlightedCount = num * itemsPerGroup;

  return {
    valid: true,
    total,
    numerator: num,
    denominator: den,
    groups,
    itemsPerGroup,
    highlightedCount,
    errors: []
  };
}
