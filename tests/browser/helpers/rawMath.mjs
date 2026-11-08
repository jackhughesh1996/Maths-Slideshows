import { expect } from '@playwright/test';

/**
 * Inspects visible text on the active slide (or specified root) for unrendered
 * raw mathematical markup or LaTeX command tokens.
 *
 * Excludes:
 * - .katex-mathml
 * - script and style elements
 * - any not-yet-revealed .reveal-item (.reveal-item:not(.is-revealed))
 * - elements hidden via display: none, visibility: hidden, opacity: 0
 *
 * Patterns checked:
 * 1. A dollar sign, 1 to 80 characters that are not dollar signs or line breaks, then a dollar sign:
 *    /\$[^$\r\n]{1,80}\$/
 * 2. A backslash followed by one of frac, dfrac, text, times, div, cdot, sqrt, left, right, begin, end, mathbf, approx:
 *    /\\(?:frac|dfrac|text|times|div|cdot|sqrt|left|right|begin|end|mathbf|approx)/
 */

export async function findRawMath(page, selector = '.slide.active') {
  return page.evaluate((sel) => {
    const root = document.querySelector(sel) || document.body;
    if (!root) return [];

    const isExcludedOrHidden = (el) => {
      if (!el) return false;
      if (el.closest('.katex-mathml, script, style, .reveal-item:not(.is-revealed)')) {
        return true;
      }
      for (let node = el; node && node !== document.body.parentElement; node = node.parentElement) {
        const css = window.getComputedStyle(node);
        if (css.display === 'none' || css.visibility === 'hidden' || Number(css.opacity) === 0) {
          return true;
        }
      }
      return false;
    };

    const DOLLAR_MATH_REGEX = /\$[^$\r\n]{1,80}\$/g;
    const LATEX_CMD_REGEX = /\\(?:frac|dfrac|text|times|div|cdot|sqrt|left|right|begin|end|mathbf|approx)/g;

    const findings = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.nodeValue) continue;
      if (isExcludedOrHidden(node.parentElement)) continue;
      const text = node.nodeValue;
      const dollarMatches = text.match(DOLLAR_MATH_REGEX);
      if (dollarMatches) {
        for (const m of dollarMatches) {
          if (!findings.includes(m)) findings.push(m);
        }
      }
      const latexMatches = text.match(LATEX_CMD_REGEX);
      if (latexMatches) {
        for (const m of latexMatches) {
          if (!findings.includes(m)) findings.push(m);
        }
      }
    }

    return findings;
  }, selector);
}

export async function expectNoRawMath(page, lessonId, slideNumber) {
  const findings = await findRawMath(page);
  expect(findings, `Lesson ${lessonId} slide ${slideNumber} has raw math on screen: ${findings.join(', ')}`).toEqual([]);
}
