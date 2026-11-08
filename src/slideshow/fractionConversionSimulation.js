/**
 * Reusable Fraction Conversion Explorer for 3C.
 * Modes: build a mixed numeral, regroup an improper fraction, locate on a number line.
 * All geometry is proportional: a unit bar is the same size regardless of mode.
 * This module intentionally has no dependency on the lesson renderer or slide engine.
 */
import { renderMath, renderMathInText } from './math.js';

import {
  FRACTION_DENOMINATORS, mixedToImproper,
  improperToMixed, normalizeFractionState
} from './fractionConversionMath.js';

const MAX_WHOLES = 5;
function wholeBound(denominator) { return MAX_WHOLES * denominator + denominator - 1; }

function svgRect(x, y, width, height, fill, stroke = 'var(--border-medium)') {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="1.5" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`;
}

/** SVG fraction bars, each whole represented by the same 126px-wide rectangle. */
export function renderFractionBars(totalParts, denominator, groupedWholes = 0) {
  const groupTotal = Math.max(1, Math.ceil(totalParts / denominator));
  const cellCount = groupTotal;
  const barWidth = 126;
  const barHeight = 56;
  const gap = 16;
  const svgWidth = 760;
  const groupWidth = barWidth + gap;
  const rowCount = Math.ceil(cellCount / 5);
  const height = rowCount * 91 + 8;
  const shapes = [];
  for (let i = 0; i < cellCount; i++) {
    const col = i % 5;
    const row = Math.floor(i / 5);
    const x = 21 + col * groupWidth;
    const y = 10 + row * 91;
    const active = Math.min(denominator, Math.max(0, totalParts - i * denominator));
    shapes.push(`<g aria-label="${active} of ${denominator} parts in group ${i + 1}">`);
    for (let k = 0; k < denominator; k++) {
      const piece = barWidth / denominator;
      const fill = k >= active ? 'var(--bg-muted)' : i < groupedWholes ? 'var(--primary)' : '#93b6e6';
      shapes.push(svgRect(x + k * piece, y, piece, barHeight, fill));
    }
    const label = i < groupedWholes ? '1 whole' : `${active}/${denominator}`;
    shapes.push(`<text x="${x + barWidth / 2}" y="${y + 76}" text-anchor="middle" font-size="15" font-weight="600" fill="var(--text-secondary)">${label}</text></g>`);
  }
  return `<svg class="fraction-conversion-svg" role="img" aria-label="${totalParts} parts of size one ${denominator}th, shown across ${cellCount} equally sized whole bars" viewBox="0 0 ${svgWidth} ${height}" preserveAspectRatio="xMidYMid meet">${shapes.join('')}</svg>`;
}

/** 0–6 scale; the marker location always represents the same numerical value. */
export function renderFractionLine(numerator, denominator, showMixed = false) {
  const width = 760;
  const left = 42;
  const right = 730;
  const length = right - left;
  const y = 88;
  const xFor = (value) => left + (value / 6) * length;
  const ticks = [];
  for (let i = 0; i <= 6 * denominator; i++) {
    const x = xFor(i / denominator);
    const integer = i % denominator === 0;
    ticks.push(`<line x1="${x}" y1="${y - (integer ? 13 : 7)}" x2="${x}" y2="${y + (integer ? 13 : 7)}" stroke="var(--text-secondary)" stroke-width="${integer ? 1.7 : 1}"/>`);
    if (integer) ticks.push(`<text x="${x}" y="${y + 32}" text-anchor="middle" font-size="19" fill="var(--text-primary)">${i / denominator}</text>`);
  }
  const pointX = xFor(numerator / denominator);
  const mixed = improperToMixed(numerator, denominator);
  const label = showMixed ? (mixed.remainder === 0 ? `${mixed.whole}` : `${mixed.whole} ${mixed.remainder}/${denominator}`) : `${numerator}/${denominator}`;
  return `<svg class="fraction-conversion-svg fraction-conversion-line" role="img" aria-label="A number line from zero to six with ${numerator}/${denominator} at position ${numerator / denominator}" viewBox="0 0 ${width} 150" preserveAspectRatio="xMidYMid meet">
    <line x1="${left}" y1="${y}" x2="${right}" y2="${y}" stroke="var(--text-primary)" stroke-width="2.2"/>
    ${ticks.join('')}
    <line x1="${pointX}" y1="${y - 40}" x2="${pointX}" y2="${y - 2}" stroke="var(--primary)" stroke-width="2" stroke-dasharray="4 4"/>
    <circle cx="${pointX}" cy="${y}" r="7.5" fill="var(--primary)" stroke="var(--bg-surface)" stroke-width="2"/>
    <text class="fraction-line-point-label" x="${pointX}" y="${y - 48}" text-anchor="middle" font-size="21" font-weight="700" fill="var(--primary)">${label}</text>
  </svg>`;
}

function math(latex) {
  return renderMath(latex, { display: true });
}

function conversionLatex(mode, state) {
  const d = state.denominator;
  if (mode === 'build') {
    const total = mixedToImproper(state.whole, state.part, d);
    if (state.part === 0) return `${state.whole}=\\frac{${total}}{${d}}`;
    if (state.whole === 0) return `\\frac{${state.part}}{${d}}=\\frac{${total}}{${d}}`;
    return `${state.whole}\\frac{${state.part}}{${d}}=\\frac{${state.whole}\\times ${d}+${state.part}}{${d}}=\\frac{${total}}{${d}}`;
  }
  const mixed = improperToMixed(state.numerator, d);
  if (mixed.remainder === 0) return `\\frac{${state.numerator}}{${d}}=${mixed.whole}`;
  const exact = `${mixed.whole}\\frac{${mixed.remainder}}{${d}}`;
  if (mixed.simplifiedNumerator === mixed.remainder && mixed.simplifiedDenominator === d) {
    return `\\frac{${state.numerator}}{${d}}=${exact}`;
  }
  return `\\frac{${state.numerator}}{${d}}=${exact}=${mixed.whole}\\frac{${mixed.simplifiedNumerator}}{${mixed.simplifiedDenominator}}`;
}

export function renderFractionConversionSimulation(block, revealClass = '') {
  const state = normalizeFractionState(block);
  // Avoid <script> sequence termination from teacher-authored text.
  const config = JSON.stringify(block).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
  return `<div class="sim-widget fraction-conversion-widget ${revealClass}" data-sim-type="fraction-conversion">
    <script type="application/json" class="sim-config">${config}</script>
    <div class="sim-header"><h4 class="sim-title">${renderMathInText(block.title || 'Fraction Conversion Explorer')}</h4>
    <p class="sim-subtitle">${renderMathInText(block.subtitle || 'Count the equal parts, then name the same amount in two ways.')}</p></div>
    <div class="fraction-conversion-controls">
      <label>Parts per whole <select class="fraction-denominator" aria-label="Parts per whole">${FRACTION_DENOMINATORS.map(d => `<option value="${d}" ${d === state.denominator ? 'selected' : ''}>${d}</option>`).join('')}</select></label>
      ${state.mode === 'build' ? `<label>Whole numbers <input class="fraction-whole" aria-label="Whole numbers" type="number" min="0" max="5" step="1" value="${state.whole}"></label>
      <label>Extra parts <input class="fraction-part" aria-label="Extra fractional parts" type="number" min="0" max="${state.denominator - 1}" step="1" value="${state.part}"></label>` :
      `<label>Numerator <input class="fraction-numerator" aria-label="Numerator" type="number" min="${state.mode === 'regroup' ? state.denominator : 0}" max="${wholeBound(state.denominator)}" step="1" value="${state.numerator}"></label>`}
    </div>
    <div class="fraction-conversion-visual"></div>
    <div class="fraction-conversion-actions">
      ${state.mode === 'regroup' ? '<button type="button" class="btn btn-sm btn-primary fraction-group-next">Group one whole</button><button type="button" class="btn btn-sm fraction-group-all">Group all wholes</button>' : ''}
      <button type="button" class="btn btn-sm btn-primary fraction-answer-toggle" aria-expanded="false">Reveal conversion</button>
      <button type="button" class="btn btn-sm fraction-reset">Reset</button>
    </div>
    <div class="fraction-conversion-result" aria-live="polite" aria-atomic="true"></div>
  </div>`;
}

/** Scoped, resettable, self-contained widget. No permanent document listeners. */
export class FractionConversionSimulation {
  constructor(root, config) {
    this.root = root;
    this.initialState = normalizeFractionState(config);
    this.state = { ...this.initialState };
    this.onChange = (event) => this.handleChange(event);
    this.onClick = (event) => this.handleClick(event);
    this.root.addEventListener('change', this.onChange);
    this.root.addEventListener('click', this.onClick);
    this.update();
  }

  setState(next) {
    this.state = { ...this.state, ...next, answerVisible: false };
    this.update();
  }

  handleChange(event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
    const value = Number(target.value);
    if (!Number.isInteger(value)) {
      this.update();
      return;
    }
    const d = this.state.denominator;
    if (target.classList.contains('fraction-denominator')) {
      if (!FRACTION_DENOMINATORS.includes(value)) return;
      this.setState({ denominator: value, part: Math.min(this.state.part, value - 1),
        numerator: Math.min(Math.max(this.state.mode === 'regroup' ? value : 0, this.state.numerator), wholeBound(value)), groupCount: 0 });
    } else if (target.classList.contains('fraction-whole')) {
      if (value < 0 || value > MAX_WHOLES) return this.update();
      this.setState({ whole: value });
    } else if (target.classList.contains('fraction-part')) {
      if (value < 0 || value >= d) return this.update();
      this.setState({ part: value });
    } else if (target.classList.contains('fraction-numerator')) {
      if (value < (this.state.mode === 'regroup' ? d : 0) || value > wholeBound(d)) return this.update();
      this.setState({ numerator: value, groupCount: 0 });
    }
  }

  handleClick(event) {
    const button = event.target.closest('button');
    if (!button || !this.root.contains(button)) return;
    if (button.classList.contains('fraction-answer-toggle')) {
      this.state.answerVisible = !this.state.answerVisible;
      this.update();
    } else if (button.classList.contains('fraction-group-next')) {
      const full = Math.floor(this.state.numerator / this.state.denominator);
      this.state.groupCount = Math.min(full, this.state.groupCount + 1);
      this.update();
    } else if (button.classList.contains('fraction-group-all')) {
      this.state.groupCount = Math.floor(this.state.numerator / this.state.denominator);
      this.update();
    } else if (button.classList.contains('fraction-reset')) {
      this.state = { ...this.initialState };
      this.update();
    }
    // Do not let the presentation treat simulation clicks as slide navigation.
    event.stopPropagation();
  }

  update() {
    const state = this.state;
    const d = state.denominator;
    const mode = state.mode;
    const total = mode === 'build' ? mixedToImproper(state.whole, state.part, d) : state.numerator;
    const visual = this.root.querySelector('.fraction-conversion-visual');
    const result = this.root.querySelector('.fraction-conversion-result');
    const denominator = this.root.querySelector('.fraction-denominator');
    if (denominator) denominator.value = String(d);
    const whole = this.root.querySelector('.fraction-whole');
    if (whole) whole.value = String(state.whole);
    const part = this.root.querySelector('.fraction-part');
    if (part) { part.value = String(state.part); part.max = String(d - 1); }
    const numerator = this.root.querySelector('.fraction-numerator');
    if (numerator) {
      numerator.value = String(state.numerator);
      numerator.min = String(mode === 'regroup' ? d : 0);
      numerator.max = String(wholeBound(d));
    }

    if (visual) {
      visual.innerHTML = mode === 'number-line'
        ? renderFractionLine(total, d, state.answerVisible)
        : renderFractionBars(total, d, mode === 'regroup' ? state.groupCount : state.whole);
    }
    const grouped = Math.floor(total / d);
    const remaining = total % d;
    const groupNext = this.root.querySelector('.fraction-group-next');
    if (groupNext) groupNext.disabled = state.groupCount >= grouped;
    const groupAll = this.root.querySelector('.fraction-group-all');
    if (groupAll) groupAll.disabled = state.groupCount >= grouped;
    const toggle = this.root.querySelector('.fraction-answer-toggle');
    if (toggle) {
      toggle.textContent = state.answerVisible ? 'Hide conversion' : 'Reveal conversion';
      toggle.setAttribute('aria-expanded', String(state.answerVisible));
    }
    if (result) {
      if (state.answerVisible) {
        result.innerHTML = math(conversionLatex(mode, state));
        result.classList.add('fraction-result-visible');
      } else {
        result.classList.remove('fraction-result-visible');
        if (mode === 'regroup') {
          result.textContent = `${state.groupCount} complete ${state.groupCount === 1 ? 'whole' : 'wholes'} grouped; ${total - state.groupCount * d} ${total - state.groupCount * d === 1 ? 'part' : 'parts'} still ungrouped. Predict the mixed numeral.`;
        } else if (mode === 'number-line') {
          result.textContent = 'Predict the mixed numeral. The position will not move when you reveal it.';
        } else {
          result.textContent = `Count ${state.whole} ${state.whole === 1 ? 'whole' : 'wholes'} and ${state.part} additional ${state.part === 1 ? 'part' : 'parts'}. Predict the numerator.`;
        }
      }
    }
  }

  onSlideEnter() { /* No timers or global state; preserve teacher's choices on navigation. */ }

  destroy() {
    this.root.removeEventListener('change', this.onChange);
    this.root.removeEventListener('click', this.onClick);
  }
}
