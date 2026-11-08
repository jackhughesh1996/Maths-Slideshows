/**
 * @file mixedAreaMarkup.js
 * SVG Mixed Numeral Area Model generator for visualising mixed numeral multiplication.
 * Demonstrates 2 1/3 × 1 2/5 = 3 4/15 with mathematically exact geometric proportions
 * (horizontal 6:1, vertical 5:2) and progressive reveals explaining why separate
 * multiplication fails.
 */

import { renderMath, renderMathInText, escapeHtml } from './math.js';

/**
 * Render a mixed-numeral area model block into SVG and explanation HTML.
 *
 * @param {Object} block - Block configuration
 * @param {string} [revealClass=''] - Class string if block is externally wrapped
 * @returns {string} HTML string
 */
export function renderMixedNumeralAreaModelBlock(block, revealClass = '') {
  // Geometry: exact mathematical area proportions
  // Horizontal ratio: wWhole : (wNum / wDen) = 2 : 1/3 = 6 : 1
  // Vertical ratio: hWhole : (hNum / hDen) = 1 : 2/5 = 5 : 2
  const gridW = 315;
  const col1W = Math.round(gridW * (6 / 7)); // 270px
  const col2W = gridW - col1W;               // 45px

  const gridH = 154;
  const row1H = Math.round(gridH * (5 / 7)); // 110px
  const row2H = gridH - row1H;               // 44px

  const marginL = 66;
  const marginT = 38;
  const svgWidth = marginL + gridW + 20;     // 401px
  const svgHeight = marginT + gridH + 20;    // 212px

  const x0 = marginL;
  const x1 = marginL + col1W;
  const y0 = marginT;
  const y1 = marginT + row1H;

  // Progressive reveal steps
  const isProgressive = block.progressive !== false;
  const startStep = typeof block.startStep === 'number' && block.startStep >= 1
    ? Math.floor(block.startStep)
    : 1;

  const stepPartition = startStep;
  const stepProducts = startStep + 1;
  const stepCrossProducts = startStep + 2;
  const stepTotal = startStep + 3;

  const revPartitionAttr = isProgressive ? ` class="reveal-item mixed-partition-layer" data-reveal-step="${stepPartition}"` : ' class="mixed-partition-layer"';
  const revProductsAttr = isProgressive ? ` class="reveal-item mixed-products-layer" data-reveal-step="${stepProducts}"` : ' class="mixed-products-layer"';
  const revCrossAttr = isProgressive ? ` class="reveal-item mixed-cross-layer" data-reveal-step="${stepCrossProducts}"` : ' class="mixed-cross-layer"';
  const revTotalAttr = isProgressive ? ` class="reveal-item mixed-total-layer" data-reveal-step="${stepTotal}"` : ' class="mixed-total-layer"';

  const ariaLabel = block.ariaLabel ||
    'Proportional area model for 2 and 1/3 times 1 and 2/5, partitioned into four regions with areas 2, 1/3, 4/5, and 2/15, summing to 3 and 4/15.';

  const titleHtml = block.title ? `<h4 class="mixed-model-title">${escapeHtml(block.title)}</h4>` : '';

  return `
    <div class="mixed-numeral-area-container ${revealClass}" data-total="3 4/15">
      ${titleHtml}
      <svg class="mixed-area-svg" viewBox="0 0 ${svgWidth} ${svgHeight}" role="img" aria-label="${escapeHtml(ariaLabel)}">
        <title>Mixed Numeral Area Model: 2 1/3 × 1 2/5</title>
        <desc>Proportional rectangle showing dimensions (2 + 1/3) by (1 + 2/5) partitioned into four mathematical sub-areas.</desc>

        <!-- Base Outer Rectangle (Step 0) -->
        <rect class="mixed-base-frame" x="${x0}" y="${y0}" width="${gridW}" height="${gridH}" fill="#f8fafc" stroke="#1e293b" stroke-width="2.5" rx="4" />

        <!-- Dimension Brackets (Step 0) -->
        <!-- Top Brackets: Horizontal (2 and 1/3) -->
        <g class="mixed-top-brackets">
          <!-- Segment 1: Length 2 -->
          <line x1="${x0 + 2}" y1="${y0 - 6}" x2="${x1 - 2}" y2="${y0 - 6}" stroke="#2563eb" stroke-width="2" stroke-linecap="round" />
          <line x1="${x0 + 2}" y1="${y0 - 12}" x2="${x0 + 2}" y2="${y0 - 2}" stroke="#2563eb" stroke-width="2" />
          <line x1="${x1 - 2}" y1="${y0 - 12}" x2="${x1 - 2}" y2="${y0 - 2}" stroke="#2563eb" stroke-width="2" />
          <text x="${x0 + col1W / 2}" y="${y0 - 15}" fill="#2563eb" font-family="var(--font-sans, sans-serif)" font-size="14" font-weight="800" text-anchor="middle">2</text>

          <!-- Segment 2: Length 1/3 -->
          <line x1="${x1 + 2}" y1="${y0 - 6}" x2="${x0 + gridW - 2}" y2="${y0 - 6}" stroke="#2563eb" stroke-width="2" stroke-linecap="round" />
          <line x1="${x1 + 2}" y1="${y0 - 12}" x2="${x1 + 2}" y2="${y0 - 2}" stroke="#2563eb" stroke-width="2" />
          <line x1="${x0 + gridW - 2}" y1="${y0 - 12}" x2="${x0 + gridW - 2}" y2="${y0 - 2}" stroke="#2563eb" stroke-width="2" />
          <text x="${x1 + col2W / 2}" y="${y0 - 15}" fill="#2563eb" font-family="var(--font-sans, sans-serif)" font-size="13" font-weight="800" text-anchor="middle">1/3</text>
        </g>

        <!-- Left Brackets: Vertical (1 and 2/5) -->
        <g class="mixed-left-brackets">
          <!-- Segment 1: Length 1 -->
          <line x1="${x0 - 6}" y1="${y0 + 2}" x2="${x0 - 6}" y2="${y1 - 2}" stroke="#16a34a" stroke-width="2" stroke-linecap="round" />
          <line x1="${x0 - 12}" y1="${y0 + 2}" x2="${x0 - 2}" y2="${y0 + 2}" stroke="#16a34a" stroke-width="2" />
          <line x1="${x0 - 12}" y1="${y1 - 2}" x2="${x0 - 2}" y2="${y1 - 2}" stroke="#16a34a" stroke-width="2" />
          <text x="${x0 - 16}" y="${y0 + row1H / 2 + 5}" fill="#16a34a" font-family="var(--font-sans, sans-serif)" font-size="14" font-weight="800" text-anchor="end">1</text>

          <!-- Segment 2: Length 2/5 -->
          <line x1="${x0 - 6}" y1="${y1 + 2}" x2="${x0 - 6}" y2="${y0 + gridH - 2}" stroke="#16a34a" stroke-width="2" stroke-linecap="round" />
          <line x1="${x0 - 12}" y1="${y1 + 2}" x2="${x0 - 2}" y2="${y1 + 2}" stroke="#16a34a" stroke-width="2" />
          <line x1="${x0 - 12}" y1="${y0 + gridH - 2}" x2="${x0 - 2}" y2="${y0 + gridH - 2}" stroke="#16a34a" stroke-width="2" />
          <text x="${x0 - 16}" y="${y1 + row2H / 2 + 5}" fill="#16a34a" font-family="var(--font-sans, sans-serif)" font-size="13" font-weight="800" text-anchor="end">2/5</text>
        </g>

        <!-- Step 1: Partition lines dividing into 4 proportional regions -->
        <g${revPartitionAttr}>
          <line x1="${x1}" y1="${y0}" x2="${x1}" y2="${y0 + gridH}" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3" />
          <line x1="${x0}" y1="${y1}" x2="${x0 + gridW}" y2="${y1}" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3" />
        </g>

        <!-- Step 2: Product values in each region -->
        <g${revProductsAttr}>
          <!-- Region A: 2 × 1 = 2 -->
          <rect x="${x0 + 1}" y="${y0 + 1}" width="${col1W - 2}" height="${row1H - 2}" fill="#eff6ff" fill-opacity="0.6" />
          <text x="${x0 + col1W / 2}" y="${y0 + row1H / 2 - 4}" fill="#1e3a8a" font-family="var(--font-sans, sans-serif)" font-size="14" font-weight="700" text-anchor="middle">2 × 1</text>
          <text x="${x0 + col1W / 2}" y="${y0 + row1H / 2 + 16}" fill="#1e3a8a" font-family="var(--font-mono, monospace)" font-size="16" font-weight="800" text-anchor="middle">= 2</text>

          <!-- Region B: 1/3 × 1 = 1/3 -->
          <rect x="${x1 + 1}" y="${y0 + 1}" width="${col2W - 2}" height="${row1H - 2}" fill="#f8fafc" />
          <text class="mixed-product-b" x="${x1 + col2W / 2}" y="${y0 + row1H / 2 - 2}" fill="#334155" font-family="var(--font-mono, monospace)" font-size="11" font-weight="700" text-anchor="middle">1/3×1</text>
          <text class="mixed-product-b" x="${x1 + col2W / 2}" y="${y0 + row1H / 2 + 14}" fill="#0f172a" font-family="var(--font-mono, monospace)" font-size="13" font-weight="800" text-anchor="middle">= 1/3</text>

          <!-- Region C: 2 × 2/5 = 4/5 -->
          <rect x="${x0 + 1}" y="${y1 + 1}" width="${col1W - 2}" height="${row2H - 2}" fill="#f8fafc" />
          <text class="mixed-product-c" x="${x0 + col1W / 2}" y="${y1 + row2H / 2 + 5}" fill="#0f172a" font-family="var(--font-sans, sans-serif)" font-size="13" font-weight="700" text-anchor="middle">
            2 × 2/5 = <tspan font-family="var(--font-mono, monospace)" font-weight="800">4/5</tspan>
          </text>

          <!-- Region D: 1/3 × 2/5 = 2/15 -->
          <rect x="${x1 + 1}" y="${y1 + 1}" width="${col2W - 2}" height="${row2H - 2}" fill="#f5f3ff" />
          <text x="${x1 + col2W / 2}" y="${y1 + row2H / 2 + 4}" fill="#6b21a8" font-family="var(--font-mono, monospace)" font-size="11" font-weight="800" text-anchor="middle">2/15</text>
        </g>

        <!-- Step 3: Highlight the two cross-product regions (Regions B & C) missed by separate multiplication -->
        <g${revCrossAttr}>
          <rect class="cross-product-highlight" x="${x1}" y="${y0}" width="${col2W}" height="${row1H}" fill="#fef3c7" fill-opacity="0.95" stroke="#ea580c" stroke-width="2.5" />
          <rect class="cross-product-highlight" x="${x0}" y="${y1}" width="${col1W}" height="${row2H}" fill="#fef3c7" fill-opacity="0.95" stroke="#ea580c" stroke-width="2.5" />
          <text x="${x1 + col2W / 2}" y="${y0 + row1H / 2 - 12}" fill="#b45309" font-family="var(--font-sans, sans-serif)" font-size="7.5" font-weight="800" letter-spacing="-0.2px" text-anchor="middle">⚠️ MISSED</text>
          <text x="${x1 + col2W / 2}" y="${y0 + row1H / 2 + 6}" fill="#b45309" font-family="var(--font-mono, monospace)" font-size="12" font-weight="800" text-anchor="middle">1/3</text>
          <text x="${x0 + col1W / 2}" y="${y1 + row2H / 2 + 5}" fill="#b45309" font-family="var(--font-sans, sans-serif)" font-size="12" font-weight="800" text-anchor="middle">
            ⚠️ MISSED CROSS-PRODUCT: 2 × 2/5 = 4/5
          </text>
        </g>

        <!-- Crisp Outer Border overlay -->
        <rect x="${x0}" y="${y0}" width="${gridW}" height="${gridH}" fill="none" stroke="#1e293b" stroke-width="2.5" rx="4" style="pointer-events: none;" />
      </svg>

      <!-- Step 4: Total calculation card -->
      <div${revTotalAttr} data-equation="2 + 4/5 + 1/3 + 2/15 = 3 4/15">
        <div class="mixed-model-summary">
          <div class="mixed-model-sum-math">
            ${renderMath('2 + \\frac{4}{5} + \\frac{1}{3} + \\frac{2}{15} = \\mathbf{3\\frac{4}{15}}', { display: true })}
          </div>
          <div class="mixed-model-alert">
            <span class="mixed-alert-badge">⚠️ Why Separate Multiplying Fails</span>
            ${renderMathInText('Multiplying parts separately only gets $2 \\times 1 + \\frac{1}{3} \\times \\frac{2}{5} = \\mathbf{2\\frac{2}{15}}$, completely missing the cross-products $\\frac{4}{5}$ and $\\frac{1}{3}$ ($1\\frac{2}{15}$ short)!')}
          </div>
        </div>
      </div>
    </div>
  `;
}
