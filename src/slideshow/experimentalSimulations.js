/**
 * @file experimentalSimulations.js
 * Specialized interactive probability simulations for Lesson 8I:
 * 1. CoinClassSimulation (Slide 3: Whole-class 20-toss coin experiment)
 * 2. CoinSummaryWidget (Slide 4: Live pooled results discussion)
 * 3. CumulativeCoinSimulation (Slide 10: Law of large numbers cumulative graph)
 * 4. BasketballSimulation (Slide 12: Die-based free-throw simulation)
 */

import { renderMathInText } from './math.js';

/* ==========================================================================
   SHARED COIN EXPERIMENT STORE (Cross-slide persistence: Slide 3 -> 4 -> 10)
   ========================================================================== */

export const coinExperimentStore = {
  classSize: 25,
  trialsPerStudent: 20,
  students: [], // Array<{ id: number, heads: number, tails: number }>
  extraTosses: 0,
  extraHeads: 0,
  showExpected: false,
  cumulativeHistory: [], // Array<{ n: number, pr: number }>
  listeners: new Set(),

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  },

  notify() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('[CoinStore Notify Error]', err);
      }
    });
  },

  getTotalClassTosses() {
    return this.students.length * this.trialsPerStudent;
  },

  getTotalClassHeads() {
    return this.students.reduce((acc, s) => acc + s.heads, 0);
  },

  getPooledTotalTosses() {
    return this.getTotalClassTosses() + this.extraTosses;
  },

  getPooledTotalHeads() {
    return this.getTotalClassHeads() + this.extraHeads;
  },

  recordHistoryPoint(n, h) {
    if (n <= 0) return;
    const pr = h / n;
    this.cumulativeHistory.push({ n, pr });
  },

  commitStudentResult(studentId, heads) {
    if (this.students.length >= this.classSize) return false;
    const clampedHeads = Math.max(0, Math.min(this.trialsPerStudent, heads));
    this.students.push({
      id: studentId || (this.students.length + 1),
      heads: clampedHeads,
      tails: this.trialsPerStudent - clampedHeads
    });
    this.recordHistoryPoint(this.getPooledTotalTosses(), this.getPooledTotalHeads());
    this.notify();
    return true;
  },

  runStudent() {
    if (this.students.length >= this.classSize) return false;
    let heads = 0;
    for (let i = 0; i < this.trialsPerStudent; i++) {
      if (Math.random() < 0.5) heads++;
    }
    return this.commitStudentResult(this.students.length + 1, heads);
  },

  runClass() {
    while (this.students.length < this.classSize) {
      let heads = 0;
      for (let i = 0; i < this.trialsPerStudent; i++) {
        if (Math.random() < 0.5) heads++;
      }
      this.students.push({
        id: this.students.length + 1,
        heads,
        tails: this.trialsPerStudent - heads
      });
      this.recordHistoryPoint(this.getPooledTotalTosses(), this.getPooledTotalHeads());
    }
    this.notify();
  },

  setClassSize(newSize) {
    const clamped = Math.max(5, Math.min(40, newSize));
    this.classSize = clamped;
    // Changing class size resets all results
    this.resetAll();
  },

  resetAll() {
    this.students = [];
    this.showExpected = false;
    this.extraTosses = 0;
    this.extraHeads = 0;
    this.cumulativeHistory = [];
    this.notify();
  },

  resetClass() {
    this.resetAll();
  },

  resetExtraTosses() {
    this.resetAll();
  },

  addExtraTosses(count) {
    if (count <= 0) return;

    const initialN = this.getPooledTotalTosses();
    const initialH = this.getPooledTotalHeads();

    // Intermediate sampling for smooth graphing on larger batches
    const step = count >= 1000 ? 50 : (count >= 100 ? 10 : 1);
    let batchHeads = 0;

    for (let i = 1; i <= count; i++) {
      if (Math.random() < 0.5) batchHeads++;
      if (i % step === 0 || i === count) {
        const currentN = initialN + i;
        const currentH = initialH + batchHeads;
        this.recordHistoryPoint(currentN, currentH);
      }
    }

    this.extraTosses += count;
    this.extraHeads += batchHeads;

    // Strict invariant: final history point MUST match pooled totals exactly
    const finalN = this.getPooledTotalTosses();
    const finalH = this.getPooledTotalHeads();
    const lastPt = this.cumulativeHistory[this.cumulativeHistory.length - 1];
    if (!lastPt || lastPt.n !== finalN || Math.abs(lastPt.pr - (finalH / finalN)) > 1e-9) {
      this.recordHistoryPoint(finalN, finalH);
    }

    this.notify();
  }
};

/* ==========================================================================
   1. COIN CLASS SIMULATION (Slide 3)
   ========================================================================== */

export function renderCoinClassSimulation(block, revealClass = '') {
  const title = block.title || 'Class Coin Toss Experiment';
  const subtitle = block.subtitle || '20 independent fair coin tosses per student';

  return `
    <div class="sim-widget sim-coin-class-widget ${revealClass}" data-sim-type="coin-class">
      <script type="application/json" class="sim-config">${JSON.stringify(block).replace(/<\//g, '<\\/')}</script>
      <div class="sim-header">
        <h4 class="sim-title">🪙 ${renderMathInText(title)}</h4>
        <p class="sim-subtitle">${renderMathInText(subtitle)}</p>
      </div>

      <div class="coin-class-controls-bar">
        <div class="coin-size-group">
          <label><strong>Class Size:</strong></label>
          <div class="coin-stepper">
            <button type="button" class="btn btn-sm btn-size-minus" title="Decrease class size">−</button>
            <span class="coin-size-display">25</span>
            <button type="button" class="btn btn-sm btn-size-plus" title="Increase class size">+</button>
          </div>
          <span class="coin-size-note" style="font-size: 0.74rem; color: var(--text-muted); margin-left: 4px;">
            (Changing size resets results)
          </span>
        </div>

        <div class="coin-action-buttons">
          <button type="button" class="btn btn-sm btn-primary btn-run-one">▶ Run 1 Student</button>
          <button type="button" class="btn btn-sm btn-primary btn-run-all">⚡ Run Class</button>
          <button type="button" class="btn btn-sm btn-show-expected">Show expected result</button>
          <button type="button" class="btn btn-sm btn-reset-class">↺ Reset</button>
        </div>
      </div>

      <!-- Inline confirmation dialog for class size changes when results exist -->
      <div class="coin-size-confirm-bar" style="display: none; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem; align-items: center; justify-content: space-between; gap: 8px;">
        <span>⚠️ Changing class size to <strong class="coin-target-size"></strong> will reset all existing results (<strong class="coin-confirm-count"></strong> trials). Proceed?</span>
        <div style="display: flex; gap: 4px; flex-shrink: 0;">
          <button type="button" class="btn btn-sm btn-confirm-proceed" style="background: #dc2626; color: #ffffff; padding: 2px 8px; font-size: 0.76rem;">Reset & Apply</button>
          <button type="button" class="btn btn-sm btn-cancel-proceed" style="padding: 2px 8px; font-size: 0.76rem;">Cancel</button>
        </div>
      </div>

      <!-- Live 20-Toss Animation Box -->
      <div class="coin-toss-animation-box" style="display: none;"></div>

      <div class="coin-pooled-summary">
        <!-- Rendered dynamically in updateUI -->
      </div>

      <div class="coin-chart-container">
        <!-- SVG column chart with reference line at 10 heads -->
      </div>

      <div class="coin-students-ribbon">
        <!-- Individual student badges -->
      </div>
    </div>
  `;
}

export class CoinClassSimulation {
  constructor(element, config) {
    this.el = element;
    this.config = config || {};
    this.unsubscribe = null;
    this.pendingTargetSize = null;

    // Set configured default size ONLY if no trials exist yet
    if (this.config.defaultClassSize && coinExperimentStore.getPooledTotalTosses() === 0) {
      coinExperimentStore.classSize = this.config.defaultClassSize;
    }

    this.sizeDisplay = this.el.querySelector('.coin-size-display');
    this.btnMinus = this.el.querySelector('.btn-size-minus');
    this.btnPlus = this.el.querySelector('.btn-size-plus');
    this.confirmBar = this.el.querySelector('.coin-size-confirm-bar');
    this.btnConfirmProceed = this.el.querySelector('.btn-confirm-proceed');
    this.btnCancelProceed = this.el.querySelector('.btn-cancel-proceed');

    this.btnRunOne = this.el.querySelector('.btn-run-one');
    this.btnRunAll = this.el.querySelector('.btn-run-all');
    this.btnReset = this.el.querySelector('.btn-reset-class');
    this.btnShowExpected = this.el.querySelector('.btn-show-expected');
    this.summaryEl = this.el.querySelector('.coin-pooled-summary');
    this.chartContainer = this.el.querySelector('.coin-chart-container');
    this.ribbonEl = this.el.querySelector('.coin-students-ribbon');

    this.animBox = this.el.querySelector('.coin-toss-animation-box');
    this.activeAnimation = null;
    this.isAnimating = false;

    this.initEvents();
    this.unsubscribe = coinExperimentStore.subscribe(() => this.updateUI());
    this.updateUI();
  }

  setControlsDisabled(disabled) {
    if (this.btnRunOne) this.btnRunOne.disabled = disabled;
    if (this.btnRunAll) this.btnRunAll.disabled = disabled;
    if (this.btnMinus) this.btnMinus.disabled = disabled;
    if (this.btnPlus) this.btnPlus.disabled = disabled;
  }

  initEvents() {
    const stopNav = (e, action) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.target && typeof e.target.blur === 'function') {
        e.target.blur();
      }
      action();
    };

    if (this.btnShowExpected) {
      this.btnShowExpected.addEventListener('click', (e) => stopNav(e, () => {
        coinExperimentStore.showExpected = !coinExperimentStore.showExpected;
        coinExperimentStore.notify();
      }));
    }

    if (this.btnMinus) {
      this.btnMinus.addEventListener('click', (e) =>
        stopNav(e, () => {
          if (!this.isAnimating) this.requestClassSizeChange(coinExperimentStore.classSize - 1);
        })
      );
    }

    if (this.btnPlus) {
      this.btnPlus.addEventListener('click', (e) =>
        stopNav(e, () => {
          if (!this.isAnimating) this.requestClassSizeChange(coinExperimentStore.classSize + 1);
        })
      );
    }

    if (this.btnConfirmProceed) {
      this.btnConfirmProceed.addEventListener('click', (e) =>
        stopNav(e, () => {
          this.cancelActiveAnimation();
          if (this.pendingTargetSize !== null) {
            coinExperimentStore.setClassSize(this.pendingTargetSize);
            this.pendingTargetSize = null;
          }
          if (this.confirmBar) {
            this.confirmBar.style.display = 'none';
          }
        })
      );
    }

    if (this.btnCancelProceed) {
      this.btnCancelProceed.addEventListener('click', (e) =>
        stopNav(e, () => {
          this.pendingTargetSize = null;
          if (this.confirmBar) {
            this.confirmBar.style.display = 'none';
          }
        })
      );
    }

    if (this.btnRunOne) {
      this.btnRunOne.addEventListener('click', (e) =>
        stopNav(e, () => this.runOneStudentAnimated())
      );
    }

    if (this.btnRunAll) {
      this.btnRunAll.addEventListener('click', (e) =>
        stopNav(e, () => {
          if (!this.isAnimating) coinExperimentStore.runClass();
        })
      );
    }

    if (this.btnReset) {
      this.btnReset.addEventListener('click', (e) =>
        stopNav(e, () => this.handleReset())
      );
    }
  }

  handleReset() {
    this.cancelActiveAnimation();
    this.pendingTargetSize = null;
    if (this.confirmBar) {
      this.confirmBar.style.display = 'none';
    }
    coinExperimentStore.resetAll();
  }

  runOneStudentAnimated() {
    if (this.isAnimating) return;
    if (coinExperimentStore.students.length >= coinExperimentStore.classSize) return;

    this.isAnimating = true;
    this.setControlsDisabled(true);

    const trials = coinExperimentStore.trialsPerStudent;
    const outcomes = [];
    for (let i = 0; i < trials; i++) {
      outcomes.push(Math.random() < 0.5 ? 1 : 0);
    }
    const finalHeads = outcomes.reduce((acc, v) => acc + v, 0);
    const studentId = coinExperimentStore.students.length + 1;

    this.activeAnimation = {
      studentId,
      outcomes,
      finalHeads,
      tossIndex: 0,
      runningHeads: 0,
      timerId: null,
      completionTimerId: null
    };

    if (this.animBox) {
      this.animBox.style.display = 'block';
    }

    // Capture the identity so stale callbacks cannot affect a later run.
    const anim = this.activeAnimation;
    const step = () => {
      if (this.activeAnimation !== anim) return;
      const currentOutcome = anim.outcomes[anim.tossIndex];
      if (currentOutcome === 1) {
        anim.runningHeads++;
      }
      anim.tossIndex++;

      this.renderAnimationProgress(anim, currentOutcome);

      if (anim.tossIndex >= anim.outcomes.length) {
        if (anim.timerId) {
          clearInterval(anim.timerId);
          anim.timerId = null;
        }
        anim.completionTimerId = setTimeout(() => {
          if (this.activeAnimation !== anim) return;
          this.commitAndStopActiveAnimation();
        }, 150);
      }
    };

    this.renderAnimationProgress(this.activeAnimation, null);
    // 20 tosses over ~4 seconds (200ms per toss)
    this.activeAnimation.timerId = setInterval(step, 200);
  }

  renderAnimationProgress(anim, latestOutcome) {
    if (!this.animBox || !anim) return;
    const { studentId, outcomes, tossIndex, runningHeads } = anim;
    const totalTosses = outcomes.length;

    let glyph = '🪙';
    let outcomeText = 'Flipping fair coin...';
    let badgeClass = 'waiting';

    if (latestOutcome !== null) {
      if (latestOutcome === 1) {
        glyph = '🟡';
        outcomeText = 'HEADS (+1)';
        badgeClass = 'heads';
      } else {
        glyph = '⚪';
        outcomeText = 'TAILS (+0)';
        badgeClass = 'tails';
      }
    }

    const chips = outcomes.slice(0, tossIndex).map((o, idx) => `
      <span class="coin-anim-chip ${o === 1 ? 'heads' : 'tails'}" title="Toss ${idx + 1}: ${o === 1 ? 'Heads' : 'Tails'}">
        ${o === 1 ? 'H' : 'T'}
      </span>
    `).join('');

    const progressPct = ((tossIndex / totalTosses) * 100).toFixed(0);

    this.animBox.innerHTML = `
      <div class="coin-anim-card">
        <div class="coin-anim-top-row">
          <span class="coin-anim-student-label">
            🧑‍🎓 <strong>Student ${studentId}:</strong> Tossing 20 independent coins...
          </span>
          <span class="coin-anim-counter">
            Toss <strong>${tossIndex}</strong> of <strong>${totalTosses}</strong>
          </span>
        </div>

        <div class="coin-anim-main-row">
          <div class="coin-anim-visual ${badgeClass}">
            <span class="coin-anim-glyph">${glyph}</span>
            <span class="coin-anim-callout">${outcomeText}</span>
          </div>

          <div class="coin-anim-counts-box">
            <div class="coin-anim-count-metric">
              <span class="metric-label">Running Heads</span>
              <span class="metric-value" style="color: var(--primary);"><strong>${runningHeads}</strong></span>
            </div>
            <div class="coin-anim-count-metric">
              <span class="metric-label">Running Tails</span>
              <span class="metric-value"><strong>${tossIndex - runningHeads}</strong></span>
            </div>
            ${coinExperimentStore.showExpected ? `<div class="coin-anim-count-metric">
              <span class="metric-label">Expected</span>
              <span class="metric-value" style="color: var(--text-muted);">10</span>
            </div>` : ''}
          </div>
        </div>

        <div class="coin-anim-progress-bar-wrap">
          <div class="coin-anim-progress-bar-fill" style="width: ${progressPct}%;"></div>
        </div>

        <div class="coin-anim-history-strip">
          ${chips || '<span style="font-size: 0.72rem; color: var(--text-muted); font-style: italic;">Starting coin toss...</span>'}
        </div>
      </div>
    `;
  }

  commitAndStopActiveAnimation() {
    if (!this.activeAnimation) return;
    const { studentId, finalHeads, timerId, completionTimerId } = this.activeAnimation;
    if (timerId) {
      clearInterval(timerId);
    }
    if (completionTimerId != null) clearTimeout(completionTimerId);
    this.activeAnimation = null;
    this.isAnimating = false;
    if (this.animBox) {
      this.animBox.style.display = 'none';
      this.animBox.innerHTML = '';
    }
    this.setControlsDisabled(false);

    coinExperimentStore.commitStudentResult(studentId, finalHeads);
  }

  cancelActiveAnimation() {
    if (this.activeAnimation) {
      if (this.activeAnimation.timerId) {
        clearInterval(this.activeAnimation.timerId);
      }
      if (this.activeAnimation.completionTimerId != null) {
        clearTimeout(this.activeAnimation.completionTimerId);
      }
      this.activeAnimation = null;
    }
    this.isAnimating = false;
    if (this.animBox) {
      this.animBox.style.display = 'none';
      this.animBox.innerHTML = '';
    }
    this.setControlsDisabled(false);
  }

  requestClassSizeChange(targetSize) {
    const clamped = Math.max(5, Math.min(40, targetSize));
    if (clamped === coinExperimentStore.classSize) return;

    const totalTrials = coinExperimentStore.getPooledTotalTosses();
    if (totalTrials > 0) {
      this.pendingTargetSize = clamped;
      if (this.confirmBar) {
        const targetSpan = this.confirmBar.querySelector('.coin-target-size');
        const countSpan = this.confirmBar.querySelector('.coin-confirm-count');
        if (targetSpan) targetSpan.textContent = String(clamped);
        if (countSpan) countSpan.textContent = String(totalTrials);
        this.confirmBar.style.display = 'flex';
      }
    } else {
      coinExperimentStore.setClassSize(clamped);
    }
  }

  updateUI() {
    const { classSize, students } = coinExperimentStore;
    const totalTosses = coinExperimentStore.getTotalClassTosses();
    const totalHeads = coinExperimentStore.getTotalClassHeads();
    const fraction = totalTosses > 0 ? totalHeads / totalTosses : 0;
    const pct = totalTosses > 0 ? (fraction * 100).toFixed(1) : '0.0';
    const diffPct = totalTosses > 0 ? Math.abs(Number(pct) - 50.0).toFixed(1) : '0.0';

    if (this.btnShowExpected) {
      this.btnShowExpected.textContent = coinExperimentStore.showExpected ? 'Hide expected result' : 'Show expected result';
      this.btnShowExpected.setAttribute('aria-pressed', String(coinExperimentStore.showExpected));
    }
    if (this.sizeDisplay) {
      this.sizeDisplay.textContent = String(classSize);
    }

    // 1. Pooled Summary Box
    if (this.summaryEl) {
      const isComplete = students.length >= classSize && classSize > 0;
      const statusPill = isComplete
        ? `<span class="coin-badge-complete">✔ All ${classSize} Students Completed</span>`
        : `<span class="coin-badge-active">${students.length} of ${classSize} Students Tossed</span>`;

      const statsHtml = totalTosses > 0 ? `
        <div class="coin-stats-grid">
          <div class="coin-stat-card">
            <span class="coin-stat-label">Total Tosses</span>
            <span class="coin-stat-val"><strong>${totalTosses}</strong></span>
            <span class="coin-stat-sub">${students.length} × 20</span>
          </div>
          <div class="coin-stat-card">
            <span class="coin-stat-label">Total Heads</span>
            <span class="coin-stat-val" style="color: var(--primary);"><strong>${totalHeads}</strong></span>
            ${coinExperimentStore.showExpected ? `<span class="coin-stat-sub">Expected: ${students.length * 10}</span>` : ''}
          </div>
          <div class="coin-stat-card">
            <span class="coin-stat-label">Experimental Pr(H)</span>
            <span class="coin-stat-val" style="color: var(--accent-green); font-size: 1.15rem;">
              <strong>${totalHeads}/${totalTosses} = ${pct}%</strong>
            </span>
            <span class="coin-stat-sub">Distance from 50.0%: ${diffPct}%</span>
          </div>
        </div>
        <div class="coin-reflection-prompt" style="margin-top: 6px; font-size: 0.8rem; color: var(--text-secondary); background: #f8fafc; border: 1px solid var(--border-light); border-radius: 4px; padding: 4px 8px; text-align: center;">
          Observed relative frequency: <strong>${pct}%</strong> (${diffPct}% from 50.0%). <em>Ask students: Do you consider this result close to 50%?</em>
        </div>
      ` : `
        <div class="coin-empty-prompt">
          👉 Click <strong>Run 1 Student</strong> (20 tosses) or <strong>Run Class</strong> to simulate tosses.
        </div>
      `;

      this.summaryEl.innerHTML = `
        <div class="coin-summary-header">
          <span class="coin-summary-title">Classroom Pooled Results</span>
          ${statusPill}
        </div>
        ${statsHtml}
      `;
    }

    // 2. SVG Bar Chart with Reference Line at 10 heads
    if (this.chartContainer) {
      const svgWidth = 460;
      const svgHeight = 150;
      const padLeft = 34;
      const padRight = 16;
      const padTop = 18;
      const padBottom = 24;
      const plotWidth = svgWidth - padLeft - padRight;
      const plotHeight = svgHeight - padTop - padBottom;

      const yMax = 20;
      const yRef = 10;
      const yRefPixel = padTop + plotHeight * (1 - yRef / yMax);

      // Gridlines at 0, 5, 10, 15, 20
      const gridTicks = [0, 5, 10, 15, 20];
      const gridLines = gridTicks.map((val) => {
        const y = padTop + plotHeight * (1 - val / yMax);
        const isRef = coinExperimentStore.showExpected && val === 10;
        return `
          <line x1="${padLeft}" y1="${y}" x2="${padLeft + plotWidth}" y2="${y}"
                stroke="${isRef ? '#d97706' : '#e2e8f0'}"
                stroke-width="${isRef ? 2 : 1}"
                stroke-dasharray="${isRef ? '4 3' : 'none'}" />
          <text x="${padLeft - 6}" y="${y}" font-size="9" fill="${isRef ? '#d97706' : '#94a3b8'}"
                font-weight="${isRef ? '700' : '400'}" text-anchor="end" dominant-baseline="central">
            ${val}
          </text>
        `;
      }).join('');

      // Student columns
      const colSlot = plotWidth / Math.max(classSize, 1);
      const barWidth = Math.max(4, Math.min(14, colSlot * 0.72));

      const bars = students.map((s, idx) => {
        const cx = padLeft + (idx + 0.5) * colSlot;
        const x = cx - barWidth / 2;
        const barH = (s.heads / yMax) * plotHeight;
        const y = padTop + plotHeight - barH;

        let barColor = '#2563eb';
        if (!coinExperimentStore.showExpected) barColor = '#2563eb';
        else if (s.heads === 10) barColor = '#16a34a';
        else if (s.heads === 9 || s.heads === 11) barColor = '#3b82f6';
        else if (s.heads >= 7 && s.heads <= 13) barColor = '#d97706';
        else barColor = '#dc2626';

        return `
          <g class="coin-bar-group" tabindex="0">
            <title>Student ${s.id}: ${s.heads} Heads, ${s.tails} Tails</title>
            <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${barH.toFixed(1)}"
                  fill="${barColor}" rx="2" />
            <text x="${cx.toFixed(1)}" y="${(y - 4).toFixed(1)}" font-size="8" fill="#1e293b" font-weight="700"
                  text-anchor="middle">
              ${s.heads}
            </text>
          </g>
        `;
      }).join('');

      // Empty placeholders for remaining students
      const emptyBars = [];
      for (let idx = students.length; idx < classSize; idx++) {
        const cx = padLeft + (idx + 0.5) * colSlot;
        const x = cx - barWidth / 2;
        emptyBars.push(`
          <rect x="${x.toFixed(1)}" y="${(padTop + plotHeight - 3).toFixed(1)}" width="${barWidth.toFixed(1)}" height="3"
                fill="#cbd5e1" rx="1" opacity="0.6" />
        `);
      }

      this.chartContainer.innerHTML = `
        <div class="coin-chart-wrapper">
          <svg class="coin-chart-svg" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMidYMid meet">
            <!-- Gridlines -->
            ${gridLines}
            <!-- Reference line label appears after predictions. -->
            ${coinExperimentStore.showExpected ? `<rect x="${padLeft + plotWidth - 110}" y="${yRefPixel - 14}" width="108" height="12" fill="#fffbeb" rx="3" stroke="#fef3c7" />
            <text x="${padLeft + plotWidth - 56}" y="${yRefPixel - 6}" font-size="8.5" fill="#b45309" font-weight="700" text-anchor="middle">
              Expected Line: 10 Heads
            </text>` : ''}
            <!-- Bars -->
            ${emptyBars.join('')}
            ${bars}
            <!-- X-axis baseline -->
            <line x1="${padLeft}" y1="${padTop + plotHeight}" x2="${padLeft + plotWidth}" y2="${padTop + plotHeight}" stroke="#64748b" stroke-width="1.5" />
            <text x="${padLeft + plotWidth / 2}" y="${svgHeight - 4}" font-size="9" fill="#64748b" font-weight="600" text-anchor="middle">
              Individual Students (1 to ${classSize})
            </text>
          </svg>
        </div>
      `;
    }

    // 3. Compact Student Ribbon
    if (this.ribbonEl) {
      if (students.length === 0) {
        this.ribbonEl.innerHTML = `
          <div class="coin-ribbon-empty" style="font-size: 0.8rem; color: var(--text-muted); padding: 4px;">No student tosses recorded yet.</div>
        `;
      } else {
        const chips = students.map((s) => {
          const diff = s.heads - 10;
          const diffStr = diff > 0 ? `+${diff}` : String(diff);
          let badgeClass = 'badge-normal';
          if (!coinExperimentStore.showExpected) badgeClass = 'badge-normal';
          else if (diff === 0) badgeClass = 'badge-exact';
          else if (Math.abs(diff) > 3) badgeClass = 'badge-far';

          return `
            <span class="coin-student-chip ${badgeClass}" title="Student ${s.id}: ${s.heads} Heads${coinExperimentStore.showExpected ? ` (${diffStr} from 10)` : ''}">
              <strong>S${s.id}:</strong> ${s.heads}H
            </span>
          `;
        }).join('');

        this.ribbonEl.innerHTML = `
          <div class="coin-chips-header">
            <span><strong>Individual Student Heads Counts:</strong></span>
            ${coinExperimentStore.showExpected ? '<span style="font-size: 0.74rem; color: var(--text-muted);">(Expected = 10 each)</span>' : ''}
          </div>
          <div class="coin-chips-scroll">
            ${chips}
          </div>
        `;
      }
    }
  }

  onSlideChange() {
    this.commitAndStopActiveAnimation();
  }

  destroy() {
    this.commitAndStopActiveAnimation();
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}

/* ==========================================================================
   2. COIN SUMMARY WIDGET (Slide 4: Live Discussion Connection)
   ========================================================================== */

export function renderCoinDiscussionSummary(block, revealClass = '') {
  return `
    <div class="sim-widget sim-coin-summary-widget ${revealClass}" data-sim-type="coin-summary">
      <script type="application/json" class="sim-config">${JSON.stringify(block).replace(/<\//g, '<\\/')}</script>
      <div class="coin-summary-mount">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;
}

export class CoinSummaryWidget {
  constructor(element, config) {
    this.el = element;
    this.config = config || {};
    this.mountEl = this.el.querySelector('.coin-summary-mount');
    this.unsubscribe = null;

    this.unsubscribe = coinExperimentStore.subscribe(() => this.updateUI());
    this.updateUI();
  }

  updateUI() {
    if (!this.mountEl) return;

    const { students, trialsPerStudent } = coinExperimentStore;
    const n = students.length;
    const totalClassTosses = coinExperimentStore.getTotalClassTosses();
    const totalClassHeads = coinExperimentStore.getTotalClassHeads();
    const expectedTrials = n * trialsPerStudent;
    const expectedHeads = n * 10;
    const fraction = totalClassTosses > 0 ? totalClassHeads / totalClassTosses : 0;
    const pct = totalClassTosses > 0 ? (fraction * 100).toFixed(1) : '0.0';
    const diff = totalClassHeads - expectedHeads;
    const diffFormatted = diff > 0 ? `+${diff}` : String(diff);
    const diffPct = totalClassTosses > 0 ? Math.abs(Number(pct) - 50.0).toFixed(1) : '0.0';

    if (n === 0) {
      this.mountEl.innerHTML = `
        <div class="coin-disc-card empty-disc-card" style="padding: 18px; text-align: center; background: var(--bg-muted); border-radius: 8px;">
          <div style="font-size: 1.8rem; margin-bottom: 6px;">🪙 👥</div>
          <h4 style="font-size: 1.05rem; color: var(--primary); margin-bottom: 6px;">No Class Experiment Run Yet</h4>
          <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 8px;">
            Navigate to <strong>Slide 3 (Do Now)</strong> to simulate coin tosses for individual students or the whole class.
          </p>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0;">
            Observed results, totals, and fractions will automatically display here once trials are run.
          </p>
        </div>
      `;
      return;
    }

    const minHeads = Math.min(...students.map((s) => s.heads));
    const maxHeads = Math.max(...students.map((s) => s.heads));

    const htmlContent = `
      <div class="coin-disc-card">
        <div class="coin-disc-badge-row">
          <span class="coin-disc-badge">📊 Live Class Experiment Data</span>
          <span class="coin-disc-students">${n} Students Tossed (${trialsPerStudent} tosses each)</span>
        </div>

        <div class="coin-disc-table-wrap">
          <table class="math-table" style="font-size: 0.92rem; width: 100%;">
            <thead>
              <tr>
                <th>Measure</th>
                <th>Theoretical Model</th>
                <th>Actual Class Experiment</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Expected per student</strong></td>
                <td>${renderMathInText(`$\\frac{1}{2} \\times 20 = 10\\text{ heads}$`)}</td>
                <td>Ranges from ${minHeads} to ${maxHeads} heads</td>
              </tr>
              <tr>
                <td><strong>Total Trials (${renderMathInText(`$20n$`)})</strong></td>
                <td>${renderMathInText(`$20 \\times ${n} = ${expectedTrials}$`)}</td>
                <td><strong>${totalClassTosses} tosses</strong></td>
              </tr>
              <tr>
                <td><strong>Total Heads (${renderMathInText(`$10n$`)})</strong></td>
                <td>${renderMathInText(`$10 \\times ${n} = ${expectedHeads}$`)}</td>
                <td style="color: var(--primary); font-weight: 700;"><strong>${totalClassHeads} heads</strong> (${diffFormatted})</td>
              </tr>
              <tr>
                <td><strong>Fraction landing heads</strong></td>
                <td>${renderMathInText(`$\\frac{1}{2} = 50.0\\%$`)}</td>
                <td style="color: var(--accent-green); font-weight: 700;">
                  ${renderMathInText(`$\\frac{${totalClassHeads}}{${totalClassTosses}} = \\mathbf{${pct}\\%}$`)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="coin-disc-takeaway">
          <span class="disc-takeaway-icon">💡</span>
          <span class="disc-takeaway-text">
            <strong>Discussion Point:</strong> Pooled across <strong>${totalClassTosses} tosses</strong>, the observed relative frequency of heads is <strong>${pct}%</strong> (a distance of <strong>${diffPct} percentage points</strong> from 50.0%). Ask students: Do you consider this result close to ${renderMathInText(`$\\frac{1}{2}$`)}? How does pooling trials across the whole class affect your estimate?
          </span>
        </div>
      </div>
    `;

    // Structural HTML stays intact; individual formula fragments are rendered above.
    this.mountEl.innerHTML = htmlContent;
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}

/* ==========================================================================
   3. CUMULATIVE COIN SIMULATION (Slide 10: Law of Large Numbers Graph)
   ========================================================================== */

export function renderCumulativeCoinSimulation(block, revealClass = '') {
  const title = block.title || 'Cumulative Experimental Probability Graph';
  const subtitle = block.subtitle || 'Observing relative frequency of heads as total trials increase';

  return `
    <div class="sim-widget sim-cumulative-widget ${revealClass}" data-sim-type="coin-cumulative">
      <script type="application/json" class="sim-config">${JSON.stringify(block).replace(/<\//g, '<\\/')}</script>
      <div class="sim-header">
        <h4 class="sim-title">📈 ${renderMathInText(title)}</h4>
        <p class="sim-subtitle">${renderMathInText(subtitle)}</p>
      </div>

      <div class="cumul-controls-bar">
        <button type="button" class="btn btn-sm btn-primary btn-add-10">+10 Tosses</button>
        <button type="button" class="btn btn-sm btn-primary btn-add-100">⚡ +100 Tosses</button>
        <button type="button" class="btn btn-sm btn-primary btn-add-1000">🚀 +1000 Tosses</button>
        <button type="button" class="btn btn-sm btn-reset-all">↺ Reset</button>
      </div>

      <div class="cumul-stats-strip">
        <!-- Rendered in updateUI -->
      </div>

      <div class="cumul-graph-container">
        <!-- Rendered in updateUI -->
      </div>

      <div class="cumul-insight-wrap">
        <!-- Rendered in updateUI -->
      </div>
    </div>
  `;
}

export class CumulativeCoinSimulation {
  constructor(element, config) {
    this.el = element;
    this.config = config || {};
    this.unsubscribe = null;

    this.btnAdd10 = this.el.querySelector('.btn-add-10');
    this.btnAdd100 = this.el.querySelector('.btn-add-100');
    this.btnAdd1000 = this.el.querySelector('.btn-add-1000');
    this.btnReset = this.el.querySelector('.btn-reset-all');
    this.statsStrip = this.el.querySelector('.cumul-stats-strip');
    this.graphContainer = this.el.querySelector('.cumul-graph-container');
    this.insightWrap = this.el.querySelector('.cumul-insight-wrap');

    this.initEvents();
    this.unsubscribe = coinExperimentStore.subscribe(() => this.updateUI());
    this.updateUI();
  }

  initEvents() {
    const stopNav = (e, action) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.target && typeof e.target.blur === 'function') {
        e.target.blur();
      }
      action();
    };

    if (this.btnAdd10) {
      this.btnAdd10.addEventListener('click', (e) =>
        stopNav(e, () => coinExperimentStore.addExtraTosses(10))
      );
    }

    if (this.btnAdd100) {
      this.btnAdd100.addEventListener('click', (e) =>
        stopNav(e, () => coinExperimentStore.addExtraTosses(100))
      );
    }

    if (this.btnAdd1000) {
      this.btnAdd1000.addEventListener('click', (e) =>
        stopNav(e, () => coinExperimentStore.addExtraTosses(1000))
      );
    }

    if (this.btnReset) {
      this.btnReset.addEventListener('click', (e) =>
        stopNav(e, () => coinExperimentStore.resetAll())
      );
    }
  }

  updateUI() {
    const classTosses = coinExperimentStore.getTotalClassTosses();
    const classHeads = coinExperimentStore.getTotalClassHeads();
    const extraTosses = coinExperimentStore.extraTosses;
    const extraHeads = coinExperimentStore.extraHeads;
    const totalTosses = coinExperimentStore.getPooledTotalTosses();
    const totalHeads = coinExperimentStore.getPooledTotalHeads();
    const hasTosses = totalTosses > 0;
    const currentPr = hasTosses ? totalHeads / totalTosses : 0;
    const currentPct = hasTosses ? (currentPr * 100).toFixed(2) : '—';
    const diffFromHalf = hasTosses ? Math.abs(currentPr - 0.5).toFixed(4) : '—';
    const diffPct = hasTosses ? (Math.abs(currentPr - 0.5) * 100).toFixed(2) + '%' : '—';

    // 1. Stats Strip
    if (this.statsStrip) {
      this.statsStrip.innerHTML = `
        <div class="cumul-stats-row">
          <div class="cumul-pill">
            <span class="cumul-label">Class Base:</span>
            <span><strong>${classTosses}</strong> tosses (${classHeads} H)</span>
          </div>
          <div class="cumul-pill">
            <span class="cumul-label">Additional:</span>
            <span><strong>+${extraTosses}</strong> tosses (${extraHeads} H)</span>
          </div>
          <div class="cumul-pill highlight">
            <span class="cumul-label">Total Pooled Trials:</span>
            <span style="color: var(--primary);"><strong>${totalTosses}</strong></span>
          </div>
          <div class="cumul-pill success">
            <span class="cumul-label">Cumulative Pr(H):</span>
            <span style="color: var(--accent-green); font-weight: 700;">
              <strong>${hasTosses ? `${currentPr.toFixed(4)} (${currentPct}%)` : '—'}</strong>
            </span>
          </div>
          <div class="cumul-pill">
            <span class="cumul-label">|Pr − 0.5|:</span>
            <span style="font-family: var(--font-mono);">${diffFromHalf}</span>
          </div>
        </div>
      `;
    }

    // 2. SVG Line Graph (Y: 0.0 to 1.0, Reference line: 0.5)
    if (this.graphContainer) {
      const svgWidth = 500;
      const svgHeight = 175;
      const padLeft = 40;
      const padRight = 20;
      const padTop = 14;
      const padBottom = 26;
      const plotWidth = svgWidth - padLeft - padRight;
      const plotHeight = svgHeight - padTop - padBottom;

      const history = coinExperimentStore.cumulativeHistory;
      const maxN = Math.max(50, totalTosses);

      // Y-axis ticks
      const yTicks = [
        { val: 1.0, label: '1.0' },
        { val: 0.75, label: '0.75' },
        { val: 0.5, label: '0.50', isRef: true },
        { val: 0.25, label: '0.25' },
        { val: 0.0, label: '0.0' },
      ];

      const gridLines = yTicks.map((t) => {
        const y = padTop + plotHeight * (1 - t.val);
        return `
          <line x1="${padLeft}" y1="${y}" x2="${padLeft + plotWidth}" y2="${y}"
                stroke="${t.isRef ? '#d97706' : '#e2e8f0'}"
                stroke-width="${t.isRef ? 2 : 1}"
                stroke-dasharray="${t.isRef ? '5 3' : 'none'}" />
          <text x="${padLeft - 6}" y="${y}" font-size="8.5" fill="${t.isRef ? '#d97706' : '#94a3b8'}"
                font-weight="${t.isRef ? '700' : '400'}" text-anchor="end" dominant-baseline="central">
            ${t.val.toFixed(2)}
          </text>
        `;
      }).join('');

      // Reference line label
      const yRefPixel = padTop + plotHeight * 0.5;
      const refBadge = `
        <rect x="${padLeft + plotWidth - 145}" y="${yRefPixel - 14}" width="140" height="13" fill="#fffbeb" rx="3" stroke="#fef3c7" />
        <text x="${padLeft + plotWidth - 75}" y="${yRefPixel - 6}" font-size="8.5" fill="#b45309" font-weight="700" text-anchor="middle">
          Theoretical Pr(Heads) = 0.5
        </text>
      `;

      // Plot cumulative path
      let pathD = '';
      let latestDot = '';

      if (hasTosses && history.length > 0) {
        history.forEach((pt, idx) => {
          const x = padLeft + (pt.n / maxN) * plotWidth;
          const clampedPr = Math.max(0, Math.min(1, pt.pr));
          const y = padTop + plotHeight * (1 - clampedPr);

          if (idx === 0) {
            pathD += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
          } else {
            pathD += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
          }
        });

        // Final point must strictly match final pooled totals
        const finalPoint = history[history.length - 1];
        const lastX = padLeft + (finalPoint.n / maxN) * plotWidth;
        const lastY = padTop + plotHeight * (1 - Math.max(0, Math.min(1, finalPoint.pr)));

        latestDot = `
          <circle cx="${lastX.toFixed(1)}" cy="${lastY.toFixed(1)}" r="4.5" fill="#2563eb" stroke="#ffffff" stroke-width="2">
            <title>Total trials: ${finalPoint.n}, Experimental Pr: ${(finalPoint.pr * 100).toFixed(1)}%</title>
          </circle>
        `;
      }

      // Empty state text if 0 trials
      const emptyNote = !hasTosses ? `
        <text x="${padLeft + plotWidth / 2}" y="${yRefPixel + 26}" font-size="10.5" fill="#94a3b8" text-anchor="middle">
          No coin tosses recorded yet. Click +10, +100, or +1000 tosses to start.
        </text>
      ` : '';

      // X-axis ticks
      const xMid = Math.round(maxN / 2);
      const xLabels = `
        <text x="${padLeft}" y="${svgHeight - 6}" font-size="8.5" fill="#64748b" text-anchor="start">0</text>
        <text x="${padLeft + plotWidth / 2}" y="${svgHeight - 6}" font-size="8.5" fill="#64748b" text-anchor="middle">${xMid} trials</text>
        <text x="${padLeft + plotWidth}" y="${svgHeight - 6}" font-size="8.5" fill="#64748b" text-anchor="end">${maxN} trials</text>
      `;

      this.graphContainer.innerHTML = `
        <svg class="cumul-graph-svg" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMidYMid meet">
          ${gridLines}
          ${refBadge}
          <line x1="${padLeft}" y1="${padTop + plotHeight}" x2="${padLeft + plotWidth}" y2="${padTop + plotHeight}" stroke="#64748b" stroke-width="1.5" />
          <line x1="${padLeft}" y1="${padTop}" x2="${padLeft}" y2="${padTop + plotHeight}" stroke="#64748b" stroke-width="1.5" />
          ${emptyNote}
          ${pathD ? `<path d="${pathD}" fill="none" stroke="#2563eb" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />` : ''}
          ${latestDot}
          ${xLabels}
        </svg>
      `;
    }

    // 3. Insight Callout
    if (this.insightWrap) {
      this.insightWrap.innerHTML = `
        <div class="sim-insight-callout" style="margin-top: 8px;">
          <span class="sim-insight-icon">💡</span>
          <span class="sim-insight-text">
            <strong>The Law of Large Numbers:</strong> As more trials are conducted, the experimental probability tends to settle closer to the theoretical 0.5.
            ${hasTosses ? `Current observed relative frequency is <strong>${currentPct}%</strong> (a distance of <strong>${diffPct}</strong> from 50.0%). <em>Ask students: Is this result close to 0.5? Notice that the line fluctuates and does NOT move steadily closer on every single toss!</em>` : `<em>Click the buttons above to observe how the cumulative relative frequency behaves as trials increase.</em>`}
          </span>
        </div>
      `;
    }
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}

/* ==========================================================================
   4. BASKETBALL DIE SIMULATION (Slide 12: Free-throw shots)
   ========================================================================== */

export function renderBasketballSimulation(block, revealClass = '') {
  const title = block.title || 'Basketball Free-Throw Simulation';
  const subtitle = block.subtitle || 'Roll a fair 6-sided die: 1–4 = SCORE (Basket Made), 5–6 = MISS';

  return `
    <div class="sim-widget sim-basketball-widget ${revealClass}" data-sim-type="basketball">
      <script type="application/json" class="sim-config">${JSON.stringify(block).replace(/<\//g, '<\\/')}</script>
      <div class="sim-header">
        <h4 class="sim-title">🏀 ${renderMathInText(title)}</h4>
        <p class="sim-subtitle">${renderMathInText(subtitle)}</p>
      </div>

      <div class="bball-controls-bar">
        <button type="button" class="btn btn-sm btn-primary btn-bball-1">🏀 Shoot 1 (Roll Die)</button>
        <button type="button" class="btn btn-sm btn-primary btn-bball-10">⚡ +10 Shots</button>
        <button type="button" class="btn btn-sm btn-primary btn-bball-50">🚀 +50 Shots</button>
        <button type="button" class="btn btn-sm btn-bball-reset">↺ Reset</button>
      </div>

      <div class="bball-stage-row">
        <!-- Visual Die & Flash Outcome -->
        <div class="bball-die-col">
          <div class="bball-die-card">
            <!-- Rendered in updateUI -->
          </div>
        </div>

        <!-- Live Scoreboard -->
        <div class="bball-score-col">
          <!-- Rendered in updateUI -->
        </div>
      </div>
    </div>
  `;
}

export class BasketballSimulation {
  constructor(element, config) {
    this.el = element;
    this.config = config || {};

    this.scores = 0;
    this.misses = 0;
    this.lastRoll = 3;
    this.lastIsScore = true;
    this.hasRolled = false;

    this.btn1 = this.el.querySelector('.btn-bball-1');
    this.btn10 = this.el.querySelector('.btn-bball-10');
    this.btn50 = this.el.querySelector('.btn-bball-50');
    this.btnReset = this.el.querySelector('.btn-bball-reset');
    this.dieCol = this.el.querySelector('.bball-die-card');
    this.scoreCol = this.el.querySelector('.bball-score-col');

    this.initEvents();
    this.updateUI();
  }

  initEvents() {
    const stopNav = (e, action) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.target && typeof e.target.blur === 'function') {
        e.target.blur();
      }
      action();
    };

    if (this.btn1) {
      this.btn1.addEventListener('click', (e) => stopNav(e, () => this.shoot(1)));
    }
    if (this.btn10) {
      this.btn10.addEventListener('click', (e) => stopNav(e, () => this.shoot(10)));
    }
    if (this.btn50) {
      this.btn50.addEventListener('click', (e) => stopNav(e, () => this.shoot(50)));
    }
    if (this.btnReset) {
      this.btnReset.addEventListener('click', (e) => stopNav(e, () => this.reset()));
    }
  }

  shoot(count) {
    this.hasRolled = true;
    for (let i = 0; i < count; i++) {
      const roll = 1 + Math.floor(Math.random() * 6);
      const isScore = roll <= 4;
      if (isScore) {
        this.scores++;
      } else {
        this.misses++;
      }
      this.lastRoll = roll;
      this.lastIsScore = isScore;
    }
    this.updateUI();
  }

  reset() {
    this.scores = 0;
    this.misses = 0;
    this.lastRoll = 3;
    this.lastIsScore = true;
    this.hasRolled = false;
    this.updateUI();
  }

  renderDieFaceSvg(val) {
    const size = 68;
    const dotR = 5;
    const c1 = 18;
    const c2 = 34;
    const c3 = 50;

    let dots = [];
    if (val === 1) {
      dots = [[c2, c2]];
    } else if (val === 2) {
      dots = [[c1, c1], [c3, c3]];
    } else if (val === 3) {
      dots = [[c1, c1], [c2, c2], [c3, c3]];
    } else if (val === 4) {
      dots = [[c1, c1], [c3, c1], [c1, c3], [c3, c3]];
    } else if (val === 5) {
      dots = [[c1, c1], [c3, c1], [c2, c2], [c1, c3], [c3, c3]];
    } else if (val === 6) {
      dots = [[c1, c1], [c3, c1], [c1, c2], [c3, c2], [c1, c3], [c3, c3]];
    }

    const dotsHtml = dots.map(([cx, cy]) => `
      <circle cx="${cx}" cy="${cy}" r="${dotR}" fill="#0f172a" />
    `).join('');

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <rect x="3" y="3" width="${size - 6}" height="${size - 6}" rx="10" fill="#ffffff" stroke="#0f172a" stroke-width="3" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.12))" />
        ${dotsHtml}
      </svg>
    `;
  }

  updateUI() {
    const total = this.scores + this.misses;
    const fraction = total > 0 ? this.scores / total : 0;
    const pct = (fraction * 100).toFixed(1);

    // 1. Die Column
    if (this.dieCol) {
      const dieSvg = this.renderDieFaceSvg(this.lastRoll);
      let outcomeBadge = '';
      if (!this.hasRolled) {
        outcomeBadge = `<span class="bball-outcome-badge waiting">Ready to shoot</span>`;
      } else if (this.lastIsScore) {
        outcomeBadge = `<span class="bball-outcome-badge score">🏀 SCORE! (Rolled ${this.lastRoll})</span>`;
      } else {
        outcomeBadge = `<span class="bball-outcome-badge miss">❌ MISS! (Rolled ${this.lastRoll})</span>`;
      }

      this.dieCol.innerHTML = `
        <div class="bball-die-container">
          <div class="bball-die-graphic">${dieSvg}</div>
          ${outcomeBadge}
        </div>
      `;
    }

    // 2. Scoreboard Column
    if (this.scoreCol) {
      this.scoreCol.innerHTML = `
        <div class="bball-scoreboard">
          <div class="bball-stats-grid">
            <div class="bball-stat-box score-box">
              <span class="bball-stat-title">Scores (1–4)</span>
              <span class="bball-stat-num"><strong>${this.scores}</strong></span>
              <span class="bball-stat-sub">Baskets Made</span>
            </div>
            <div class="bball-stat-box miss-box">
              <span class="bball-stat-title">Misses (5–6)</span>
              <span class="bball-stat-num"><strong>${this.misses}</strong></span>
              <span class="bball-stat-sub">Failed Attempts</span>
            </div>
            <div class="bball-stat-box total-box">
              <span class="bball-stat-title">Total Attempts</span>
              <span class="bball-stat-num"><strong>${total}</strong></span>
              <span class="bball-stat-sub">Target: 60 shots</span>
            </div>
          </div>

          <div class="bball-comparison-bar">
            <div class="bball-comp-row">
              <span class="bball-comp-label"><strong>Experimental Probability:</strong></span>
              <span class="bball-comp-val" style="color: var(--accent-green); font-weight: 700;">
                ${total > 0 ? `${this.scores}/${total} = ${pct}%` : '—'}
              </span>
            </div>
            <div class="bball-comp-row" style="font-size: 0.78rem; color: var(--text-secondary);">
              <span class="bball-comp-label">Die Mapping:</span>
              <span class="bball-comp-val">Rolls 1–4 = Score (4 faces) | Rolls 5–6 = Miss (2 faces)</span>
            </div>
          </div>
        </div>
      `;
    }
  }

  destroy() {
    // cleanup
  }
}
