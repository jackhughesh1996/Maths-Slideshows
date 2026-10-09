/**
 * @file renderer.js
 * Renders structured lesson data into semantic HTML elements.
 * Generates SVG sector graphs, divided bar graphs, and stem-and-leaf plots.
 * Infers progressive reveal sequence automatically without manual author indices.
 */

import { renderMath, renderMathInText, escapeHtml } from './math.js';

/**
 * Standard palette for graph categories (high-contrast, restrained workbook colors)
 */
const PALETTE = [
  '#2563eb', // Blue
  '#16a34a', // Green
  '#d97706', // Amber
  '#dc2626', // Red
  '#7c3aed', // Purple
  '#0891b2', // Cyan
  '#ea580c', // Orange
  '#475569', // Slate
];

/**
 * Render a single content block into HTML string.
 * @param {Object} block
 * @returns {string}
 */
export function renderBlock(block) {
  if (!block || typeof block !== 'object') return '';

  const revealClass = block.reveal ? 'reveal-item' : '';

  switch (block.type) {
    case 'heading': {
      const level = block.level || 3;
      const tag = `h${Math.min(6, Math.max(1, level))}`;
      return `<${tag} class="block-heading ${revealClass}">${renderMathInText(block.text || '')}</${tag}>`;
    }

    case 'paragraph': {
      return `<p class="block-paragraph ${revealClass}">${renderMathInText(block.text || '')}</p>`;
    }

    case 'bullet-list': {
      const items = (block.items || [])
        .map((item) => `<li>${renderMathInText(item)}</li>`)
        .join('');
      return `<ul class="block-list ${revealClass}" style="margin-left: 20px; line-height: 1.6; margin-top: 6px;">${items}</ul>`;
    }

    case 'ordered-list': {
      const items = (block.items || [])
        .map((item) => `<li>${renderMathInText(item)}</li>`)
        .join('');
      return `<ol class="block-list ${revealClass}" style="margin-left: 20px; line-height: 1.6; margin-top: 6px;">${items}</ol>`;
    }

    case 'note-box': {
      const variant = block.variant || 'default'; // 'default', 'alert', 'gold', 'green'
      const title = block.title ? `<h4>${renderMathInText(block.title)}</h4>` : '';
      const banner = block.copyToWorkbook ? `<span class="copy-badge">✍️ Copy into Workbook</span>` : '';
      return `
        <div class="note-box ${variant} ${revealClass}">
          ${banner}
          ${title}
          <div class="note-box-content">${renderMathInText(block.text || '')}</div>
        </div>
      `;
    }

    case 'raw-data': {
      return `
        <div class="raw-data-strip ${revealClass}">
          ${escapeHtml(block.data || '')}
        </div>
      `;
    }

    case 'formula': {
      return `
        <div class="formula-block ${revealClass}">
          ${renderMath(block.latex || '', { display: true })}
        </div>
      `;
    }

    case 'table': {
      const headers = (block.headers || [])
        .map((h) => `<th>${renderMathInText(h)}</th>`)
        .join('');
      const rows = (block.rows || [])
        .map((row) => {
          const cells = row
            .map((c) => `<td>${renderMathInText(String(c))}</td>`)
            .join('');
          return `<tr>${cells}</tr>`;
        })
        .join('');
      return `
        <div class="table-container ${revealClass}">
          <table class="math-table">
            <thead><tr>${headers}</tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    }

    case 'stem-and-leaf': {
      return renderStemAndLeafBlock(block, revealClass);
    }

    case 'sector-graph': {
      return renderSectorGraphBlock(block, revealClass);
    }

    case 'sector-construction': {
      return renderSectorConstructionBlock(block, revealClass);
    }

    case 'measured-bar':
    case 'divided-bar': {
      return renderMeasuredBarBlock(block, revealClass);
    }

    case 'board-workspace': {
      // Deprecated interactive workspace: render inner content directly without blank/dotted frame
      return block.content ? renderBlocks(block.content) : '';
    }

    case 'solution': {
      // Solutions are always progressive reveal items by default
      return `
        <div class="solution-container reveal-item">
          <span class="solution-badge">✔ ${escapeHtml(block.title || 'Model Solution')}</span>
          <div class="solution-content">
            ${block.text ? `<p style="margin-bottom: 6px;">${renderMathInText(block.text)}</p>` : ''}
            ${block.latex ? renderMath(block.latex, { display: true }) : ''}
            ${block.blocks ? renderBlocks(block.blocks) : ''}
          </div>
        </div>
      `;
    }

    default:
      return `<div class="${revealClass}">${renderMathInText(block.text || '')}</div>`;
  }
}

/**
 * Render multiple content blocks.
 * @param {Array<Object>} blocks
 * @returns {string}
 */
export function renderBlocks(blocks) {
  if (!Array.isArray(blocks)) return '';
  return blocks.map(renderBlock).join('');
}

/**
 * Render a Stem-and-Leaf plot table.
 * Supports standard single plots and back-to-back comparison plots.
 */
function renderStemAndLeafBlock(block, revealClass) {
  const isBackToBack = Boolean(block.isBackToBack);
  const rows = block.rows || [];

  let thead = '';
  if (isBackToBack) {
    thead = `
      <thead>
        <tr>
          <th style="color: var(--accent-rust);">${escapeHtml(block.leftHeader || 'Group A')}</th>
          <th>Stem</th>
          <th style="color: var(--accent-green);">${escapeHtml(block.rightHeader || 'Group B')}</th>
        </tr>
      </thead>
    `;
  } else {
    thead = `
      <thead>
        <tr>
          <th>Stem</th>
          <th>Leaf</th>
        </tr>
      </thead>
    `;
  }

  const tbody = rows
    .map((r) => {
      if (isBackToBack) {
        return `
          <tr>
            <td class="leaves-left">${escapeHtml(r.leftLeaves || '')}</td>
            <td class="stem-center">${escapeHtml(String(r.stem))}</td>
            <td class="leaves">${escapeHtml(r.leaves || '')}</td>
          </tr>
        `;
      } else {
        return `
          <tr>
            <td class="stem">${escapeHtml(String(r.stem))}</td>
            <td class="leaves">${escapeHtml(r.leaves || '')}</td>
          </tr>
        `;
      }
    })
    .join('');

  const keyHtml = block.key
    ? `<div class="plot-key">${renderMathInText(block.key)}</div>`
    : '';

  return `
    <div class="stem-plot-container ${revealClass}">
      <table class="stem-plot">
        ${thead}
        <tbody>
          ${tbody}
        </tbody>
      </table>
      ${keyHtml}
    </div>
  `;
}

/**
 * Render an SVG Sector Graph (Pie Chart) with exact geometry.
 */
function renderSectorGraphBlock(block, revealClass) {
  const items = block.items || [];
  if (items.length === 0) return '';

  const total = block.total || items.reduce((acc, it) => acc + (it.amount || 0), 0);
  const size = block.size || 250;
  const cx = size / 2;
  const cy = size / 2;
  const r = block.radius || Math.round(size * 0.38);

  let currentAngleDeg = -90; // Start at top 12 o'clock
  const paths = [];

  items.forEach((item, index) => {
    const fraction = item.fraction !== undefined ? item.fraction : (item.amount || 0) / total;
    const angleDeg = fraction * 360;
    const color = item.color || PALETTE[index % PALETTE.length];

    if (angleDeg >= 360) {
      // Full circle
      paths.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" stroke="#ffffff" stroke-width="2"/>`);
      return;
    }

    const startRad = (currentAngleDeg * Math.PI) / 180;
    const endRad = ((currentAngleDeg + angleDeg) * Math.PI) / 180;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const largeArcFlag = angleDeg > 180 ? 1 : 0;
    const pathD = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;

    paths.push(`
      <path d="${pathD}" fill="${color}" stroke="#ffffff" stroke-width="2">
        <title>${escapeHtml(item.label)}: ${item.amount || ''} (${Math.round(angleDeg)}°)</title>
      </path>
    `);

    // Mid angle for degree text label inside segment if arc is large enough
    if (angleDeg > 22) {
      const midRad = ((currentAngleDeg + angleDeg / 2) * Math.PI) / 180;
      const labelR = r * 0.65;
      const lx = cx + labelR * Math.cos(midRad);
      const ly = cy + labelR * Math.sin(midRad);
      paths.push(`
        <text x="${lx.toFixed(2)}" y="${ly.toFixed(2)}" text-anchor="middle" dominant-baseline="central"
              fill="#ffffff" font-weight="700" font-size="12" font-family="system-ui, sans-serif">
          ${Math.round(angleDeg)}°
        </text>
      `);
    }

    currentAngleDeg += angleDeg;
  });

  const legendItems = items
    .map((item, index) => {
      const color = item.color || PALETTE[index % PALETTE.length];
      const angle = item.angle || Math.round(((item.amount || 0) / total) * 360);
      return `
        <div class="legend-item">
          <span class="legend-swatch" style="background-color: ${color};"></span>
          <span><strong>${escapeHtml(item.label)}</strong>: ${item.amount !== undefined ? item.amount : ''} (${angle}°)</span>
        </div>
      `;
    })
    .join('');

  return `
    <div class="graph-display-container ${revealClass}">
      <svg class="svg-graph" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
        ${paths.join('')}
      </svg>
      <div class="graph-legend">
        ${legendItems}
      </div>
    </div>
  `;
}

/**
 * Render an SVG Animated Sector Graph Construction Component.
 * Supports step-by-step construction reveals:
 * - Empty base circle with center pivot and 0° baseline radius
 * - Category-by-category sector wedge drawing with bounding radii
 * - Angle arcs and high-contrast degree labels
 * - Synchronized calculation table with valid KaTeX answer blanks initially
 * - Progressive reveal of calculated answers in sync with sector wedges
 * - Active category row and sector visual highlighting
 * - Concluding angle sum check (all angles sum to 360°)
 *
 * @param {Object} block - Sector construction block configuration
 * @param {string} [revealClass=''] - Class for reveal wrapper if applied
 * @returns {string} HTML string
 */
function renderSectorConstructionBlock(block, revealClass = '') {
  const items = block.categories || block.items || [];
  if (items.length === 0) return '';

  const total = Number(block.total) || items.reduce((acc, it) => {
    const val = it.value !== undefined ? it.value : (it.amount !== undefined ? it.amount : 0);
    return acc + Number(val);
  }, 0) || 24;

  const size = Number(block.size) || 340;
  const cx = size / 2;
  const cy = size / 2;
  const r = Number(block.radius) || Math.round(size * 0.39); // ~132px
  const showTable = block.showTable !== false;

  // 1. Initial 0° baseline radius (12 o'clock, top vertical)
  const topY = (cy - r).toFixed(2);
  const baseline = `
    <line class="sector-baseline-line" x1="${cx}" y1="${cy}" x2="${cx}" y2="${topY}"
          stroke="#334155" stroke-width="2.5" stroke-linecap="round" />
    <text class="sector-baseline-text" x="${cx}" y="${(cy - r - 8).toFixed(2)}" text-anchor="middle"
          font-family="var(--font-sans, sans-serif)" font-size="11" font-weight="700" fill="#475569">
      0° Baseline
    </text>
  `;

  // 2. Base dashed protractor circle
  const baseCircle = `
    <circle class="sector-base-circle" cx="${cx}" cy="${cy}" r="${r}"
            fill="#f8fafc" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 4" />
  `;

  // 3. Sectors with progressive reveal and geometry elements
  let currentAngleDeg = -90; // Start at 12 o'clock
  const svgSectors = [];
  const tableRows = [];

  items.forEach((item, index) => {
    const color = item.color || PALETTE[index % PALETTE.length];
    const val = item.value !== undefined ? item.value : (item.amount !== undefined ? item.amount : 0);
    const fractionVal = val / total;
    const angleDeg = item.angle !== undefined ? Number(item.angle) : Math.round(fractionVal * 360);

    const calcStep = index * 2 + 1; // Step 1, 3, 5, 7
    const sectorStep = index * 2 + 2; // Step 2, 4, 6, 8

    const startAngle = currentAngleDeg;
    const endAngle = currentAngleDeg + angleDeg;

    // Circumference coordinates
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArcFlag = angleDeg > 180 ? 1 : 0;

    const wedgePath = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;

    // Angle Arc coordinates
    const rArc = 42;
    const ax1 = cx + rArc * Math.cos(startRad);
    const ay1 = cy + rArc * Math.sin(startRad);
    const ax2 = cx + rArc * Math.cos(endRad);
    const ay2 = cy + rArc * Math.sin(endRad);
    const arcPath = `M ${ax1.toFixed(2)} ${ay1.toFixed(2)} A ${rArc} ${rArc} 0 ${largeArcFlag} 1 ${ax2.toFixed(2)} ${ay2.toFixed(2)}`;

    // Text label coordinates
    const midRad = ((startAngle + angleDeg / 2) * Math.PI) / 180;
    const degR = r * 0.52;
    const dx = cx + degR * Math.cos(midRad);
    const dy = cy + degR * Math.sin(midRad);

    const catR = r * 0.80;
    const nx = cx + catR * Math.cos(midRad);
    const ny = cy + catR * Math.sin(midRad);

    // SVG Sector Element
    svgSectors.push(`
      <g class="reveal-item sector-construction-group"
         data-reveal-step="${sectorStep}"
         data-category="${escapeHtml(item.label)}"
         data-sector-index="${index}">
        <path class="sector-wedge" d="${wedgePath}" fill="${color}" fill-opacity="0.92" stroke="#ffffff" stroke-width="2.2" />
        <line class="sector-radius-line" x1="${cx}" y1="${cy}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" />
        <path class="sector-angle-arc" d="${arcPath}" fill="none" stroke="#0f172a" stroke-width="2.5" />
        <text class="sector-angle-text" x="${dx.toFixed(2)}" y="${dy.toFixed(2)}" text-anchor="middle" dominant-baseline="central"
              fill="#ffffff" font-family="var(--font-mono, monospace)" font-size="14" font-weight="800"
              style="filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.85));">
          ${Math.round(angleDeg)}°
        </text>
        <text class="sector-cat-text" x="${nx.toFixed(2)}" y="${ny.toFixed(2)}" text-anchor="middle" dominant-baseline="central"
              fill="#ffffff" font-family="var(--font-sans, sans-serif)" font-size="12" font-weight="700"
              style="filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.85));">
          ${escapeHtml(item.label)} (${val})
        </text>
      </g>
    `);

    // Synchronized Table Row Element
    if (showTable) {
      const fracStr = item.fraction || `\\frac{${val}}{${total}}`;
      const calcStr = item.calculation || `\\frac{${val}}{${total}} \\times 360^\\circ`;
      tableRows.push(`
        <tr class="sector-table-row" data-category-target="${escapeHtml(item.label)}">
          <td class="cat-label-cell">
            <span class="sector-swatch-dot" style="background-color: ${color};"></span>
            <strong>${escapeHtml(item.label)}</strong>
          </td>
          <td class="cat-count-cell">${val}</td>
          <td class="cat-frac-cell">${renderMathInText(`$${fracStr}$`)}</td>
          <td class="cat-calc-cell">
            <div class="calc-expression-wrap">
              <span class="calc-prefix">${renderMathInText(`$${calcStr} = $`)}</span>
              <span class="calc-blank-value">${renderMathInText('$\\underline{\\hspace{2.5em}}^\\circ$')}</span>
              <span class="reveal-item calc-revealed-value" data-reveal-step="${calcStep}" data-category="${escapeHtml(item.label)}">
                ${renderMathInText(`$\\mathbf{${Math.round(angleDeg)}^\\circ}$`)}
              </span>
            </div>
          </td>
        </tr>
      `);
    }

    currentAngleDeg += angleDeg;
  });

  // Final check step (after all sectors)
  const checkStep = items.length * 2 + 1; // 4 * 2 + 1 = 9

  // Center pivot point
  const centerPoint = `
    <circle class="sector-center-point" cx="${cx}" cy="${cy}" r="4" fill="#0f172a" />
    <circle class="sector-center-ring" cx="${cx}" cy="${cy}" r="8.5" fill="none" stroke="#ffffff" stroke-width="2" />
  `;

  // Right column: SVG Pie Chart & Legend & Check Banner
  const legendItems = items.map((item, index) => {
    const color = item.color || PALETTE[index % PALETTE.length];
    const val = item.value !== undefined ? item.value : (item.amount !== undefined ? item.amount : '');
    const angle = item.angle !== undefined ? item.angle : Math.round(((val || 0) / total) * 360);
    return `
      <div class="sector-legend-pill" data-category-target="${escapeHtml(item.label)}">
        <span class="sector-legend-dot" style="background-color: ${color};"></span>
        <span class="sector-legend-label"><strong>${escapeHtml(item.label)}</strong>: ${val} (${angle}°)</span>
      </div>
    `;
  }).join('');

  const checkLatex = block.checkMath || block.check || items.map(it => Math.round(it.angle || ((it.value || it.amount || 0) / total * 360)) + '^\\circ').join(' + ') + ' = 360^\\circ';
  const checkLabel = block.checkLabel || 'Full Circle Sum';

  const chartCard = `
    <div class="sector-chart-card">
      <div class="sector-chart-header">
        <span class="sector-chart-badge">📐 Step-by-Step Construction</span>
      </div>
      <svg class="sector-construction-svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet">
        ${baseCircle}
        ${baseline}
        ${svgSectors.join('')}
        ${centerPoint}
      </svg>
      <div class="sector-construction-legend">
        ${legendItems}
      </div>
      <div class="reveal-item sector-construction-check" data-reveal-step="${checkStep}" data-category="check">
        <span class="check-pill-badge">✔ ${renderMathInText(checkLabel)}</span>
        <span class="check-pill-equation">${renderMath(checkLatex, { display: false })}</span>
      </div>
    </div>
  `;

  if (!showTable) {
    return `
      <div class="sector-construction-container ${revealClass}">
        ${chartCard}
      </div>
    `;
  }

  // Left column: Calculation Table & Notes
  const headers = (block.tableHeaders || ['Travel Method', 'Count ($f$)', 'Fraction', 'Sector Angle Calculation'])
    .map(h => `<th>${renderMathInText(h)}</th>`)
    .join('');

  const totalRow = `
    <tr class="sector-table-total-row" data-category-target="check">
      <td><strong>Total</strong></td>
      <td><strong>${total}</strong></td>
      <td><strong>1</strong></td>
      <td class="cat-calc-cell">
        <div class="calc-expression-wrap">
          <span class="calc-prefix"><strong>Sum</strong> = </span>
          <span class="calc-blank-value">${renderMathInText('$\\underline{\\hspace{2.5em}}^\\circ$')}</span>
          <span class="reveal-item calc-revealed-value" data-reveal-step="${checkStep}" data-category="check">
            ${renderMathInText('$\\mathbf{360^\\circ} \\text{ ✔}$')}
          </span>
        </div>
      </td>
    </tr>
  `;

  const notesHtml = block.notes ? `<div class="sector-notes-wrap">${renderBlocks(block.notes)}</div>` : '';

  return `
    <div class="sector-construction-container ${revealClass}">
      <div class="sector-construction-layout">
        <div class="sector-construction-left">
          <div class="table-container">
            <table class="math-table sector-math-table">
              <thead><tr>${headers}</tr></thead>
              <tbody>
                ${tableRows.join('')}
                ${totalRow}
              </tbody>
            </table>
          </div>
          ${notesHtml}
        </div>
        <div class="sector-construction-right">
          ${chartCard}
        </div>
      </div>
    </div>
  `;
}

/**
 * Render an SVG Measured / Divided Bar Graph.
 * Features ruler-style centimeter and minor ticks, numerical labels along the axis,
 * configurable length (e.g. 10 cm or 20 cm), blank outlined ruler bar initially,
 * and progressive reveal of boundaries, segment fills, category labels, and check equation.
 *
 * @param {Object} block - Measured bar block model
 * @param {string} [revealClass=''] - Class for reveal wrapper if applied at block level
 * @returns {string} HTML string
 */
function renderMeasuredBarBlock(block, revealClass = '') {
  const items = block.categories || block.items || [];
  if (items.length === 0) return '';

  const totalLength = Number(block.totalLength || block.totalLengthCm) || 20;
  const unit = block.unit || 'cm';
  const showTicks = block.showTicks !== false;
  const showMinorTicks = block.showMinorTicks !== false;
  const isProgressive = Boolean(block.progressive);

  // Compute total count/denominator
  const total = Number(block.total) || items.reduce((acc, it) => {
    const val = it.value !== undefined ? it.value : (it.amount !== undefined ? it.amount : (it.length !== undefined ? it.length : 0));
    return acc + Number(val);
  }, 0) || totalLength;

  // SVG Geometry for clean projector and laptop scaling
  const svgWidth = 740;
  const paddingLeft = 32;
  const paddingRight = 44;
  const barWidth = svgWidth - paddingLeft - paddingRight; // 664px
  const barY = 28;
  const barHeight = 52;
  const axisY = barY + barHeight; // 80px
  const svgHeight = 126;

  // 1. Ruler tick marks and numbers (rendered on base layer, visible from the start)
  const ticks = [];
  if (showTicks) {
    for (let i = 0; i <= totalLength; i++) {
      const x = paddingLeft + (i / totalLength) * barWidth;
      // Major integer tick extending below the bar
      ticks.push(`
        <line x1="${x.toFixed(2)}" y1="${axisY}" x2="${x.toFixed(2)}" y2="${axisY + 12}"
              stroke="#334155" stroke-width="2" />
      `);

      // Integer number label below tick
      ticks.push(`
        <text x="${x.toFixed(2)}" y="${axisY + 26}" text-anchor="middle"
              font-family="var(--font-mono, monospace)" font-size="13" font-weight="700" fill="#1e293b">
          ${i}
        </text>
      `);

      // Minor half-interval tick (e.g. 0.5, 1.5, ... totalLength - 0.5)
      if (showMinorTicks && i < totalLength) {
        const halfX = paddingLeft + ((i + 0.5) / totalLength) * barWidth;
        ticks.push(`
          <line x1="${halfX.toFixed(2)}" y1="${axisY}" x2="${halfX.toFixed(2)}" y2="${axisY + 7}"
                stroke="#64748b" stroke-width="1.4" />
        `);
      }
    }

    // Final unit label placed after the last number
    ticks.push(`
      <text x="${(paddingLeft + barWidth + 14).toFixed(2)}" y="${axisY + 26}"
            font-family="var(--font-sans, sans-serif)" font-size="13" font-weight="700" fill="#2563eb">
        ${escapeHtml(unit)}
      </text>
    `);
  }

  // 2. Base outlined blank bar (visible from the start)
  const baseBar = `
    <rect class="measured-bar-outline" x="${paddingLeft}" y="${barY}" width="${barWidth}" height="${barHeight}"
          rx="4" fill="#f8fafc" stroke="#334155" stroke-width="2.5" />
  `;

  // 3. Category segments with progressive reveal support
  let currentX = paddingLeft;
  let accumulatedCm = 0;
  const segments = [];

  items.forEach((item, index) => {
    const val = item.value !== undefined ? item.value : (item.amount !== undefined ? item.amount : (item.length !== undefined ? item.length : 0));
    const fraction = item.fraction !== undefined ? item.fraction : val / total;
    const segWidth = fraction * barWidth;
    const segCm = fraction * totalLength;
    const color = item.color || PALETTE[index % PALETTE.length];
    accumulatedCm += segCm;
    const segGroupClass = isProgressive ? 'reveal-item measured-bar-segment' : 'measured-bar-segment';

    const boundaryX = (currentX + segWidth).toFixed(2);
    const midX = (currentX + segWidth / 2).toFixed(2);
    const lengthFormatted = segCm.toFixed(1).replace(/\.0$/, '');
    const accumFormatted = accumulatedCm.toFixed(1).replace(/\.0$/, '');

    // Inner text label (category name + length)
    let labelText = '';
    if (segWidth >= 65) {
      labelText = `
        <text x="${midX}" y="${barY + barHeight / 2 - 8}" text-anchor="middle" dominant-baseline="central"
              fill="#ffffff" font-family="var(--font-sans, sans-serif)" font-weight="700" font-size="13"
              style="filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.6));">
          ${escapeHtml(item.label)}
        </text>
        <text x="${midX}" y="${barY + barHeight / 2 + 12}" text-anchor="middle" dominant-baseline="central"
              fill="#ffffff" font-family="var(--font-mono, monospace)" font-weight="700" font-size="12"
              style="filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.6));">
          ${lengthFormatted} ${escapeHtml(unit)}
        </text>
      `;
    } else if (segWidth >= 32) {
      labelText = `
        <text x="${midX}" y="${barY + barHeight / 2}" text-anchor="middle" dominant-baseline="central"
              fill="#ffffff" font-family="var(--font-sans, sans-serif)" font-weight="700" font-size="11"
              style="filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.6));">
          ${lengthFormatted} ${escapeHtml(unit)}
        </text>
      `;
    }

    // Boundary vertical division line and coordinate callout above bar
    const boundaryMarker = `
      <line x1="${boundaryX}" y1="${barY}" x2="${boundaryX}" y2="${axisY + 14}"
            stroke="#0f172a" stroke-width="2.5" />
      <text x="${boundaryX}" y="${barY - 8}" text-anchor="middle"
            font-family="var(--font-mono, monospace)" font-size="11" font-weight="700" fill="#0f172a">
        ${accumFormatted} ${escapeHtml(unit)}
      </text>
    `;

    segments.push(`
      <g class="${segGroupClass}" data-segment="${index}">
        <rect x="${currentX.toFixed(2)}" y="${barY}" width="${segWidth.toFixed(2)}" height="${barHeight}"
              fill="${color}" fill-opacity="0.92" stroke="#1e293b" stroke-width="1.5">
          <title>${escapeHtml(item.label)}: ${lengthFormatted} ${escapeHtml(unit)} (boundary at ${accumFormatted} ${escapeHtml(unit)})</title>
        </rect>
        ${labelText}
        ${boundaryMarker}
      </g>
    `);

    currentX += segWidth;
  });

  // 4. Category legend items
  const legendItems = items
    .map((item, index) => {
      const color = item.color || PALETTE[index % PALETTE.length];
      const val = item.value !== undefined ? item.value : (item.amount !== undefined ? item.amount : (item.length !== undefined ? item.length : ''));
      const fraction = (item.amount || item.value || 0) / total;
      const lengthFormatted = (fraction * totalLength).toFixed(1).replace(/\.0$/, '');
      return `
        <div class="measured-bar-legend-item">
          <span class="measured-bar-legend-swatch" style="background-color: ${color};"></span>
          <span><strong>${escapeHtml(item.label)}</strong>: ${val !== '' ? `${val} students → ` : ''}<strong>${lengthFormatted} ${escapeHtml(unit)}</strong></span>
        </div>
      `;
    })
    .join('');

  // 5. Header and optional check calculation
  const headerHtml = (block.title || block.subtitle) ? `
    <div class="measured-bar-card-header">
      ${block.title ? `<h4>📏 ${renderMathInText(block.title)}</h4>` : ''}
      ${block.subtitle ? `<div class="measured-bar-subtitle">${renderMathInText(block.subtitle)}</div>` : ''}
    </div>
  ` : '';

  let checkHtml = '';
  const rawCheckMath = block.checkMath || (!block.check?.includes('$') && (block.check?.includes('\\text') || block.check?.includes('+')) ? block.check : null);
  const rawCheckLabel = block.checkLabel || (block.check && !rawCheckMath ? block.check : null);

  if (block.checkMath || block.check || block.checkSum) {
    let mathRendered = '';
    let labelText = block.checkLabel || 'Length Check';

    if (block.checkMath) {
      mathRendered = renderMath(block.checkMath, { display: false });
    } else if (block.check || block.checkSum) {
      const expr = block.check || block.checkSum;
      // If author wrote raw LaTeX or mixed latex inside string without $, handle cleanly
      if (expr.includes('$')) {
        mathRendered = renderMathInText(expr);
      } else if (expr.includes('\\text') || expr.includes('+') || expr.includes('=')) {
        mathRendered = renderMath(expr, { display: false });
      } else {
        mathRendered = renderMathInText(expr);
      }
    }

    checkHtml = `
      <div class="measured-bar-check ${isProgressive ? 'reveal-item' : ''}">
        <span class="check-badge">✔ ${renderMathInText(labelText)}</span>
        <span class="check-equation">${mathRendered}</span>
      </div>
    `;
  }

  return `
    <div class="measured-bar-container ${revealClass}">
      ${headerHtml}
      <svg class="measured-bar-svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}" preserveAspectRatio="xMidYMid meet">
        ${baseBar}
        ${segments.join('')}
        ${ticks.join('')}
      </svg>
      <div class="measured-bar-legend">
        ${legendItems}
      </div>
      ${checkHtml}
    </div>
  `;
}

const renderDividedBarBlock = renderMeasuredBarBlock;

/**
 * Render a complete slide into DOM Element.
 * @param {Object} slide - Slide data model
 * @param {number} index - Slide index
 * @returns {HTMLElement}
 */
export function renderSlide(slide, index) {
  const section = document.createElement('section');
  section.className = `slide ${index === 0 ? 'active' : ''}`;
  section.id = `slide-${index + 1}`;
  section.dataset.slideIndex = String(index);

  if (slide.timerMinutes) {
    section.dataset.timerMinutes = String(slide.timerMinutes);
  }

  // Phase badge class mapping
  let phaseClass = 'phase-concept';
  const type = slide.type || 'notes';
  if (['worked-example', 'i-do'].includes(type)) phaseClass = 'phase-i-do';
  else if (['we-do', 'board-task'].includes(type)) phaseClass = 'phase-we-do';
  else if (['practice', 'you-do'].includes(type)) phaseClass = 'phase-you-do';
  else if (['exit-ticket', 'assessment'].includes(type)) phaseClass = 'phase-assess';

  const phaseLabel = slide.phase || getPhaseDefaultLabel(type);

  // 1. Slide Header
  let headerHtml = '';
  if (type !== 'title') {
    headerHtml = `
      <div class="slide-header">
        <span class="slide-phase-badge ${phaseClass}">${escapeHtml(phaseLabel)}</span>
        <h2>${renderMathInText(slide.title || '')}</h2>
        ${slide.subtitle ? `<p class="subhead">${renderMathInText(slide.subtitle)}</p>` : ''}
      </div>
    `;
  }

  // 2. Slide Body (determined by slide.type)
  let bodyHtml = '';

  switch (type) {
    case 'title':
      bodyHtml = renderTitleSlide(slide);
      break;
    case 'learning':
      bodyHtml = renderLearningSlide(slide);
      break;
    case 'do-now':
      bodyHtml = renderDoNowSlide(slide);
      break;
    case 'worked-example':
      bodyHtml = renderWorkedExampleSlide(slide);
      break;
    case 'we-do':
    case 'board-task':
      bodyHtml = renderBoardTaskSlide(slide);
      break;
    case 'comparison':
      bodyHtml = renderComparisonSlide(slide);
      break;
    case 'practice':
      bodyHtml = renderPracticeSlide(slide);
      break;
    case 'exit-ticket':
      bodyHtml = renderExitTicketSlide(slide);
      break;
    case 'summary':
      bodyHtml = renderSummarySlide(slide);
      break;
    case 'notes':
    default:
      bodyHtml = renderNotesSlide(slide);
      break;
  }

  section.innerHTML = `
    ${headerHtml}
    <div class="slide-body">
      ${bodyHtml}
    </div>
  `;

  return section;
}

function getPhaseDefaultLabel(type) {
  switch (type) {
    case 'title': return 'Introduction';
    case 'learning': return 'Lesson Intentions';
    case 'do-now': return 'Do Now — Warm Up';
    case 'worked-example': return 'I Do — Worked Example';
    case 'we-do': return 'We Do — Guided Practice';
    case 'board-task': return 'We Do — Board Task';
    case 'comparison': return 'Analysis & Comparison';
    case 'practice': return 'You Do — Independent Practice';
    case 'exit-ticket': return 'Check for Understanding';
    case 'summary': return 'Lesson Summary';
    default: return 'Key Knowledge';
  }
}

/* ==========================================================================
   SLIDE TYPE SPECIFIC RENDERERS
   ========================================================================== */

function renderTitleSlide(slide) {
  return `
    <div class="card col-half" style="display:flex; flex-direction:column; justify-content:center; padding: 36px 40px;">
      <span class="slide-phase-badge phase-concept" style="width:fit-content; margin-bottom:12px;">Year 7 Mathematics</span>
      <h1 style="font-size: 2.5rem; font-weight: 800; color: var(--text-primary); line-height: 1.15; margin-bottom: 12px;">
        ${renderMathInText(slide.title || '')}
      </h1>
      ${slide.subtitle ? `<p style="font-size: 1.25rem; color: var(--text-secondary); margin-bottom: 24px;">${renderMathInText(slide.subtitle)}</p>` : ''}
      <div style="font-size: 0.88rem; color: var(--text-muted); font-family: var(--font-mono);">
        Press <kbd>Spacebar</kbd> or <kbd>→</kbd> to advance
      </div>
    </div>
    <div class="card col-half" style="display:flex; flex-direction:column; justify-content:center; background-color: var(--primary-subtle); border-color: var(--primary-border);">
      <h3 style="font-size: 1.15rem; color: var(--primary); margin-bottom: 12px;">Lesson Overview</h3>
      ${slide.overview ? `<p style="font-size: 1rem; color: var(--text-primary); line-height: 1.6; margin-bottom: 16px;">${renderMathInText(slide.overview)}</p>` : ''}
      ${slide.topics ? `
        <ul style="margin-left: 20px; font-size: 0.95rem; line-height: 1.7; color: var(--text-secondary);">
          ${slide.topics.map((t) => `<li>${renderMathInText(t)}</li>`).join('')}
        </ul>
      ` : ''}
    </div>
  `;
}

function renderLearningSlide(slide) {
  const criteria = (slide.successCriteria || [])
    .map((c) => `<li style="margin-bottom: 8px;">${renderMathInText(c)}</li>`)
    .join('');

  return `
    <div class="card col-half" style="display:flex; flex-direction:column; justify-content:center;">
      <div class="note-box" style="padding: 16px; margin-bottom: 20px;">
        <h4 style="font-size: 1.05rem; color: var(--primary);">🎯 WALT (We Are Learning To)</h4>
        <p style="font-size: 1.05rem; color: var(--text-primary); margin-top: 6px; line-height: 1.5;">
          ${renderMathInText(slide.learningIntention || '')}
        </p>
      </div>
      <div class="note-box gold" style="padding: 16px; margin-bottom: 0;">
        <h4 style="font-size: 1.05rem; color: var(--accent-gold);">⭐ WILF (What I'm Looking For)</h4>
        <ul style="margin-left: 20px; font-size: 0.96rem; line-height: 1.6; color: var(--text-primary); margin-top: 6px;">
          ${criteria}
        </ul>
      </div>
    </div>
    <div class="card col-half" style="display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding: 24px;">
      ${slide.keyPrinciple ? `
        <div style="font-size: 2.8rem; margin-bottom: 12px;">📐 ✏️</div>
        <h3 style="font-size: 1.25rem; color: var(--text-primary); margin-bottom: 10px;">Core Mathematics Principle</h3>
        <p style="font-size: 1.08rem; color: var(--primary); font-weight: 700; background: var(--primary-subtle); padding: 16px; border-radius: 8px; border: 1.5px dashed var(--primary-border); line-height: 1.5;">
          "${renderMathInText(slide.keyPrinciple)}"
        </p>
      ` : ''}
      ${slide.extraBlocks ? renderBlocks(slide.extraBlocks) : ''}
    </div>
  `;
}

function renderDoNowSlide(slide) {
  const questions = (slide.questions || [])
    .map((q, idx) => `
      <div style="margin-bottom: 16px; padding: 12px; background: var(--bg-muted); border-radius: 6px;">
        <p style="font-weight: 600; font-size: 0.96rem;">${idx + 1}. ${renderMathInText(q.prompt)}</p>
        <div class="reveal-item" style="margin-top: 8px; color: var(--accent-green); font-weight: 700; font-size: 0.94rem;">
          ✔ ${renderMathInText(q.answer)}
        </div>
      </div>
    `)
    .join('');

  return `
    <div class="card col-60">
      <h3 class="card-title">Warm-up Questions</h3>
      <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 14px;">Complete these in your workbook. Spacebar reveals answers.</p>
      ${questions}
    </div>
    <div class="card col-40" style="display:flex; flex-direction:column; justify-content:center;">
      ${slide.sidebarNotes ? renderBlocks(slide.sidebarNotes) : `
        <div class="note-box gold">
          <h4>💡 Teacher Reminder</h4>
          <p style="font-size: 0.9rem;">Allow 3–5 minutes for independent student attempts before revealing step answers.</p>
        </div>
      `}
    </div>
  `;
}

function renderNotesSlide(slide) {
  if (slide.columns) {
    return slide.columns
      .map((col) => {
        const widthClass = col.width ? `col-${col.width}` : 'col-half';
        return `
          <div class="card ${widthClass}">
            ${col.title ? `<h3 class="card-title">${renderMathInText(col.title)}</h3>` : ''}
            ${renderBlocks(col.blocks || [])}
          </div>
        `;
      })
      .join('');
  }

  return `
    <div class="card col-full">
      ${renderBlocks(slide.content || [])}
    </div>
  `;
}

function renderWorkedExampleSlide(slide) {
  const steps = (slide.steps || [])
    .map((step, idx) => `
      <div class="reveal-item" style="margin-bottom: 14px; padding: 12px 14px; background: var(--bg-muted); border-left: 3px solid var(--primary); border-radius: 0 6px 6px 0;">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--primary); margin-bottom: 4px;">
          Step ${idx + 1}: ${renderMathInText(step.label || '')}
        </h4>
        <div style="font-size: 0.92rem; line-height: 1.5;">${renderMathInText(step.text || '')}</div>
        ${step.latex ? renderMath(step.latex, { display: true }) : ''}
        ${step.blocks ? renderBlocks(step.blocks) : ''}
      </div>
    `)
    .join('');

  return `
    <div class="card col-half">
      <h3 class="card-title">Problem Statement</h3>
      ${slide.prompt ? `<p style="font-size: 1rem; line-height: 1.5; margin-bottom: 12px;">${renderMathInText(slide.prompt)}</p>` : ''}
      ${slide.data ? `<div class="raw-data-strip">${escapeHtml(slide.data)}</div>` : ''}
      ${slide.leftBlocks ? renderBlocks(slide.leftBlocks) : ''}
    </div>
    <div class="card col-half">
      <h3 class="card-title">Step-by-Step Working</h3>
      ${steps}
    </div>
  `;
}

function renderBoardTaskSlide(slide) {
  const studentAction = slide.studentAction || 'On whiteboards: calculate each missing value.';
  // Only split into two primary columns if there are explicit two primary presentation representations
  // (e.g. workspaceContent/leftBlocks on one side, and rightBlocks or a model solution on the other side).
  // Notes are secondary teacher support guidance and must NEVER trigger a two-column layout on their own.
  const hasTwoCols = Boolean(slide.solution || slide.rightBlocks);

  const actionBannerHtml = `
    <div class="whiteboard-instruction">
      <span class="wb-icon">📋</span>
      <span class="wb-text">${renderMathInText(studentAction)}</span>
    </div>
  `;

  // Secondary teacher guidance note box (compact styling so it does not dominate presentation area)
  const notesHtml = slide.notes ? `
    <div class="board-task-teacher-notes" style="margin-top: 10px;">
      ${renderBlocks(slide.notes)}
    </div>
  ` : '';

  if (!hasTwoCols) {
    // Single primary mathematical representation layout (e.g. sector-construction component, or wide table)
    // Uses full slide width beneath the compact action banner.
    return `
      <div class="card col-full" style="display: flex; flex-direction: column;">
        ${actionBannerHtml}
        ${slide.prompt ? `<p style="font-size: 1.02rem; line-height: 1.5; margin-bottom: 10px; color: var(--text-primary); font-weight: 500;">${renderMathInText(slide.prompt)}</p>` : ''}
        ${slide.data ? `<div class="raw-data-strip">${escapeHtml(slide.data)}</div>` : ''}
        ${slide.workspaceContent ? renderBlocks(slide.workspaceContent) : (slide.content ? renderBlocks(slide.content) : '')}
        ${slide.leftBlocks ? renderBlocks(slide.leftBlocks) : ''}
        ${notesHtml}
      </div>
    `;
  }

  // Two-column layout when two primary representations are explicitly provided
  // (e.g. Table on left, Measured-Bar / Solution on right)
  const leftContent = `
    ${actionBannerHtml}
    ${slide.prompt ? `<p style="font-size: 0.98rem; line-height: 1.45; margin-bottom: 8px; color: var(--text-primary); font-weight: 500;">${renderMathInText(slide.prompt)}</p>` : ''}
    ${slide.data ? `<div class="raw-data-strip">${escapeHtml(slide.data)}</div>` : ''}
    ${slide.workspaceContent ? renderBlocks(slide.workspaceContent) : (slide.content ? renderBlocks(slide.content) : '')}
    ${slide.leftBlocks ? renderBlocks(slide.leftBlocks) : ''}
    ${notesHtml}
  `;

  const rightContent = `
    ${slide.rightBlocks ? renderBlocks(slide.rightBlocks) : ''}
    ${slide.solution ? `
      <div class="reveal-item solution-container" style="margin-top: 10px;">
        <span class="solution-badge">✔ Model Solution</span>
        <div class="solution-content" style="margin-top: 8px;">
          ${renderBlocks(slide.solution)}
        </div>
      </div>
    ` : ''}
  `;

  return `
    <div class="card col-half" style="display: flex; flex-direction: column;">
      ${leftContent}
    </div>
    <div class="card col-half" style="display: flex; flex-direction: column; justify-content: flex-start;">
      ${rightContent}
    </div>
  `;
}

function renderComparisonSlide(slide) {
  const cols = slide.columns || [];
  return cols
    .map((col) => `
      <div class="card col-half">
        <h3 class="card-title">${renderMathInText(col.title || '')}</h3>
        ${renderBlocks(col.blocks || [])}
      </div>
    `)
    .join('');
}

function renderPracticeSlide(slide) {
  const tasks = (slide.tasks || [])
    .map((task) => `
      <div class="card col-third" style="display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <h3 class="card-title" style="font-size: 1.05rem;">${renderMathInText(task.title || '')}</h3>
          ${task.prompt ? `<p style="font-size: 0.92rem; line-height: 1.5; margin-bottom: 8px;">${renderMathInText(task.prompt)}</p>` : ''}
          ${task.blocks ? renderBlocks(task.blocks) : ''}
        </div>
        <div class="reveal-item solution-container" style="margin-top: 12px;">
          <span class="solution-badge">✔ Solution</span>
          ${task.solution ? renderBlocks(task.solution) : ''}
        </div>
      </div>
    `)
    .join('');

  return tasks;
}

function renderExitTicketSlide(slide) {
  const checks = (slide.questions || [])
    .map((q, idx) => `
      <div class="card col-half" style="display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <h3 class="card-title">Question ${idx + 1}</h3>
          <p style="font-size: 1rem; line-height: 1.5; margin-bottom: 12px;">${renderMathInText(q.prompt)}</p>
          ${q.blocks ? renderBlocks(q.blocks) : ''}
        </div>
        <div class="reveal-item solution-container" style="margin-top: 14px;">
          <span class="solution-badge">✔ Answer</span>
          ${q.solution ? renderBlocks(q.solution) : ''}
        </div>
      </div>
    `)
    .join('');

  return checks;
}

function renderSummarySlide(slide) {
  const takeaways = (slide.takeaways || [])
    .map((t) => `
      <li style="margin-bottom: 10px; font-size: 1.05rem; line-height: 1.6;">
        ${renderMathInText(t)}
      </li>
    `)
    .join('');

  return `
    <div class="card col-60" style="display:flex; flex-direction:column; justify-content:center; padding: 30px;">
      <h3 style="font-size: 1.35rem; color: var(--primary); margin-bottom: 16px;">Core Concepts Checklist</h3>
      <ul style="margin-left: 24px; color: var(--text-primary);">
        ${takeaways}
      </ul>
    </div>
    <div class="card col-40" style="display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding: 24px;">
      <div style="font-size: 3rem; margin-bottom: 12px;">🎓 ⭐</div>
      <h3 style="font-size: 1.25rem; margin-bottom: 8px;">Well done, Year 7!</h3>
      <p style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 16px;">Pack up workbooks, pens and calculators.</p>
      <button class="btn btn-primary btn-summary-return" type="button">
        Return to Lesson Library
      </button>
    </div>
  `;
}
