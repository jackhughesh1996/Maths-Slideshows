import assert from 'node:assert/strict';
import { test } from 'node:test';
import { graphConsistency, simpleFraction } from '../src/slideshow/graphConsistency.js';
import { validateLesson } from '../src/slideshow/validator.js';
import { lessonManifest } from '../src/lessons/manifest.js';

function validate(block) {
  return validateLesson({ id: 'GRAPH-MATH', title: 'Consistency', slides: [{ type: 'notes', title: 'Graph',
    columns: [{ blocks: [block] }] }] }, { silent: true });
}
function passes(block) {
  const result = validate(block);
  assert.equal(result.valid, true, result.errors.join('\n'));
}
function fails(block, pattern) {
  const result = validate(block);
  assert.equal(result.valid, false, JSON.stringify(block));
  assert.ok(result.errors.some((error) => pattern.test(error)), result.errors.join('\n'));
  return result;
}
const sector = (items, extras = {}) => ({ type: 'sector-graph', items, ...extras });
const construction = (categories, extras = {}) => ({ type: 'sector-construction', categories, ...extras });
const bar = (categories, extras = {}) => ({ type: 'measured-bar', categories, ...extras });

test('sector graphs accept counts, fractions, mixed representations and zero categories', () => {
  passes(sector([{ label: 'A', amount: 3 }, { label: 'B', amount: 7 }], { total: 10 }));
  passes(sector([{ label: 'A', fraction: 0.25 }, { label: 'B', fraction: 0.75 }]));
  passes(sector([{ label: 'A', amount: 3, fraction: 0.3 }, { label: 'B', amount: 7, fraction: 0.7 }], { total: 10 }));
  passes(sector([{ label: 'A', amount: 3 }, { label: 'B', fraction: 0.7 }], { total: 10 }));
  passes(sector([{ label: 'Zero', amount: 0, angle: 0 }, { label: 'All', amount: 10, angle: 360 }]));
});

test('sector graphs reject incorrect totals, fractions, negative values and empty effective circles', () => {
  fails(sector([{ label: 'A', amount: 3 }, { label: 'B', amount: 7 }], { total: 11 }), /Observed 10; expected 11/);
  fails(sector([{ label: 'A', fraction: 0.4 }, { label: 'B', fraction: 0.4 }]), /Observed 0.8; expected 1/);
  fails(sector([{ label: 'A', amount: 3, fraction: 0.5 }, { label: 'B', amount: 7, fraction: 0.5 }]), /fraction.*Observed 0.5; expected 0.3/);
  for (const item of [{ amount: -1 }, { fraction: -0.1 }, { amount: 1, angle: -1 }]) {
    fails(sector([{ label: 'Negative', ...item }, { label: 'B', amount: 2 }]), /cannot be negative/);
  }
  fails(sector([{ label: 'Zero', amount: 0 }]), /Cannot derive proportions from a zero total/);
  fails(sector([{ label: 'Zero count with a whole fraction', amount: 0, fraction: 1 }]), /Cannot derive proportions from a zero total/);
});

test('ignored sector-graph angle annotations are still checked without requiring optional angles', () => {
  passes(sector([{ label: 'A', fraction: 0.5, angle: 180 }, { label: 'B', fraction: 0.5 }]));
  fails(sector([{ label: 'A', fraction: 0.5, angle: 170 }, { label: 'B', fraction: 0.5, angle: 190 }]), /angle.*Observed 170; expected 180/);
  fails(sector([{ label: 'A', fraction: 1, angle: 720 }]), /angle.*Observed 720; expected 360/);
  // Exact whole-degree answers cannot be shifted under a rounding exception.
  fails(sector([{ label: 'A', amount: 1, angle: 179 }, { label: 'B', amount: 1, angle: 181 }]), /angle.*expected 180/);
});

test('floating-point noise and whole-degree rounding are permitted, but broad angular errors are not', () => {
  passes(sector([{ label: 'A', amount: 0.1 }, { label: 'B', amount: 0.2 }], { total: 0.3 }));
  passes(sector([{ label: 'A', fraction: 0.1 + 0.2 }, { label: 'B', fraction: 0.7 }]));
  passes(sector([{ label: 'A', amount: 1, fraction: 0.333 }, { label: 'B', amount: 2, fraction: 0.667 }]));
  fails(sector(['A', 'B', 'C'].map((label) => ({ label, amount: 1, fraction: 0.33 }))), /proportions must sum to 1/);

  const seven = Array.from({ length: 7 }, (_, index) => ({ label: String(index), value: 1, angle: 51 }));
  passes(construction(seven)); // 357 is the legitimate sum of seven rounded angles.
  passes(construction(seven.map(({ label, angle }) => ({ label, angle,
    calculation: String.raw`\frac{1}{7} \times 360^\circ` }))));

  passes(sector(seven.map(({ label, angle }) => ({ label, angle, fraction: 1 / 7 }))));
  const corrected = [{ label: 'A', value: 1 }, { label: 'B', value: 1 }, { label: 'C', value: 5, angle: 258 }];
  passes(construction(corrected)); // 51 + 51 + (257 + 1) = 360.
  fails(construction([{ label: 'A', value: 1, angle: 80 }, { label: 'B', value: 1, angle: 280 }]), /angle/);
});

test('construction supports numeric/simple LaTeX fractions and safe angle calculations', () => {
  passes(construction([
    { label: 'A', value: 12, fraction: String.raw`\frac{12}{24}`, calculation: String.raw`\frac{12}{24} \times 360^\circ`, angle: 180 },
    { label: 'B', amount: 12, fraction: 0.5, angle: 180 }
  ], { total: 24 }));
  passes({ type: 'sector-construction', items: [{ label: 'A', angle: 90 }, { label: 'B', angle: 270 }] });
  passes(construction([{ label: 'A', fraction: 0.5, angle: 180 }, { label: 'B', angle: 180 }]));
  fails(construction([{ label: 'A', value: 1, fraction: String.raw`\frac{1}{3}` }, { label: 'B', value: 1 }]), /fraction.*expected 0.5/);
  fails(construction([{ label: 'A', value: 1, calculation: String.raw`\frac{1}{3} \times 360^\circ` }, { label: 'B', value: 1 }]), /calculation.*expected 180/);
  fails(construction([{ label: 'A', angle: 360, fraction: String.raw`\frac{1}{0}` }]), /nonzero denominator/);
});

test('construction does not reinterpret fraction/calculation annotations as geometry', () => {
  fails(construction([{ label: 'A', fraction: 1 }]), /angle.*Observed 0; expected 360/);
  fails(construction([{ label: 'A', angle: 90 }, { label: 'B', angle: 90 }]), /Observed 180; expected 360/);
  fails(construction([{ label: 'A', angle: 200 }, { label: 'B', angle: 200 }]), /Observed 400; expected 360/);
  fails(construction([{ label: 'A', value: 3 }, { label: 'B', value: 7 }], { total: 11 }), /Observed 10; expected 11/);
  passes(construction([{ label: 'A', angle: 360, fraction: String.raw`\frac{a}{b}`,
    calculation: String.raw`\frac{a}{b} \times 360^\circ` }])); // syntax only, no algebra guessed
});

test('simple fraction parsing is restricted and does not evaluate symbolic algebra', () => {
  assert.equal(simpleFraction(String.raw`\frac{12}{24}`), 0.5);
  assert.equal(simpleFraction(String.raw`-\frac{1}{2}`), -0.5);
  assert.equal(simpleFraction(String.raw`\tfrac{0.5}{2}`), 0.25);
  assert.equal(simpleFraction('0.25'), 0.25);
  assert.ok(Number.isNaN(simpleFraction(String.raw`\frac{1}{0}`)));
  for (const value of [String.raw`\frac{x}{y}`, String.raw`\frac{1+1}{4}`, '1/2 + 1/2', 'globalThis.fail()']) {
    assert.equal(simpleFraction(value), undefined);
  }
});

for (const type of ['measured-bar', 'divided-bar']) {
  test(`${type}: proportions, count totals, zero values and length aliases`, () => {
    passes(bar([{ label: 'A', value: 3 }, { label: 'B', amount: 7 }], { type, total: 10, totalLength: 20 }));
    passes({ type, items: [{ label: 'A', fraction: 0 }, { label: 'B', fraction: 1 }], totalLengthCm: 10 });
    passes(bar([{ label: 'A', value: 3, fraction: 0.3 }, { label: 'B', value: 7, fraction: 0.7 }], { type, totalLength: 5 }));
    fails(bar([{ label: 'A', value: 3 }, { label: 'B', value: 7 }], { type, total: 9 }), /Observed 10; expected 9/);
    fails(bar([{ label: 'A', fraction: 0.4 }, { label: 'B', fraction: 0.7 }], { type }), /expected 1/);
    fails(bar([{ label: 'A', value: 3, fraction: 0.5 }, { label: 'B', value: 7, fraction: 0.5 }], { type }), /fraction.*expected 0.3/);
    for (const prop of ['value', 'amount', 'length', 'fraction']) {
      fails(bar([{ label: 'Negative', [prop]: -1 }, { label: 'B', value: 2 }], { type }), /cannot be negative/);
    }
  });

  test(`${type}: length is a fallback category weight, not an absolute centimetre measurement`, () => {
    // Weights 2:3 produce physical lengths 8:12 on a 20 cm bar. Requiring
    // input length to equal rendered centimetres would reject this valid graph.
    passes(bar([{ label: 'A', length: 2 }, { label: 'B', length: 3 }], { type, totalLength: 20 }));
    passes(bar([{ label: 'A', length: 2, fraction: 0.4 }, { label: 'B', length: 3, fraction: 0.6 }], { type, total: 5, totalLengthCm: 20 }));
    passes(bar([{ label: 'A', value: 1 / 3, length: 0.33 }, { label: 'B', value: 2 / 3, length: 0.67 }], { type, total: 1, totalLength: 10 }));
    fails(bar([{ label: 'A', value: 2, length: 8 }, { label: 'B', value: 3, length: 12 }], { type, totalLength: 20 }), /length.*Observed 8; expected 2/);
    fails(bar([{ label: 'A', length: 2, fraction: 0.5 }, { label: 'B', length: 3, fraction: 0.5 }], { type, totalLength: 20 }), /fraction.*expected 0.4/);
    fails(bar([{ label: 'A', value: 1 }], { type, totalLength: 10, totalLengthCm: 20 }), /totalLengthCm.*Observed 20; expected 10/);
  });
}

test('preferred count fields cannot silently disagree with alternative counts', () => {
  for (const type of ['sector-construction', 'measured-bar', 'divided-bar']) {
    fails({ type, categories: [{ label: 'A', value: 1, amount: 2 }] }, /amount.*Observed 2; expected 1/);
  }
});

test('structural failures suppress misleading consistency cascades and diagnostics include context', () => {
  const invalid = validate(sector([{ label: 'A', amount: NaN }]));
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.some((error) => error.includes('finite number')));
  assert.ok(invalid.errors.every((error) => !error.includes('Observed')));
  const result = fails(sector([{ label: 'A', amount: 2 }], { total: 3 }), /Observed 2; expected 3/);
  assert.equal(result.errors.length, 1);
  assert.match(result.errors[0], /GRAPH-MATH.*Slide 1.*slide.columns\[0\].blocks\[0\].total/);
  assert.equal(graphConsistency({ items: [null] }, 'sector-graph').length, 0);
});

test('all registered lessons, including the real 8F graphs, remain valid', async () => {
  let graphs = 0;
  for (const entry of lessonManifest) {
    const { default: lesson } = await import(new URL(entry.path, new URL('../src/lessons/', import.meta.url)));
    const result = validateLesson(lesson, { silent: true });
    assert.equal(result.valid, true, `${entry.id}: ${result.errors.join('\n')}`);
    function visit(value) {
      if (!value || typeof value !== 'object') return;
      if (['sector-graph', 'sector-construction', 'measured-bar'].includes(value.type)) {
        assert.deepEqual(graphConsistency(value, value.type), [], entry.id);
        graphs++;
      }
      Object.values(value).forEach(visit);
    }
    visit(lesson);
  }
  assert.ok(graphs >= 3, 'Exercise the actual 8F sector, construction and measured bar');
});
