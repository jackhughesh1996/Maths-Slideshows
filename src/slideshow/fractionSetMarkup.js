/**
 * @file fractionSetMarkup.js
 * SVG Fraction of a Set generator for visualising fraction-of-quantity operations.
 * Renders equally sized SVG circle counters partitioned into equal groups,
 * with progressive reveal stages for group separation, group highlighting, and equation.
 */

import { renderMath, renderMathInText, escapeHtml } from './math.js';
import { parseFractionOfSetData } from './fractionSetUtils.js';

/**
 * High-contrast accessible color palette for fraction-of-set diagrams.
 */
export const SET_MODEL_COLORS = Object.freeze({
  neutralCounterFill: '#f8fafc',
  neutralCounterStroke: '#64748b',
  highlightCounterFill: '#2563eb',
  highlightCounterStroke: '#1d4ed8',
  highlightGroupBg: 'rgba(219, 234, 254, 0.65)',
  highlightGroupBorder: '#2563eb',
  neutralGroupBorder: '#cbd5e1',
  neutralGroupBg: 'rgba(248, 250, 252, 0.45)',
  textColor: '#1e293b'
});

/**
 * Render a fraction-of-set content block into HTML containing crisp SVG vector graphics.
 *
 * @param {Object} block - Block configuration
 * @param {string} [revealClass=''] - Class string if block is externally wrapped
 * @returns {string} HTML string
 */
export function renderFractionOfSetBlock(block, revealClass = '') {
  const parsed = parseFractionOfSetData(block);
  if (!parsed.valid) {
    return `
      <div class="fraction-of-set-container ${revealClass} fraction-set-error">
        <p class="math-error">Invalid fraction-of-set configuration: ${escapeHtml(parsed.errors.join('; '))}</p>
      </div>
    `;
  }

  const { total, numerator, denominator, groups, itemsPerGroup, highlightedCount } = parsed;
  const unit = block.unit || 'counters';

  // Progressive reveal stages
  const isProgressive = block.progressive !== false;
  const startStep = typeof block.startStep === 'number' && block.startStep >= 1
    ? Math.floor(block.startStep)
    : 1;

  const stepGroups = startStep;
  const stepHighlight = startStep + 1;
  const stepEquation = startStep + 2;

  const revGroupsAttr = isProgressive ? ` class="reveal-item set-groups-layer" data-reveal-step="${stepGroups}"` : ' class="set-groups-layer"';
  const revHighlightAttr = isProgressive ? ` class="reveal-item set-highlight-layer" data-reveal-step="${stepHighlight}"` : ' class="set-highlight-layer"';
  const revEquationAttr = isProgressive ? ` class="reveal-item set-equation-layer" data-reveal-step="${stepEquation}"` : ' class="set-equation-layer"';

  // Sub-grid layout per group
  let subCols = 2;
  if (itemsPerGroup >= 5 && itemsPerGroup <= 6) subCols = 3;
  else if (itemsPerGroup > 6) subCols = Math.ceil(Math.sqrt(itemsPerGroup * 1.3));
  const subRows = Math.ceil(itemsPerGroup / subCols);

  // SVG Geometry
  const counterRadius = 8.5;
  const counterSpacingX = counterRadius * 2.5;
  const counterSpacingY = counterRadius * 2.5;

  const groupInnerW = (subCols - 1) * counterSpacingX + counterRadius * 2 + 18;
  const groupInnerH = (subRows - 1) * counterSpacingY + counterRadius * 2 + 18;

  const groupGap = groups <= 5 ? 12 : 8;
  const marginX = 24;
  const marginTop = 38;
  const marginBottom = 28;

  const svgWidth = Math.max(480, marginX * 2 + groups * groupInnerW + (groups - 1) * groupGap);
  const svgHeight = marginTop + groupInnerH + marginBottom;

  const allGroupsTotalW = groups * groupInnerW + (groups - 1) * groupGap;
  const startX = Math.round((svgWidth - allGroupsTotalW) / 2);
  const groupY = marginTop;

  // Build SVG elements
  const neutralCounters = [];
  const highlightCounters = [];
  const groupRects = [];
  const groupHighlightBgs = [];
  const groupLabels = [];

  for (let g = 0; g < groups; g++) {
    const gx = startX + g * (groupInnerW + groupGap);
    const isSelected = g < numerator;

    // Neutral group card backdrop
    groupRects.push(
      `<rect class="set-group-box" data-group="${g}" x="${gx}" y="${groupY}" width="${groupInnerW}" height="${groupInnerH}" rx="6" fill="${SET_MODEL_COLORS.neutralGroupBg}" stroke="${SET_MODEL_COLORS.neutralGroupBorder}" stroke-width="1.6" stroke-dasharray="3 3" />`
    );

    // Group number / count label
    groupLabels.push(
      `<text class="set-group-label" x="${gx + groupInnerW / 2}" y="${groupY + groupInnerH + 16}" fill="#64748b" font-family="var(--font-sans, sans-serif)" font-size="11" font-weight="600" text-anchor="middle">Group ${g + 1} (${itemsPerGroup})</text>`
    );

    // If selected, highlight backdrop
    if (isSelected) {
      groupHighlightBgs.push(
        `<rect class="set-group-highlight-box" data-group="${g}" x="${gx}" y="${groupY}" width="${groupInnerW}" height="${groupInnerH}" rx="6" fill="${SET_MODEL_COLORS.highlightGroupBg}" stroke="${SET_MODEL_COLORS.highlightGroupBorder}" stroke-width="2.2" />`
      );
    }

    // Counters inside group
    const contentStartX = gx + (groupInnerW - ((subCols - 1) * counterSpacingX + counterRadius * 2)) / 2 + counterRadius;
    const contentStartY = groupY + (groupInnerH - ((subRows - 1) * counterSpacingY + counterRadius * 2)) / 2 + counterRadius;

    for (let i = 0; i < itemsPerGroup; i++) {
      const col = i % subCols;
      const row = Math.floor(i / subCols);
      const cx = Math.round(contentStartX + col * counterSpacingX);
      const cy = Math.round(contentStartY + row * counterSpacingY);
      const itemIndex = g * itemsPerGroup + i;

      // Base neutral counter
      neutralCounters.push(
        `<circle class="set-counter neutral-counter" data-index="${itemIndex}" data-group="${g}" cx="${cx}" cy="${cy}" r="${counterRadius}" fill="${SET_MODEL_COLORS.neutralCounterFill}" stroke="${SET_MODEL_COLORS.neutralCounterStroke}" stroke-width="1.8" />`
      );

      // Highlight counter (for selected groups)
      if (isSelected) {
        highlightCounters.push(
          `<circle class="set-counter highlight-counter" data-index="${itemIndex}" data-group="${g}" cx="${cx}" cy="${cy}" r="${counterRadius}" fill="${SET_MODEL_COLORS.highlightCounterFill}" stroke="${SET_MODEL_COLORS.highlightCounterStroke}" stroke-width="2" />`
        );
      }
    }
  }

  // Bracket over highlighted groups
  let highlightBracket = '';
  if (numerator > 0) {
    const highlightW = numerator * groupInnerW + (numerator - 1) * groupGap;
    const hStartX = startX;
    const hMidX = hStartX + highlightW / 2;
    highlightBracket = `
      <g class="set-highlight-bracket">
        <line x1="${hStartX + 3}" y1="${groupY - 8}" x2="${hStartX + highlightW - 3}" y2="${groupY - 8}" stroke="${SET_MODEL_COLORS.highlightGroupBorder}" stroke-width="2.2" stroke-linecap="round" />
        <line x1="${hStartX + 3}" y1="${groupY - 14}" x2="${hStartX + 3}" y2="${groupY - 4}" stroke="${SET_MODEL_COLORS.highlightGroupBorder}" stroke-width="2.2" stroke-linecap="round" />
        <line x1="${hStartX + highlightW - 3}" y1="${groupY - 14}" x2="${hStartX + highlightW - 3}" y2="${groupY - 4}" stroke="${SET_MODEL_COLORS.highlightGroupBorder}" stroke-width="2.2" stroke-linecap="round" />
        <text class="set-highlight-bracket-label" x="${hMidX}" y="${groupY - 18}" fill="${SET_MODEL_COLORS.highlightGroupBorder}" font-family="var(--font-sans, sans-serif)" font-size="13" font-weight="800" text-anchor="middle">
          ${numerator} of ${denominator} groups (${highlightedCount} ${unit})
        </text>
      </g>
    `;
  }

  // Mathematical equation and takeaway
  const mathFormula = block.equation || `\\frac{${numerator}}{${denominator}} \\text{ of } ${total} = \\frac{${numerator}}{${denominator}} \\times \\frac{${total}}{1} = \\mathbf{${highlightedCount}}`;
  const ariaLabel = block.ariaLabel ||
    `Fraction of set model: ${numerator}/${denominator} of ${total} equals ${highlightedCount}. ${total} ${unit} separated into ${groups} equal groups of ${itemsPerGroup}, with ${numerator} groups highlighted containing ${highlightedCount} ${unit}.`;

  const equationHtml = block.showEquation !== false
    ? `
      <div${revEquationAttr} data-equation="${escapeHtml(mathFormula)}" data-answer="${highlightedCount}">
        <div class="fraction-set-equation-box">
          <div class="fraction-set-math">
            ${renderMath(mathFormula, { display: true })}
          </div>
          <div class="fraction-set-breakdown">
            <span class="fraction-set-pill">
              <span class="pill-dot" style="background: ${SET_MODEL_COLORS.neutralCounterStroke};"></span>
              ${renderMathInText(`Divide into **${groups}** equal groups: $${total} \\div ${denominator} = ${itemsPerGroup}$ per group`)}
            </span>
            <span class="fraction-set-pill highlight">
              <span class="pill-dot" style="background: ${SET_MODEL_COLORS.highlightCounterFill};"></span>
              ${renderMathInText(`Select **${numerator}** group${numerator === 1 ? '' : 's'}: $${numerator} \\times ${itemsPerGroup} = \\mathbf{${highlightedCount}}$ ${unit}`)}
            </span>
          </div>
        </div>
      </div>
    `
    : '';

  const titleHtml = block.title ? `<h4 class="fraction-set-title">${escapeHtml(block.title)}</h4>` : '';
  const subtitleHtml = block.subtitle ? `<p class="fraction-set-subtitle">${renderMathInText(block.subtitle)}</p>` : '';

  return `
    <div class="fraction-of-set-container ${revealClass}" data-total="${total}" data-numerator="${numerator}" data-denominator="${denominator}" data-groups="${groups}" data-per-group="${itemsPerGroup}" data-highlighted="${highlightedCount}">
      ${titleHtml}
      ${subtitleHtml}
      <svg class="fraction-set-svg" viewBox="0 0 ${svgWidth} ${svgHeight}" role="img" aria-label="${escapeHtml(ariaLabel)}">
        <title>Fraction of Set: ${numerator}/${denominator} of ${total}</title>
        <desc>${total} total objects divided into ${groups} groups of ${itemsPerGroup}. ${numerator} groups highlighted (${highlightedCount} objects).</desc>

        <!-- Step 0 (Initial unshaded state): all counters visible in orderly array -->
        <g class="set-base-counters">
          ${neutralCounters.join('')}
        </g>

        <!-- Step 1 (Reveal 1): Group separation outlines and labels -->
        <g${revGroupsAttr}>
          ${groupRects.join('')}
          ${groupLabels.join('')}
        </g>

        <!-- Step 2 (Reveal 2): Highlight selected groups and counters -->
        <g${revHighlightAttr}>
          ${groupHighlightBgs.join('')}
          ${highlightCounters.join('')}
          ${highlightBracket}
        </g>
      </svg>
      ${equationHtml}
    </div>
  `;
}
