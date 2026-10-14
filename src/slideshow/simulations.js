/**
 * @file simulations.js
 * Interactive probability simulations for classroom presentations.
 * Provides live, empirical chance experiments for:
 * 1. Spinners (Fair vs Biased relative likelihood comparison)
 * 2. Counter Bag (Sampling without/with replacement, demonstrating likely vs unlikely vs impossible)
 * 3. Pen Box Draw (Demonstrating even chance, impossible, and certain events)
 */

import { escapeHtml } from './math.js';
import {
  CoinClassSimulation,
  CoinSummaryWidget,
  CumulativeCoinSimulation,
  BasketballSimulation
} from './experimentalSimulations.js';

/**
 * Initialize all simulation widgets mounted inside the given container.
 * @param {HTMLElement} container
 * @returns {Array<{ destroy: () => void }>}
 */
export function initSimulations(container) {
  if (!container) return [];
  const widgets = [];
  const simElements = container.querySelectorAll('.sim-widget');

  simElements.forEach((el) => {
    const configEl = el.querySelector('.sim-config');
    if (!configEl) return;

    let config = null;
    try {
      config = JSON.parse(configEl.textContent || '{}');
    } catch (err) {
      console.error('[Simulations] Failed to parse config JSON:', err);
      return;
    }

    const simType = config.simType || el.dataset.simType;
    let widgetInstance = null;

    if (simType === 'spinner' || simType === 'spinners') {
      widgetInstance = new SpinnerSimulation(el, config);
    } else if (simType === 'counter-bag' || simType === 'bag-draw') {
      widgetInstance = new CounterBagSimulation(el, config);
    } else if (simType === 'pen-draw' || simType === 'box-draw') {
      widgetInstance = new PenDrawSimulation(el, config);
    } else if (simType === 'coin-class') {
      widgetInstance = new CoinClassSimulation(el, config);
    } else if (simType === 'coin-summary') {
      widgetInstance = new CoinSummaryWidget(el, config);
    } else if (simType === 'coin-cumulative') {
      widgetInstance = new CumulativeCoinSimulation(el, config);
    } else if (simType === 'basketball') {
      widgetInstance = new BasketballSimulation(el, config);
    }

    if (widgetInstance) {
      widgets.push(widgetInstance);
    }
  });

  // 2. Initialize visual Do Now stimulus spinners if present
  const doNowController = initDoNowSpinners(container);
  if (doNowController) {
    widgets.push(doNowController);
  }

  return widgets;
}

/**
 * Initialize interactive spin behavior on Do Now stimulus spinners.
 * @param {HTMLElement} container
 * @returns {{ destroy: () => void }|null}
 */
export function initDoNowSpinners(container) {
  if (!container) return null;
  const cards = Array.from(container.querySelectorAll('.do-now-spinner-card'));
  if (cards.length === 0) return null;

  const cleanups = [];

  cards.forEach((card) => {
    const btn = card.querySelector('.btn-spin-donow');
    const needle = card.querySelector('.do-now-needle');
    if (!needle) return;

    let currentRot = 225; // default needle orientation (down-left)
    const spin = (e) => {
      if (e) {
        e.stopPropagation();
        if (e.target && typeof e.target.blur === 'function') {
          e.target.blur();
        }
      }
      const randomExtra = 1080 + Math.floor(Math.random() * 360);
      currentRot += randomExtra;
      needle.style.transform = `rotate(${currentRot}deg)`;
    };

    if (btn) {
      btn.addEventListener('click', spin);
      cleanups.push(() => btn.removeEventListener('click', spin));
    }

    const cardClickHandler = (e) => {
      if (e.target === btn || (btn && btn.contains(e.target))) return;
      spin(e);
    };
    card.addEventListener('click', cardClickHandler);
    cleanups.push(() => card.removeEventListener('click', cardClickHandler));
  });

  return {
    destroy: () => {
      cleanups.forEach((fn) => fn());
    }
  };
}

/* ==========================================================================
   1. SPINNER SIMULATION
   ========================================================================== */

export class SpinnerSimulation {
  constructor(element, config) {
    this.el = element;
    this.config = config;
    this.spinners = config.spinners || [];
    this.activeSpinnerIdx = 0;

    // State per spinner: { rotation: number, isSpinning: boolean, counts: Record<string, number>, total: number }
    this.states = this.spinners.map((sp) => ({
      rotation: 0,
      isSpinning: false,
      counts: Object.fromEntries((sp.sectors || []).map((s) => [s.label, 0])),
      total: 0
    }));

    this.tabButtons = Array.from(this.el.querySelectorAll('.sim-tab-btn'));
    this.views = Array.from(this.el.querySelectorAll('.sim-spinner-view'));
    this.btnSpin = this.el.querySelector('.btn-sim-spin');
    this.btnSpin10 = this.el.querySelector('.btn-sim-spin-10');
    this.btnReset = this.el.querySelector('.btn-sim-reset');
    this.resultBadge = this.el.querySelector('.sim-result-badge');

    this.initEvents();
    this.updateUI();
  }

  initEvents() {
    // Tab switching
    this.tabButtons.forEach((btn, idx) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        btn.blur();
        this.switchSpinner(idx);
      });
    });

    if (this.btnSpin) {
      this.btnSpin.addEventListener('click', (e) => {
        e.stopPropagation();
        this.btnSpin.blur();
        this.spinOnce();
      });
    }

    if (this.btnSpin10) {
      this.btnSpin10.addEventListener('click', (e) => {
        e.stopPropagation();
        this.btnSpin10.blur();
        this.spinMultiple(10);
      });
    }

    if (this.btnReset) {
      this.btnReset.addEventListener('click', (e) => {
        e.stopPropagation();
        this.btnReset.blur();
        this.reset();
      });
    }
  }

  switchSpinner(idx) {
    if (idx === this.activeSpinnerIdx || idx < 0 || idx >= this.spinners.length) return;
    this.activeSpinnerIdx = idx;

    this.tabButtons.forEach((b, i) => b.classList.toggle('active', i === idx));
    this.views.forEach((v, i) => v.classList.toggle('active', i === idx));

    const st = this.states[idx];
    if (st && st.lastResult) {
      this.displayResult(st.lastResult, st.lastNote || '');
    } else if (this.resultBadge) {
      this.resultBadge.style.display = 'none';
    }

    this.updateUI();
  }

  getRandomSafeAngle(spinner) {
    let angle = Math.random() * 360;
    let accum = 0;
    for (const sec of spinner.sectors || []) {
      accum += sec.angle;
      if (Math.abs(angle - accum) < 1.0) {
        angle = (angle + 2.0) % 360;
      }
    }
    return angle;
  }

  spinOnce() {
    const sp = this.spinners[this.activeSpinnerIdx];
    const st = this.states[this.activeSpinnerIdx];
    if (!sp || !st || st.isSpinning) return;

    st.isSpinning = true;
    this.setControlsDisabled(true);

    const activeView = this.views[this.activeSpinnerIdx];
    const needle = activeView ? activeView.querySelector('.sim-needle') : null;

    // Random landing angle [0, 360) avoiding dividing lines
    const randomAngle = this.getRandomSafeAngle(sp);
    // Add 4-6 full spins plus random angle
    const extraRotations = (4 + Math.floor(Math.random() * 3)) * 360;
    const targetRotation = st.rotation + extraRotations + randomAngle;
    const normalizedAngle = ((targetRotation % 360) + 360) % 360;
    const winningSector = this.getSectorAtAngle(sp, normalizedAngle);

    if (needle) {
      needle.style.transition = 'transform 1.15s cubic-bezier(0.12, 0.82, 0.35, 1.0)';
      needle.style.transform = `rotate(${targetRotation}deg)`;
    }

    setTimeout(() => {
      st.rotation = targetRotation;
      st.isSpinning = false;
      this.setControlsDisabled(false);

      if (winningSector) {
        st.counts[winningSector.label] = (st.counts[winningSector.label] || 0) + 1;
        st.total++;
        this.displayResult(winningSector);
      }
      this.updateTally(this.activeSpinnerIdx);
    }, 1180);
  }

  spinMultiple(count = 10) {
    const sp = this.spinners[this.activeSpinnerIdx];
    const st = this.states[this.activeSpinnerIdx];
    if (!sp || !st || st.isSpinning) return;

    st.isSpinning = true;
    this.setControlsDisabled(true);

    const activeView = this.views[this.activeSpinnerIdx];
    const needle = activeView ? activeView.querySelector('.sim-needle') : null;

    // 1. Accurately tally the first (count - 1) spins based on spinner probability distribution
    for (let i = 0; i < count - 1; i++) {
      const angle = this.getRandomSafeAngle(sp);
      const sector = this.getSectorAtAngle(sp, angle);
      if (sector) {
        st.counts[sector.label] = (st.counts[sector.label] || 0) + 1;
        st.total++;
      }
    }

    // 2. The 10th (final) spin determines the final needle position AND the 10th tallied outcome
    const randomAngle = this.getRandomSafeAngle(sp);
    const extraRotations = (3 + Math.floor(Math.random() * 2)) * 360;
    const targetRotation = st.rotation + extraRotations + randomAngle;
    const normalizedAngle = ((targetRotation % 360) + 360) % 360;
    const finalSector = this.getSectorAtAngle(sp, normalizedAngle);

    if (finalSector) {
      st.counts[finalSector.label] = (st.counts[finalSector.label] || 0) + 1;
      st.total++;
    }

    if (needle) {
      needle.style.transition = 'transform 0.65s cubic-bezier(0.12, 0.82, 0.35, 1.0)';
      needle.style.transform = `rotate(${targetRotation}deg)`;
    }

    setTimeout(() => {
      st.rotation = targetRotation;
      st.isSpinning = false;
      this.setControlsDisabled(false);

      if (finalSector) {
        this.displayResult(finalSector, `+${count} spins completed!`);
      }
      this.updateTally(this.activeSpinnerIdx);
    }, 670);
  }

  getSectorAtAngle(spinner, normalizedAngle) {
    // Normalizes angle so 0 deg corresponds to the top 12 o'clock sector
    const norm = ((normalizedAngle % 360) + 360) % 360;
    let accum = 0;
    for (const sec of spinner.sectors || []) {
      accum += sec.angle;
      if (norm < accum) {
        return sec;
      }
    }
    return spinner.sectors[spinner.sectors.length - 1] || null;
  }

  displayResult(sector, extraNote = '') {
    const st = this.states[this.activeSpinnerIdx];
    if (st) {
      st.lastResult = sector;
      st.lastNote = extraNote;
    }

    if (!this.resultBadge) return;
    this.resultBadge.style.display = 'inline-flex';
    this.resultBadge.style.backgroundColor = `${sector.color}15`;
    this.resultBadge.style.borderColor = sector.color;
    this.resultBadge.style.color = sector.color;
    this.resultBadge.innerHTML = `
      <span class="sim-dot" style="background-color: ${sector.color};"></span>
      <span>Result: <strong>${escapeHtml(sector.label)}</strong></span>
      ${extraNote ? `<span class="sim-badge-note">${escapeHtml(extraNote)}</span>` : ''}
    `;
  }

  updateTally(idx) {
    const sp = this.spinners[idx];
    const st = this.states[idx];
    const activeView = this.views[idx];
    if (!sp || !st || !activeView) return;

    const tallyContainer = activeView.querySelector('.sim-tally-list');
    if (!tallyContainer) return;

    const total = st.total || 0;

    tallyContainer.innerHTML = (sp.sectors || [])
      .map((sec) => {
        const count = st.counts[sec.label] || 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return `
          <div class="sim-tally-item">
            <div class="sim-tally-row">
              <span class="sim-tally-label">
                <span class="sim-swatch" style="background-color: ${sec.color};"></span>
                <strong>${escapeHtml(sec.label)}</strong>
                <span class="sim-expected-term">(${escapeHtml(sec.term || '')})</span>
              </span>
              <span class="sim-tally-val"><strong>${count}</strong> / ${total} <span class="sim-pct">(${pct}%)</span></span>
            </div>
            <div class="sim-bar-track">
              <div class="sim-bar-fill" style="width: ${pct}%; background-color: ${sec.color};"></div>
            </div>
          </div>
        `;
      })
      .join('');

    const totalEl = activeView.querySelector('.sim-total-spins');
    if (totalEl) {
      totalEl.textContent = `Total spins: ${total}`;
    }
  }

  updateUI() {
    this.updateTally(this.activeSpinnerIdx);
  }

  setControlsDisabled(disabled) {
    if (this.btnSpin) this.btnSpin.disabled = disabled;
    if (this.btnSpin10) this.btnSpin10.disabled = disabled;
    if (this.btnReset) this.btnReset.disabled = disabled;
    this.tabButtons.forEach((b) => (b.disabled = disabled));
  }

  reset() {
    const st = this.states[this.activeSpinnerIdx];
    const sp = this.spinners[this.activeSpinnerIdx];
    if (!st || !sp || st.isSpinning) return;

    st.counts = Object.fromEntries((sp.sectors || []).map((s) => [s.label, 0]));
    st.total = 0;
    st.rotation = 0;
    st.lastResult = null;
    st.lastNote = '';

    const activeView = this.views[this.activeSpinnerIdx];
    const needle = activeView ? activeView.querySelector('.sim-needle') : null;
    if (needle) {
      needle.style.transition = 'none';
      needle.style.transform = 'rotate(0deg)';
    }

    if (this.resultBadge) {
      this.resultBadge.style.display = 'none';
    }

    this.updateTally(this.activeSpinnerIdx);
  }

  destroy() {
    // cleanup
  }
}

/* ==========================================================================
   2. COUNTER BAG SIMULATION
   ========================================================================== */

export class CounterBagSimulation {
  constructor(element, config) {
    this.el = element;
    this.config = config;
    this.items = config.items || [];

    // Build the selection pool from items with count > 0
    this.pool = [];
    this.items.forEach((it) => {
      for (let i = 0; i < (it.count || 0); i++) {
        this.pool.push(it);
      }
    });

    this.state = {
      counts: Object.fromEntries(this.items.map((it) => [it.label, 0])),
      total: 0,
      lastDrawn: null
    };

    this.btnDraw = this.el.querySelector('.btn-sim-draw');
    this.btnDraw10 = this.el.querySelector('.btn-sim-draw-10');
    this.btnReset = this.el.querySelector('.btn-sim-reset');
    this.stage = this.el.querySelector('.sim-draw-stage');
    this.tallyList = this.el.querySelector('.sim-tally-list');
    this.totalLabel = this.el.querySelector('.sim-total-draws');

    this.initEvents();
    this.updateUI();
  }

  initEvents() {
    if (this.btnDraw) {
      this.btnDraw.addEventListener('click', (e) => {
        e.stopPropagation();
        this.btnDraw.blur();
        this.drawOnce();
      });
    }

    if (this.btnDraw10) {
      this.btnDraw10.addEventListener('click', (e) => {
        e.stopPropagation();
        this.btnDraw10.blur();
        this.drawMultiple(10);
      });
    }

    if (this.btnReset) {
      this.btnReset.addEventListener('click', (e) => {
        e.stopPropagation();
        this.btnReset.blur();
        this.reset();
      });
    }
  }

  drawOnce() {
    if (this.pool.length === 0) return;
    const drawn = this.pool[Math.floor(Math.random() * this.pool.length)];

    this.state.counts[drawn.label] = (this.state.counts[drawn.label] || 0) + 1;
    this.state.total++;
    this.state.lastDrawn = drawn;

    this.renderDrawnToken(drawn);
    this.updateUI();
  }

  drawMultiple(count = 10) {
    if (this.pool.length === 0) return;
    let last = null;
    for (let i = 0; i < count; i++) {
      const drawn = this.pool[Math.floor(Math.random() * this.pool.length)];
      this.state.counts[drawn.label] = (this.state.counts[drawn.label] || 0) + 1;
      this.state.total++;
      last = drawn;
    }
    this.state.lastDrawn = last;
    if (last) {
      this.renderDrawnToken(last, `+${count} draws completed`);
    }
    this.updateUI();
  }

  renderDrawnToken(item, extraMsg = '') {
    if (!this.stage) return;
    this.stage.innerHTML = `
      <div class="sim-drawn-card" style="border-color: ${item.color}; background-color: ${item.color}12;">
        <span class="sim-token-circle" style="background-color: ${item.color};"></span>
        <div class="sim-drawn-info">
          <span class="sim-drawn-label" style="color: ${item.color};">Drawn: <strong>${escapeHtml(item.label)}</strong></span>
          <span class="sim-drawn-term">Classification: <strong>${escapeHtml(item.term || '')}</strong></span>
          ${extraMsg ? `<span class="sim-drawn-sub">${escapeHtml(extraMsg)}</span>` : ''}
        </div>
      </div>
    `;
  }

  updateUI() {
    if (!this.tallyList) return;
    const total = this.state.total || 0;

    this.tallyList.innerHTML = this.items
      .map((it) => {
        const count = this.state.counts[it.label] || 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return `
          <div class="sim-tally-item">
            <div class="sim-tally-row">
              <span class="sim-tally-label">
                <span class="sim-swatch" style="background-color: ${it.color};"></span>
                <strong>${escapeHtml(it.label)}</strong>
                <span class="sim-expected-term">(${escapeHtml(it.term || '')})</span>
              </span>
              <span class="sim-tally-val"><strong>${count}</strong> / ${total} <span class="sim-pct">(${pct}%)</span></span>
            </div>
            <div class="sim-bar-track">
              <div class="sim-bar-fill" style="width: ${pct}%; background-color: ${it.color};"></div>
            </div>
          </div>
        `;
      })
      .join('');

    if (this.totalLabel) {
      this.totalLabel.textContent = `Total draws: ${total}`;
    }
  }

  reset() {
    this.state.counts = Object.fromEntries(this.items.map((it) => [it.label, 0]));
    this.state.total = 0;
    this.state.lastDrawn = null;

    if (this.stage) {
      this.stage.innerHTML = `
        <div class="sim-empty-stage">
          <span class="sim-bag-icon">🛍️</span>
          <span>Click <strong>Draw Counter</strong> to sample from the bag</span>
        </div>
      `;
    }
    this.updateUI();
  }

  destroy() {}
}

/* ==========================================================================
   3. PEN DRAW SIMULATION
   ========================================================================== */

export class PenDrawSimulation {
  constructor(element, config) {
    this.el = element;
    this.config = config;
    this.items = config.items || [];

    // Pool from items with count > 0
    this.pool = [];
    this.items.forEach((it) => {
      for (let i = 0; i < (it.count || 0); i++) {
        this.pool.push(it);
      }
    });

    this.state = {
      counts: Object.fromEntries(this.items.map((it) => [it.label, 0])),
      total: 0,
      lastDrawn: null
    };

    this.btnDraw = this.el.querySelector('.btn-sim-draw');
    this.btnDraw10 = this.el.querySelector('.btn-sim-draw-10');
    this.btnReset = this.el.querySelector('.btn-sim-reset');
    this.stage = this.el.querySelector('.sim-draw-stage');
    this.tallyList = this.el.querySelector('.sim-tally-list');
    this.totalLabel = this.el.querySelector('.sim-total-draws');

    this.initEvents();
    this.updateUI();
  }

  initEvents() {
    if (this.btnDraw) {
      this.btnDraw.addEventListener('click', (e) => {
        e.stopPropagation();
        this.btnDraw.blur();
        this.drawOnce();
      });
    }

    if (this.btnDraw10) {
      this.btnDraw10.addEventListener('click', (e) => {
        e.stopPropagation();
        this.btnDraw10.blur();
        this.drawMultiple(10);
      });
    }

    if (this.btnReset) {
      this.btnReset.addEventListener('click', (e) => {
        e.stopPropagation();
        this.btnReset.blur();
        this.reset();
      });
    }
  }

  drawOnce() {
    if (this.pool.length === 0) return;
    const drawn = this.pool[Math.floor(Math.random() * this.pool.length)];

    this.state.counts[drawn.label] = (this.state.counts[drawn.label] || 0) + 1;
    this.state.total++;
    this.state.lastDrawn = drawn;

    this.renderDrawnPen(drawn);
    this.updateUI();
  }

  drawMultiple(count = 10) {
    if (this.pool.length === 0) return;
    let last = null;
    for (let i = 0; i < count; i++) {
      const drawn = this.pool[Math.floor(Math.random() * this.pool.length)];
      this.state.counts[drawn.label] = (this.state.counts[drawn.label] || 0) + 1;
      this.state.total++;
      last = drawn;
    }
    this.state.lastDrawn = last;
    if (last) {
      this.renderDrawnPen(last, `+${count} draws completed`);
    }
    this.updateUI();
  }

  renderDrawnPen(item, extraMsg = '') {
    if (!this.stage) return;
    this.stage.innerHTML = `
      <div class="sim-drawn-card" style="border-color: ${item.color}; background-color: ${item.color}12;">
        <span class="sim-pen-icon" style="color: ${item.color};">🖊️</span>
        <div class="sim-drawn-info">
          <span class="sim-drawn-label" style="color: ${item.color};">Drawn: <strong>${escapeHtml(item.label)}</strong></span>
          <span class="sim-drawn-term">Likelihood: <strong>${escapeHtml(item.term || '')}</strong></span>
          ${extraMsg ? `<span class="sim-drawn-sub">${escapeHtml(extraMsg)}</span>` : ''}
        </div>
      </div>
    `;
  }

  updateUI() {
    if (!this.tallyList) return;
    const total = this.state.total || 0;

    this.tallyList.innerHTML = this.items
      .map((it) => {
        const count = this.state.counts[it.label] || 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return `
          <div class="sim-tally-item">
            <div class="sim-tally-row">
              <span class="sim-tally-label">
                <span class="sim-swatch" style="background-color: ${it.color};"></span>
                <strong>${escapeHtml(it.label)}</strong>
                <span class="sim-expected-term">(${escapeHtml(it.term || '')})</span>
              </span>
              <span class="sim-tally-val"><strong>${count}</strong> / ${total} <span class="sim-pct">(${pct}%)</span></span>
            </div>
            <div class="sim-bar-track">
              <div class="sim-bar-fill" style="width: ${pct}%; background-color: ${it.color};"></div>
            </div>
          </div>
        `;
      })
      .join('');

    if (this.totalLabel) {
      this.totalLabel.textContent = `Total draws: ${total}`;
    }
  }

  reset() {
    this.state.counts = Object.fromEntries(this.items.map((it) => [it.label, 0]));
    this.state.total = 0;
    this.state.lastDrawn = null;

    if (this.stage) {
      this.stage.innerHTML = `
        <div class="sim-empty-stage">
          <span class="sim-pen-icon">📦</span>
          <span>Click <strong>Draw Pen</strong> to sample from the box</span>
        </div>
      `;
    }
    this.updateUI();
  }

  destroy() {}
}
