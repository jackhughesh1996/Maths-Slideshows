/**
 * @file test-slide-types.mjs
 * Automated regression tests for slide type definitions, alias normalization,
 * validator schema enforcement, and rendered layouts.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import {
  CANONICAL_SLIDE_TYPES,
  SLIDE_TYPE_ALIASES,
  SUPPORTED_SLIDE_TYPES,
  normalizeSlideType,
  isSupportedSlideType
} from '../src/slideshow/slideTypes.js';

import { validateLesson } from '../src/slideshow/validator.js';

// Setup minimal document mock for Node testing of DOM elements
globalThis.document = {
  compatMode: 'CSS1Compat',
  createElement: (tag) => ({
    tagName: tag.toUpperCase(),
    className: '',
    id: '',
    dataset: {},
    innerHTML: ''
  })
};

// Load renderer in Node by stripping browser-only KaTeX CSS import
const mathUrl = new URL('../src/slideshow/math.js', import.meta.url);
let mathSource = await readFile(mathUrl, 'utf8');
mathSource = mathSource
  .replace("import katex from 'katex';", `import katex from ${JSON.stringify(import.meta.resolve('katex'))};`)
  .replace("import 'katex/dist/katex.min.css';", '');

const asModule = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const mathMod = asModule(mathSource);

const slideTypesUrl = new URL('../src/slideshow/slideTypes.js', import.meta.url).href;
const blockTypesUrl = new URL('../src/slideshow/blockTypes.js', import.meta.url).href;
const simUrl = new URL('../src/slideshow/experimentalSimulations.js', import.meta.url);
let simSource = await readFile(simUrl, 'utf8');
simSource = simSource.replace("from './math.js'", `from ${JSON.stringify(mathMod)}`);
const simMod = asModule(simSource);

let rendererSource = await readFile(new URL('../src/slideshow/renderer.js', import.meta.url), 'utf8');
rendererSource = rendererSource
  .replace("from './math.js'", `from ${JSON.stringify(mathMod)}`)
  .replace("from './slideTypes.js'", `from ${JSON.stringify(slideTypesUrl)}`)
  .replace("from './blockTypes.js'", `from ${JSON.stringify(blockTypesUrl)}`)
  .replace("from './experimentalSimulations.js'", `from ${JSON.stringify(simMod)}`);

const { renderSlide } = await import(asModule(rendererSource));

// ---------------------------------------------------------------------------
// 1. Shared Definitions and Normalisation Tests
// ---------------------------------------------------------------------------

test('slideTypes exports canonical types, aliases, and correct membership', () => {
  assert.ok(Array.isArray(CANONICAL_SLIDE_TYPES));
  assert.ok(CANONICAL_SLIDE_TYPES.includes('worked-example'));
  assert.ok(CANONICAL_SLIDE_TYPES.includes('practice'));
  assert.ok(CANONICAL_SLIDE_TYPES.includes('we-do'));
  assert.ok(CANONICAL_SLIDE_TYPES.includes('board-task'));
  assert.ok(CANONICAL_SLIDE_TYPES.includes('notes'));

  assert.equal(SLIDE_TYPE_ALIASES['i-do'], 'worked-example');
  assert.equal(SLIDE_TYPE_ALIASES['you-do'], 'practice');

  assert.equal(isSupportedSlideType('i-do'), true);
  assert.equal(isSupportedSlideType('you-do'), true);
  assert.equal(isSupportedSlideType('worked-example'), true);
  assert.equal(isSupportedSlideType('practice'), true);
  assert.equal(isSupportedSlideType('we-do'), true);
  assert.equal(isSupportedSlideType('board-task'), true);
  assert.equal(isSupportedSlideType('notes'), true);

  assert.equal(isSupportedSlideType('mystery-slide'), false);
  assert.equal(isSupportedSlideType(''), false);
  assert.equal(isSupportedSlideType(null), false);
  assert.equal(isSupportedSlideType(undefined), false);
});

test('normalizeSlideType resolves aliases without mutating input objects', () => {
  assert.equal(normalizeSlideType('i-do'), 'worked-example');
  assert.equal(normalizeSlideType('you-do'), 'practice');
  assert.equal(normalizeSlideType('worked-example'), 'worked-example');
  assert.equal(normalizeSlideType('practice'), 'practice');
  assert.equal(normalizeSlideType('we-do'), 'we-do');
  assert.equal(normalizeSlideType('board-task'), 'board-task');

  // Object input support
  const iDoObj = { type: 'i-do', title: 'Example' };
  assert.equal(normalizeSlideType(iDoObj), 'worked-example');
  assert.equal(iDoObj.type, 'i-do', 'Input object type property must NOT be mutated');

  const youDoObj = { type: 'you-do', title: 'Practice' };
  assert.equal(normalizeSlideType(youDoObj), 'practice');
  assert.equal(youDoObj.type, 'you-do', 'Input object type property must NOT be mutated');
});

// ---------------------------------------------------------------------------
// 2. Validator Tests
// ---------------------------------------------------------------------------

test('validator rejects unknown slide types and missing types', () => {
  const lessonWithUnknown = {
    id: 'TEST-1',
    title: 'Test Unknown Type',
    slides: [
      { type: 'invalid-type-xyz', title: 'Invalid Slide' }
    ]
  };

  const resUnknown = validateLesson(lessonWithUnknown, { silent: true });
  assert.equal(resUnknown.valid, false);
  assert.ok(resUnknown.errors.some((err) => err.includes("Unsupported slide type 'invalid-type-xyz'")));

  const lessonWithMissing = {
    id: 'TEST-2',
    title: 'Test Missing Type',
    slides: [
      { title: 'No Type Slide' }
    ]
  };

  const resMissing = validateLesson(lessonWithMissing, { silent: true });
  assert.equal(resMissing.valid, false);
  assert.ok(resMissing.errors.some((err) => err.includes("Missing required 'type' property")));
});

test('validator accepts i-do and you-do aliases while preserving lesson immutability', () => {
  const lesson = {
    id: 'TEST-3',
    title: 'Test Aliases',
    slides: [
      {
        type: 'i-do',
        title: 'I Do Worked Example',
        prompt: 'Calculate 2 + 2',
        steps: [{ label: 'Add numbers', text: '$2 + 2 = 4$' }]
      },
      {
        type: 'you-do',
        title: 'You Do Practice',
        tasks: [{ title: 'Task 1', prompt: 'Solve $3 + 3$' }]
      }
    ]
  };

  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, true, `Validation should pass for valid i-do and you-do slides: ${res.errors.join(', ')}`);

  // Immutability check
  assert.equal(lesson.slides[0].type, 'i-do', 'Validator must not mutate slide.type on i-do slide');
  assert.equal(lesson.slides[1].type, 'you-do', 'Validator must not mutate slide.type on you-do slide');
});

test('validator enforces practice requirements on you-do alias', () => {
  const lessonInvalidYouDo = {
    id: 'TEST-4',
    title: 'Test Empty You Do',
    slides: [
      {
        type: 'you-do',
        title: 'Empty Practice without tasks or content'
      }
    ]
  };

  const res = validateLesson(lessonInvalidYouDo, { silent: true });
  assert.equal(res.valid, false);
  assert.ok(res.errors.some((err) => err.includes("Practice slide must define a non-empty 'tasks' array or 'content'")));
});

// ---------------------------------------------------------------------------
// 3. Renderer Layout Tests
// ---------------------------------------------------------------------------

test('i-do renders worked-example layout and phase-i-do badge without mutating slide', () => {
  const slide = {
    type: 'i-do',
    title: 'Finding the Sector Angle',
    prompt: 'Survey of 20 students',
    steps: [
      { label: 'Find Fraction', text: '$\\frac{5}{20} = \\frac{1}{4}$' }
    ]
  };

  const rendered = renderSlide(slide, 0);

  // Assert worked-example specific layout elements
  assert.ok(rendered.innerHTML.includes('Problem Statement'), 'i-do must render worked-example "Problem Statement" card');
  assert.ok(rendered.innerHTML.includes('Step-by-Step Working'), 'i-do must render worked-example "Step-by-Step Working" card');
  assert.ok(rendered.innerHTML.includes('phase-i-do'), 'i-do must use phase-i-do class badge');
  assert.ok(rendered.innerHTML.includes('I Do — Worked Example'), 'i-do default badge label must be "I Do — Worked Example"');

  // Verify immutability
  assert.equal(slide.type, 'i-do', 'Rendering must NOT mutate original slide.type');
});

test('you-do renders practice layout and phase-you-do badge without mutating slide', () => {
  const slide = {
    type: 'you-do',
    title: 'Workbook Problems',
    tasks: [
      { title: 'Question 1', prompt: 'Calculate the angle for 10 out of 40' }
    ]
  };

  const rendered = renderSlide(slide, 1);

  // Assert practice specific layout elements
  assert.ok(rendered.innerHTML.includes('col-third'), 'you-do must render practice task card with col-third class');
  assert.ok(rendered.innerHTML.includes('Question 1'), 'you-do must render task title');
  assert.ok(rendered.innerHTML.includes('phase-you-do'), 'you-do must use phase-you-do class badge');
  assert.ok(rendered.innerHTML.includes('You Do — Independent Practice'), 'you-do default badge label must be "You Do — Independent Practice"');

  // Verify immutability
  assert.equal(slide.type, 'you-do', 'Rendering must NOT mutate original slide.type');
});

test('we-do and board-task preserve distinct default labels and board task layout', () => {
  const weDoSlide = {
    type: 'we-do',
    title: 'Guided Whiteboard Practice',
    prompt: 'Calculate together'
  };

  const boardTaskSlide = {
    type: 'board-task',
    title: 'Individual Board Task',
    prompt: 'Write on whiteboards'
  };

  const renderedWeDo = renderSlide(weDoSlide, 2);
  const renderedBoardTask = renderSlide(boardTaskSlide, 3);

  // Both should render board-task layout
  assert.ok(renderedWeDo.innerHTML.includes('whiteboard-instruction'), 'we-do must render board-task layout');
  assert.ok(renderedBoardTask.innerHTML.includes('whiteboard-instruction'), 'board-task must render board-task layout');

  // Both should have phase-we-do badge class
  assert.ok(renderedWeDo.innerHTML.includes('phase-we-do'), 'we-do must have phase-we-do badge');
  assert.ok(renderedBoardTask.innerHTML.includes('phase-we-do'), 'board-task must have phase-we-do badge');

  // Each preserves its distinct default label
  assert.ok(renderedWeDo.innerHTML.includes('We Do — Guided Practice'), 'we-do default label must be "We Do — Guided Practice"');
  assert.ok(renderedBoardTask.innerHTML.includes('We Do — Board Task'), 'board-task default label must be "We Do — Board Task"');
});
