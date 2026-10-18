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
  normalizeBlockType,
  isSupportedBlockType,
  CANONICAL_SIMULATION_TYPES,
  SIMULATION_TYPE_ALIASES,
  isSupportedSimulationType
} from '../src/slideshow/blockTypes.js';

import { validateLesson, SUPPORTED_NOTE_VARIANTS } from '../src/slideshow/validator.js';

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
    type: 'do-now',
    title: 'Simulation Slide',
    questions: [{ prompt: 'Warm-up question', answer: 'Warm-up answer' }],
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
    type: 'do-now',
    title: 'Simulation Aliases Slide',
    questions: [{ prompt: 'Warm-up question', answer: 'Warm-up answer' }],
    sidebarNotes: [
      { type: 'simulation', simType: 'spinners', spinners: [{ sectors: [{ label: 'A', angle: 360 }] }] },
      { type: 'simulation', simType: 'bag-draw', items: [{ label: 'A', count: 1 }] },
      { type: 'simulation', simType: 'box-draw', items: [{ label: 'A', count: 0 }] }
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

test('rejects misspelled property "varient" on note-box with actionable guidance', () => {
  const lesson = makeLesson({
    type: 'notes',
    title: 'Misspelled Varient Test',
    content: [
      { type: 'note-box', varient: 'gold', text: 'Important note' }
    ]
  });
  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, false);
  const err = res.errors.find((e) => e.includes('slide.content[0]') && e.includes('varient'));
  assert.ok(err, 'Should find error mentioning varient in slide.content[0]');
  assert.ok(err.includes("Unknown or unexpected block property 'varient' (did you mean 'variant'?)"));
});

test('rejects invalid note variants and non-string variant values while accepting supported variants', () => {
  const lessonInvalidVariant = makeLesson({
    type: 'notes',
    title: 'Invalid Note Variant Test',
    content: [
      { type: 'note-box', variant: 'purple', text: 'Purple note' },
      { type: 'note-box', variant: 123, text: 'Numeric variant note' }
    ]
  });
  const res = validateLesson(lessonInvalidVariant, { silent: true });
  assert.equal(res.valid, false);
  assert.ok(res.errors.some((e) => e.includes('slide.content[0]') && e.includes("Unsupported note-box variant 'purple'")));
  assert.ok(res.errors.some((e) => e.includes('slide.content[1]') && e.includes("'variant' must be a string")));

  // Valid note variants should all pass
  for (const variant of SUPPORTED_NOTE_VARIANTS) {
    const validLesson = makeLesson({
      type: 'notes',
      title: `${variant} Note Test`,
      content: [
        { type: 'note-box', variant, text: `${variant} text` }
      ]
    });
    const validRes = validateLesson(validLesson, { silent: true });
    assert.equal(validRes.valid, true, `Variant '${variant}' must be accepted`);
  }
});

test('rejects unequal table row widths matching headers count', () => {
  const lesson = makeLesson({
    type: 'notes',
    title: 'Unequal Table Rows Test',
    content: [
      {
        type: 'table',
        headers: ['Col A', 'Col B', 'Col C'],
        rows: [
          ['1', '2', '3'],
          ['4', '5'],          // too short (2 cells vs 3)
          ['6', '7', '8', '9'] // too long (4 cells vs 3)
        ]
      }
    ]
  });
  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, false);
  const errShort = res.errors.find((e) => e.includes('Row [1]') && e.includes('Unequal table row width'));
  const errLong = res.errors.find((e) => e.includes('Row [2]') && e.includes('Unequal table row width'));
  assert.ok(errShort, 'Should detect Row [1] being too short');
  assert.ok(errShort.includes('row has 2 cells, expected 3 cells (matching headers count)'));
  assert.ok(errLong, 'Should detect Row [2] being too long');
  assert.ok(errLong.includes('row has 4 cells, expected 3 cells (matching headers count)'));
});

test('rejects unequal table row widths without headers matching first row width', () => {
  const lesson = makeLesson({
    type: 'notes',
    title: 'Unequal Table Rows No Headers Test',
    content: [
      {
        type: 'table',
        rows: [
          ['A', 'B'],
          ['C', 'D', 'E'] // 3 cells vs 2
        ]
      }
    ]
  });
  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, false);
  const err = res.errors.find((e) => e.includes('Row [1]') && e.includes('Unequal table row width'));
  assert.ok(err, 'Should detect Row [1] mismatching first row width');
  assert.ok(err.includes('row has 3 cells, expected 2 cells (matching first row width)'));
});

test('rejects malformed table rows (non-array rows, null cells, unknown cell properties)', () => {
  const lesson = makeLesson({
    type: 'notes',
    title: 'Malformed Table Rows Test',
    content: [
      {
        type: 'table',
        headers: ['A', 'B'],
        rows: [
          'not an array row',
          [null, 'valid'],
          [{ text: 'Cell', reveal: true, unknownCellProp: 123 }, 'valid'],
          [{ text: 'Cell', reveal: 'not-a-boolean' }, 'valid'],
          [{ text: 42, revealStep: -2 }, 'valid']
        ]
      }
    ]
  });
  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, false);
  assert.ok(res.errors.some((e) => e.includes('Row [0]: Table row must be an array of cells')));
  assert.ok(res.errors.some((e) => e.includes('Row [1] Cell [0]: Cell cannot be null or undefined')));
  assert.ok(res.errors.some((e) => e.includes("Row [2] Cell [0]: Unknown cell property 'unknownCellProp'")));
  assert.ok(res.errors.some((e) => e.includes("Row [3] Cell [0]: 'reveal' must be a boolean")));
  assert.ok(res.errors.some((e) => e.includes("Row [4] Cell [0]: 'revealStep' must be a positive integer")));
});

test('rejects wrong field types across block properties', () => {
  const lesson = makeLesson({
    type: 'notes',
    title: 'Wrong Field Types Test',
    content: [
      { type: 'heading', text: 123, level: 'high' },
      { type: 'paragraph', text: ['Not a string'] },
      { type: 'formula', latex: '' },
      { type: 'bullet-list', items: 'not an array' },
      { type: 'note-box', text: 'Valid', copyToWorkbook: 'yes' },
      { type: 'paragraph', text: 'Valid', reveal: 'true', revealStep: 0 }
    ]
  });
  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, false);
  assert.ok(res.errors.some((e) => e.includes('slide.content[0]') && e.includes("Heading 'text' must be a string")));
  assert.ok(res.errors.some((e) => e.includes('slide.content[0]') && e.includes("Heading 'level' must be an integer between 1 and 6")));
  assert.ok(res.errors.some((e) => e.includes('slide.content[1]') && e.includes("Paragraph 'text' must be a string")));
  assert.ok(res.errors.some((e) => e.includes('slide.content[2]') && e.includes("Formula 'latex' cannot be empty")));
  assert.ok(res.errors.some((e) => e.includes('slide.content[3]') && e.includes("bullet-list requires an 'items' array")));
  assert.ok(res.errors.some((e) => e.includes('slide.content[4]') && e.includes("Note-box 'copyToWorkbook' must be a boolean")));
  assert.ok(res.errors.some((e) => e.includes('slide.content[5]') && e.includes("'reveal' must be a boolean")));
  assert.ok(res.errors.some((e) => e.includes('slide.content[5]') && e.includes("'revealStep' must be a positive integer")));
});

test('rejects misspelled properties on various block types', () => {
  const lesson = makeLesson({
    type: 'notes',
    title: 'Misspelled Props Test',
    content: [
      { type: 'paragraph', text: 'Hello', tezt: 'Extra misspelled' },
      { type: 'formula', latex: 'x=1', latx: 'misspelled' },
      { type: 'table', headers: ['A'], rows: [['1']], compactTable: true }
    ]
  });
  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, false);
  assert.ok(res.errors.some((e) => e.includes("Unknown or unexpected block property 'tezt'")));
  assert.ok(res.errors.some((e) => e.includes("Unknown or unexpected block property 'latx'")));
  assert.ok(res.errors.some((e) => e.includes("Unknown or unexpected block property 'compactTable'")));
});

test('rejects unknown or misspelled properties in stem-and-leaf rows', () => {
  const lesson = makeLesson({
    type: 'notes',
    title: 'Stem and Leaf Row Props Test',
    content: [
      {
        type: 'stem-and-leaf',
        rows: [
          { stem: 1, leaves: '2 3', leaf: '4' }
        ]
      }
    ]
  });
  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, false);
  assert.ok(res.errors.some((e) => e.includes("Unknown property 'leaf' in stem-and-leaf row")));
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


function validateGraphBlock(block) {
  return validateLesson(makeLesson({
    type: 'notes',
    title: 'Nested graph validation',
    content: [block]
  }), { silent: true });
}

const nestedGraphCases = [
  { type: 'sector-graph', key: 'items', numbers: ['amount', 'fraction', 'angle'], required: ['amount', 'fraction'], strings: ['color'] },
  ...['categories', 'items'].map((key) => ({
    type: 'sector-construction', key, numbers: ['value', 'amount', 'angle'],
    required: ['value', 'amount', 'angle', 'fraction'], strings: ['calculation', 'color']
  })),
  ...['measured-bar', 'divided-bar'].flatMap((type) => ['categories', 'items'].map((key) => ({
    type, key, numbers: ['value', 'amount', 'length', 'fraction'],
    required: ['value', 'amount', 'length', 'fraction'], strings: ['color']
  })))
];

for (const { type, key, numbers, required, strings } of nestedGraphCases) {
  test(`${type}.${key} accepts numeric alternatives, zeros and optional strings`, () => {
    for (const prop of required) {
      for (const value of [0, 0.25]) {
        // Type-valid entries must now also describe a complete graph. Zero is
        // retained as a category, paired with the remainder of the whole.
        const first = { label: 'A', [prop]: value };
        const second = { label: 'B', [prop]: (prop === 'angle' ? 360 : 1) - value };
        if (type === 'sector-construction' && prop === 'fraction') {
          first.angle = value * 360;
          second.angle = (1 - value) * 360;
        }
        const result = validateGraphBlock({ type, [key]: [first, second] });
        assert.equal(result.valid, true, `${prop}=${value}: ${result.errors.join('; ')}`);
      }
    }
    const item = { label: 'A', ...Object.fromEntries(numbers.map((prop) => [prop, 0])),
      ...Object.fromEntries(strings.map((prop) => [prop, ''])) };
    const remainder = { label: 'B', ...Object.fromEntries(numbers.map((prop) => [prop, prop === 'angle' ? 360 : 1])) };
    const result = validateGraphBlock({ type, [key]: [item, remainder] });
    assert.equal(result.valid, true, result.errors.join('; '));
  });

  test(`${type}.${key} rejects non-finite numbers and invalid nested field types`, () => {
    for (const prop of numbers) {
      for (const value of [NaN, Infinity, -Infinity, '1', '', null, true, {}, []]) {
        const result = validateGraphBlock({ type, [key]: [{ label: 'A', [required[0]]: 1, [prop]: value }] });
        assert.equal(result.valid, false, `${prop}=${String(value)} must fail`);
        assert.ok(result.errors.some((error) => error.includes('slide.content[0]') &&
          error.includes('Item [0]') && error.includes(`'${prop}' must be a finite number`)), result.errors.join('; '));
      }
    }
    for (const prop of strings) {
      for (const value of [0, null, false, {}, []]) {
        const result = validateGraphBlock({ type, [key]: [{ label: 'A', [required[0]]: 1, [prop]: value }] });
        assert.equal(result.valid, false);
        assert.ok(result.errors.some((error) => error.includes('Item [0]') &&
          error.includes(`'${prop}' must be a string`)), result.errors.join('; '));
      }
    }
    for (const item of [null, [], 'A', 0]) {
      const result = validateGraphBlock({ type, [key]: [item] });
      assert.equal(result.valid, false);
      assert.ok(result.errors.some((error) => error.includes('Item [0]') && error.includes('must be an object')));
    }
    const missingLabel = validateGraphBlock({ type, [key]: [{ [required[0]]: 0 }] });
    assert.equal(missingLabel.valid, false);
    const missingValue = validateGraphBlock({ type, [key]: [{ label: 'A' }] });
    assert.equal(missingValue.valid, false);
  });
}

for (const key of ['categories', 'items']) {
  test(`sector-construction.${key} accepts LaTeX fractions and rejects invalid fractions`, () => {
    for (const fraction of [0, 0.5, String.raw`\frac{1}{2}`]) {
      const proportion = typeof fraction === 'number' ? fraction : 0.5;
      const result = validateGraphBlock({ type: 'sector-construction', [key]: [
        { label: 'A', fraction, angle: proportion * 360 },
        { label: 'B', angle: (1 - proportion) * 360 }
      ] });
      assert.equal(result.valid, true, result.errors.join('; '));
    }
    for (const fraction of [NaN, Infinity, -Infinity, '', '   ', null, false, [], {}]) {
      const result = validateGraphBlock({ type: 'sector-construction', [key]: [{ label: 'A', fraction }] });
      assert.equal(result.valid, false);
      assert.ok(result.errors.some((error) => error.includes('Item [0]') &&
        error.includes("'fraction' must be a finite number or non-empty LaTeX string")), result.errors.join('; '));
    }
  });
}

test('sector-construction validates tableHeaders and nested notes without requiring optional fields', () => {
  const block = { type: 'sector-construction', categories: [{ label: 'A', value: 1 }] };
  for (const extras of [{}, { tableHeaders: [], notes: [] }, {
    tableHeaders: ['Category', '$x$', ''],
    notes: [{ type: 'solution', blocks: [{ type: 'paragraph', text: 'Valid note', reveal: true }] }]
  }]) {
    const result = validateGraphBlock({ ...block, ...extras });
    assert.equal(result.valid, true, result.errors.join('; '));
  }
  for (const tableHeaders of ['Heading', null, {}, [0], [null], [[]], [{}]]) {
    const result = validateGraphBlock({ ...block, tableHeaders });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((error) => error.includes('tableHeaders')), result.errors.join('; '));
  }
  for (const notes of ['Note', null, {}, { type: 'paragraph', text: 'Not an array' }]) {
    const result = validateGraphBlock({ ...block, notes });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((error) => error.includes("'notes' must be an array of blocks")));
  }
  for (const note of [null, 'Note', [], { type: 'paragraph', text: 0 }, { type: 'paragraf', text: 'Typo' },
    { type: 'solution', blocks: [{ type: 'formula', latex: 0 }] }]) {
    const result = validateGraphBlock({ ...block, notes: [note] });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((error) => error.includes('slide.content[0].notes[0]')), result.errors.join('; '));
  }
});

function validateSimulation(simType, config = {}) {
  return validateGraphBlock({ type: 'simulation', simType, ...config });
}

function assertSimulationError(simType, config, errorPath) {
  const result = validateSimulation(simType, config);
  assert.equal(result.valid, false, `${simType} must reject ${errorPath}`);
  assert.ok(result.errors.some((error) => error.includes(`[slide.content[0].${errorPath}]`)), result.errors.join('; '));
}

for (const simType of ['spinner', 'spinners']) {
  test(`${simType} accepts spinner metadata, finite angles and optional sector strings`, () => {
    for (const angle of [0, 90, 360, 0.5]) {
      const result = validateSimulation(simType, { spinners: [{
        id: 'spinner1', name: 'Spinner 1', badge: 'Fair', expected: 'Expected outcome',
        sectors: [{ label: 'Red', angle, color: '#dc2626', term: 'Likely' }, { label: 'Blue', angle: 0 }]
      }] });
      assert.equal(result.valid, true, result.errors.join('; '));
    }
  });

  test(`${simType} rejects malformed spinners and sectors with precise paths`, () => {
    for (const spinners of [undefined, null, {}, 'spinners', []]) {
      assertSimulationError(simType, { spinners }, 'spinners');
    }
    for (const spinner of [null, [], 'spinner', 1]) {
      assertSimulationError(simType, { spinners: [spinner] }, 'spinners[0]');
    }
    for (const sectors of [undefined, null, {}, 'sectors', []]) {
      assertSimulationError(simType, { spinners: [{ sectors }] }, 'spinners[0].sectors');
    }
    for (const sector of [null, [], 'sector', 1]) {
      assertSimulationError(simType, { spinners: [{ sectors: [sector] }] }, 'spinners[0].sectors[0]');
    }
    for (const angle of [undefined, null, NaN, Infinity, -Infinity, '90', {}, [], true]) {
      assertSimulationError(simType, { spinners: [{ sectors: [{ label: 'A', angle }] }] }, 'spinners[0].sectors[0].angle');
    }
    for (const label of [undefined, null, '', '  ', 0, [], {}]) {
      assertSimulationError(simType, { spinners: [{ sectors: [{ label, angle: 90 }] }] }, 'spinners[0].sectors[0].label');
    }
    for (const prop of ['color', 'term']) {
      for (const value of [null, 0, false, [], {}]) {
        assertSimulationError(simType, { spinners: [{ sectors: [{ label: 'A', angle: 90, [prop]: value }] }] }, `spinners[0].sectors[0].${prop}`);
      }
    }
    for (const prop of ['id', 'name', 'badge', 'expected']) {
      for (const value of [null, 0, false, [], {}]) {
        assertSimulationError(simType, { spinners: [{ [prop]: value, sectors: [{ label: 'A', angle: 90 }] }] }, `spinners[0].${prop}`);
      }
    }
    assertSimulationError(simType, { spinners: [{ sectors: [{ label: 'A', angle: 90 }], sectorz: [] }] }, 'spinners[0].sectorz');
    assertSimulationError(simType, { spinners: [{ sectors: [{ label: 'A', angle: 90, colour: 'red' }] }] }, 'spinners[0].sectors[0].colour');
  });
}

for (const simType of ['counter-bag', 'bag-draw', 'pen-draw', 'box-draw']) {
  test(`${simType} accepts draw items including zero counts`, () => {
    const result = validateSimulation(simType, { items: [
      { label: 'Red', count: 5, color: '#dc2626', term: 'Likely' },
      { label: 'Impossible', count: 0 },
      { label: 'Empty optional strings', count: 1, color: '', term: '' }
    ] });
    assert.equal(result.valid, true, result.errors.join('; '));
  });

  test(`${simType} rejects malformed items and fields with precise paths`, () => {
    for (const items of [undefined, null, 'items', {}, []]) {
      assertSimulationError(simType, { items }, 'items');
    }
    for (const item of [null, [], 'item', 1]) {
      assertSimulationError(simType, { items: [item] }, 'items[0]');
    }
    for (const label of [undefined, null, '', '  ', 0, [], {}]) {
      assertSimulationError(simType, { items: [{ label, count: 1 }] }, 'items[0].label');
    }
    for (const count of [undefined, null, -1, 0.5, NaN, Infinity, -Infinity, '1', true, [], {}]) {
      assertSimulationError(simType, { items: [{ label: 'A', count }] }, 'items[0].count');
    }
    for (const prop of ['color', 'term']) {
      for (const value of [null, 0, false, [], {}]) {
        assertSimulationError(simType, { items: [{ label: 'A', count: 1, [prop]: value }] }, `items[0].${prop}`);
      }
    }
    assertSimulationError(simType, { items: [{ label: 'A', count: 1, colour: 'red' }] }, 'items[0].colour');
  });
}

test('shared simulation fields reject non-finite and incorrectly typed values', () => {
  for (const simType of ['spinner', 'counter-bag', 'pen-draw', 'coin-class', 'coin-summary', 'coin-cumulative', 'basketball']) {
    const config = simType === 'spinner'
      ? { spinners: [{ sectors: [{ label: 'A', angle: 360 }] }] }
      : ['counter-bag', 'pen-draw'].includes(simType) ? { items: [{ label: 'A', count: 0 }] } : {};
    const valid = validateSimulation(simType, { ...config, title: '', subtitle: '', expected: '', badge: '',
      totalSpins: 0, defaultClassSize: 25, trialsPerStudent: 20 });
    assert.equal(valid.valid, true, valid.errors.join('; '));
    for (const prop of ['totalSpins', 'defaultClassSize', 'trialsPerStudent']) {
      for (const value of [NaN, Infinity, -Infinity, '20', null, true, [], {}]) {
        assertSimulationError(simType, { ...config, [prop]: value }, prop);
      }
    }
    for (const prop of ['defaultClassSize', 'trialsPerStudent']) {
      for (const value of [0, -1]) {
        assert.equal(validateSimulation(simType, { ...config, [prop]: value }).valid, false);
      }
      assert.equal(validateSimulation(simType, { ...config, [prop]: 1.5 }).valid, true, 'Preserve positive-number format');
    }
    for (const prop of ['title', 'subtitle', 'expected', 'badge']) {
      assert.equal(validateSimulation(simType, { ...config, [prop]: {} }).valid, false);
    }
  }
});

test('coin and basketball simulations do not require spinner or draw configuration', () => {
  for (const simType of ['coin-class', 'coin-summary', 'coin-cumulative', 'basketball']) {
    const result = validateSimulation(simType);
    assert.equal(result.valid, true, result.errors.join('; '));
  }
});

test('existing 8G spinner, counter bag and pen draw configurations validate with their aliases', async () => {
  const { default: lesson } = await import('../src/lessons/8G.js');
  const simulations = [];
  function collect(value) {
    if (!value || typeof value !== 'object') return;
    if (value.type === 'simulation') simulations.push(value);
    Object.values(value).forEach(collect);
  }
  collect(lesson);
  assert.deepEqual(simulations.map((block) => block.simType).sort(), ['counter-bag', 'pen-draw', 'spinner']);
  for (const block of simulations) {
    const alias = { spinner: 'spinners', 'counter-bag': 'bag-draw', 'pen-draw': 'box-draw' }[block.simType];
    for (const simType of [block.simType, alias]) {
      const result = validateGraphBlock({ ...block, simType });
      assert.equal(result.valid, true, result.errors.join('; '));
    }
  }
});

test('accepts numbered-only, automatic and grouped reveal settings on blocks and table entries', () => {
  for (const settings of [{ revealStep: 2 }, { reveal: true, revealStep: 2 }, { reveal: true }, { reveal: false }, {}]) {
    for (const block of [
      { type: 'paragraph', text: 'Reveal', ...settings },
      { type: 'table', headers: [{ text: 0, ...settings }], rows: [[{ text: 0, ...settings }]] }
    ]) {
      const result = validateGraphBlock(block);
      assert.equal(result.valid, true, result.errors.join('; '));
    }
  }
});

test('rejects reveal false combined with a reveal step on blocks, headers and cells', () => {
  for (const revealStep of [1, 3]) {
    for (const [block, location] of [
      [{ type: 'paragraph', text: 'Contradiction', reveal: false, revealStep }, 'slide.content[0]'],
      [{ type: 'table', headers: [{ text: 0, reveal: false, revealStep }], rows: [[0]] }, 'Header [0]'],
      [{ type: 'table', rows: [[{ text: 0, reveal: false, revealStep }]] }, 'Row [0] Cell [0]']
    ]) {
      const result = validateGraphBlock(block);
      assert.equal(result.valid, false);
      assert.ok(result.errors.some((error) => error.includes(location) &&
        error.includes("'reveal: false' cannot be combined with 'revealStep'")), result.errors.join('; '));
    }
  }
});

test('numbered reveal settings still require positive integer step numbers', () => {
  for (const revealStep of [0, -1, 1.5, NaN, Infinity, '2', null]) {
    for (const [block, location] of [
      [{ type: 'paragraph', text: 'Bad step', revealStep }, 'slide.content[0]'],
      [{ type: 'table', headers: [{ text: 'Bad step', revealStep }], rows: [[0]] }, 'Header [0]'],
      [{ type: 'table', rows: [[{ text: 'Bad step', revealStep }]] }, 'Row [0] Cell [0]']
    ]) {
      const result = validateGraphBlock(block);
      assert.equal(result.valid, false);
      assert.ok(result.errors.some((error) => error.includes(location) &&
        error.includes("'revealStep' must be a positive integer")), result.errors.join('; '));
    }
  }
});

test('standalone solution reveal defaults and numbered roots remain valid', () => {
  for (const flags of [{}, { reveal: true }, { revealStep: 4 }, { reveal: true, revealStep: 4 }, { reveal: false }]) {
    const result = validateGraphBlock({ type: 'solution', text: 'Answer', ...flags });
    assert.equal(result.valid, true, result.errors.join('; '));
  }
  assert.equal(validateGraphBlock({ type: 'solution', text: 'Answer', reveal: false, revealStep: 4 }).valid, false);
});

test('sector construction and workspaces reject block-level reveal metadata but accept child reveals', () => {
  for (const block of [
    { type: 'sector-construction', categories: [{ label: 'A', value: 1 }] },
    { type: 'board-workspace', content: [{ type: 'paragraph', text: 'Child', revealStep: 3 }] }
  ]) {
    assert.equal(validateGraphBlock(block).valid, true);
    for (const flags of [{ reveal: true }, { reveal: false }, { revealStep: 1 }]) {
      const result = validateGraphBlock({ ...block, ...flags });
      assert.equal(result.valid, false);
      const prop = Object.keys(flags)[0];
      assert.ok(result.errors.some((error) => error.includes('slide.content[0]') &&
        error.includes(`Block-level '${prop}' is unsupported for ${block.type}`)), result.errors.join('; '));
    }
  }
});

for (const type of ['measured-bar', 'divided-bar']) {
  test(`${type} rejects conflicting outer and progressive reveals while retaining nonprogressive roots`, () => {
    const block = { type, categories: [{ label: 'A', value: 1 }] };
    for (const flags of [{ reveal: true }, { revealStep: 2 }, { reveal: true, revealStep: 2 }]) {
      const result = validateGraphBlock({ ...block, progressive: true, ...flags });
      assert.equal(result.valid, false);
      assert.ok(result.errors.some((error) => error.includes('slide.content[0]') &&
        error.includes('cannot combine outer')), result.errors.join('; '));
      const nonprogressive = validateGraphBlock({ ...block, progressive: false, ...flags });
      assert.equal(nonprogressive.valid, true, nonprogressive.errors.join('; '));
    }
    for (const flags of [{}, { reveal: false }]) {
      const result = validateGraphBlock({ ...block, progressive: true, ...flags });
      assert.equal(result.valid, true, result.errors.join('; '));
    }
  });
}

test('separate solution owners reject conflicting disabled roots and internally progressive graphs', () => {
  const validateSeparate = (solution) => validateLesson(makeLesson({
    type: 'board-task', title: 'Separate answers', prompt: 'Question', separateSolutions: true, solution
  }), { silent: true });
  const valid = validateSeparate([
    { type: 'solution', title: 'Answer', text: 'Working', revealStep: 2 },
    { type: 'paragraph', text: 'Second answer', reveal: true }
  ]);
  assert.equal(valid.valid, true, valid.errors.join('; '));
  for (const block of [
    { type: 'paragraph', text: 'Hidden answer', reveal: false },
    { type: 'sector-construction', categories: [{ label: 'A', value: 1 }] },
    { type: 'measured-bar', progressive: true, categories: [{ label: 'A', value: 1 }] },
    { type: 'divided-bar', progressive: true, categories: [{ label: 'A', value: 1 }] },
    { type: 'solution', blocks: [{ type: 'measured-bar', progressive: true, categories: [{ label: 'A', value: 1 }] }] }
  ]) {
    const result = validateSeparate([block]);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((error) => error.includes('slide.solution[0]') &&
      (error.includes('separate solution reveal') || error.includes('cannot use'))), result.errors.join('; '));
  }
});

test('existing 8F composite graphs and 8I solution configurations remain valid', async () => {
  for (const id of ['8F', '8I']) {
    const { default: lesson } = await import(`../src/lessons/${id}.js`);
    const result = validateLesson(lesson, { silent: true });
    assert.equal(result.valid, true, result.errors.join('; '));
  }
});

// Static Do Now spinners deliberately differ from simulation spinner sectors.
function validateDoNowSpinner(spinner) {
  return validateLesson(makeLesson({ type: 'do-now', title: 'Spinner stimulus',
    questions: [{ prompt: 'Which colour?', answer: 'Blue' }], spinners: [spinner]
  }), { silent: true });
}

test('Do Now rejects malformed spinner/sector containers with precise nested paths', () => {
  for (const spinner of [null, [], 'spinner', 1]) {
    const result = validateDoNowSpinner(spinner);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('TEST-BLOCKS') && e.includes('Slide 1') &&
      e.includes('slide.spinners[0]') && e.includes('must be an object')));
  }
  for (const sectors of ['invalid', {}, null, false, 0]) {
    const result = validateDoNowSpinner({ sectors });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('slide.spinners[0].sectors') && e.includes('array')));
  }
  for (const sector of [null, [], 'sector', 0, true]) {
    const result = validateDoNowSpinner({ sectors: [sector] });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('slide.spinners[0].sectors[0]') && e.includes('object')));
  }
});

test('Do Now rejects non-finite/incorrect angles, invalid text and unknown nested fields', () => {
  for (const field of ['needleAngle', 'startDeg', 'endDeg']) {
    for (const value of [NaN, Infinity, -Infinity, '90', null, false, {}, []]) {
      const spinner = field === 'needleAngle' ? { [field]: value } : { sectors: [{ [field]: value }] };
      const result = validateDoNowSpinner(spinner);
      const path = field === 'needleAngle' ? 'slide.spinners[0].needleAngle' : `slide.spinners[0].sectors[0].${field}`;
      assert.equal(result.valid, false, `${field}: ${String(value)}`);
      assert.ok(result.errors.some((e) => e.includes(path) && e.includes('finite number')));
    }
  }
  for (const field of ['id', 'name', 'sectorsDescription', 'label', 'color', 'textColor']) {
    for (const value of [0, null, {}, []]) {
      const isSector = ['label', 'color', 'textColor'].includes(field);
      const spinner = isSector ? { sectors: [{ [field]: value }] } : { [field]: value };
      const result = validateDoNowSpinner(spinner);
      const path = `slide.spinners[0]${isSector ? '.sectors[0]' : ''}.${field}`;
      assert.equal(result.valid, false);
      assert.ok(result.errors.some((e) => e.includes(path) && e.includes('string')));
    }
  }
  for (const [spinner, path] of [
    [{ sector: [] }, 'slide.spinners[0].sector'],
    [{ sectors: [{ angle: 360 }] }, 'slide.spinners[0].sectors[0].angle']
  ]) {
    const result = validateDoNowSpinner(spinner);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes(path) && e.includes('Unknown property')));
  }
});

test('stem-and-leaf enforces documented string leaves and scalar stems', () => {
  for (const isBackToBack of [false, true]) {
    const base = { type: 'stem-and-leaf', isBackToBack, leftHeader: 'Left', rightHeader: 'Right',
      rows: [{ stem: 0, leaves: '0', ...(isBackToBack ? { leftLeaves: '' } : {}) }] };
    assert.equal(validateGraphBlock(base).valid, true);
    for (const prop of isBackToBack ? ['leaves', 'leftLeaves'] : ['leaves']) {
      for (const value of [0, 42, NaN, Infinity, null, [], {}, true]) {
        const result = validateGraphBlock({ ...base, rows: [{ ...base.rows[0], [prop]: value }] });
        assert.equal(result.valid, false, `${prop}: ${String(value)}`);
        assert.ok(result.errors.some((e) => e.includes(`slide.content[0].rows[0].${prop}`) && e.includes('string')));
      }
    }
    for (const value of [NaN, Infinity, true, {}, []]) {
      const result = validateGraphBlock({ ...base, rows: [{ ...base.rows[0], stem: value }] });
      assert.equal(result.valid, false);
      assert.ok(result.errors.some((e) => e.includes('slide.content[0].rows[0].stem') && e.includes('finite number')));
    }
    assert.equal(validateGraphBlock({ ...base, rows: [[]] }).valid, false);
  }
});

test('list items reject non-finite numbers and non-scalar values', () => {
  for (const type of ['bullet-list', 'ordered-list']) {
    for (const item of [NaN, Infinity, -Infinity, null, {}, [], true]) {
      const result = validateGraphBlock({ type, items: [item] });
      assert.equal(result.valid, false);
      assert.ok(result.errors.some((e) => e.includes('slide.content[0]') && e.includes('Item [0]') &&
        e.includes('string or finite number')));
    }
  }
});

test('padded composite block types retain restrictions on outer reveals', () => {
  for (const block of [
    { type: ' sector-construction ', categories: [{ label: 'A', value: 1 }] },
    { type: ' board-workspace ', content: [{ type: 'paragraph', text: 'Child' }] },
    { type: ' divided-bar ', categories: [{ label: 'A', value: 1 }], progressive: true }
  ]) {
    for (const settings of [{ reveal: true }, { revealStep: 2 }]) {
      const result = validateGraphBlock({ ...block, ...settings });
      assert.equal(result.valid, false);
      assert.ok(result.errors.some((e) => e.includes('unsupported') || e.includes('internal reveal steps')));
    }
  }
});
