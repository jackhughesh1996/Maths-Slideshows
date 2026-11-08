/**
 * @file test-step-labels.mjs
 * Regression tests for step headings in worked example slides.
 * Verifies that leading step markers ("Step 3:", "Step 3 -", "Step 3 —", "Step 3.", "3.", "3)")
 * are cleanly stripped before automatic "Step N:" prefixes are applied, preventing double step headings.
 * Ensures the automatic position number is always displayed, and "Part 1:" or other wording is preserved.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

// Setup math and slideMarkup modules for Node testing (bypassing Vite CSS import)
const mathUrl = new URL('../src/slideshow/math.js', import.meta.url);
let mathSource = await readFile(mathUrl, 'utf8');
mathSource = mathSource
  .replace("import katex from 'katex';", `import katex from ${JSON.stringify(import.meta.resolve('katex'))};`)
  .replace("from './mathExpressions.js'", `from ${JSON.stringify(import.meta.resolve('../src/slideshow/mathExpressions.js'))}`)
  .replace("import 'katex/dist/katex.min.css';", '');

const asModule = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const mathMod = asModule(mathSource);

let slideMarkupSource = await readFile(new URL('../src/slideshow/slideMarkup.js', import.meta.url), 'utf8');
slideMarkupSource = slideMarkupSource.replace("from './math.js'", `from ${JSON.stringify(mathMod)}`);

const {
  stripStepNumberPrefix,
  formatStepHeading,
  renderWorkedExampleSlide
} = await import(asModule(slideMarkupSource));

const dummyRenderBlocks = () => '';

test('step label helper strips only target patterns and preserves other text', () => {
  // Target patterns to remove
  assert.equal(stripStepNumberPrefix('Step 1: Foo'), 'Foo');
  assert.equal(stripStepNumberPrefix('Step 3: Foo'), 'Foo');
  assert.equal(stripStepNumberPrefix('Step 3 - Foo'), 'Foo');
  assert.equal(stripStepNumberPrefix('Step 3 — Foo'), 'Foo');
  assert.equal(stripStepNumberPrefix('Step 3 – Foo'), 'Foo');
  assert.equal(stripStepNumberPrefix('Step 3. Foo'), 'Foo');
  assert.equal(stripStepNumberPrefix('3. Foo'), 'Foo');
  assert.equal(stripStepNumberPrefix('3) Foo'), 'Foo');
  assert.equal(stripStepNumberPrefix('step 1: lowercase'), 'lowercase');
  assert.equal(stripStepNumberPrefix('STEP 1: uppercase'), 'uppercase');

  // Must NOT remove "Part 1:" or other wording
  assert.equal(stripStepNumberPrefix('Part 1: Foo'), 'Part 1: Foo');
  assert.equal(stripStepNumberPrefix('Method 1: Foo'), 'Method 1: Foo');
  assert.equal(stripStepNumberPrefix('Example 1: Foo'), 'Example 1: Foo');
  assert.equal(stripStepNumberPrefix('Foo'), 'Foo');
  assert.equal(stripStepNumberPrefix('3.5 kg of flour'), '3.5 kg of flour');
});

test('formatStepHeading covers all mandated acceptance patterns', () => {
  // 1. "Step 1: Foo" shows "Step 1: Foo" once
  assert.equal(formatStepHeading(1, 'Step 1: Foo'), 'Step 1: Foo');

  // 2. "1. Foo" shows "Step 1: Foo"
  assert.equal(formatStepHeading(1, '1. Foo'), 'Step 1: Foo');

  // 3. "Step 2 — Bar" in position 2 shows "Step 2: Bar"
  assert.equal(formatStepHeading(2, 'Step 2 — Bar'), 'Step 2: Bar');

  // 4. "Foo" is unchanged apart from the automatic prefix
  assert.equal(formatStepHeading(1, 'Foo'), 'Step 1: Foo');

  // 5. "Part 1: Foo" becomes "Step 1: Part 1: Foo"
  assert.equal(formatStepHeading(1, 'Part 1: Foo'), 'Step 1: Part 1: Foo');
});

test('the number shown is always the automatic position of the step, not the typed number', () => {
  // Typed number is 3, but position is 1 -> must show Step 1
  assert.equal(formatStepHeading(1, 'Step 3: Calculate sum'), 'Step 1: Calculate sum');
  assert.equal(formatStepHeading(1, '3. Calculate sum'), 'Step 1: Calculate sum');
  assert.equal(formatStepHeading(1, '3) Calculate sum'), 'Step 1: Calculate sum');
  assert.equal(formatStepHeading(2, 'Step 5 — Final value'), 'Step 2: Final value');
});

test('renderWorkedExampleSlide renders headings without double numbering', () => {
  const slide = {
    type: 'worked-example',
    prompt: 'Sample problem',
    steps: [
      { label: 'Step 1: First action', text: 'Do something' },
      { label: '2. Second action', text: 'Do next' },
      { label: 'Step 3 — Third action', text: 'Finish' },
      { label: 'Part 1: Multi-part action', text: 'Note' },
      { label: 'Plain unnumbered label', text: 'Explain' }
    ]
  };

  const html = renderWorkedExampleSlide(slide, dummyRenderBlocks);

  // Assert expected formatted step headings appear
  assert.ok(html.includes('Step 1: First action'), 'Step 1 heading must not repeat "Step 1:"');
  assert.ok(!html.includes('Step 1: Step 1:'), 'Must not contain double "Step 1: Step 1:"');

  assert.ok(html.includes('Step 2: Second action'), 'Step 2 heading must replace "2." with "Step 2:"');
  assert.ok(!html.includes('Step 2: 2.'), 'Must not contain "Step 2: 2."');

  assert.ok(html.includes('Step 3: Third action'), 'Step 3 heading must replace "Step 3 —" with "Step 3:"');
  assert.ok(!html.includes('Step 3: Step 3 —'), 'Must not contain double "Step 3: Step 3 —"');

  assert.ok(html.includes('Step 4: Part 1: Multi-part action'), '"Part 1:" must be preserved alongside automatic Step 4');
  assert.ok(html.includes('Step 5: Plain unnumbered label'), 'Unnumbered label must receive automatic Step 5 prefix');
});

test('acceptance slides: 3G slide 11, 3H slide 5, 3G slide 3, and 8B slide 5 show step number once', async () => {
  // Load actual lesson files directly to verify real lesson data
  const lesson3G = (await import('../src/lessons/3G.js')).default;
  const lesson3H = (await import('../src/lessons/3H.js')).default;
  const lesson8B = (await import('../src/lessons/8B.js')).default;

  // 1. Lesson 3G slide 11 (index 10)
  const slide3G_11 = lesson3G.slides[10];
  const html3G_11 = renderWorkedExampleSlide(slide3G_11, dummyRenderBlocks);
  assert.ok(html3G_11.includes('Step 1: Rewrite with &#039;×&#039; and write 30 over 1'));
  assert.ok(!html3G_11.includes('Step 1: Step 1:'));
  assert.ok(html3G_11.includes('Step 2: Cancel common factor 5 diagonally'));
  assert.ok(!html3G_11.includes('Step 2: Step 2:'));
  assert.ok(html3G_11.includes('Step 3: Multiply across'));
  assert.ok(!html3G_11.includes('Step 3: Step 3:'));

  // 2. Lesson 3H slide 5 (index 4)
  const slide3H_5 = lesson3H.slides[4];
  const html3H_5 = renderWorkedExampleSlide(slide3H_5, dummyRenderBlocks);
  assert.ok(html3H_5.includes('Step 1: Translate division into equal groups'));
  assert.ok(!html3H_5.includes('Step 1: Step 1:'));
  assert.ok(html3H_5.includes('Step 2: Visualise with fraction bars'));
  assert.ok(!html3H_5.includes('Step 2: Step 2:'));
  assert.ok(html3H_5.includes('Step 3: Count the groups'));
  assert.ok(!html3H_5.includes('Step 3: Step 3:'));

  // 3. Lesson 3G slide 3 (index 2)
  const slide3G_3 = lesson3G.slides[2];
  const html3G_3 = renderWorkedExampleSlide(slide3G_3, dummyRenderBlocks);
  assert.ok(html3G_3.includes('Step 1: Simplify 6/8'));
  assert.ok(!html3G_3.includes('Step 1: 1.'));
  assert.ok(html3G_3.includes('Step 2: Convert 2 1/3 to improper fraction'));
  assert.ok(!html3G_3.includes('Step 2: 2.'));
  assert.ok(html3G_3.includes('Step 3: Find 1/3 of 12'));
  assert.ok(!html3G_3.includes('Step 3: 3.'));

  // 4. Lesson 8B slide 5 (index 4)
  const slide8B_5 = lesson8B.slides[4];
  const html8B_5 = renderWorkedExampleSlide(slide8B_5, dummyRenderBlocks);
  assert.ok(html8B_5.includes('Step 1: ADD all the values'));
  assert.ok(!html8B_5.includes('Step 1: Step 1 —'));
  assert.ok(html8B_5.includes('Step 2: COUNT how many values there are'));
  assert.ok(!html8B_5.includes('Step 2: Step 2 —'));
  assert.ok(html8B_5.includes('Step 3: DIVIDE the sum by the count'));
  assert.ok(!html8B_5.includes('Step 3: Step 3 —'));
});
