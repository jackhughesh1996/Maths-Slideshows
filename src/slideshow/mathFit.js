/**
 * @file mathFit.js
 * Automatically fits wide displayed equations (.katex-display) to their containing card.
 * Detects when scrollWidth > clientWidth and shrinks font size just enough to fit,
 * down to a minimum of 78% of normal size.
 * Restores equations to normal size when space permits (e.g. after container/window expansion).
 */

const MIN_SCALE = 0.78;

/**
 * Finds each displayed equation (.katex-display) in the currently visible slide
 * whose scrollWidth is larger than its clientWidth, and shrinks its font size
 * down to a minimum of 78% of normal size.
 *
 * @param {HTMLElement} [container] - Optional slide element or container. Defaults to .pres-slide.active.
 */
export function fitMath(container) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const slideEl = container || document.querySelector('.slide.active') || document.querySelector('.pres-slide.active');
  if (!slideEl) return;

  const equations = slideEl.querySelectorAll('.katex-display');
  if (!equations.length) return;

  equations.forEach((el) => {
    // Skip equations inside blocks that are not yet revealed; they have no width,
    // so measure again when they are revealed.
    if (el.closest('.reveal-item:not(.is-revealed)')) {
      return;
    }

    // Skip if equation or container is currently hidden (no rendered width)
    if (!el.clientWidth || el.offsetParent === null) {
      return;
    }

    // 1. Reset font size to normal so we can measure unconstrained dimensions
    // and allow equations to return to normal size when space permits.
    el.style.removeProperty('font-size');

    // 2. Check if equation content overflows available container width
    const clientWidth = el.clientWidth;
    const scrollWidth = el.scrollWidth;

    if (scrollWidth <= clientWidth) {
      // Equation fits comfortably at 100% normal font size
      return;
    }

    // 3. Compute base font size at normal scale (from CSS stylesheet)
    const baseFontSize = parseFloat(window.getComputedStyle(el).fontSize);
    if (!baseFontSize || isNaN(baseFontSize)) return;

    // 4. Calculate required scale factor: clientWidth / scrollWidth
    // Clamped to a minimum of 78% (0.78) of normal size
    let scale = Math.max(MIN_SCALE, clientWidth / scrollWidth);
    el.style.setProperty('font-size', `${(baseFontSize * scale).toFixed(3)}px`, 'important');

    // 5. Fine-tune: if subpixel rounding leaves scrollWidth slightly larger than clientWidth,
    // nudge down until it fits or reaches MIN_SCALE (0.78)
    while (el.scrollWidth > el.clientWidth && scale > MIN_SCALE) {
      scale = Math.max(MIN_SCALE, scale - 0.008);
      el.style.setProperty('font-size', `${(baseFontSize * scale).toFixed(3)}px`, 'important');
    }
  });
}

export default fitMath;
