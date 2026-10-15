/**
 * @file test-block-validation.mjs
 * Automated regression tests for block type and simulation type validation,
 * including nesting location traversal and property path reporting.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  CANONICAL_BLOCK_TYPES,
  BLOCK_TYPE_ALIASES,
  SUPPORTED_BLOCK_TYPES,
  normalizeBlockType,
  isSupportedBlockType,
  CANONICAL_SIMULATION_TYPES,
  SIMULATION_TYPE_ALIASES,
  SUPPORTED_SIMULATION_TYPES,
  normalizeSimulationType,
  isSupportedSimulationType
} from '../src/slideshow/blockTypes.js';

import { validateLesson } from '../src/slideshow/validator.js';

// ---------------------------------------------------------------------------
// 1. Shared Definitions and Aliases Tests
// ---------------------------------------------------------------------------

test('blockTypes exports canonical blocks, simulation types, and aliases', () => {
  assert.ok(CANONICAL_BLOCK_TYPES.includes('paragraph'));
  assert.ok(CANONICAL_BLOCK_TYPES.includes('heading'));
  assert.ok(CANONICAL_BLOCK_TYPES.includes('table'));
  assert.ok(CANONICAL_BLOCK_TYPES.includes('measured-bar'));
  assert.ok(CANONICAL_BLOCK_TYPES.includes('simulation'));
  assert.ok(CANONICAL_BLOCK_TYPES.includes('solution'));

  assert.equal(BLOCK_TYPE_ALIASES['divided-bar'], 'measured-bar');
  assert.equal(normalizeBlockType('divided-bar'), 'measured-bar');
  assert.equal(isSupportedBlockType('divided-bar'), true);
  assert.equal(isSupportedBlockType('measured-bar'), true);
  assert.equal(isSupportedBlockType('invalid-block-name'), false);

  assert.ok(CANONICAL_SIMULATION_TYPES.includes('spinner'));
  assert.ok(CANONICAL_SIMULATION_TYPES.includes('counter-bag'));
  assert.ok(CANONICAL_SIMULATION_TYPES.includes('pen-draw'));
  assert.ok(CANONICAL_SIMULATION_TYPES.includes('coin-class'));
  assert.ok(CANONICAL_SIMULATION_TYPES.includes('coin-summary'));
  assert.ok(CANONICAL_SIMULATION_TYPES.includes('coin-cumulative'));
  assert.ok(CANONICAL_SIMULATION_TYPES.includes('basketball'));

  assert.equal(SIMULATION_TYPE_ALIASES['spinners'], 'spinner');
  assert.equal(SIMULATION_TYPE_ALIASES['bag-draw'], 'counter-bag');
  assert.equal(SIMULATION_TYPE_ALIASES['box-draw'], 'pen-draw');

  assert.equal(isSupportedSimulationType('spinners'), true);
  assert.equal(isSupportedSimulationType('bag-draw'), true);
  assert.equal(isSupportedSimulationType('box-draw'), true);
  assert.equal(isSupportedSimulationType('spinner'), true);
  assert.equal(isSupportedSimulationType('counter-bag'), true);
  assert.equal(isSupportedSimulationType('pen-draw'), true);
  assert.equal(isSupportedSimulationType('basketball'), true);
  assert.equal(isSupportedSimulationType('roulette'), false);
});

// ---------------------------------------------------------------------------
// 2. Traversal and Error Reporting in Each Nesting Location
// ---------------------------------------------------------------------------

function makeLesson(slideObj) {
  return {
    id: 'TEST-BLOCKS',
    title: 'Block Validation Test Lesson',
    slides: [slideObj]
  };
}

test('rejects misspelled block type in slide.rightBlocks with ID, slide, and path', () => {
  const lesson = makeLesson({
    type: 'we-do',
    title: 'We Do Slide',
    rightBlocks: [
      { type: 'paragrph', text: 'Misspelled block' }
    ]
  });

  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, false);
  const err = res.errors.find((e) => e.includes('slide.rightBlocks[0]'));
  assert.ok(err, 'Error must identify slide.rightBlocks[0]');
  assert.ok(err.includes('[LessonValidation: TEST-BLOCKS]'), 'Error must include lesson ID');
  assert.ok(err.includes('Slide 1'), 'Error must include slide number');
  assert.ok(err.includes("Unsupported block type 'paragrph'"), 'Error must name the unsupported type');
});

test('rejects misspelled block type in slide.leftBlocks', () => {
  const lesson = makeLesson({
    type: 'worked-example',
    title: 'Worked Example',
    leftBlocks: [
      { type: 'formla', latex: 'x = 1' }
    ],
    steps: [{ label: 'Step 1', text: 'Do math' }]
  });

  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, false);
  const err = res.errors.find((e) => e.includes('slide.leftBlocks[0]'));
  assert.ok(err);
  assert.ok(err.includes("Unsupported block type 'formla'"));
});

test('rejects misspelled block type in slide.steps[].blocks', () => {
  const lesson = makeLesson({
    type: 'worked-example',
    title: 'Worked Example',
    prompt: 'Solve equation',
    steps: [
      {
        label: 'Step 1',
        text: 'Initial step',
        blocks: [
          { type: 'heding', text: 'Misspelled heading' }
        ]
      }
    ]
  });

  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, false);
  const err = res.errors.find((e) => e.includes('slide.steps[0].blocks[0]'));
  assert.ok(err);
  assert.ok(err.includes("Unsupported block type 'heding'"));
});

test('rejects misspelled block type in slide.columns[].blocks', () => {
  const lesson = makeLesson({
    type: 'notes',
    title: 'Notes Slide',
    columns: [
      {
        width: '50',
        title: 'Col 1',
        blocks: [
          { type: 'tbl', headers: ['A'], rows: [['1']] }
        ]
      }
    ]
  });

  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, false);
  const err = res.errors.find((e) => e.includes('slide.columns[0].blocks[0]'));
  assert.ok(err);
  assert.ok(err.includes("Unsupported block type 'tbl'"));
});

test('rejects misspelled block type in slide.tasks[].blocks and tasks[].solution', () => {
  const lesson = makeLesson({
    type: 'practice',
    title: 'Practice Slide',
    tasks: [
      {
        title: 'Task 1',
        blocks: [
          { type: 'row-data', data: '1, 2, 3' }
        ],
        solution: [
          { type: 'soluton-note', text: 'Misspelled in task solution' }
        ]
      }
    ]
  });

  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, false);
  const errBlock = res.errors.find((e) => e.includes('slide.tasks[0].blocks[0]'));
  const errSol = res.errors.find((e) => e.includes('slide.tasks[0].solution[0]'));
  assert.ok(errBlock, 'Should detect invalid block in task.blocks');
  assert.ok(errBlock.includes("Unsupported block type 'row-data'"));
  assert.ok(errSol, 'Should detect invalid block in task.solution');
  assert.ok(errSol.includes("Unsupported block type 'soluton-note'"));
});

test('rejects misspelled block type in slide.questions[].solution', () => {
  const lesson = makeLesson({
    type: 'exit-ticket',
    title: 'Exit Ticket Slide',
    questions: [
      {
        prompt: 'What is 5 + 5?',
        solution: [
          { type: 'paragraf', text: '10' }
        ]
      }
    ]
  });

  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, false);
  const err = res.errors.find((e) => e.includes('slide.questions[0].solution[0]'));
  assert.ok(err);
  assert.ok(err.includes("Unsupported block type 'paragraf'"));
});

test('rejects misspelled block type nested inside a solution block', () => {
  const lesson = makeLesson({
    type: 'notes',
    title: 'Notes with Solution',
    content: [
      {
        type: 'solution',
        title: 'Model Answer',
        blocks: [
          { type: 'bullet-lst', items: ['Item 1'] }
        ]
      }
    ]
  });

  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, false);
  const err = res.errors.find((e) => e.includes('slide.content[0].blocks[0]'));
  assert.ok(err);
  assert.ok(err.includes("Unsupported block type 'bullet-lst'"));
});

test('rejects misspelled block type inside graph notes', () => {
  const lesson = makeLesson({
    type: 'we-do',
    title: 'Graph Notes Test',
    workspaceContent: [
      {
        type: 'sector-construction',
        total: 24,
        categories: [{ label: 'A', value: 12, angle: 180 }],
        notes: [
          { type: 'notebox', text: 'Misspelled note-box' }
        ]
      }
    ]
  });

  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, false);
  const err = res.errors.find((e) => e.includes('slide.workspaceContent[0].notes[0]'));
  assert.ok(err);
  assert.ok(err.includes("Unsupported block type 'notebox'"));
});

// ---------------------------------------------------------------------------
// 3. Simulation Name Validation Tests
// ---------------------------------------------------------------------------

test('rejects unknown or misspelled simulation types with property path', () => {
  const lesson = makeLesson({
    type: 'notes',
    title: 'Simulation Slide',
    sidebarNotes: [
      { type: 'simulation', simType: 'spinnr' }
    ]
  });

  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, false);
  const err = res.errors.find((e) => e.includes('slide.sidebarNotes[0]'));
  assert.ok(err);
  assert.ok(err.includes("[LessonValidation: TEST-BLOCKS]"));
  assert.ok(err.includes("Unsupported simulation type 'spinnr'"));
});

test('accepts valid simulation aliases: spinners, bag-draw, box-draw', () => {
  const lesson = makeLesson({
    type: 'notes',
    title: 'Simulation Aliases Slide',
    sidebarNotes: [
      { type: 'simulation', simType: 'spinners' },
      { type: 'simulation', simType: 'bag-draw' },
      { type: 'simulation', simType: 'box-draw' }
    ]
  });

  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, true, `Aliases should be accepted: ${res.errors.join(', ')}`);
});

test('does not misinterpret table rows, cells, or graph categories as blocks', () => {
  const lesson = makeLesson({
    type: 'notes',
    title: 'Data Slide',
    content: [
      {
        type: 'table',
        headers: ['Category', 'Value'],
        rows: [
          [{ text: 'Row 1', reveal: true }, 10],
          [{ text: 'Row 2', reveal: true }, 20]
        ]
      },
      {
        type: 'measured-bar',
        totalLength: 10,
        categories: [
          { label: 'Part A', value: 5, color: '#2563eb' },
          { label: 'Part B', value: 5, color: '#16a34a' }
        ]
      }
    ]
  });

  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, true, `Data items must not trigger block errors: ${res.errors.join(', ')}`);
});

test('rejects misspelled block type in slide.sidebarNotes and slide.extraBlocks', () => {
  const lessonSidebar = makeLesson({
    type: 'do-now',
    title: 'Do Now',
    sidebarNotes: [
      { type: 'note-bx', text: 'Misspelled' }
    ]
  });
  const resSidebar = validateLesson(lessonSidebar, { silent: true });
  assert.equal(resSidebar.valid, false);
  const errSidebar = resSidebar.errors.find((e) => e.includes('slide.sidebarNotes[0]'));
  assert.ok(errSidebar);
  assert.ok(errSidebar.includes("Unsupported block type 'note-bx'"));

  const lessonExtra = makeLesson({
    type: 'learning',
    title: 'Learning Intentions',
    learningIntention: 'Learn probability',
    successCriteria: ['Success 1'],
    extraBlocks: [
      { type: 'bullet-lists', items: ['Invalid'] }
    ]
  });
  const resExtra = validateLesson(lessonExtra, { silent: true });
  assert.equal(resExtra.valid, false);
  const errExtra = resExtra.errors.find((e) => e.includes('slide.extraBlocks[0]'));
  assert.ok(errExtra);
  assert.ok(errExtra.includes("Unsupported block type 'bullet-lists'"));
});

test('rejects misspelled block type in slide.solution (array and single object)', () => {
  const lessonSolArray = makeLesson({
    type: 'we-do',
    title: 'We Do Slide',
    solution: [
      { type: 'paragrph', text: 'Misspelled in array solution' }
    ]
  });
  const resArray = validateLesson(lessonSolArray, { silent: true });
  assert.equal(resArray.valid, false);
  const errArray = resArray.errors.find((e) => e.includes('slide.solution[0]'));
  assert.ok(errArray);
  assert.ok(errArray.includes("Unsupported block type 'paragrph'"));

  const lessonSolObj = makeLesson({
    type: 'we-do',
    title: 'We Do Slide',
    solution: { type: 'bad-block-type', text: 'Misspelled in single object solution' }
  });
  const resObj = validateLesson(lessonSolObj, { silent: true });
  assert.equal(resObj.valid, false);
  const errObj = resObj.errors.find((e) => e.includes('slide.solution'));
  assert.ok(errObj);
  assert.ok(errObj.includes("Unsupported block type 'bad-block-type'"));
});

test('rejects misspelled simulation name in deeply nested block container', () => {
  const lesson = makeLesson({
    type: 'worked-example',
    title: 'Deep Simulation Test',
    steps: [
      {
        label: 'Step 1',
        blocks: [
          {
            type: 'solution',
            title: 'Working',
            blocks: [
              { type: 'simulation', simType: 'roulette-wheel' }
            ]
          }
        ]
      }
    ]
  });
  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, false);
  const err = res.errors.find((e) => e.includes('slide.steps[0].blocks[0].blocks[0]'));
  assert.ok(err);
  assert.ok(err.includes("Unsupported simulation type 'roulette-wheel'"));
});

test('rejects invalid non-object entries in block containers with path', () => {
  const lesson = makeLesson({
    type: 'we-do',
    title: 'We Do Slide',
    rightBlocks: [null, 'raw-string']
  });
  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, false);
  assert.ok(res.errors.some((e) => e.includes('slide.rightBlocks[0]') && e.includes('Invalid block entry')));
  assert.ok(res.errors.some((e) => e.includes('slide.rightBlocks[1]') && e.includes('Invalid block entry')));
});

test('validates all registered lessons from manifest without errors', async () => {
  const { lessonManifest } = await import('../src/lessons/manifest.js');
  assert.ok(Array.isArray(lessonManifest) && lessonManifest.length >= 5);

  for (const entry of lessonManifest) {
    const mod = await import(new URL(`../src/lessons/${entry.id}.js`, import.meta.url).href);
    const lesson = mod.default;
    const res = validateLesson(lesson, { silent: true });
    assert.equal(res.valid, true, `Lesson ${entry.id} must pass validation without errors: ${res.errors.join('; ')}`);
  }
});

