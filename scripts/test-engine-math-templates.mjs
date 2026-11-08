/**
 * @file test-engine-math-templates.mjs
 * Regression tests to ensure engine HTML markup templates pass all inline
 * and block LaTeX expressions through KaTeX rendering functions without leaking
 * raw delimiters ($) or commands (\div, \times, \frac, \mathbf) into visual HTML.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

// Setup math module mock for Node testing (bypassing Vite CSS import)
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

/**
 * Strips KaTeX annotation (<annotation>...</annotation>) and MathML (<math>...</math>
 * or <span class="katex-mathml">...</span>) tags which preserve the original TeX source
 * for assistive technology and copy/paste.
 *
 * @param {string} html
 * @returns {string} HTML with TeX annotations stripped
 */
function stripKatexAnnotationAndMathml(html) {
  return html
    .replace(/<annotation[^>]*>[\s\S]*?<\/annotation>/gi, '')
    .replace(/<span class="katex-mathml">[\s\S]*?<\/span>/gi, '')
    .replace(/<math[^>]*>[\s\S]*?<\/math>/gi, '')
    .replace(/\sdata-equation="[^"]*"/gi, '');
}

test('fraction-of-set markup renders math via KaTeX with no raw LaTeX in visual DOM', () => {
  const html = renderFractionOfSetBlock({
    total: 30,
    numerator: 2,
    denominator: 5,
    title: 'Visual Grouping (2/5 of 30)',
    unit: 'counters',
  });

  // Verify KaTeX HTML elements exist
  assert.ok(html.includes('class="katex"'), 'Output must contain rendered KaTeX classes');
  assert.ok(html.includes('class="katex-html"'), 'Output must contain KaTeX HTML view elements');

  // Strip KaTeX internal TeX source annotations
  const stripped = stripKatexAnnotationAndMathml(html);

  // Assert no unrendered dollar delimiters or raw LaTeX commands leak into visual HTML
  assert.ok(!stripped.includes('$'), 'Stripped visual HTML must contain no literal dollar signs');
  assert.ok(!stripped.includes('\\div'), 'Stripped visual HTML must contain no unrendered \\div');
  assert.ok(!stripped.includes('\\times'), 'Stripped visual HTML must contain no unrendered \\times');
  assert.ok(!stripped.includes('\\frac'), 'Stripped visual HTML must contain no unrendered \\frac');
  assert.ok(!stripped.includes('\\mathbf'), 'Stripped visual HTML must contain no unrendered \\mathbf');
});

test('mixed-numeral-area-model markup renders math via KaTeX with no raw LaTeX in visual DOM', () => {
  // Block used on slide 13 of lesson 3G
  const html = renderMixedNumeralAreaModelBlock({
    type: 'mixed-numeral-area-model',
    title: 'Area Model: 2 1/3 × 1 2/5',
  });

  // Verify KaTeX HTML elements exist
  assert.ok(html.includes('class="katex"'), 'Output must contain rendered KaTeX classes');
  assert.ok(html.includes('class="katex-html"'), 'Output must contain KaTeX HTML view elements');

  // Strip KaTeX internal TeX source annotations
  const stripped = stripKatexAnnotationAndMathml(html);

  // Assert no unrendered dollar delimiters or raw LaTeX commands leak into visual HTML
  assert.ok(!stripped.includes('$'), 'Stripped visual HTML must contain no literal dollar signs');
  assert.ok(!stripped.includes('\\div'), 'Stripped visual HTML must contain no unrendered \\div');
  assert.ok(!stripped.includes('\\times'), 'Stripped visual HTML must contain no unrendered \\times');
  assert.ok(!stripped.includes('\\frac'), 'Stripped visual HTML must contain no unrendered \\frac');
  assert.ok(!stripped.includes('\\mathbf'), 'Stripped visual HTML must contain no unrendered \\mathbf');
});
