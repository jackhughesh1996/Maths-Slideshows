/**
 * Simulation widget markup and dispatch; runtime initialisation stays in simulations.js.
 */
import { renderMathInText, escapeHtml } from './math.js';
import { normalizeSimulationType } from './blockTypes.js';
import {
  renderCoinClassSimulation,
  renderCoinDiscussionSummary,
  renderCumulativeCoinSimulation,
  renderBasketballSimulation
} from './experimentalSimulations.js';

/**
 * Render an interactive simulation block container.
 * @param {Object} block
 * @param {string} [revealClass='']
 * @returns {string}
 */
export function renderSimulationBlock(block, revealClass = '') {
  const rawType = block.simType || 'spinner';
  const simType = normalizeSimulationType(rawType);

  switch (simType) {
    case 'spinner':
      return renderSpinnerSimulationBlock(block, revealClass);
    case 'counter-bag':
      return renderCounterBagSimulationBlock(block, revealClass);
    case 'pen-draw':
      return renderPenDrawSimulationBlock(block, revealClass);
    case 'coin-class':
      return renderCoinClassSimulation(block, revealClass);
    case 'coin-summary':
      return renderCoinDiscussionSummary(block, revealClass);
    case 'coin-cumulative':
      return renderCumulativeCoinSimulation(block, revealClass);
    case 'basketball':
      return renderBasketballSimulation(block, revealClass);
    default:
      return '';
  }
}

/**
 * Render a dual or single spinner simulation widget.
 */
function renderSpinnerSimulationBlock(block, revealClass = '') {
  const spinners = block.spinners || [];
  const title = block.title || 'Interactive Spinner Simulation';
  const subtitle = block.subtitle || '';

  const tabsHtml = spinners.length > 1 ? `
    <div class="sim-tabs">
      ${spinners.map((sp, idx) => `
        <button type="button" class="btn btn-sm sim-tab-btn ${idx === 0 ? 'active' : ''}" data-spinner-index="${idx}">
          ${escapeHtml(sp.name || `Spinner ${idx + 1}`)}
          ${sp.badge ? `<span class="sim-tab-badge">${escapeHtml(sp.badge)}</span>` : ''}
        </button>
      `).join('')}
    </div>
  ` : '';

  const viewsHtml = spinners.map((sp, idx) => {
    const size = 180;
    const cx = size / 2;
    const cy = size / 2;
    const r = Math.round(size * 0.42); // 75px

    let currentAngle = -90; // Start at top 12 o'clock
    const paths = [];

    (sp.sectors || []).forEach((sec) => {
      const angle = sec.angle || 90;
      const color = sec.color || '#2563eb';

      if (angle >= 360) {
        paths.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" stroke="#ffffff" stroke-width="2"/>`);
        return;
      }

      const startRad = (currentAngle * Math.PI) / 180;
      const endRad = ((currentAngle + angle) * Math.PI) / 180;
      const x1 = cx + r * Math.cos(startRad);
      const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad);
      const y2 = cy + r * Math.sin(endRad);
      const largeArc = angle > 180 ? 1 : 0;

      const d = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;

      const midRad = ((currentAngle + angle / 2) * Math.PI) / 180;
      const lx = cx + (r * 0.6) * Math.cos(midRad);
      const ly = cy + (r * 0.6) * Math.sin(midRad);

      paths.push(`
        <path d="${d}" fill="${color}" stroke="#ffffff" stroke-width="2" />
        <text x="${lx.toFixed(2)}" y="${ly.toFixed(2)}" text-anchor="middle" dominant-baseline="central"
              fill="#ffffff" font-family="var(--font-sans, sans-serif)" font-weight="700" font-size="11"
              style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.7));">
          ${escapeHtml(sec.label)}
        </text>
      `);

      currentAngle += angle;
    });

    const svg = `
      <svg class="sim-spinner-svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
        <circle cx="${cx}" cy="${cy}" r="${r + 2}" fill="none" stroke="#cbd5e1" stroke-width="3" />
        ${paths.join('')}
        <g class="sim-needle" style="transform-origin: 50% 50%; transform-box: view-box; transform: rotate(0deg);">
          <!-- Concentric bounding anchor to guarantee the element box center is strictly (cx, cy) in all browsers -->
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="none" opacity="0" pointer-events="none" />
          <polygon points="${cx},${cy - r + 8} ${cx - 6},${cy + 10} ${cx + 6},${cy + 10}" fill="#0f172a" stroke="#ffffff" stroke-width="1.5" />
          <circle cx="${cx}" cy="${cy}" r="7" fill="#0f172a" stroke="#ffffff" stroke-width="2" />
        </g>
      </svg>
    `;

    return `
      <div class="sim-spinner-view ${idx === 0 ? 'active' : ''}" data-spinner-index="${idx}">
        <div class="sim-stage-row">
          <div class="sim-visual-col">
            ${svg}
          </div>
          <div class="sim-data-col">
            <div class="sim-tally-list"></div>
            <div class="sim-total-spins">Total spins: 0</div>
          </div>
        </div>
        ${sp.expected ? `
          <div class="sim-insight-callout">
            <span class="sim-insight-icon">💡</span>
            <span class="sim-insight-text"><strong>Expectation:</strong> ${renderMathInText(sp.expected)}</span>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  return `
    <div class="sim-widget sim-spinner-widget ${revealClass}" data-sim-type="spinner">
      <script type="application/json" class="sim-config">${JSON.stringify(block).replace(/<\//g, '<\\/')}</script>
      <div class="sim-header">
        <h4 class="sim-title">🎯 ${renderMathInText(title)}</h4>
        ${subtitle ? `<p class="sim-subtitle">${renderMathInText(subtitle)}</p>` : ''}
      </div>
      ${tabsHtml}
      <div class="sim-controls-bar">
        <button type="button" class="btn btn-sm btn-primary btn-sim-spin">🎯 Spin</button>
        <button type="button" class="btn btn-sm btn-sim-spin-10">⚡ Spin 10×</button>
        <button type="button" class="btn btn-sm btn-sim-reset">↺ Reset</button>
        <span class="sim-result-badge" style="display: none;"></span>
      </div>
      <div class="sim-views-container">
        ${viewsHtml}
      </div>
    </div>
  `;
}

/**
 * Render a Counter Bag simulation widget.
 */
function renderCounterBagSimulationBlock(block, revealClass = '') {
  const items = block.items || [];
  const title = block.title || 'Bag Draw Simulation';
  const subtitle = block.subtitle || '';

  const bagChips = items.filter(it => (it.count || 0) > 0).flatMap((it) => {
    return Array.from({ length: it.count }).map(() => `
      <span class="sim-token-chip" style="background-color: ${it.color};" title="${escapeHtml(it.label)}"></span>
    `);
  }).join('');

  return `
    <div class="sim-widget sim-bag-widget ${revealClass}" data-sim-type="counter-bag">
      <script type="application/json" class="sim-config">${JSON.stringify(block).replace(/<\//g, '<\\/')}</script>
      <div class="sim-header">
        <h4 class="sim-title">🛍️ ${renderMathInText(title)}</h4>
        ${subtitle ? `<p class="sim-subtitle">${renderMathInText(subtitle)}</p>` : ''}
      </div>
      <div class="sim-bag-container">
        <div class="sim-bag-preview">
          <span class="sim-bag-badge">Bag:</span>
          <div class="sim-bag-chips-row">${bagChips}</div>
        </div>
        <div class="sim-controls-bar">
          <button type="button" class="btn btn-sm btn-primary btn-sim-draw">🎲 Draw</button>
          <button type="button" class="btn btn-sm btn-sim-draw-10">⚡ Draw 10×</button>
          <button type="button" class="btn btn-sm btn-sim-reset">↺ Reset</button>
        </div>
        <div class="sim-draw-stage">
          <div class="sim-empty-stage">
            <span class="sim-bag-icon">🛍️</span>
            <span>Click <strong>Draw</strong> to sample</span>
          </div>
        </div>
        <div class="sim-tally-list"></div>
        <div class="sim-total-draws">Total draws: 0</div>
        ${block.expected ? `
          <div class="sim-insight-callout">
            <span class="sim-insight-icon">💡</span>
            <span class="sim-insight-text"><strong>Observation:</strong> ${renderMathInText(block.expected)}</span>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Render a Pen Box Draw simulation widget.
 */
function renderPenDrawSimulationBlock(block, revealClass = '') {
  const items = block.items || [];
  const title = block.title || 'Pen Box Simulation';
  const subtitle = block.subtitle || '';

  const pensPreview = items.filter(it => (it.count || 0) > 0).flatMap((it) => {
    return Array.from({ length: it.count }).map(() => `
      <span class="sim-pen-preview-icon" style="color: ${it.color};" title="${escapeHtml(it.label)}">🖊️</span>
    `);
  }).join('');

  return `
    <div class="sim-widget sim-pen-widget ${revealClass}" data-sim-type="pen-draw">
      <script type="application/json" class="sim-config">${JSON.stringify(block).replace(/<\//g, '<\\/')}</script>
      <div class="sim-header">
        <h4 class="sim-title">📦 ${renderMathInText(title)}</h4>
        ${subtitle ? `<p class="sim-subtitle">${renderMathInText(subtitle)}</p>` : ''}
      </div>
      <div class="sim-pen-container">
        <div class="sim-bag-preview">
          <span class="sim-bag-badge">Box:</span>
          <div class="sim-pens-preview-row">${pensPreview}</div>
        </div>
        <div class="sim-controls-bar">
          <button type="button" class="btn btn-sm btn-primary btn-sim-draw">🖊️ Draw</button>
          <button type="button" class="btn btn-sm btn-sim-draw-10">⚡ Draw 10×</button>
          <button type="button" class="btn btn-sm btn-sim-reset">↺ Reset</button>
        </div>
        <div class="sim-draw-stage">
          <div class="sim-empty-stage">
            <span class="sim-pen-icon">📦</span>
            <span>Click <strong>Draw</strong> to sample</span>
          </div>
        </div>
        <div class="sim-tally-list"></div>
        <div class="sim-total-draws">Total draws: 0</div>
        ${block.expected ? `
          <div class="sim-insight-callout">
            <span class="sim-insight-icon">💡</span>
            <span class="sim-insight-text"><strong>Observation:</strong> ${renderMathInText(block.expected)}</span>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}
