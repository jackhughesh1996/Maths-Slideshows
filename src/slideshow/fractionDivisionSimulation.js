/**
 * @file fractionDivisionSimulation.js
 * Interactive Fraction Division Explorer & Reciprocal Demonstrator widgets.
 * Supports Mode 1 (How many groups fit?) and Mode 2 (Equal sharing),
 * plus the lightweight interactive Reciprocal Demonstrator.
 */

import { renderMath, renderMathInText, escapeHtml } from './math.js';
import {
  calculateDivisionFit,
  calculateDivisionSharing,
  calculateReciprocal
} from './fractionDivisionMath.js';

// ============================================================================
// SIMULATION A: FRACTION DIVISION EXPLORER
// ============================================================================

export const DIVISION_PRESETS_FIT = [
  { label: '1/2 ÷ 1/4', divWhole: 0, divNum: 1, divDen: 2, dvrNum: 1, dvrDen: 4, desc: 'How many quarters fit into one half?' },
  { label: '3/4 ÷ 1/2', divWhole: 0, divNum: 3, divDen: 4, dvrNum: 1, dvrDen: 2, desc: 'How many halves fit into 3 quarters? (Partial group)' },
  { label: '3 ÷ 1/2', divWhole: 3, divNum: 0, divDen: 1, dvrNum: 1, dvrDen: 2, desc: 'How many halves fit into 3 wholes?' },
  { label: '6 ÷ 1/3', divWhole: 6, divNum: 0, divDen: 1, dvrNum: 1, dvrDen: 3, desc: 'How many thirds fit into 6 wholes?' },
  { label: '3/5 ÷ 3/8', divWhole: 0, divNum: 3, divDen: 5, dvrNum: 3, dvrDen: 8, desc: 'Fraction divided by fraction' }
];

export const DIVISION_PRESETS_SHARING = [
  { label: '5/8 ÷ 3', divNum: 5, divDen: 8, shares: 3, desc: 'Share 5/8 equally among 3 parts' },
  { label: '3/4 ÷ 5', divNum: 3, divDen: 4, shares: 5, desc: 'Share 3/4 equally among 5 parts' },
  { label: '3/4 ÷ 2', divNum: 3, divDen: 4, shares: 2, desc: 'Share 3/4 equally among 2 parts' }
];

/**
 * Render SVG for Mode 1: How many groups fit?
 */
export function renderFitSvg(state) {
  const { divWhole, divNum, divDen, dvrNum, dvrDen, showGroups } = state;
  const calc = calculateDivisionFit(divWhole, divNum, divDen, dvrNum, dvrDen);

  const totalWholes = Math.max(1, divWhole > 0 ? divWhole : 1);
  const svgWidth = 760;
  const margin = 20;
  const availableWidth = svgWidth - margin * 2;
  const wholeWidth = availableWidth / totalWholes;
  const barHeight = 44;

  const shapes = [];

  // Group color palette
  const groupColors = ['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#4f46e5', '#ca8a04'];

  // 1. Render Wholes Background and Grid
  for (let w = 0; w < totalWholes; w++) {
    const wx = margin + w * wholeWidth;
    shapes.push(`<rect x="${wx}" y="20" width="${wholeWidth}" height="${barHeight}" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2" rx="4"/>`);
    if (totalWholes > 1) {
      shapes.push(`<text x="${wx + wholeWidth / 2}" y="15" text-anchor="middle" font-size="12" font-weight="700" fill="#475569">Whole ${w + 1}</text>`);
    }
  }

  // 2. Render Dividend Shading (Blue)
  const dividendFraction = (calc.dividend.num / calc.dividend.den);
  const dividendPixelWidth = dividendFraction * wholeWidth;
  shapes.push(`<rect x="${margin}" y="20" width="${dividendPixelWidth}" height="${barHeight}" fill="#93c5fd" stroke="#2563eb" stroke-width="2" rx="3"/>`);

  // Subdivide dividend into common denominator slices for crisp alignment
  const sliceCount = calc.dividend.num * calc.divisor.den; // pieces of 1/commonDen
  const sliceWidth = (wholeWidth / calc.commonDen);

  for (let s = 1; s < sliceCount; s++) {
    const sx = margin + s * sliceWidth;
    shapes.push(`<line x1="${sx}" y1="20" x2="${sx}" y2="${20 + barHeight}" stroke="#60a5fa" stroke-width="1" stroke-dasharray="2 2"/>`);
  }

  // Dividend label
  const divLabel = divWhole > 0 && divNum === 0
    ? `${divWhole}`
    : (divWhole > 0 ? `${divWhole} ${divNum}/${divDen}` : `${divNum}/${divDen}`);
  shapes.push(`<text x="${margin + dividendPixelWidth / 2}" y="47" text-anchor="middle" font-size="16" font-weight="800" fill="#1e3a8a">Dividend: ${divLabel}</text>`);

  // 3. Render Divisor Groups underneath
  const dvrPixelWidth = (calc.divisor.num / calc.divisor.den) * wholeWidth;
  const groupsY = 85;

  if (showGroups) {
    // Render complete groups
    for (let g = 0; g < calc.fullGroups; g++) {
      const gx = margin + g * dvrPixelWidth;
      const gColor = groupColors[g % groupColors.length];
      shapes.push(`
        <g class="sim-group-block">
          <rect x="${gx}" y="${groupsY}" width="${dvrPixelWidth}" height="36" fill="${gColor}" opacity="0.85" rx="4" stroke="#ffffff" stroke-width="1.5"/>
          <text x="${gx + dvrPixelWidth / 2}" y="${groupsY + 23}" text-anchor="middle" font-size="14" font-weight="800" fill="#ffffff">Group ${g + 1} (${dvrNum}/${dvrDen})</text>
        </g>
      `);
    }

    // Render partial group if remainder exists
    if (calc.remParts > 0) {
      const px = margin + calc.fullGroups * dvrPixelWidth;
      const remWidth = (calc.remParts / calc.dvrPartsInCommon) * dvrPixelWidth;
      const partialFractionStr = `${calc.partialFraction.num}/${calc.partialFraction.den}`;
      shapes.push(`
        <g class="sim-partial-group-block">
          <rect x="${px}" y="${groupsY}" width="${remWidth}" height="36" fill="#f59e0b" opacity="0.9" rx="4" stroke="#d97706" stroke-width="1.5"/>
          <text x="${px + remWidth / 2}" y="${groupsY + 23}" text-anchor="middle" font-size="13" font-weight="800" fill="#78350f">${partialFractionStr} group</text>
        </g>
      `);
    }

    // Bracket connecting total count
    shapes.push(`
      <path d="M ${margin} ${groupsY + 44} L ${margin} ${groupsY + 52} L ${margin + dividendPixelWidth} ${groupsY + 52} L ${margin + dividendPixelWidth} ${groupsY + 44}" fill="none" stroke="#0f172a" stroke-width="2"/>
      <text x="${margin + dividendPixelWidth / 2}" y="${groupsY + 68}" text-anchor="middle" font-size="14" font-weight="700" fill="#0f172a">
        Total divisor groups that fit = ${calc.mixed.isExact ? calc.mixed.whole : `${calc.mixed.whole > 0 ? `${calc.mixed.whole} ` : ''}${calc.mixed.simplifiedNum}/${calc.mixed.simplifiedDen}`}
      </text>
    `);
  } else {
    // Prompt to click 'Show Groups'
    shapes.push(`
      <rect x="${margin}" y="${groupsY}" width="${availableWidth}" height="42" fill="#f8fafc" stroke="#cbd5e1" stroke-dasharray="4 4" rx="4"/>
      <text x="${svgWidth / 2}" y="${groupsY + 26}" text-anchor="middle" font-size="14" font-weight="600" fill="#64748b">Click 'Show Groups' to count how many ${dvrNum}/${dvrDen} groups fit inside ${divLabel}</text>
    `);
  }

  const svgHeight = showGroups ? 165 : 145;
  return `<svg class="sim-division-svg" role="img" aria-label="Fraction division model" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMidYMid meet">${shapes.join('')}</svg>`;
}

/**
 * Render SVG for Mode 2: Equal sharing
 */
export function renderSharingSvg(state) {
  const { divNum, divDen, shares, showSubdivisions, showOneShare } = state;
  const calc = calculateDivisionSharing(divNum, divDen, shares);

  const svgWidth = 760;
  const margin = 20;
  const barWidth = svgWidth - margin * 2;
  const barHeight = 60;
  const shapes = [];

  // Whole bar outline
  shapes.push(`<rect x="${margin}" y="20" width="${barWidth}" height="${barHeight}" fill="#f8fafc" stroke="#64748b" stroke-width="2" rx="4"/>`);

  const partWidth = barWidth / divDen;

  // 1. Initial Eighths / Denominator parts
  for (let p = 0; p < divDen; p++) {
    const px = margin + p * partWidth;
    const isDividend = p < divNum;
    const fill = isDividend ? '#93c5fd' : '#f1f5f9';
    shapes.push(`<rect x="${px}" y="20" width="${partWidth}" height="${barHeight}" fill="${fill}" stroke="#3b82f6" stroke-width="1.5"/>`);
    shapes.push(`<text x="${px + partWidth / 2}" y="15" text-anchor="middle" font-size="11" font-weight="600" fill="#475569">1/${divDen}</text>`);
  }

  // 2. Subdivisions when active
  if (showSubdivisions) {
    const sliceWidth = partWidth / shares;
    for (let p = 0; p < divDen; p++) {
      for (let s = 1; s < shares; s++) {
        const sx = margin + p * partWidth + s * sliceWidth;
        shapes.push(`<line x1="${sx}" y1="20" x2="${sx}" y2="${20 + barHeight}" stroke="#1e40af" stroke-width="1.2" stroke-dasharray="3 3"/>`);
      }
    }

    // Highlight 1 share in green/gold across the shaded parts
    if (showOneShare) {
      for (let p = 0; p < divNum; p++) {
        const sx = margin + p * partWidth;
        shapes.push(`<rect x="${sx}" y="20" width="${sliceWidth}" height="${barHeight}" fill="#22c55e" opacity="0.85" stroke="#15803d" stroke-width="1.5"/>`);
      }

      shapes.push(`
        <text x="${svgWidth / 2}" y="${20 + barHeight + 28}" text-anchor="middle" font-size="14" font-weight="700" fill="#15803d">
          One share receives 1 slice from each of the ${divNum} shaded parts = ${calc.shareNum} slices out of ${calc.totalSubdivisions} in the whole = ${calc.shareNum}/${calc.totalSubdivisions}
        </text>
      `);
    } else {
      shapes.push(`
        <text x="${svgWidth / 2}" y="${20 + barHeight + 28}" text-anchor="middle" font-size="14" font-weight="600" fill="#1e3a8a">
          Each 1/${divDen} is cut into ${shares} equal slices $\\implies$ ${divDen} × ${shares} = ${calc.totalSubdivisions} slices in one whole!
        </text>
      `);
    }
  } else {
    shapes.push(`
      <text x="${svgWidth / 2}" y="${20 + barHeight + 28}" text-anchor="middle" font-size="14" font-weight="600" fill="#475569">
        Shaded dividend: ${divNum}/${divDen}. How do we share this equally into ${shares} parts?
      </text>
    `);
  }

  const svgHeight = 125;
  return `<svg class="sim-sharing-svg" role="img" aria-label="Equal sharing fraction model" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMidYMid meet">${shapes.join('')}</svg>`;
}

/**
 * Format KaTeX equation string for Mode 1
 */
export function getFitEquationLatex(state) {
  const calc = calculateDivisionFit(state.divWhole, state.divNum, state.divDen, state.dvrNum, state.dvrDen);
  const divStr = state.divWhole > 0 && state.divNum === 0
    ? `${state.divWhole}`
    : (state.divWhole > 0 ? `${state.divWhole}\\frac{${state.divNum}}{${state.divDen}}` : `\\frac{${state.divNum}}{${state.divDen}}`);

  const dvrStr = `\\frac{${state.dvrNum}}{${state.dvrDen}}`;
  const recipStr = `\\frac{${state.dvrDen}}{${state.dvrNum}}`;

  let improperDivStr = divStr;
  if (state.divWhole > 0 && state.divNum === 0) {
    improperDivStr = `\\frac{${state.divWhole}}{1}`;
  } else if (state.divWhole > 0) {
    improperDivStr = `\\frac{${calc.dividend.num}}{${calc.dividend.den}}`;
  }

  const ansFrac = `\\frac{${calc.productNum}}{${calc.productDen}}`;
  const simpFrac = calc.simplified.den === 1
    ? `${calc.simplified.num}`
    : (calc.mixed.isExact
      ? `\\frac{${calc.simplified.num}}{${calc.simplified.den}}`
      : `${calc.mixed.whole > 0 ? `${calc.mixed.whole}` : ''}\\frac{${calc.mixed.simplifiedNum}}{${calc.mixed.simplifiedDen}}`);

  return `${divStr} \\div ${dvrStr} = ${improperDivStr} \\times ${recipStr} = ${ansFrac} = \\mathbf{${simpFrac}}`;
}

/**
 * Format KaTeX equation string for Mode 2
 */
export function getSharingEquationLatex(state) {
  const calc = calculateDivisionSharing(state.divNum, state.divDen, state.shares);
  const divStr = `\\frac{${state.divNum}}{${state.divDen}}`;
  const ansFrac = `\\frac{${calc.shareNum}}{${calc.totalSubdivisions}}`;
  const simpFrac = calc.simplified.num === calc.shareNum && calc.simplified.den === calc.totalSubdivisions
    ? ansFrac
    : `\\frac{${calc.simplified.num}}{${calc.simplified.den}}`;

  return `${divStr} \\div ${state.shares} = ${divStr} \\times \\frac{1}{${state.shares}} = ${ansFrac} = \\mathbf{${simpFrac}}`;
}

/**
 * Render initial markup for Simulation A: Fraction Division Explorer
 */
export function renderFractionDivisionSimulation(block, revealClass = '') {
  const mode = block.mode || 'fit';
  const title = block.title || (mode === 'fit' ? 'Fraction Division Explorer · How Many Groups Fit?' : 'Equal Sharing Explorer · Sharing Fractions');
  const subtitle = block.subtitle || '';

  // Initial state defaults
  const state = mode === 'fit'
    ? {
        mode: 'fit',
        divWhole: block.dividendWhole !== undefined ? block.dividendWhole : (block.divWhole || 0),
        divNum: block.dividendNum !== undefined ? block.dividendNum : (block.divNum !== undefined ? block.divNum : 1),
        divDen: block.dividendDen !== undefined ? block.dividendDen : (block.divDen !== undefined ? block.divDen : 2),
        dvrNum: block.divisorNum !== undefined ? block.divisorNum : (block.dvrNum !== undefined ? block.dvrNum : 1),
        dvrDen: block.divisorDen !== undefined ? block.divisorDen : (block.dvrDen !== undefined ? block.dvrDen : 4),
        showGroups: false,
        showCalculation: false
      }
    : {
        mode: 'sharing',
        divNum: block.dividendNum !== undefined ? block.dividendNum : (block.divNum !== undefined ? block.divNum : 5),
        divDen: block.dividendDen !== undefined ? block.dividendDen : (block.divDen !== undefined ? block.divDen : 8),
        shares: block.shares !== undefined ? block.shares : 3,
        showSubdivisions: false,
        showOneShare: false,
        showCalculation: false
      };

  const presets = mode === 'fit' ? DIVISION_PRESETS_FIT : DIVISION_PRESETS_SHARING;

  const presetsHtml = `
    <div class="sim-presets-bar">
      <span class="sim-presets-label">Examples:</span>
      ${presets.map((p, idx) => `
        <button type="button" class="btn btn-sm sim-preset-btn ${idx === 0 ? 'active' : ''}" data-preset-index="${idx}">
          ${escapeHtml(p.label)}
        </button>
      `).join('')}
    </div>
  `;

  const visualHtml = mode === 'fit' ? renderFitSvg(state) : renderSharingSvg(state);

  const actionsHtml = mode === 'fit'
    ? `
      <div class="sim-actions-bar">
        <button type="button" class="btn btn-sm sim-toggle-groups-btn">👁️ Show Groups</button>
        <button type="button" class="btn btn-sm sim-toggle-calc-btn">🔢 Show Working & Answer</button>
        <button type="button" class="btn btn-sm btn-ghost sim-reset-btn">↺ Reset</button>
      </div>
    `
    : `
      <div class="sim-actions-bar">
        <button type="button" class="btn btn-sm sim-toggle-subdiv-btn">🔪 Cut Equal Slices</button>
        <button type="button" class="btn btn-sm sim-toggle-oneshare-btn">✨ Show 1 Share</button>
        <button type="button" class="btn btn-sm sim-toggle-calc-btn">🔢 Show Working & Answer</button>
        <button type="button" class="btn btn-sm btn-ghost sim-reset-btn">↺ Reset</button>
      </div>
    `;

  const equationLatex = mode === 'fit' ? getFitEquationLatex(state) : getSharingEquationLatex(state);
  const equationHtml = `
    <div class="sim-equation-container" style="display: none;">
      <div class="sim-equation-content">${renderMath(equationLatex, { display: true })}</div>
    </div>
  `;

  return `
    <div class="card sim-widget fraction-division-widget ${revealClass}" data-sim-type="fraction-division">
      <script type="application/json" class="sim-config">${JSON.stringify(block)}</script>
      <div class="sim-header">
        <h4 class="sim-title">${escapeHtml(title)}</h4>
        ${subtitle ? `<p class="sim-subtitle">${renderMathInText(subtitle)}</p>` : ''}
      </div>
      ${presetsHtml}
      <div class="sim-visual-stage">${visualHtml}</div>
      ${actionsHtml}
      ${equationHtml}
    </div>
  `;
}

// ============================================================================
// SIMULATION B: RECIPROCAL DEMONSTRATOR
// ============================================================================

export const RECIPROCAL_PRESETS = [
  { label: '2/3', whole: 0, num: 2, den: 3, desc: 'Proper fraction' },
  { label: '5', whole: 5, num: 0, den: 1, desc: 'Whole number' },
  { label: '1 3/7', whole: 1, num: 3, den: 7, desc: 'Mixed numeral' },
  { label: '3/4', whole: 0, num: 3, den: 4, desc: 'Proper fraction' },
  { label: '8', whole: 8, num: 0, den: 1, desc: 'Whole number' }
];

/**
 * Render initial markup for Simulation B: Reciprocal Demonstrator
 */
export function renderReciprocalSimulation(block, revealClass = '') {
  const title = block.title || 'Reciprocal Demonstrator · Flip & Verify';
  const subtitle = block.subtitle || 'Select a number, reveal its reciprocal, and verify their product is 1.';

  const presetsHtml = `
    <div class="sim-presets-bar">
      <span class="sim-presets-label">Select Number:</span>
      ${RECIPROCAL_PRESETS.map((p, idx) => `
        <button type="button" class="btn btn-sm sim-recip-preset-btn ${idx === 0 ? 'active' : ''}" data-recip-index="${idx}">
          ${escapeHtml(p.label)}
        </button>
      `).join('')}
    </div>
  `;

  return `
    <div class="card sim-widget reciprocal-widget ${revealClass}" data-sim-type="reciprocal-explorer">
      <script type="application/json" class="sim-config">${JSON.stringify(block)}</script>
      <div class="sim-header">
        <h4 class="sim-title">${escapeHtml(title)}</h4>
        ${subtitle ? `<p class="sim-subtitle">${renderMathInText(subtitle)}</p>` : ''}
      </div>
      ${presetsHtml}
      <div class="recip-cards-stage">
        <div class="recip-card recip-card-original">
          <span class="recip-card-badge">Original Number</span>
          <div class="recip-card-math">${renderMath('\\frac{2}{3}', { display: true })}</div>
        </div>

        <div class="recip-flip-arrow">
          <button type="button" class="btn btn-sm recip-reveal-btn">🔄 Reveal Reciprocal</button>
        </div>

        <div class="recip-card recip-card-flipped" style="opacity: 0.4;">
          <span class="recip-card-badge">Reciprocal</span>
          <div class="recip-card-math"><span class="recip-placeholder">?</span></div>
        </div>
      </div>

      <div class="recip-verify-stage" style="display: none;">
        <div class="recip-verify-equation"></div>
        <div class="recip-verify-badge">✔ Product is always 1!</div>
      </div>
    </div>
  `;
}

// ============================================================================
// CLIENT-SIDE SIMULATION CONTROLLERS
// ============================================================================

export class FractionDivisionSimulation {
  constructor(root, config) {
    this.root = root;
    this.config = config || {};
    this.mode = config.mode || 'fit';

    if (this.mode === 'fit') {
      this.state = {
        mode: 'fit',
        divWhole: config.dividendWhole !== undefined ? config.dividendWhole : (config.divWhole || 0),
        divNum: config.dividendNum !== undefined ? config.dividendNum : (config.divNum !== undefined ? config.divNum : 1),
        divDen: config.dividendDen !== undefined ? config.dividendDen : (config.divDen !== undefined ? config.divDen : 2),
        dvrNum: config.divisorNum !== undefined ? config.divisorNum : (config.dvrNum !== undefined ? config.dvrNum : 1),
        dvrDen: config.divisorDen !== undefined ? config.divisorDen : (config.dvrDen !== undefined ? config.dvrDen : 4),
        showGroups: false,
        showCalculation: false
      };
      this.presets = DIVISION_PRESETS_FIT;
    } else {
      this.state = {
        mode: 'sharing',
        divNum: config.dividendNum !== undefined ? config.dividendNum : (config.divNum !== undefined ? config.divNum : 5),
        divDen: config.dividendDen !== undefined ? config.dividendDen : (config.divDen !== undefined ? config.divDen : 8),
        shares: config.shares !== undefined ? config.shares : 3,
        showSubdivisions: false,
        showOneShare: false,
        showCalculation: false
      };
      this.presets = DIVISION_PRESETS_SHARING;
    }

    this.onClick = (e) => this.handleClick(e);
    this.root.addEventListener('click', this.onClick);
  }

  handleClick(e) {
    const btn = e.target.closest('button');
    if (!btn || !this.root.contains(btn)) return;
    e.stopPropagation();

    // Preset button
    if (btn.classList.contains('sim-preset-btn')) {
      const idx = parseInt(btn.dataset.presetIndex, 10);
      const preset = this.presets[idx];
      if (preset) {
        if (this.mode === 'fit') {
          this.state.divWhole = preset.divWhole;
          this.state.divNum = preset.divNum;
          this.state.divDen = preset.divDen;
          this.state.dvrNum = preset.dvrNum;
          this.state.dvrDen = preset.dvrDen;
          this.state.showGroups = false;
          this.state.showCalculation = false;
        } else {
          this.state.divNum = preset.divNum;
          this.state.divDen = preset.divDen;
          this.state.shares = preset.shares;
          this.state.showSubdivisions = false;
          this.state.showOneShare = false;
          this.state.showCalculation = false;
        }

        this.root.querySelectorAll('.sim-preset-btn').forEach((b, i) => {
          b.classList.toggle('active', i === idx);
        });
        this.update();
      }
      return;
    }

    // Toggle Groups (Mode 1)
    if (btn.classList.contains('sim-toggle-groups-btn')) {
      this.state.showGroups = !this.state.showGroups;
      btn.textContent = this.state.showGroups ? '🙈 Hide Groups' : '👁️ Show Groups';
      this.update();
      return;
    }

    // Toggle Subdivisions (Mode 2)
    if (btn.classList.contains('sim-toggle-subdiv-btn')) {
      this.state.showSubdivisions = !this.state.showSubdivisions;
      btn.textContent = this.state.showSubdivisions ? '🙈 Hide Slices' : '🔪 Cut Equal Slices';
      this.update();
      return;
    }

    // Toggle One Share (Mode 2)
    if (btn.classList.contains('sim-toggle-oneshare-btn')) {
      this.state.showOneShare = !this.state.showOneShare;
      if (this.state.showOneShare) this.state.showSubdivisions = true;
      btn.textContent = this.state.showOneShare ? '🙈 Hide Share' : '✨ Show 1 Share';
      this.update();
      return;
    }

    // Toggle Calculation
    if (btn.classList.contains('sim-toggle-calc-btn')) {
      this.state.showCalculation = !this.state.showCalculation;
      btn.textContent = this.state.showCalculation ? '🙈 Hide Working' : '🔢 Show Working & Answer';
      this.update();
      return;
    }

    // Reset button
    if (btn.classList.contains('sim-reset-btn')) {
      this.state.showGroups = false;
      this.state.showSubdivisions = false;
      this.state.showOneShare = false;
      this.state.showCalculation = false;
      const groupsBtn = this.root.querySelector('.sim-toggle-groups-btn');
      if (groupsBtn) groupsBtn.textContent = '👁️ Show Groups';
      const subdivBtn = this.root.querySelector('.sim-toggle-subdiv-btn');
      if (subdivBtn) subdivBtn.textContent = '🔪 Cut Equal Slices';
      const shareBtn = this.root.querySelector('.sim-toggle-oneshare-btn');
      if (shareBtn) shareBtn.textContent = '✨ Show 1 Share';
      const calcBtn = this.root.querySelector('.sim-toggle-calc-btn');
      if (calcBtn) calcBtn.textContent = '🔢 Show Working & Answer';
      this.update();
    }
  }

  update() {
    const visualStage = this.root.querySelector('.sim-visual-stage');
    if (visualStage) {
      visualStage.innerHTML = this.mode === 'fit'
        ? renderFitSvg(this.state)
        : renderSharingSvg(this.state);
    }

    const eqContainer = this.root.querySelector('.sim-equation-container');
    const eqContent = this.root.querySelector('.sim-equation-content');
    if (eqContainer && eqContent) {
      if (this.state.showCalculation) {
        eqContainer.style.display = 'block';
        const latex = this.mode === 'fit'
          ? getFitEquationLatex(this.state)
          : getSharingEquationLatex(this.state);
        eqContent.innerHTML = renderMath(latex, { display: true });
      } else {
        eqContainer.style.display = 'none';
      }
    }
  }

  destroy() {
    this.root.removeEventListener('click', this.onClick);
  }
}

export class ReciprocalSimulation {
  constructor(root, config) {
    this.root = root;
    this.config = config || {};
    this.presets = RECIPROCAL_PRESETS;
    this.currentPresetIndex = 0;
    this.isReciprocalRevealed = false;
    this.isVerified = false;

    this.onClick = (e) => this.handleClick(e);
    this.root.addEventListener('click', this.onClick);
    this.update();
  }

  handleClick(e) {
    const btn = e.target.closest('button');
    if (!btn || !this.root.contains(btn)) return;
    e.stopPropagation();

    // Preset select
    if (btn.classList.contains('sim-recip-preset-btn')) {
      const idx = parseInt(btn.dataset.recipIndex, 10);
      if (this.presets[idx]) {
        this.currentPresetIndex = idx;
        this.isReciprocalRevealed = false;
        this.isVerified = false;
        this.root.querySelectorAll('.sim-recip-preset-btn').forEach((b, i) => {
          b.classList.toggle('active', i === idx);
        });
        this.update();
      }
      return;
    }

    // Reveal Reciprocal
    if (btn.classList.contains('recip-reveal-btn')) {
      this.isReciprocalRevealed = true;
      this.update();
      return;
    }

    // Verify button
    if (btn.classList.contains('recip-verify-btn')) {
      this.isVerified = true;
      this.update();
    }
  }

  update() {
    const p = this.presets[this.currentPresetIndex];
    const calc = calculateReciprocal(p.whole, p.num, p.den);

    // 1. Original Card
    const origCard = this.root.querySelector('.recip-card-original .recip-card-math');
    if (origCard) {
      let origLatex = '';
      if (p.whole > 0 && p.num === 0) {
        origLatex = `${p.whole} = \\frac{${p.whole}}{1}`;
      } else if (p.whole > 0) {
        origLatex = `${p.whole}\\frac{${p.num}}{${p.den}} = \\frac{${calc.improperNum}}{${calc.improperDen}}`;
      } else {
        origLatex = `\\frac{${p.num}}{${p.den}}`;
      }
      origCard.innerHTML = renderMath(origLatex, { display: true });
    }

    // 2. Flipped Card
    const flippedCard = this.root.querySelector('.recip-card-flipped');
    const flippedMath = this.root.querySelector('.recip-card-flipped .recip-card-math');
    if (flippedCard && flippedMath) {
      if (this.isReciprocalRevealed) {
        flippedCard.style.opacity = '1';
        const recipLatex = `\\mathbf{\\frac{${calc.recipNum}}{${calc.recipDen}}}`;
        flippedMath.innerHTML = renderMath(recipLatex, { display: true });
      } else {
        flippedCard.style.opacity = '0.4';
        flippedMath.innerHTML = '<span class="recip-placeholder">?</span>';
      }
    }

    // 3. Middle Arrow Button
    const arrowContainer = this.root.querySelector('.recip-flip-arrow');
    if (arrowContainer) {
      if (!this.isReciprocalRevealed) {
        arrowContainer.innerHTML = '<button type="button" class="btn btn-sm recip-reveal-btn">🔄 Reveal Reciprocal</button>';
      } else if (!this.isVerified) {
        arrowContainer.innerHTML = '<button type="button" class="btn btn-sm btn-green recip-verify-btn">✔ Verify Product = 1</button>';
      } else {
        arrowContainer.innerHTML = '<span class="recip-done-pill">Matched Pair ✔</span>';
      }
    }

    // 4. Verify Stage
    const verifyStage = this.root.querySelector('.recip-verify-stage');
    const verifyEq = this.root.querySelector('.recip-verify-equation');
    if (verifyStage && verifyEq) {
      if (this.isVerified) {
        verifyStage.style.display = 'flex';
        const impN = calc.improperNum;
        const impD = calc.improperDen;
        const prod = impN * impD;
        const verifyLatex = `\\frac{${impN}}{${impD}} \\times \\frac{${impD}}{${impN}} = \\frac{${impN} \\times ${impD}}{${impD} \\times ${impN}} = \\frac{${prod}}{${prod}} = \\mathbf{1}`;
        verifyEq.innerHTML = renderMath(verifyLatex, { display: true });
      } else {
        verifyStage.style.display = 'none';
      }
    }
  }

  destroy() {
    this.root.removeEventListener('click', this.onClick);
  }
}
