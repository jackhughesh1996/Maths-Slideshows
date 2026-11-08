import test from 'node:test';
import assert from 'node:assert/strict';
import lesson from '../src/lessons/3C.js';
import { lessonManifest } from '../src/lessons/manifest.js';
import {
  mixedToImproper, improperToMixed, normalizeFractionState,
  greatestCommonDivisor, FRACTION_DENOMINATORS
} from '../src/slideshow/fractionConversionMath.js';

const simulationBlocks = lesson.slides.flatMap(slide => (slide.content || []).filter(b => b.type === 'simulation'));

test('3C is registered and runs for precisely 60 estimated minutes', () => {
  assert.ok(lessonManifest.some(l => l.id === '3C' && l.path === './3C.js'));
  assert.equal(lesson.slides.length, 16);
  assert.equal(lesson.slides.reduce((sum, slide) => sum + slide.estimatedMinutes, 0), 60);
  const firstPractice = lesson.slides.findIndex(slide => slide.phase === 'independent');
  assert.equal(lesson.slides.slice(0, firstPractice).reduce((sum, slide) => sum + slide.estimatedMinutes, 0), 21);
});

test('three supported 3C simulation modes configured exactly once', () => {
  assert.deepEqual(simulationBlocks.map(b => b.mode), ['build', 'regroup', 'number-line']);
  assert.ok(simulationBlocks.every(b => b.simType === 'fraction-conversion'));
});

test('mixed numeral converts to equivalent improper fraction', () => {
  assert.equal(mixedToImproper(3, 1, 5), 16);
  assert.equal(mixedToImproper(2, 3, 4), 11);
  assert.equal(mixedToImproper(0, 3, 4), 3);
  assert.equal(mixedToImproper(4, 0, 4), 16);
});

test('improper fraction gives quotient, remainder, and reduced fractional part', () => {
  assert.deepEqual(improperToMixed(11, 4), { whole: 2, remainder: 3, denominator: 4, simplifiedNumerator: 3, simplifiedDenominator: 4 });
  assert.deepEqual(improperToMixed(20, 6), { whole: 3, remainder: 2, denominator: 6, simplifiedNumerator: 1, simplifiedDenominator: 3 });
  assert.deepEqual(improperToMixed(16, 4), { whole: 4, remainder: 0, denominator: 4, simplifiedNumerator: 0, simplifiedDenominator: 1 });
  assert.equal(greatestCommonDivisor(0, 6), 6);
});

test('all available denominators preserve value across both conversion directions', () => {
  for (const d of FRACTION_DENOMINATORS) {
    for (let whole = 0; whole <= 5; whole++) {
      for (let part = 0; part < d; part++) {
        const n = mixedToImproper(whole, part, d);
        const mixed = improperToMixed(n, d);
        assert.equal(mixed.whole, whole, `${n}/${d}: whole`);
        assert.equal(mixed.remainder, part, `${n}/${d}: remainder`);
        assert.ok(Math.abs((whole + part / d) - n / d) < 1e-12, 'Equivalent position');
        assert.equal(greatestCommonDivisor(mixed.simplifiedNumerator, mixed.simplifiedDenominator), 1);
      }
    }
  }
});

test('normalization clamps invalid quantities to safe classroom bounds', () => {
  const s = normalizeFractionState({ mode: 'build', denominator: 4, whole: 8, part: 7 });
  assert.equal(s.whole, 5);
  assert.equal(s.part, 3);
  assert.equal(normalizeFractionState({ mode: 'regroup', denominator: 3, numerator: 1 }).numerator, 3);
  assert.equal(normalizeFractionState({ mode: 'number-line', denominator: 7, numerator: 999 }).numerator, 41);
  assert.equal(normalizeFractionState({ mode: 'unexpected', denominator: 0 }).mode, 'build');
});
