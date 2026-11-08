import { test } from 'node:test';
import assert from 'node:assert/strict';
import lesson from '../src/lessons/3C.js';
import { validateLesson } from '../src/slideshow/validator.js';
import { isSupportedSimulationType } from '../src/slideshow/blockTypes.js';

const validation = (block) => validateLesson({
  id: '3C-CHECK', title: 'Schema Check', slides: [{
    type: 'notes', title: 'Sim check', content: [block]
  }]
}, { silent: true });

test('3C uses a valid canonical simulation type and a fully valid lesson definition', () => {
  assert.equal(isSupportedSimulationType('fraction-conversion'), true);
  const result = validateLesson(lesson, { silent: true });
  assert.deepEqual(result.errors, []);
  assert.equal(result.valid, true);
});

test('fraction simulation schema rejects invalid config with exact property paths', () => {
  const base = { type: 'simulation', simType: 'fraction-conversion', mode: 'regroup', denominator: 4, numerator: 11 };
  const badDenominator = validation({ ...base, denominator: 0 });
  assert.ok(badDenominator.errors.some(e => e.includes('slide.content[0].denominator')));
  const badNumerator = validation({ ...base, numerator: 3 });
  assert.ok(badNumerator.errors.some(e => e.includes('slide.content[0].numerator')));
  const badMode = validation({ ...base, mode: 'bizarre' });
  assert.ok(badMode.errors.some(e => e.includes('slide.content[0].mode')));
  const unknown = validation({ ...base, unrelated: 'x' });
  assert.ok(unknown.errors.some(e => e.includes("block property 'unrelated'")));
  assert.equal(validation(base).valid, true);
});
