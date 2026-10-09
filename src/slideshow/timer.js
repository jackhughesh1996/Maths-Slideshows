/**
 * @file timer.js
 * Classroom practice countdown timer component.
 * Allows teacher to adjust duration (presets: 3, 5, 10, 15 min, custom, +/- 1 min),
 * automatically pauses on slide navigation, preserves remaining time per slide,
 * resets to the teacher-configured duration, and alerts visually without alert dialogs.
 */

export class ClassroomTimer {
  /**
   * @param {HTMLElement} widgetElement - Container element for the timer widget
   */
  constructor(widgetElement) {
    this.widget = widgetElement;
    this.timeDisplay = widgetElement.querySelector('.timer-time');
    this.btnToggle = widgetElement.querySelector('.timer-btn-toggle');
    this.btnReset = widgetElement.querySelector('.timer-btn-reset');
    this.btnSettings = widgetElement.querySelector('.timer-btn-settings');
    this.btnMinus = widgetElement.querySelector('.timer-btn-minus');
    this.btnPlus = widgetElement.querySelector('.timer-btn-plus');
    this.popover = widgetElement.querySelector('.timer-popover');

    // Slide timer state store: slideIndex => { configuredMinutes: number, totalSeconds: number, remainingSeconds: number, isRunning: boolean }
    this.stateBySlide = new Map();
    this.currentSlideIndex = 0;
    this.intervalId = null;

    this.initEvents();
  }

  initEvents() {
    if (this.btnToggle) {
      this.btnToggle.addEventListener('click', () => this.toggle());
    }
    if (this.btnReset) {
      this.btnReset.addEventListener('click', () => this.reset());
    }

    // Toggle popover when clicking time display or settings gear
    if (this.timeDisplay) {
      this.timeDisplay.addEventListener('click', () => this.togglePopover());
      this.timeDisplay.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.togglePopover();
        }
      });
    }

    if (this.btnSettings) {
      this.btnSettings.addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePopover();
      });
    }

    // Quick +/- 1 minute buttons
    if (this.btnMinus) {
      this.btnMinus.addEventListener('click', () => this.adjustDuration(-60));
    }
    if (this.btnPlus) {
      this.btnPlus.addEventListener('click', () => this.adjustDuration(60));
    }

    // Popover preset buttons
    if (this.popover) {
      const presetButtons = this.popover.querySelectorAll('.timer-preset-btn');
      presetButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const minutes = Number(e.currentTarget.dataset.minutes);
          if (minutes > 0) {
            this.setDuration(minutes);
          }
        });
      });

      // Custom duration submit
      const customForm = this.popover.querySelector('.timer-custom-form');
      const customInput = this.popover.querySelector('.timer-custom-input');
      if (customForm && customInput) {
        customForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const val = parseInt(customInput.value, 10);
          if (!isNaN(val) && val >= 1 && val <= 99) {
            this.setDuration(val);
          }
        });
      }
    }

    // Close popover on outside click or Escape key
    this.onDocumentClick = (e) => {
      if (this.popover && !this.popover.hidden) {
        if (!this.widget.contains(e.target)) {
          this.closePopover();
        }
      }
    };

    this.onDocumentKeyDown = (e) => {
      if (e.key === 'Escape' && this.popover && !this.popover.hidden) {
        this.closePopover();
      }
    };

    document.addEventListener('click', this.onDocumentClick);
    document.addEventListener('keydown', this.onDocumentKeyDown);
  }

  togglePopover() {
    if (!this.popover) return;
    const isHidden = this.popover.hidden;
    if (isHidden) {
      this.openPopover();
    } else {
      this.closePopover();
    }
  }

  openPopover() {
    if (!this.popover) return;
    this.popover.hidden = false;
    this.popover.classList.add('open');

    // Sync custom input with current duration
    const state = this.getCurrentState();
    const customInput = this.popover.querySelector('.timer-custom-input');
    if (customInput && state) {
      customInput.value = state.configuredMinutes || Math.round(state.totalSeconds / 60);
      customInput.focus();
    }
  }

  closePopover() {
    if (!this.popover) return;
    this.popover.hidden = true;
    this.popover.classList.remove('open');
  }

  /**
   * Configure the timer when switching slides.
   * Pauses any running timer on slide change and restores remaining seconds if configured.
   *
   * @param {number} slideIndex
   * @param {number|null} [timerMinutes=null] - Duration configured in slide, or null if none
   */
  syncSlide(slideIndex, timerMinutes = null) {
    // Automatically pause current timer if running
    this.pause();
    this.closePopover();

    this.currentSlideIndex = slideIndex;

    if (timerMinutes && timerMinutes > 0) {
      this.widget.classList.add('visible');

      let state = this.stateBySlide.get(slideIndex);
      if (!state) {
        const total = Math.round(timerMinutes * 60);
        state = {
          configuredMinutes: timerMinutes,
          totalSeconds: total,
          remainingSeconds: total,
          isRunning: false
        };
        this.stateBySlide.set(slideIndex, state);
      }

      this.updateDisplay();
    } else {
      this.widget.classList.remove('visible');
    }
  }

  getCurrentState() {
    return this.stateBySlide.get(this.currentSlideIndex);
  }

  /**
   * Set teacher-configured duration in minutes for active slide.
   * @param {number} minutes
   */
  setDuration(minutes) {
    const state = this.getCurrentState();
    if (!state) return;

    this.pause();

    const total = Math.round(minutes * 60);
    state.configuredMinutes = minutes;
    state.totalSeconds = total;
    state.remainingSeconds = total;

    this.updateDisplay();
    this.closePopover();
  }

  /**
   * Increment or decrement duration by deltaSeconds (+60 or -60).
   * @param {number} deltaSeconds
   */
  adjustDuration(deltaSeconds) {
    const state = this.getCurrentState();
    if (!state) return;

    const newTotal = Math.max(60, state.totalSeconds + deltaSeconds);
    const diff = newTotal - state.totalSeconds;

    state.totalSeconds = newTotal;
    state.configuredMinutes = Math.round(newTotal / 60);
    state.remainingSeconds = Math.max(0, state.remainingSeconds + diff);

    this.updateDisplay();
  }

  toggle() {
    const state = this.getCurrentState();
    if (!state) return;

    if (state.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  start() {
    const state = this.getCurrentState();
    if (!state) return;

    this.closePopover();

    if (state.remainingSeconds <= 0) {
      state.remainingSeconds = state.totalSeconds;
    }

    state.isRunning = true;
    if (this.btnToggle) {
      this.btnToggle.textContent = '⏸';
      this.btnToggle.title = 'Pause Timer';
      this.btnToggle.setAttribute('aria-label', 'Pause Timer');
    }

    clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      if (state.remainingSeconds > 0) {
        state.remainingSeconds--;
        this.updateDisplay();
      } else {
        this.pause();
        this.updateDisplay();
      }
    }, 1000);
  }

  pause() {
    const state = this.getCurrentState();
    if (state) {
      state.isRunning = false;
    }
    if (this.btnToggle) {
      this.btnToggle.textContent = '▶';
      this.btnToggle.title = 'Start / Resume Timer';
      this.btnToggle.setAttribute('aria-label', 'Start Timer');
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset() {
    this.pause();
    const state = this.getCurrentState();
    if (!state) return;

    // Resets to the teacher's configured duration
    state.remainingSeconds = state.totalSeconds;
    this.updateDisplay();
  }

  updateDisplay() {
    const state = this.getCurrentState();
    if (!state || !this.timeDisplay) return;

    const m = Math.floor(state.remainingSeconds / 60);
    const s = state.remainingSeconds % 60;
    this.timeDisplay.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

    if (state.remainingSeconds === 0) {
      this.timeDisplay.classList.add('time-up');
      this.timeDisplay.title = "Time's up! Click to change duration or reset.";
    } else {
      this.timeDisplay.classList.remove('time-up');
      this.timeDisplay.title = `Click to configure timer (current: ${state.configuredMinutes || Math.round(state.totalSeconds / 60)} min)`;
    }
  }

  /**
   * Cleanup timer resources and event listeners on teardown.
   */
  destroy() {
    this.pause();
    this.closePopover();
    if (this.onDocumentClick) {
      document.removeEventListener('click', this.onDocumentClick);
    }
    if (this.onDocumentKeyDown) {
      document.removeEventListener('keydown', this.onDocumentKeyDown);
    }
  }
}

