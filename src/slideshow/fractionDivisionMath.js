/**
 * @file fractionDivisionMath.js
 * Mathematical helpers and formatting for Fraction Division and Reciprocal simulations.
 * Pure functional calculations with zero DOM or framework dependencies.
 */

/**
 * Calculate greatest common divisor of two non-negative integers.
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
 * Simplify a fraction to lowest terms.
 * @param {number} num
 * @param {number} den
 * @returns {{ num: number, den: number }}
 */
export function simplifyFraction(num, den) {
  if (den === 0) return { num: 0, den: 1 };
  if (num === 0) return { num: 0, den: 1 };
  const divisor = gcd(num, den);
  return {
    num: Math.round(num / divisor),
    den: Math.round(den / divisor)
  };
}

/**
 * Convert whole number and fraction to improper fraction numerator.
 * @param {number} whole
 * @param {number} num
 * @param {number} den
 * @returns {{ num: number, den: number }}
 */
export function toImproper(whole = 0, num = 0, den = 1) {
  const d = den || 1;
  const improperNum = (whole * d) + num;
  return { num: improperNum, den: d };
}

/**
 * Convert improper fraction to mixed numeral.
 * @param {number} num
 * @param {number} den
 * @returns {{ whole: number, remNum: number, remDen: number, isExact: boolean, simplifiedWhole: number, simplifiedNum: number, simplifiedDen: number }}
 */
export function toMixed(num, den) {
  if (den === 0) return { whole: 0, remNum: 0, remDen: 1, isExact: true, simplifiedWhole: 0, simplifiedNum: 0, simplifiedDen: 1 };
  const whole = Math.floor(num / den);
  const remNum = num % den;
  const simplified = simplifyFraction(remNum, den);
  return {
    whole,
    remNum,
    remDen: den,
    isExact: remNum === 0,
    simplifiedWhole: whole,
    simplifiedNum: simplified.num,
    simplifiedDen: simplified.den
  };
}

/**
 * Calculate reciprocal of a fraction or mixed numeral.
 * @param {number} whole
 * @param {number} num
 * @param {number} den
 * @returns {{ origWhole: number, origNum: number, origDen: number, improperNum: number, improperDen: number, recipNum: number, recipDen: number, isWhole: boolean, isMixed: boolean }}
 */
export function calculateReciprocal(whole = 0, num = 0, den = 1) {
  const isMixed = whole > 0 && num > 0;
  const isWhole = whole > 0 && num === 0;
  const improper = isWhole ? { num: whole, den: 1 } : (isMixed ? toImproper(whole, num, den) : { num: num || 1, den: den || 1 });
  const recipNum = improper.den;
  const recipDen = improper.num;
  return {
    origWhole: whole,
    origNum: num,
    origDen: den,
    improperNum: improper.num,
    improperDen: improper.den,
    recipNum,
    recipDen,
    isWhole,
    isMixed
  };
}

/**
 * Calculate division of two fractions (dividend / divisor).
 * @param {number} divWhole
 * @param {number} divNum
 * @param {number} divDen
 * @param {number} dvrNum
 * @param {number} dvrDen
 * @returns {Object}
 */
export function calculateDivisionFit(divWhole = 0, divNum = 0, divDen = 1, dvrNum = 1, dvrDen = 1) {
  const dividend = divWhole > 0 && divNum === 0
    ? { num: divWhole, den: 1 }
    : toImproper(divWhole, divNum, divDen);

  const divisor = { num: dvrNum, den: dvrDen };

  // dividend ÷ divisor = dividend × (dvrDen / dvrNum)
  const productNum = dividend.num * divisor.den;
  const productDen = dividend.den * divisor.num;

  const simplified = simplifyFraction(productNum, productDen);
  const mixed = toMixed(simplified.num, simplified.den);

  // Common denominator representation to visualise grouping
  const commonDen = dividend.den * divisor.den;
  const divPartsInCommon = dividend.num * divisor.den;
  const dvrPartsInCommon = divisor.num * dividend.den;

  // Number of complete divisor groups that fit into dividend
  const fullGroups = Math.floor(divPartsInCommon / dvrPartsInCommon);
  const remParts = divPartsInCommon % dvrPartsInCommon;
  const partialFraction = simplifyFraction(remParts, dvrPartsInCommon);

  return {
    dividend,
    divisor,
    productNum,
    productDen,
    simplified,
    mixed,
    commonDen,
    divPartsInCommon,
    dvrPartsInCommon,
    fullGroups,
    remParts,
    partialFraction
  };
}

/**
 * Calculate fraction divided by whole number (equal sharing).
 * @param {number} divNum
 * @param {number} divDen
 * @param {number} shares
 * @returns {Object}
 */
export function calculateDivisionSharing(divNum, divDen, shares) {
  const safeShares = Math.max(1, shares);
  const totalSubdivisions = divDen * safeShares;
  const simplified = simplifyFraction(divNum, totalSubdivisions);

  return {
    divNum,
    divDen,
    shares: safeShares,
    totalSubdivisions,
    shareNum: divNum,
    shareDen: totalSubdivisions,
    simplified
  };
}
