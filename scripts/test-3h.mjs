import test from 'node:test';
import assert from 'node:assert/strict';
import { lessonManifest } from '../src/lessons/manifest.js';
import lesson3H from '../src/lessons/3H.js';
import {
  calculateDivisionFit,
  calculateDivisionSharing,
  calculateReciprocal,
  simplifyFraction,
  toImproper,
  toMixed,
  gcd
} from '../src/slideshow/fractionDivisionMath.js';

test('Lesson 3H manifest registration', () => {
  const entry = lessonManifest.find((l) => l.id === '3H');
  assert.ok(entry, '3H should be registered in lessonManifest');
  assert.equal(entry.path, './3H.js');
});

test('Lesson 3H metadata, slide count and timing structure', () => {
  assert.equal(lesson3H.id, '3H');
  assert.equal(lesson3H.title, 'Dividing Fractions');
  assert.equal(lesson3H.unit, 'Chapter 3');
  assert.equal(lesson3H.slides.length, 17, 'Must have exactly 17 slides');

  const totalDuration = lesson3H.slides.reduce((sum, s) => sum + (s.estimatedMinutes || s.duration || 0), 0);
  assert.equal(totalDuration, 60, 'Total duration across all slides must equal exactly 60 minutes');

  // Independent practice part 1 starts at minute 23 (Slide 11, index 10)
  let cumulativeMin = 0;
  for (let i = 0; i < 10; i++) {
    cumulativeMin += lesson3H.slides[i].estimatedMinutes || lesson3H.slides[i].duration || 0;
  }
  assert.equal(cumulativeMin, 23, 'Independent textbook practice (Slide 11) must start at minute 23 (within 20-25 min window)');
  assert.equal(lesson3H.slides[10].type, 'practice');
  assert.equal(lesson3H.slides[10].estimatedMinutes, 11);

  // Independent practice part 2 (Slide 16, index 15)
  assert.equal(lesson3H.slides[15].type, 'practice');
  assert.equal(lesson3H.slides[15].estimatedMinutes, 9);
});

function getAllBlocks(slide) {
  const blocks = [];
  if (Array.isArray(slide.blocks)) blocks.push(...slide.blocks);
  if (Array.isArray(slide.content)) blocks.push(...slide.content);
  if (Array.isArray(slide.leftBlocks)) blocks.push(...slide.leftBlocks);
  if (Array.isArray(slide.rightBlocks)) blocks.push(...slide.rightBlocks);
  if (Array.isArray(slide.columns)) {
    for (const col of slide.columns) {
      if (Array.isArray(col.blocks)) blocks.push(...col.blocks);
      if (Array.isArray(col.content)) blocks.push(...col.content);
    }
  }
  return blocks;
}

test('Lesson 3H simulations and block structure', () => {
  // Slide 6 (index 5) Fraction Division Explorer
  const slide6 = lesson3H.slides[5];
  assert.equal(slide6.type, 'notes');
  const slide6Blocks = getAllBlocks(slide6);
  const sim6 = slide6Blocks.find((b) => b.type === 'simulation');
  assert.ok(sim6, 'Slide 6 must contain a simulation block');
  assert.equal(sim6.simType, 'fraction-division');
  assert.equal(sim6.mode, 'fit');

  // Slide 8 (index 7) Reciprocal Demonstrator
  const slide8 = lesson3H.slides[7];
  const slide8Blocks = getAllBlocks(slide8);
  const sim8 = slide8Blocks.find((b) => b.type === 'simulation');
  assert.ok(sim8, 'Slide 8 must contain a reciprocal explorer simulation block');
  assert.equal(sim8.simType, 'reciprocal-explorer');
});

test('fractionDivisionMath pure functions', () => {
  // GCD
  assert.equal(gcd(12, 18), 6);
  assert.equal(gcd(7, 13), 1);

  // simplifyFraction
  assert.deepEqual(simplifyFraction(24, 15), { num: 8, den: 5 });
  assert.deepEqual(simplifyFraction(0, 5), { num: 0, den: 1 });

  // toImproper & toMixed
  assert.deepEqual(toImproper(1, 1, 2), { num: 3, den: 2 });
  assert.deepEqual(toImproper(0, 3, 4), { num: 3, den: 4 });
  assert.deepEqual(toImproper(5, 0, 1), { num: 5, den: 1 });

  const mixed1 = toMixed(8, 5);
  assert.equal(mixed1.whole, 1);
  assert.equal(mixed1.simplifiedNum, 3);
  assert.equal(mixed1.simplifiedDen, 5);

  const mixed2 = toMixed(4, 2);
  assert.equal(mixed2.whole, 2);
  assert.equal(mixed2.isExact, true);

  // calculateReciprocal
  const rec1 = calculateReciprocal(0, 2, 3);
  assert.equal(rec1.recipNum, 3);
  assert.equal(rec1.recipDen, 2);

  const rec2 = calculateReciprocal(5, 0, 1);
  assert.equal(rec2.recipNum, 1);
  assert.equal(rec2.recipDen, 5);

  const rec3 = calculateReciprocal(1, 3, 7);
  assert.equal(rec3.improperNum, 10);
  assert.equal(rec3.improperDen, 7);
  assert.equal(rec3.recipNum, 7);
  assert.equal(rec3.recipDen, 10);

  // calculateDivisionFit: 1/2 ÷ 1/4 = 2 wholes
  const fit1 = calculateDivisionFit(0, 1, 2, 1, 4);
  assert.equal(fit1.fullGroups, 2);
  assert.equal(fit1.remParts, 0);
  assert.equal(fit1.simplified.num, 2);
  assert.equal(fit1.simplified.den, 1);

  // calculateDivisionFit: 3/4 ÷ 1/2 = 1 1/2
  const fit2 = calculateDivisionFit(0, 3, 4, 1, 2);
  assert.equal(fit2.fullGroups, 1);
  assert.equal(fit2.partialFraction.num, 1);
  assert.equal(fit2.partialFraction.den, 2);
  assert.equal(fit2.mixed.whole, 1);
  assert.equal(fit2.mixed.simplifiedNum, 1);
  assert.equal(fit2.mixed.simplifiedDen, 2);

  // calculateDivisionFit: 6 ÷ 1/3 = 18
  const fit3 = calculateDivisionFit(6, 0, 1, 1, 3);
  assert.equal(fit3.fullGroups, 18);
  assert.equal(fit3.remParts, 0);

  // calculateDivisionSharing: 5/8 ÷ 3 = 5/24
  const share1 = calculateDivisionSharing(5, 8, 3);
  assert.equal(share1.shareNum, 5);
  assert.equal(share1.shareDen, 24);
  assert.equal(share1.simplified.num, 5);
  assert.equal(share1.simplified.den, 24);

  // calculateDivisionSharing: 3/4 ÷ 5 = 3/20
  const share2 = calculateDivisionSharing(3, 4, 5);
  assert.equal(share2.shareNum, 3);
  assert.equal(share2.shareDen, 20);
  assert.equal(share2.simplified.num, 3);
  assert.equal(share2.simplified.den, 20);
});
