/**
 * @file test-fraction-area-model.mjs
 * Automated unit and regression tests for fraction-area-model content block,
 * verifying SVG grid geometry, cell areas, reveal steps, mathematical consistency, and input validation.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import {
  CANONICAL_BLOCK_TYPES,
  BLOCK_TYPE_ALIASES,
  isSupportedBlockType,
  normalizeBlockType
} from '../src/slideshow/blockTypes.js';

import { validateLesson } from '../src/slideshow/validator.js';
import {
  parseFraction,
  parseFractionModelData,
  gcd,
  MAX_FRACTION_DENOMINATOR
} from '../src/slideshow/fractionModelUtils.js';

// Load KaTeX-free math module for Node testing
const mathUrl = new URL('../src/slideshow/math.js', import.meta.url);
let mathSource = await readFile(mathUrl, 'utf8');
mathSource = mathSource
  .replace("import katex from 'katex';", `import katex from ${JSON.stringify(import.meta.resolve('katex'))};`)
  .replace("from './mathExpressions.js'", `from ${JSON.stringify(import.meta.resolve('../src/slideshow/mathExpressions.js'))}`)
  .replace("import 'katex/dist/katex.min.css';", '');

const asModule = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const mathMod = asModule(mathSource);

let fractionAreaSource = await readFile(new URL('../src/slideshow/fractionAreaMarkup.js', import.meta.url), 'utf8');
fractionAreaSource = fractionAreaSource
  .replace("from './math.js'", `from ${JSON.stringify(mathMod)}`)
  .replace("from './fractionModelUtils.js'", `from ${JSON.stringify(new URL('../src/slideshow/fractionModelUtils.js', import.meta.url).href)}`);
const { renderFractionAreaModelBlock } = await import(asModule(fractionAreaSource));

function makeLesson(slideObj) {
  return {
    id: 'TEST-FAM',
    title: 'Fraction Area Model Test Lesson',
    slides: [slideObj]
  };
}

function parseSvgRects(html, className) {
  const rectRegex = new RegExp(`<rect[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>`, 'g');
  const matches = [...html.matchAll(rectRegex)].map(([tag]) => tag);
  return matches.map((tag) => {
    const x = parseFloat(tag.match(/\bx="([^"]+)"/)?.[1] || '0');
    const y = parseFloat(tag.match(/\by="([^"]+)"/)?.[1] || '0');
    const width = parseFloat(tag.match(/\bwidth="([^"]+)"/)?.[1] || '0');
    const height = parseFloat(tag.match(/\bheight="([^"]+)"/)?.[1] || '0');
    const row = tag.match(/\bdata-row="([^"]+)"/)?.[1];
    const col = tag.match(/\bdata-col="([^"]+)"/)?.[1];
    return { tag, x, y, width, height, row, col };
  });
}

// ---------------------------------------------------------------------------
// 1. Block Type Registration
// ---------------------------------------------------------------------------

test('fraction-area-model is registered in canonical block types and aliases', () => {
  assert.ok(CANONICAL_BLOCK_TYPES.includes('fraction-area-model'));
  assert.equal(isSupportedBlockType('fraction-area-model'), true);
  assert.equal(isSupportedBlockType('fraction-model'), true);
  assert.equal(normalizeBlockType('fraction-model'), 'fraction-area-model');
  assert.equal(normalizeBlockType(' fraction-area-model '), 'fraction-area-model');
});

// ---------------------------------------------------------------------------
// 2. Geometry & Mathematical Representation Tests
// ---------------------------------------------------------------------------

test('1/3 × 2/3 generates a 3×3 grid, with exactly 2 overlapping cells and answer 2/9', () => {
  const block = {
    type: 'fraction-area-model',
    fraction1: '1/3',
    fraction2: '2/3'
  };

  const html = renderFractionAreaModelBlock(block);

  // Check container metadata
  assert.ok(html.includes('data-rows="3"'), 'Must have 3 rows');
  assert.ok(html.includes('data-cols="3"'), 'Must have 3 columns');
  assert.ok(html.includes('data-total-cells="9"'), 'Must have 9 total cells');
  assert.ok(html.includes('data-overlap-cells="2"'), 'Must have 2 overlapping cells');

  // Verify all 9 grid cells have genuine rectangle geometry and equal area
  const cells = parseSvgRects(html, 'area-model-cell');
  assert.equal(cells.length, 9, 'Must generate exactly 9 base grid cells');
  const firstCellArea = cells[0].width * cells[0].height;
  assert.ok(firstCellArea > 0, 'Cell area must be positive');
  for (const cell of cells) {
    const area = cell.width * cell.height;
    assert.equal(area, firstCellArea, 'All 9 cells must have strictly equal area');
    assert.equal(cell.width, cells[0].width, 'All cells must have equal width');
    assert.equal(cell.height, cells[0].height, 'All cells must have equal height');
  }

  // Verify column shading (2 full columns in blue)
  const cols = parseSvgRects(html, 'model-column-rect');
  assert.equal(cols.length, 2, 'Must shade exactly 2 columns');
  assert.ok(html.includes('2/3 (2 columns)'), 'Must label 2/3 columns');

  // Verify row shading (1 complete row in green)
  const rows = parseSvgRects(html, 'model-row-rect');
  assert.equal(rows.length, 1, 'Must shade exactly 1 row');
  assert.ok(html.includes('1/3 (1 row)'), 'Must label 1/3 row');

  // Verify overlapping cells (exactly 2 cells highlighted in purple)
  const overlaps = parseSvgRects(html, 'overlap-cell');
  assert.equal(overlaps.length, 2, 'Must have exactly 2 overlapping cells');
  assert.equal(overlaps[0].row, '0');
  assert.equal(overlaps[0].col, '0');
  assert.equal(overlaps[1].row, '0');
  assert.equal(overlaps[1].col, '1');

  // Verify purple color
  assert.ok(html.includes('fill="#7c3aed"'), 'Must highlight overlapping cells in purple');

  // Verify final equation contains 2/9
  assert.ok(html.includes('data-product="2/9"'), 'Must have data-product="2/9"');
  assert.ok(html.includes('data-equation="\\frac{1}{3} \\times \\frac{2}{3}'), 'Must format correct multiplication LaTeX');
});

test('1/2 × 3/4 generates a 2×4 grid, with exactly 3 overlapping cells and answer 3/8', () => {
  const block = {
    type: 'fraction-area-model',
    fraction1: { numerator: 1, denominator: 2 },
    fraction2: { numerator: 3, denominator: 4 }
  };

  const html = renderFractionAreaModelBlock(block);

  assert.ok(html.includes('data-rows="2"'));
  assert.ok(html.includes('data-cols="4"'));
  assert.ok(html.includes('data-total-cells="8"'));
  assert.ok(html.includes('data-overlap-cells="3"'));

  const cells = parseSvgRects(html, 'area-model-cell');
  assert.equal(cells.length, 8, 'Must generate exactly 8 base grid cells');
  const firstCellArea = cells[0].width * cells[0].height;
  for (const cell of cells) {
    assert.equal(cell.width * cell.height, firstCellArea, 'All 8 cells must have strictly equal area');
  }

  const overlaps = parseSvgRects(html, 'overlap-cell');
  assert.equal(overlaps.length, 3, 'Must have exactly 3 overlapping cells');

  assert.ok(html.includes('data-product="3/8"'), 'Equation must show product 3/8');
});

test('2/3 × 4/5 generates a 3×5 grid, with exactly 8 overlapping cells and answer 8/15', () => {
  const block = {
    type: 'fraction-area-model',
    fractions: ['2/3', '4/5']
  };

  const html = renderFractionAreaModelBlock(block);

  assert.ok(html.includes('data-rows="3"'));
  assert.ok(html.includes('data-cols="5"'));
  assert.ok(html.includes('data-total-cells="15"'));
  assert.ok(html.includes('data-overlap-cells="8"'));

  const cells = parseSvgRects(html, 'area-model-cell');
  assert.equal(cells.length, 15);

  const overlaps = parseSvgRects(html, 'overlap-cell');
  assert.equal(overlaps.length, 8);
  assert.ok(html.includes('data-product="8/15"'), 'Equation must show product 8/15');
});

// ---------------------------------------------------------------------------
// 3. Progressive Reveal Stages Tests
// ---------------------------------------------------------------------------

test('all expected reveal stages exist in default sequential order (1 to 4)', () => {
  const block = {
    type: 'fraction-area-model',
    fraction1: '1/3',
    fraction2: '2/3'
  };

  const html = renderFractionAreaModelBlock(block);

  // Stage 1: Column shading
  assert.ok(html.includes('class="reveal-item model-column-shading" data-reveal-step="1"'),
    'Stage 1 must reveal column shading');

  // Stage 2: Row shading
  assert.ok(html.includes('class="reveal-item model-row-shading" data-reveal-step="2"'),
    'Stage 2 must reveal row shading');

  // Stage 3: Overlapping cells
  assert.ok(html.includes('class="reveal-item model-overlap-shading" data-reveal-step="3"'),
    'Stage 3 must reveal overlapping cells in purple');

  // Stage 4: Equation underneath diagram
  assert.ok(html.includes('class="reveal-item fraction-model-equation" data-reveal-step="4"'),
    'Stage 4 must reveal equation and answer');

  // Base grid must NOT have reveal-item (visible at initial state step 0)
  assert.ok(html.includes('<g class="model-base-grid">'), 'Base grid must be permanent');
  assert.ok(!html.includes('class="reveal-item model-base-grid"'), 'Base grid must not be hidden in reveal step');
});

test('respects custom startStep (e.g. startStep: 3 yields steps 3, 4, 5, 6)', () => {
  const block = {
    type: 'fraction-area-model',
    fraction1: '1/3',
    fraction2: '2/3',
    startStep: 3
  };

  const html = renderFractionAreaModelBlock(block);

  assert.ok(html.includes('data-reveal-step="3"'), 'Step 1 should map to startStep 3');
  assert.ok(html.includes('data-reveal-step="4"'), 'Step 2 should map to startStep 4');
  assert.ok(html.includes('data-reveal-step="5"'), 'Step 3 should map to startStep 5');
  assert.ok(html.includes('data-reveal-step="6"'), 'Step 4 should map to startStep 6');
});

test('non-progressive mode (progressive: false) shows all layers without reveal items', () => {
  const block = {
    type: 'fraction-area-model',
    fraction1: '1/3',
    fraction2: '2/3',
    progressive: false
  };

  const html = renderFractionAreaModelBlock(block);

  assert.ok(!html.includes('data-reveal-step='), 'No data-reveal-step when progressive is false');
  assert.ok(!html.includes('class="reveal-item'), 'No reveal-item classes on internal layers');
  assert.ok(html.includes('class="model-column-shading"'));
  assert.ok(html.includes('class="model-row-shading"'));
  assert.ok(html.includes('class="model-overlap-shading"'));
});

// ---------------------------------------------------------------------------
// 4. SVG Geometry and Accessibility Standards
// ---------------------------------------------------------------------------

test('SVG output uses genuine rectangle geometry and responsive viewBox without tables or square characters', () => {
  const block = {
    type: 'fraction-area-model',
    fraction1: '1/3',
    fraction2: '2/3'
  };

  const html = renderFractionAreaModelBlock(block);

  // SVG root attributes
  assert.ok(html.includes('<svg class="fraction-area-svg"'), 'Must contain SVG element');
  assert.ok(html.includes('viewBox="0 0 '), 'Must use viewBox for crisp scalable vector rendering');
  assert.ok(html.includes('role="img"'), 'Must include accessible role');
  assert.ok(html.includes('aria-label="'), 'Must include descriptive aria-label');

  // Accessible title and desc tags
  assert.ok(html.includes('<title>'), 'Must provide <title>');
  assert.ok(html.includes('<desc>'), 'Must provide <desc>');

  // Strict anti-substitute checks: must NOT use table or raw character squares as substitutes
  assert.ok(!html.includes('<table'), 'Must not use HTML tables as substitute');
  assert.ok(!html.includes('blacksquare'), 'Must not use KaTeX blacksquare as substitute');
  assert.ok(!html.includes('■') && !html.includes('□'), 'Must not use Unicode squares as substitute');

  // Must have clear borders and diagonal hatching pattern
  assert.ok(html.includes('class="grid-outer-frame"'), 'Must include defined grid frame');
  assert.ok(html.includes('<pattern id="row-diagonal-hatch-'), 'Must provide diagonal hatch pattern');
});

// ---------------------------------------------------------------------------
// 5. Validation Rules and Error Handling
// ---------------------------------------------------------------------------

test('validates correctly configured fraction-area-model inside lesson', () => {
  const lesson = makeLesson({
    type: 'notes',
    title: 'Valid Fraction Model Slide',
    content: [
      {
        type: 'fraction-area-model',
        fraction1: '1/3',
        fraction2: '2/3',
        title: 'Area Model'
      }
    ]
  });

  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, true, `Expected valid lesson: ${res.errors.join('; ')}`);
});

test('rejects missing fraction configuration', () => {
  const lesson = makeLesson({
    type: 'notes',
    title: 'Missing Fraction Model',
    content: [
      {
        type: 'fraction-area-model'
      }
    ]
  });

  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, false);
  assert.ok(res.errors.some((e) => e.includes('Fraction area model requires two fractions')));
});

test('rejects zero or negative denominators', () => {
  for (const den of [0, -1, -3]) {
    const lesson = makeLesson({
      type: 'notes',
      title: 'Invalid Denominator Slide',
      content: [
        {
          type: 'fraction-area-model',
          fraction1: { numerator: 1, denominator: den },
          fraction2: '2/3'
        }
      ]
    });
    const res = validateLesson(lesson, { silent: true });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some((e) => e.includes('denominator must be a positive integer')));
  }
});

test('rejects improper fractions (numerator > denominator)', () => {
  const lesson = makeLesson({
    type: 'notes',
    title: 'Improper Fraction Slide',
    content: [
      {
        type: 'fraction-area-model',
        fraction1: '4/3',
        fraction2: '2/3'
      }
    ]
  });

  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, false);
  assert.ok(res.errors.some((e) => e.includes('proper fraction') && e.includes('cannot exceed denominator')));
});

test('rejects negative numerators', () => {
  const lesson = makeLesson({
    type: 'notes',
    title: 'Negative Numerator Slide',
    content: [
      {
        type: 'fraction-area-model',
        fraction1: { numerator: -1, denominator: 3 },
        fraction2: '2/3'
      }
    ]
  });

  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, false);
  assert.ok(res.errors.some((e) => e.includes('numerator must be a non-negative integer')));
});

test('rejects grid dimensions exceeding maximum limit for classroom legibility', () => {
  const lesson = makeLesson({
    type: 'notes',
    title: 'Oversized Denominator Slide',
    content: [
      {
        type: 'fraction-area-model',
        fraction1: '1/15',
        fraction2: '2/3'
      }
    ]
  });

  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, false);
  assert.ok(res.errors.some((e) => e.includes(`exceeds maximum supported grid limit of ${MAX_FRACTION_DENOMINATOR}`)));
});

test('rejects non-integer fractions (e.g. decimal or malformed string)', () => {
  for (const badFrac of ['1.5/3', 'abc', '1/', '/3', null]) {
    const lesson = makeLesson({
      type: 'notes',
      title: 'Malformed Fraction Slide',
      content: [
        {
          type: 'fraction-area-model',
          fraction1: badFrac,
          fraction2: '2/3'
        }
      ]
    });
    const res = validateLesson(lesson, { silent: true });
    assert.equal(res.valid, false);
    assert.ok(res.errors.length > 0);
  }
});

test('rejects contradictory explicit rows/cols versus fraction denominators', () => {
  const lesson = makeLesson({
    type: 'notes',
    title: 'Contradictory Dimensions Slide',
    content: [
      {
        type: 'fraction-area-model',
        fraction1: '1/3',
        fraction2: '2/3',
        rows: 4 // Contradicts fraction1 denominator 3
      }
    ]
  });

  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, false);
  assert.ok(res.errors.some((e) => e.includes("contradicts Fraction 1 denominator")));
});

test('rejects outer reveal or revealStep when model is progressive', () => {
  for (const outerSetting of [{ reveal: true }, { revealStep: 2 }]) {
    const lesson = makeLesson({
      type: 'notes',
      title: 'Outer Reveal Conflict Slide',
      content: [
        {
          type: 'fraction-area-model',
          fraction1: '1/3',
          fraction2: '2/3',
          ...outerSetting
        }
      ]
    });

    const res = validateLesson(lesson, { silent: true });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some((e) => e.includes('cannot combine outer') && e.includes('internal reveal steps')));
  }
});

test('rejects unknown or misspelled properties on fraction-area-model block', () => {
  const lesson = makeLesson({
    type: 'notes',
    title: 'Misspelled Props Slide',
    content: [
      {
        type: 'fraction-area-model',
        fraction1: '1/3',
        fraction2: '2/3',
        fracton1: 'misspelled'
      }
    ]
  });

  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, false);
  assert.ok(res.errors.some((e) => e.includes("Unknown or unexpected block property 'fracton1'")));
});
