/**
 * @file engine.js
 * The core presentation engine: orchestrates slide rendering, keyboard navigation,
 * progressive reveals, reveal state persistence, drawing ink, timer, and fullscreen.
 */

import { renderSlide } from './renderer.js';
import { BoardDrawing } from './drawing.js';
import { ClassroomTimer } from './timer.js';
import { openTeacherTools } from '../tools/teacherToolsModal.js';

export class SlideshowEngine {
  /**
   * @param {Object} lesson - Structured lesson data object
   * @param {HTMLElement} container - DOM mount element
   */
  constructor(lesson, container) {
    this.lesson = lesson;
    this.container = container;

    this.currentSlideIndex = 0;
    this.totalSlides = (lesson.slides || []).length;

    // Preserve reveal state separately for each slide!
    // revealState[i] = number of revealed items on slide i
    this.revealState = new Array(this.totalSlides).fill(0);

    // Active slide elements cache
    this.slideElements = [];

    // Sub-components
    this.drawing = null;
    this.timer = null;

    this.initDOM();
    this.initSubsystems();
    this.initEvents();

    this.goToSlide(0);
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="presentation-view">
        <!-- TOP HEADER -->
        <header class="pres-header">
          <div class="pres-header-left">
            <button class="btn btn-nav-home" id="btnBackToLibrary" title="Return to Lesson Library">
              ← Library
            </button>
            <div class="pres-lesson-title">
              <span class="lesson-code-badge">${this.lesson.id || ''}</span>
              <span>${this.lesson.title || ''}</span>
            </div>
          </div>
          <div class="pres-header-right">
            <!-- Unobtrusive Teacher Pacing Guide & Lesson Phase -->
            <div class="pres-pacing-container" id="presPacingContainer" aria-label="Lesson pacing guide"></div>
            <button type="button" class="btn btn-sm btn-nav-tools" id="btnPresTeacherTools" title="Teacher Tools: Random Student & Teams">
              👥 Tools
            </button>
            <div class="pres-progress-container">
              <div class="pres-progress-bar">
                <div class="pres-progress-fill" id="presProgressFill"></div>
              </div>
              <div class="pres-slide-counter" id="presSlideCounter">1 / ${this.totalSlides}</div>
            </div>
          </div>
        </header>

        <!-- STAGE & VIEWPORT -->
        <main class="pres-stage" id="presStage">
          <div class="pres-slide-viewport" id="slideViewport">
            <!-- Slides will be mounted here -->
          </div>
          <canvas id="drawingCanvas"></canvas>
        </main>

        <!-- BOTTOM CONTROLS FOOTER -->
        <footer class="pres-footer">
          <div class="pres-footer-left">
            <button class="btn" id="btnPrevSlide" title="Previous reveal step or slide (Left Arrow)" aria-label="Previous reveal or slide">
              ◀ Previous
            </button>
            <button class="btn btn-primary" id="btnNextSlide" title="Next reveal step or slide (Spacebar / Right Arrow)" aria-label="Next reveal or slide">
              Next ▶
            </button>
            <!-- Reveal-Step Indicator -->
            <div class="step-indicator" id="presStepIndicator" role="status" aria-live="polite"></div>
          </div>

          <div class="pres-footer-center">
            <!-- Classroom Practice Timer Widget with Teacher Configuration -->
            <div class="timer-widget" id="presTimerWidget">
              <span style="font-size: 0.95rem;" aria-hidden="true">⏱️</span>
              <button class="timer-btn timer-btn-adjust timer-btn-minus" title="Subtract 1 minute" aria-label="Subtract 1 minute">−1m</button>
              <span class="timer-time" role="button" tabindex="0" title="Click to configure timer duration">00:00</span>
              <button class="timer-btn timer-btn-adjust timer-btn-plus" title="Add 1 minute" aria-label="Add 1 minute">+1m</button>
              <button class="timer-btn timer-btn-settings" title="Configure timer duration" aria-label="Configure timer duration">⚙️</button>
              <button class="timer-btn timer-btn-toggle" title="Start / Resume Timer" aria-label="Start Timer">▶</button>
              <button class="timer-btn timer-btn-reset" title="Reset Timer" aria-label="Reset Timer">↺</button>

              <!-- Timer Duration Configuration Popover -->
              <div class="timer-popover" id="timerPopover" hidden>
                <div class="timer-popover-title">Timer Duration</div>
                <div class="timer-presets-row">
                  <button type="button" class="btn btn-sm timer-preset-btn" data-minutes="3">3 min</button>
                  <button type="button" class="btn btn-sm timer-preset-btn" data-minutes="5">5 min</button>
                  <button type="button" class="btn btn-sm timer-preset-btn" data-minutes="10">10 min</button>
                  <button type="button" class="btn btn-sm timer-preset-btn" data-minutes="15">15 min</button>
                  <button type="button" class="btn btn-sm timer-preset-btn" data-minutes="20">20 min</button>
                </div>
                <form class="timer-custom-form">
                  <label class="timer-custom-label">
                    <span>Custom:</span>
                    <input type="number" min="1" max="99" class="timer-custom-input" value="10" />
                    <span>min</span>
                  </label>
                  <button type="submit" class="btn btn-sm btn-primary">Set</button>
                </form>
              </div>
            </div>
          </div>

          <div class="pres-footer-right">
            <!-- Drawing Pen Controls -->
            <div class="pen-controls">
              <button class="btn btn-sm btn-pen-toggle" id="btnTogglePen" title="Toggle interactive board pen (P)">
                ✏️ Pen
              </button>
              <button class="pen-color-btn active" data-color="#dc2626" style="background-color: #dc2626;" title="Red"></button>
              <button class="pen-color-btn" data-color="#2563eb" style="background-color: #2563eb;" title="Blue"></button>
              <button class="pen-color-btn" data-color="#16a34a" style="background-color: #16a34a;" title="Green"></button>
              <button class="btn btn-sm" id="btnClearInk" title="Clear annotations on this slide" style="padding: 3px 8px; font-size: 0.78rem;">
                Clear
              </button>
            </div>

            <button class="btn" id="btnToggleFullscreen" title="Toggle Fullscreen (F)">
              ⛶ Fullscreen
            </button>
          </div>
        </footer>
      </div>
    `;

    // Mount slides
    const viewport = this.container.querySelector('#slideViewport');
    (this.lesson.slides || []).forEach((slideData, idx) => {
      const slideEl = renderSlide(slideData, idx);
      viewport.appendChild(slideEl);
      this.slideElements.push(slideEl);
    });

    // Cache elements
    this.progressFill = this.container.querySelector('#presProgressFill');
    this.slideCounter = this.container.querySelector('#presSlideCounter');
    this.btnPrev = this.container.querySelector('#btnPrevSlide');
    this.btnNext = this.container.querySelector('#btnNextSlide');
    this.btnFullscreen = this.container.querySelector('#btnToggleFullscreen');
    this.btnBack = this.container.querySelector('#btnBackToLibrary');
    this.btnTeacherTools = this.container.querySelector('#btnPresTeacherTools');
    this.btnPen = this.container.querySelector('#btnTogglePen');
    this.btnClearInk = this.container.querySelector('#btnClearInk');
    this.stepIndicator = this.container.querySelector('#presStepIndicator');
    this.pacingContainer = this.container.querySelector('#presPacingContainer');
  }

  initSubsystems() {
    // 1. Drawing
    const canvas = this.container.querySelector('#drawingCanvas');
    const stage = this.container.querySelector('#presStage');
    if (canvas && stage) {
      this.drawing = new BoardDrawing(canvas, stage);
    }

    // 2. Timer
    const timerWidget = this.container.querySelector('#presTimerWidget');
    if (timerWidget) {
      this.timer = new ClassroomTimer(timerWidget);
    }
  }

  initEvents() {
    // Buttons
    this.btnNext.addEventListener('click', () => this.handleNext());
    this.btnPrev.addEventListener('click', () => this.handlePrev());
    this.btnFullscreen.addEventListener('click', () => this.toggleFullscreen());
    this.btnBack.addEventListener('click', () => this.exitToLibrary());
    if (this.btnTeacherTools) {
      this.btnTeacherTools.addEventListener('click', () => openTeacherTools());
    }

    // Summary slide return button (if present)
    const summaryBtn = this.container.querySelector('.btn-summary-return');
    if (summaryBtn) {
      summaryBtn.addEventListener('click', () => this.exitToLibrary());
    }

    // Pen button & color pickers
    if (this.btnPen) {
      this.btnPen.addEventListener('click', () => {
        const isActive = this.drawing.togglePen();
        this.btnPen.classList.toggle('active', isActive);
      });
    }

    if (this.btnClearInk) {
      this.btnClearInk.addEventListener('click', () => {
        this.drawing.clearActiveSlideInk();
      });
    }

    const colorButtons = this.container.querySelectorAll('.pen-color-btn');
    colorButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        colorButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const color = btn.dataset.color || '#dc2626';
        this.drawing.setColor(color);
        // Automatically turn on pen if not already
        if (!this.drawing.isPenActive) {
          this.drawing.togglePen(true);
          this.btnPen.classList.add('active');
        }
      });
    });

    // Keyboard navigation
    this.handleKeyDown = (e) => {
      // Don't intercept if focus is inside an input, textarea, or teacher tools panel is open
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (document.body.classList.contains('teacher-tools-open')) return;

      switch (e.key) {
        case ' ':
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault();
          this.handleNext();
          break;

        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          this.handlePrev();
          break;

        case 'f':
        case 'F':
          // Toggle fullscreen
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            this.toggleFullscreen();
          }
          break;

        case 'p':
        case 'P':
          // Toggle pen
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            const active = this.drawing.togglePen();
            this.btnPen.classList.toggle('active', active);
          }
          break;
      }
    };

    window.addEventListener('keydown', this.handleKeyDown);
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;

    window.removeEventListener('keydown', this.handleKeyDown);

    if (this.timer) {
      this.timer.destroy();
      this.timer = null;
    }

    if (this.drawing) {
      this.drawing.destroy();
      this.drawing = null;
    }
  }

  getSlideRevealSteps() {
    const currentSlideEl = this.slideElements[this.currentSlideIndex];
    if (!currentSlideEl) return { totalSteps: 0, stepNumbers: [], itemsByStep: new Map(), hasCustomSteps: false };

    const items = Array.from(currentSlideEl.querySelectorAll('.reveal-item'));
    if (items.length === 0) return { totalSteps: 0, stepNumbers: [], itemsByStep: new Map(), hasCustomSteps: false };

    // Check if any items declare explicit data-reveal-step
    const hasCustomSteps = items.some((el) => el.dataset.revealStep !== undefined);

    if (hasCustomSteps) {
      const stepSet = new Set();
      items.forEach((el) => {
        const s = el.dataset.revealStep !== undefined ? Number(el.dataset.revealStep) : 1;
        stepSet.add(s);
      });
      const stepNumbers = Array.from(stepSet).sort((a, b) => a - b);

      const itemsByStep = new Map();
      stepNumbers.forEach((s) => itemsByStep.set(s, []));
      items.forEach((el) => {
        const s = el.dataset.revealStep !== undefined ? Number(el.dataset.revealStep) : 1;
        if (!itemsByStep.has(s)) itemsByStep.set(s, []);
        itemsByStep.get(s).push(el);
      });

      return {
        totalSteps: stepNumbers.length,
        stepNumbers,
        itemsByStep,
        hasCustomSteps: true
      };
    }

    // Default: 1..N sequential steps in DOM order
    const stepNumbers = items.map((_, idx) => idx + 1);
    const itemsByStep = new Map();
    items.forEach((el, idx) => {
      itemsByStep.set(idx + 1, [el]);
    });

    return {
      totalSteps: items.length,
      stepNumbers,
      itemsByStep,
      hasCustomSteps: false
    };
  }

  getActiveReveals() {
    const currentSlideEl = this.slideElements[this.currentSlideIndex];
    if (!currentSlideEl) return [];
    return Array.from(currentSlideEl.querySelectorAll('.reveal-item'));
  }

  applyRevealState() {
    const { totalSteps, stepNumbers, itemsByStep } = this.getSlideRevealSteps();
    const count = this.revealState[this.currentSlideIndex] || 0;

    // Apply reveal visibility to elements
    stepNumbers.forEach((s, idx) => {
      const isRevealed = idx < count;
      const elements = itemsByStep.get(s) || [];
      elements.forEach((el) => {
        el.classList.toggle('is-revealed', isRevealed);
        if (el.parentElement) {
          el.parentElement.classList.toggle('has-revealed-answer', isRevealed);
        }
      });
    });

    // Synchronize active category / active row highlights
    const currentSlideEl = this.slideElements[this.currentSlideIndex];
    if (currentSlideEl) {
      const activeStepNum = count > 0 && count <= totalSteps ? stepNumbers[count - 1] : null;
      const activeElements = activeStepNum ? (itemsByStep.get(activeStepNum) || []) : [];
      const activeCategory = activeElements.find((el) => el.dataset.category)?.dataset?.category || null;

      currentSlideEl.querySelectorAll('[data-category-target]').forEach((targetEl) => {
        targetEl.classList.toggle('is-active-category', Boolean(activeCategory && targetEl.dataset.categoryTarget === activeCategory));
      });

      currentSlideEl.querySelectorAll('.sector-construction-group').forEach((groupEl) => {
        groupEl.classList.toggle('is-active-sector', Boolean(activeCategory && groupEl.dataset.category === activeCategory));
      });
    }

    // Dynamic Step Indicator
    if (this.stepIndicator) {
      const isLastSlide = this.currentSlideIndex >= this.totalSlides - 1;

      if (totalSteps > 0) {
        let dotsHtml = '';
        for (let i = 0; i < totalSteps; i++) {
          dotsHtml += `<span class="step-dot ${i < count ? 'filled' : ''}" title="Step ${i + 1} of ${totalSteps}"></span>`;
        }
        const dotsClass = count === totalSteps ? 'step-dots all-complete' : 'step-dots';

        let wording = '';
        if (count === 0) {
          wording = `${totalSteps} reveals`;
        } else if (count < totalSteps) {
          wording = `${count} of ${totalSteps}`;
        } else {
          wording = isLastSlide ? 'All shown · End of lesson' : 'All shown · → next slide';
        }

        const textClass = count === totalSteps ? 'step-text complete' : 'step-text';

        this.stepIndicator.innerHTML = `
          <div class="${dotsClass}" aria-hidden="true">${dotsHtml}</div>
          <span class="${textClass}">${wording}</span>
        `;
      } else {
        const text = isLastSlide
          ? 'No reveals · End of lesson'
          : 'No reveals · → next slide';
        this.stepIndicator.innerHTML = `<span class="step-text">${text}</span>`;
      }
    }

    // Dynamic Next button label, title, and accessibility label
    if (count < totalSteps) {
      this.btnNext.innerHTML = 'Reveal Step ▶';
      this.btnNext.title = `Reveal step ${count + 1} of ${totalSteps} (Spacebar / Right Arrow)`;
      this.btnNext.setAttribute('aria-label', `Reveal step ${count + 1} of ${totalSteps}`);
    } else if (this.currentSlideIndex < this.totalSlides - 1) {
      this.btnNext.innerHTML = 'Next Slide ▶';
      this.btnNext.title = 'Advance to next slide (Spacebar / Right Arrow)';
      this.btnNext.setAttribute('aria-label', 'Advance to next slide');
    } else {
      this.btnNext.innerHTML = 'End of Lesson ✔';
      this.btnNext.title = 'End of lesson';
      this.btnNext.setAttribute('aria-label', 'End of lesson reached');
    }

    // Dynamic Previous button title and accessibility label
    if (count > 0) {
      this.btnPrev.title = `Hide previous reveal step (${count} of ${totalSteps}) (Left Arrow)`;
      this.btnPrev.setAttribute('aria-label', `Step back to step ${count - 1} of ${totalSteps}`);
    } else if (this.currentSlideIndex > 0) {
      this.btnPrev.title = 'Go to previous slide (Left Arrow)';
      this.btnPrev.setAttribute('aria-label', 'Go to previous slide');
    } else {
      this.btnPrev.title = 'Beginning of lesson (Left Arrow)';
      this.btnPrev.setAttribute('aria-label', 'Beginning of lesson');
    }

    // Check for overflow on reveals as well
    this.checkSlideOverflow(this.currentSlideIndex);
  }

  handleNext() {
    const { totalSteps } = this.getSlideRevealSteps();
    const currentCount = this.revealState[this.currentSlideIndex] || 0;

    if (currentCount < totalSteps) {
      // Reveal next hidden item on this slide
      this.revealState[this.currentSlideIndex]++;
      this.applyRevealState();
    } else if (this.currentSlideIndex < this.totalSlides - 1) {
      // Advance to next slide
      this.goToSlide(this.currentSlideIndex + 1);
    }
  }

  handlePrev() {
    const currentCount = this.revealState[this.currentSlideIndex] || 0;

    if (currentCount > 0) {
      // Step back one reveal on this slide
      this.revealState[this.currentSlideIndex]--;
      this.applyRevealState();
    } else if (this.currentSlideIndex > 0) {
      // Return to previous slide (its revealed state remains intact!)
      this.goToSlide(this.currentSlideIndex - 1);
    }
  }

  goToSlide(newIndex) {
    if (newIndex < 0 || newIndex >= this.totalSlides) return;

    // Deactivate previous slide
    const prevSlideEl = this.slideElements[this.currentSlideIndex];
    if (prevSlideEl) prevSlideEl.classList.remove('active');

    this.currentSlideIndex = newIndex;

    // Activate new slide
    const nextSlideEl = this.slideElements[this.currentSlideIndex];
    if (nextSlideEl) nextSlideEl.classList.add('active');

    // 1. Restore preserved reveal state for this slide
    this.applyRevealState();

    // 2. Sync progress & header counter
    this.updateHeader();

    // 3. Sync drawing surface
    if (this.drawing) {
      this.drawing.setSlide(this.currentSlideIndex);
    }

    // 4. Sync classroom timer
    if (this.timer) {
      const slideData = this.lesson.slides[this.currentSlideIndex];
      this.timer.syncSlide(this.currentSlideIndex, slideData ? slideData.timerMinutes : null);
    }

    // 5. Development-only slide overflow audit check
    this.checkSlideOverflow(this.currentSlideIndex);
  }

  /**
   * Development-only overflow audit.
   * Logs a warning to the developer console if a slide or card exceeds its available content area.
   * Does NOT show technical warnings to students in production presentation mode.
   */
  checkSlideOverflow(slideIndex) {
    if (typeof window === 'undefined') return;

    // Run in development / local environment or preview
    const isDev = window.location.hostname === 'localhost' ||
                  window.location.hostname === '127.0.0.1' ||
                  window.location.port !== '' ||
                  Boolean(import.meta.env?.DEV);

    if (!isDev) return;

    requestAnimationFrame(() => {
      const slideEl = this.slideElements[slideIndex];
      if (!slideEl || !slideEl.classList.contains('active')) return;

      const tolerance = 4;
      let hasOverflow = false;

      // Check whole slide container height
      if (slideEl.scrollHeight > slideEl.clientHeight + tolerance) {
        hasOverflow = true;
      }

      // Check each internal card container
      const cards = slideEl.querySelectorAll('.card');
      for (const card of cards) {
        if (card.scrollHeight > card.clientHeight + tolerance) {
          hasOverflow = true;
          break;
        }
      }

      if (hasOverflow) {
        console.warn(`[Overflow warning] Lesson ${this.lesson.id} slide ${slideIndex + 1} exceeds available height.`);
      }
    });
  }

  updateHeader() {
    this.slideCounter.textContent = `${this.currentSlideIndex + 1} / ${this.totalSlides}`;
    const pct = ((this.currentSlideIndex + 1) / this.totalSlides) * 100;
    this.progressFill.style.width = `${pct}%`;

    // Unobtrusive Teacher Pacing & Phase Guide
    if (this.pacingContainer) {
      const slideData = this.lesson.slides && this.lesson.slides[this.currentSlideIndex];
      const phase = slideData ? slideData.phase : null;
      const targetMin = slideData ? slideData.estimatedMinutes : null;

      if (phase || targetMin != null) {
        let html = '';
        if (phase) {
          const phaseSlug = String(phase).toLowerCase().replace(/\s+/g, '-');
          const phaseLabel = String(phase).charAt(0).toUpperCase() + String(phase).slice(1);
          html += `<span class="pacing-phase-badge pacing-phase-${phaseSlug}">${phaseLabel}</span>`;
        }
        if (targetMin != null) {
          html += `<span class="pacing-target-time" title="Teacher pacing guide: ~${targetMin} minutes">Target: ~${targetMin} min</span>`;
        }
        this.pacingContainer.innerHTML = html;
        this.pacingContainer.style.display = 'inline-flex';
      } else {
        this.pacingContainer.innerHTML = '';
        this.pacingContainer.style.display = 'none';
      }
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  exitToLibrary() {
    this.destroy();

    // Check if mounted in a dedicated static lesson page container
    const isStaticLessonPage = Boolean(
      this.container?.getAttribute('data-lesson-id') ||
      this.container?.closest?.('[data-lesson-id]')
    );

    if (isStaticLessonPage) {
      let pathname = window.location.pathname;
      if (!pathname.endsWith('/')) {
        if (/\.[a-zA-Z0-9]+$/.test(pathname)) {
          pathname = pathname.substring(0, pathname.lastIndexOf('/') + 1);
        } else {
          pathname += '/';
        }
      }
      const libraryUrl = new URL('../../', new URL(pathname, window.location.origin)).href;
      window.location.assign(libraryUrl);
      return;
    }

    // Legacy single-page app behavior: update URL query parameters cleanly
    const url = new URL(window.location.href);
    url.searchParams.delete('lesson');
    window.history.pushState({}, '', url.toString());
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}
