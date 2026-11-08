/**
 * @file test-fraction-visuals.mjs
 * Automated unit and regression tests for fraction-of-set and mixed-numeral-area-model components.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { parseFractionOfSetData } from '../src/slideshow/fractionSetUtils.js';
import { validateLesson } from '../src/slideshow/validator.js';

// Setup math module mock for Node testing
const mathUrl = new URL('../src/slideshow/math.js', import.meta.url);
let mathSource = await readFile(mathUrl, 'utf8');
mathSource = mathSource
  .replace("import katex from 'katex';", `import katex from ${JSON.stringify(import.meta.resolve('katex'))};`)
  .replace("from './mathExpressions.js'", `from ${JSON.stringify(import.meta.resolve('../src/slideshow/mathExpressions.js'))}`)
  .replace("import 'katex/dist/katex.min.css';", '');
const asModule = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const mathMod = asModule(mathSource);

let fractionSetSource = await readFile(new URL('../src/slideshow/fractionSetMarkup.js', import.meta.url), 'utf8');
fractionSetSource = fractionSetSource
  .replace("from './math.js'", `from ${JSON.stringify(mathMod)}`)
  .replace("from './fractionSetUtils.js'", `from ${JSON.stringify(new URL('../src/slideshow/fractionSetUtils.js', import.meta.url).href)}`);
const { renderFractionOfSetBlock } = await import(asModule(fractionSetSource));

let mixedAreaSource = await readFile(new URL('../src/slideshow/mixedAreaMarkup.js', import.meta.url), 'utf8');
mixedAreaSource = mixedAreaSource
  .replace("from './math.js'", `from ${JSON.stringify(mathMod)}`);
const { renderMixedNumeralAreaModelBlock } = await import(asModule(mixedAreaSource));

test('fraction-of-set data parsing and validation', () => {
  const valid1 = parseFractionOfSetData({ total: 30, numerator: 2, denominator: 5 });
  assert.equal(valid1.valid, true);
  assert.equal(valid1.groups, 5);
  assert.equal(valid1.itemsPerGroup, 6);
  assert.equal(valid1.highlightedCount, 12);

  const valid2 = parseFractionOfSetData({ total: 24, fraction: '5/6' });
  assert.equal(valid2.valid, true);
  assert.equal(valid2.groups, 6);
  assert.equal(valid2.itemsPerGroup, 4);
  assert.equal(valid2.highlightedCount, 20);

  const invalidDiv = parseFractionOfSetData({ total: 29, numerator: 2, denominator: 5 });
  assert.equal(invalidDiv.valid, false);
  assert.ok(invalidDiv.errors.some(e => e.includes('not divisible')));

  const invalidNum = parseFractionOfSetData({ total: 30, numerator: 6, denominator: 5 });
  assert.equal(invalidNum.valid, false);
  assert.ok(invalidNum.errors.some(e => e.includes('cannot exceed')));
});

test('fraction-of-set SVG markup rendering and progressive reveal attributes', () => {
  const html = renderFractionOfSetBlock({
    total: 30,
    numerator: 2,
    denominator: 5,
    title: 'Visual Grouping (2/5 of 30)',
    unit: 'counters'
  });

  assert.ok(html.includes('fraction-of-set-container'));
  assert.ok(html.includes('set-groups-layer'));
  assert.ok(html.includes('set-highlight-layer'));
  assert.ok(html.includes('set-equation-layer'));
  assert.ok(html.includes('data-reveal-step="1"'));
  assert.ok(html.includes('data-reveal-step="2"'));
  assert.ok(html.includes('data-reveal-step="3"'));
  assert.ok(html.includes('12'));
});

test('mixed-numeral-area-model SVG markup rendering and progressive reveal attributes', () => {
  const html = renderMixedNumeralAreaModelBlock({
    title: 'Area Model: 2 1/3 × 1 2/5'
  });

  assert.ok(html.includes('mixed-numeral-area-container'));
  assert.ok(html.includes('mixed-partition-layer'));
  assert.ok(html.includes('mixed-products-layer'));
  assert.ok(html.includes('mixed-cross-layer'));
  assert.ok(html.includes('mixed-total-layer'));
  assert.ok(html.includes('3') && html.includes('4'));
});

test('validator accepts lesson 3G containing new visual blocks', async () => {
  const mod = await import('../src/lessons/3G.js');
  const lesson = mod.default;
  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, true, `Lesson 3G must validate successfully: ${res.errors.join('; ')}`);
});
