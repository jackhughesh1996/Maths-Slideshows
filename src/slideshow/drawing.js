/**
 * @file drawing.js
 * Board annotation pen using Pointer Events (mouse, touch, stylus).
 * Isolates ink by slide and preserves annotations across window resize & fullscreen.
 */

export class BoardDrawing {
  /**
   * @param {HTMLCanvasElement} canvasElement
   * @param {HTMLElement} stageElement
   */
  constructor(canvasElement, stageElement) {
    this.canvas = canvasElement;
    this.stage = stageElement;
    this.ctx = canvasElement.getContext('2d');

    this.isPenActive = false;
    this.isDrawing = false;
    this.currentSlideIndex = 0;

    // Default pen style
    this.currentColor = '#dc2626'; // Red teacher ink
    this.currentLineWidth = 3.5;

    // Ink store: slideIndex => Array of strokes
    // Each stroke: { color: string, width: number, points: Array<{x: number, y: number}> }
    // Points are normalized 0..1 relative to canvas width/height to preserve ink on resize
    this.strokesBySlide = new Map();
    this.activeStroke = null;

    this.initEvents();
    this.resizeCanvas();
  }

  initEvents() {
    // Window resize & fullscreen change listeners
    this.onResize = () => this.resizeCanvas();
    this.onFullscreenChange = () => {
      // Small timeout allows CSS layout to settle after fullscreen transition
      setTimeout(() => this.resizeCanvas(), 50);
    };

    window.addEventListener('resize', this.onResize);
    document.addEventListener('fullscreenchange', this.onFullscreenChange);

    // Pointer events for drawing
    this.canvas.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
    this.canvas.addEventListener('pointermove', (e) => this.handlePointerMove(e));
    this.canvas.addEventListener('pointerup', (e) => this.handlePointerUp(e));
    this.canvas.addEventListener('pointercancel', (e) => this.handlePointerUp(e));
  }

  resizeCanvas() {
    if (!this.canvas || !this.stage) return;

    const rect = this.stage.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set canvas internal resolution to match display size * DPR
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);

    // Style size
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    this.redrawActiveSlide();
  }

  /**
   * Set active slide index and redraw annotations for that slide.
   * @param {number} slideIndex
   */
  setSlide(slideIndex) {
    this.currentSlideIndex = slideIndex;
    this.redrawActiveSlide();
  }

  /**
   * Toggle pen mode on or off.
   * @param {boolean} [forceState]
   * @returns {boolean} New pen state
   */
  togglePen(forceState) {
    this.isPenActive = typeof forceState === 'boolean' ? forceState : !this.isPenActive;
    document.body.classList.toggle('pen-active', this.isPenActive);
    return this.isPenActive;
  }

  /**
   * Set pen color.
   * @param {string} color
   */
  setColor(color) {
    this.currentColor = color;
  }

  /**
   * Clear ink strokes only for the currently active slide.
   */
  clearActiveSlideInk() {
    this.strokesBySlide.set(this.currentSlideIndex, []);
    this.redrawActiveSlide();
  }

  /**
   * Get normalized coordinate (0 to 1) from PointerEvent.
   * @param {PointerEvent} e
   */
  getNormalizedPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    return { x, y };
  }

  handlePointerDown(e) {
    if (!this.isPenActive) return;

    // Only respond to primary buttons (left click or stylus tip or touch)
    if (e.button !== 0) return;

    this.isDrawing = true;
    try {
      this.canvas.setPointerCapture(e.pointerId);
    } catch (_) {
      // Ignore in environments where pointer capture is unsupported
    }

    const pos = this.getNormalizedPos(e);
    this.activeStroke = {
      color: this.currentColor,
      width: this.currentLineWidth,
      points: [pos]
    };

    let strokes = this.strokesBySlide.get(this.currentSlideIndex);
    if (!strokes) {
      strokes = [];
      this.strokesBySlide.set(this.currentSlideIndex, strokes);
    }
    strokes.push(this.activeStroke);

    this.redrawActiveSlide();
  }

  handlePointerMove(e) {
    if (!this.isDrawing || !this.isPenActive || !this.activeStroke) return;

    const pos = this.getNormalizedPos(e);
    this.activeStroke.points.push(pos);
    this.redrawActiveSlide();
  }

  handlePointerUp(e) {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.activeStroke = null;

    if (e.pointerId) {
      try {
        this.canvas.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  }

  redrawActiveSlide() {
    if (!this.ctx || !this.canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    // Reset transformations and scale for DPR
    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
    this.ctx.clearRect(0, 0, rect.width, rect.height);

    const strokes = this.strokesBySlide.get(this.currentSlideIndex) || [];
    if (strokes.length === 0) return;

    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    for (const stroke of strokes) {
      if (!stroke.points || stroke.points.length === 0) continue;

      this.ctx.strokeStyle = stroke.color;
      this.ctx.lineWidth = stroke.width;

      if (stroke.points.length === 1) {
        // Draw single dot
        const pt = stroke.points[0];
        const x = pt.x * rect.width;
        const y = pt.y * rect.height;
        this.ctx.beginPath();
        this.ctx.arc(x, y, stroke.width / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = stroke.color;
        this.ctx.fill();
        continue;
      }

      this.ctx.beginPath();
      const first = stroke.points[0];
      this.ctx.moveTo(first.x * rect.width, first.y * rect.height);

      for (let i = 1; i < stroke.points.length; i++) {
        const pt = stroke.points[i];
        this.ctx.lineTo(pt.x * rect.width, pt.y * rect.height);
      }
      this.ctx.stroke();
    }
  }

  /**
   * Cleanup drawing listeners and state on teardown.
   */
  destroy() {
    this.togglePen(false);
    if (this.onResize) {
      window.removeEventListener('resize', this.onResize);
    }
    if (this.onFullscreenChange) {
      document.removeEventListener('fullscreenchange', this.onFullscreenChange);
    }
    document.body.classList.remove('pen-active');
  }
}

