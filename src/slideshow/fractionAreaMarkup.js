/**
 * @file fractionAreaMarkup.js
 * SVG Fraction Area Model generator for visualising fraction multiplication.
 * Generates mathematically accurate, progressively revealed area models with genuine SVG rectangle geometry.
 */

import { renderMath, renderMathInText, escapeHtml } from './math.js';
import { gcd, parseFraction, parseFractionModelData, MAX_FRACTION_DENOMINATOR } from './fractionModelUtils.js';

export { gcd, parseFraction, parseFractionModelData, MAX_FRACTION_DENOMINATOR };

/**
 * Standard high-contrast workbook palette for fraction models.
 */
export const FRACTION_MODEL_COLORS = Object.freeze({
  columns: '#2563eb', // Blue for columns (Fraction 2)
  rows: '#16a34a',    // Green for rows (Fraction 1)
  overlap: '#7c3aed', // Purple for overlapping cells
  border: '#1e293b',  // Dark slate for grid border
  gridLine: '#94a3b8',// Muted slate for cell outlines
  backdrop: '#ffffff' // Crisp white cell background
});

let modelInstanceCounter = 0;

/**
 * Render a Fraction Area Model content block into HTML string containing crisp SVG vector graphics.
 *
 * @param {Object} block - Block configuration
 * @param {string} [revealClass=''] - Class string if block is externally wrapped
 * @returns {string} HTML string
 */
export function renderFractionAreaModelBlock(block, revealClass = '') {
  const parsed = parseFractionModelData(block);
  if (!parsed.valid) {
    return `
      <div class="fraction-area-model-container ${revealClass} fraction-model-error">
        <p class="math-error">Invalid fraction area model configuration: ${escapeHtml(parsed.errors.join('; '))}</p>
      </div>
    `;
  }

  const { rowFraction, colFraction } = parsed;
  const n1 = rowFraction.numerator;
  const d1 = rowFraction.denominator;
  const n2 = colFraction.numerator;
  const d2 = colFraction.denominator;

  const rows = d1;
  const cols = d2;
  const selRows = n1;
  const selCols = n2;
  const totalCells = rows * cols;
  const overlapCells = selRows * selCols;

  const prodNum = n1 * n2;
  const prodDen = d1 * d2;
  const factor = gcd(prodNum, prodDen);

  // Progressive reveal stages
  const isProgressive = block.progressive !== false;
  const startStep = typeof block.startStep === 'number' && block.startStep >= 1
    ? Math.floor(block.startStep)
    : 1;

  const stepCols = startStep;
  const stepRows = startStep + 1;
  const stepOverlap = startStep + 2;
  const stepEquation = startStep + 3;

  const revColsAttr = isProgressive ? ` class="reveal-item model-column-shading" data-reveal-step="${stepCols}"` : ' class="model-column-shading"';
  const revRowsAttr = isProgressive ? ` class="reveal-item model-row-shading" data-reveal-step="${stepRows}"` : ' class="model-row-shading"';
  const revOverlapAttr = isProgressive ? ` class="reveal-item model-overlap-shading" data-reveal-step="${stepOverlap}"` : ' class="model-overlap-shading"';
  const revEquationAttr = isProgressive ? ` class="reveal-item fraction-model-equation" data-reveal-step="${stepEquation}"` : ' class="fraction-model-equation"';

  // Colors
  const colColor = block.colColor || FRACTION_MODEL_COLORS.columns;
  const rowColor = block.rowColor || FRACTION_MODEL_COLORS.rows;
  const overlapColor = block.overlapColor || FRACTION_MODEL_COLORS.overlap;

  // Geometry computation: maintain equal area cells and clean projector proportions
  const maxAvailableGridWidth = 360;
  const maxAvailableGridHeight = 195;
  const cellW = Math.min(Math.floor(maxAvailableGridWidth / cols), Math.floor(maxAvailableGridHeight / rows), 68);
  const cellH = cellW; // Equal width and height gives perfectly square, equal-area cells
  const gridW = cols * cellW;
  const gridH = rows * cellH;

  const leftMargin = 90;
  const rightMargin = 30;
  const topMargin = 45;
  const bottomMargin = 28;

  const svgWidth = Math.max(440, gridW + leftMargin + rightMargin);
  const svgHeight = Math.max(260, gridH + topMargin + bottomMargin);

  const gridX = leftMargin + Math.round((svgWidth - leftMargin - rightMargin - gridW) / 2);
  const gridY = topMargin + Math.round((svgHeight - topMargin - bottomMargin - gridH) / 2);

  modelInstanceCounter++;
  const uniqueId = `fam-${modelInstanceCounter}`;

  // 1. Base Layer (Initial unshaded state: all rows and columns with equal area)
  const baseCells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = gridX + c * cellW;
      const y = gridY + r * cellH;
      baseCells.push(
        `<rect class="area-model-cell" data-row="${r}" data-col="${c}" x="${x}" y="${y}" width="${cellW}" height="${cellH}" fill="${FRACTION_MODEL_COLORS.backdrop}" stroke="${FRACTION_MODEL_COLORS.gridLine}" stroke-width="1.5" />`
      );
    }
  }

  // 2. Layer 1 (Reveal 1): Column Shading (Fraction 2, e.g. 2/3 in blue)
  const colShadeElements = [];
  for (let c = 0; c < selCols; c++) {
    const x = gridX + c * cellW;
    colShadeElements.push(
      `<rect class="model-column-rect" data-col="${c}" x="${x}" y="${gridY}" width="${cellW}" height="${gridH}" fill="${colColor}" fill-opacity="0.35" stroke="${colColor}" stroke-width="1.5" stroke-dasharray="4 2" />`
    );
  }

  let colBracket = '';
  if (selCols > 0) {
    const colSpanW = selCols * cellW;
    const midX = gridX + colSpanW / 2;
    colBracket = `
      <g class="column-bracket-group">
        <line x1="${gridX + 2}" y1="${gridY - 8}" x2="${gridX + colSpanW - 2}" y2="${gridY - 8}" stroke="${colColor}" stroke-width="2.2" stroke-linecap="round" />
        <line x1="${gridX + 2}" y1="${gridY - 14}" x2="${gridX + 2}" y2="${gridY - 4}" stroke="${colColor}" stroke-width="2.2" stroke-linecap="round" />
        <line x1="${gridX + colSpanW - 2}" y1="${gridY - 14}" x2="${gridX + colSpanW - 2}" y2="${gridY - 4}" stroke="${colColor}" stroke-width="2.2" stroke-linecap="round" />
        <text class="column-fraction-label" x="${midX}" y="${gridY - 20}" fill="${colColor}" font-family="var(--font-sans, sans-serif)" font-size="15" font-weight="800" text-anchor="middle">
          ${n2}/${d2} (${n2} ${n2 === 1 ? 'column' : 'columns'})
        </text>
      </g>
    `;
  }

  // 3. Layer 2 (Reveal 2): Row Shading (Fraction 1, e.g. 1/3 in green with diagonal hatch pattern)
  const rowShadeElements = [];
  for (let r = 0; r < selRows; r++) {
    const y = gridY + r * cellH;
    rowShadeElements.push(
      `<rect class="model-row-rect" data-row="${r}" x="${gridX}" y="${y}" width="${gridW}" height="${cellH}" fill="${rowColor}" fill-opacity="0.28" />`
    );
    rowShadeElements.push(
      `<rect class="model-row-hatch" data-row="${r}" x="${gridX}" y="${y}" width="${gridW}" height="${cellH}" fill="url(#row-diagonal-hatch-${uniqueId})" />`
    );
  }

  let rowBracket = '';
  if (selRows > 0) {
    const rowSpanH = selRows * cellH;
    const midY = gridY + rowSpanH / 2;
    rowBracket = `
      <g class="row-bracket-group">
        <line x1="${gridX - 8}" y1="${gridY + 2}" x2="${gridX - 8}" y2="${gridY + rowSpanH - 2}" stroke="${rowColor}" stroke-width="2.2" stroke-linecap="round" />
        <line x1="${gridX - 14}" y1="${gridY + 2}" x2="${gridX - 4}" y2="${gridY + 2}" stroke="${rowColor}" stroke-width="2.2" stroke-linecap="round" />
        <line x1="${gridX - 14}" y1="${gridY + rowSpanH - 2}" x2="${gridX - 4}" y2="${gridY + rowSpanH - 2}" stroke="${rowColor}" stroke-width="2.2" stroke-linecap="round" />
        <text class="row-fraction-label" x="${gridX - 22}" y="${midY + 5}" fill="${rowColor}" font-family="var(--font-sans, sans-serif)" font-size="15" font-weight="800" text-anchor="end">
          ${n1}/${d1} (${n1} ${n1 === 1 ? 'row' : 'rows'})
        </text>
      </g>
    `;
  }

  // 4. Layer 3 (Reveal 3): Overlapping Cells Highlight in Purple
  const overlapElements = [];
  for (let r = 0; r < selRows; r++) {
    for (let c = 0; c < selCols; c++) {
      const x = gridX + c * cellW;
      const y = gridY + r * cellH;
      const cx = x + cellW / 2;
      const cy = y + cellH / 2;
      overlapElements.push(
        `<rect class="overlap-cell" data-row="${r}" data-col="${c}" x="${x}" y="${y}" width="${cellW}" height="${cellH}" fill="${overlapColor}" fill-opacity="0.88" stroke="#5b21b6" stroke-width="2.2" />`
      );
      overlapElements.push(
        `<text class="overlap-cell-label" x="${cx}" y="${cy + 5}" fill="#ffffff" font-family="var(--font-mono, monospace)" font-size="${cellH >= 50 ? 14 : 11}" font-weight="800" text-anchor="middle" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.85));">1/${totalCells}</text>`
      );
    }
  }

  // Accessible description text
  const ariaLabel = block.ariaLabel ||
    `Fraction area model for ${n1}/${d1} times ${n2}/${d2} equals ${prodNum}/${prodDen}, subdivided into ${rows} rows and ${cols} columns with ${overlapCells} overlapping cells out of ${totalCells} total equal cells.`;

  // 5. Layer 4 (Reveal 4): Mathematical Equation underneath diagram
  let mathLatex = '';
  if (block.equation) {
    mathLatex = block.equation;
  } else if (factor > 1 && factor !== prodNum) {
    const simpNum = prodNum / factor;
    const simpDen = prodDen / factor;
    mathLatex = `\\frac{${n1}}{${d1}} \\times \\frac{${n2}}{${d2}} = \\frac{${n1} \\times ${n2}}{${d1} \\times ${d2}} = \\frac{${prodNum}}{${prodDen}} = \\mathbf{\\frac{${simpNum}}{${simpDen}}}`;
  } else {
    mathLatex = `\\frac{${n1}}{${d1}} \\times \\frac{${n2}}{${d2}} = \\frac{${n1} \\times ${n2}}{${d1} \\times ${d2}} = \\mathbf{\\frac{${prodNum}}{${prodDen}}}`;
  }

  const titleHtml = block.title ? `<h4 class="fraction-model-title">${escapeHtml(block.title)}</h4>` : '';
  const subtitleHtml = block.subtitle ? `<p class="fraction-model-subtitle">${renderMathInText(block.subtitle)}</p>` : '';

  const equationHtml = block.showEquation !== false
    ? `
      <div${revEquationAttr} data-product="${prodNum}/${prodDen}" data-equation="${escapeHtml(mathLatex)}">
        <div class="fraction-model-equation-math">
          ${renderMath(mathLatex, { display: true })}
        </div>
        <div class="fraction-model-legend">
          <span class="fraction-legend-badge">
            <span class="fraction-legend-dot" style="background-color: ${colColor};"></span>
            ${renderMathInText(`$\\frac{${n2}}{${d2}}$`)} columns (${n2} of ${d2})
          </span>
          <span class="fraction-legend-badge">
            <span class="fraction-legend-dot" style="background-color: ${rowColor};"></span>
            ${renderMathInText(`$\\frac{${n1}}{${d1}}$`)} row${n1 === 1 ? '' : 's'} (${n1} of ${d1})
          </span>
          <span class="fraction-legend-badge">
            <span class="fraction-legend-dot" style="background-color: ${overlapColor};"></span>
            Overlap: <strong>${overlapCells}</strong> of <strong>${totalCells}</strong> cells = ${renderMathInText(`$\\mathbf{\\frac{${prodNum}}{${totalCells}}}$`)}
          </span>
        </div>
      </div>
    `
    : '';

  return `
    <div class="fraction-area-model-container ${revealClass}" data-rows="${rows}" data-cols="${cols}" data-total-cells="${totalCells}" data-overlap-cells="${overlapCells}" data-product="${prodNum}/${prodDen}">
      ${titleHtml}
      ${subtitleHtml}
      <svg class="fraction-area-svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}" role="img" aria-label="${escapeHtml(ariaLabel)}">
        <title>Fraction Area Model: ${n1}/${d1} × ${n2}/${d2}</title>
        <desc>Subdivided rectangle with ${rows} rows and ${cols} columns. ${n2} columns shaded blue (${n2}/${d2}), ${n1} rows shaded green (${n1}/${d1}), and ${overlapCells} overlapping cells highlighted in purple (${prodNum}/${totalCells}).</desc>
        <defs>
          <pattern id="row-diagonal-hatch-${uniqueId}" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="10" stroke="${rowColor}" stroke-width="2.5" stroke-opacity="0.65" />
          </pattern>
        </defs>

        <!-- Base Grid: Initial unshaded state with equal-area rectangular cells -->
        <g class="model-base-grid">
          <rect class="grid-backdrop" x="${gridX}" y="${gridY}" width="${gridW}" height="${gridH}" fill="${FRACTION_MODEL_COLORS.backdrop}" stroke="${FRACTION_MODEL_COLORS.border}" stroke-width="2.5" rx="3" />
          ${baseCells.join('')}
        </g>

        <!-- Reveal 1: Column Shading (Fraction 2, Blue) -->
        <g${revColsAttr}>
          ${colShadeElements.join('')}
          ${colBracket}
        </g>

        <!-- Reveal 2: Row Shading (Fraction 1, Green) -->
        <g${revRowsAttr}>
          ${rowShadeElements.join('')}
          ${rowBracket}
        </g>

        <!-- Reveal 3: Overlapping Cells Highlight (Purple) -->
        <g${revOverlapAttr}>
          ${overlapElements.join('')}
        </g>

        <!-- Top Crisp Grid Frame -->
        <rect class="grid-outer-frame" x="${gridX}" y="${gridY}" width="${gridW}" height="${gridH}" fill="none" stroke="${FRACTION_MODEL_COLORS.border}" stroke-width="2.5" rx="3" style="pointer-events: none;" />

        <!-- Grid Dimension Label -->
        <text class="grid-dimension-label" x="${gridX + gridW / 2}" y="${gridY + gridH + 24}" fill="#64748b" font-family="var(--font-sans, sans-serif)" font-size="13" font-weight="600" text-anchor="middle">
          ${rows} rows × ${cols} columns = ${totalCells} equal parts
        </text>
      </svg>
      ${equationHtml}
    </div>
  `;
}
