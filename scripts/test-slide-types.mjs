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

test('practice renders content-only blocks in a full-width card', () => {
  const html = renderSlide({
    type: 'practice', title: 'Content practice',
    content: [{ type: 'paragraph', text: 'Complete workbook questions.', reveal: true }]
  }, 0).innerHTML;

  assert.match(html, /<div class="card col-full">\s*<p[^>]*>Complete workbook questions\.<\/p>\s*<\/div>/);
  assert.ok(html.includes('reveal-item'), 'Content blocks preserve their reveal markup');
  assert.ok(!html.includes('card col-third'), 'Content-only slides have no task cards');
});

test('practice renders tasks without an empty content card', () => {
  for (const content of [undefined, []]) {
    const html = renderSlide({
      type: 'practice', title: 'Task practice', content,
      tasks: [{ title: 'Task one', prompt: 'Calculate 2 + 2',
        solution: [{ type: 'paragraph', text: 'Four' }] }]
    }, 0).innerHTML;

    assert.ok(!html.includes('card col-full'), 'Absent or empty content adds no card');
    assert.match(html, /class="card col-third" style="display:flex; flex-direction:column; justify-content:space-between;"/);
    assert.ok(html.includes('Task one'));
    assert.ok(html.includes('Calculate 2 + 2'));
    assert.match(html, /class="reveal-item solution-container" style="margin-top: 12px;"/);
    assert.ok(html.includes('<span class="solution-badge">✔ Solution</span>'));
    assert.ok(html.includes('Four'));
  }
});

test('practice renders content before unchanged task cards when both are present', () => {
  const slide = {
    type: 'practice', title: 'Combined practice',
    tasks: [{ title: 'Task two', prompt: 'Calculate 3 + 3',
      blocks: [{ type: 'paragraph', text: 'Show working.' }],
      solution: [{ type: 'paragraph', text: 'Six' }] }]
  };
  const tasksOnly = renderSlide(slide, 0).innerHTML;
  const combined = renderSlide({ ...slide,
    content: [{ type: 'paragraph', text: 'Read these instructions first.' }]
  }, 0).innerHTML;

  assert.match(combined, /<div class="card col-full">\s*<p[^>]*>Read these instructions first\.<\/p>\s*<\/div>/);
  assert.ok(combined.indexOf('Read these instructions first.') < combined.indexOf('card col-third'));
  assert.equal(combined.slice(combined.indexOf('<div class="card col-third"')),
    tasksOnly.slice(tasksOnly.indexOf('<div class="card col-third"')),
    'Task cards, solutions and reveal markup remain identical');
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

test('renderNotesSlide handles content-only, empty columns with content, columns-only and combined content', () => {
  // 1. Content-only
  const slideContentOnly = {
    type: 'notes',
    title: 'Content Only Notes',
    content: [{ type: 'paragraph', text: 'Notes content only text' }]
  };
  const htmlContentOnly = renderSlide(slideContentOnly, 0).innerHTML;
  assert.ok(htmlContentOnly.includes('Notes content only text'), 'Content-only notes must render content');
  assert.ok(htmlContentOnly.includes('col-full'), 'Content-only notes must use col-full card');
  assert.ok(!htmlContentOnly.includes('col-half'), 'Content-only notes must not render half columns');

  // 2. Empty columns with content (`columns: []`)
  const slideEmptyCols = {
    type: 'notes',
    title: 'Empty Columns Notes',
    columns: [],
    content: [{ type: 'paragraph', text: 'Content with empty columns array' }]
  };
  const htmlEmptyCols = renderSlide(slideEmptyCols, 0).innerHTML;
  assert.ok(htmlEmptyCols.includes('Content with empty columns array'), 'Notes slide with empty columns array and non-empty content must render content instead of rendering nothing');
  assert.ok(htmlEmptyCols.includes('col-full'), 'Must render full width card for content');

  // 3. Columns-only
  const slideColsOnly = {
    type: 'notes',
    title: 'Columns Only Notes',
    columns: [
      { title: 'Column A', width: '60', blocks: [{ type: 'paragraph', text: 'Col A text' }] },
      { title: 'Column B', width: '40', blocks: [{ type: 'paragraph', text: 'Col B text' }] }
    ]
  };
  const htmlColsOnly = renderSlide(slideColsOnly, 0).innerHTML;
  assert.ok(htmlColsOnly.includes('Column A'), 'Columns-only notes must render column title');
  assert.ok(htmlColsOnly.includes('Col A text'), 'Columns-only notes must render column blocks');
  assert.ok(htmlColsOnly.includes('col-60'), 'Columns-only notes must preserve column width col-60');
  assert.ok(htmlColsOnly.includes('col-40'), 'Columns-only notes must preserve column width col-40');
  assert.ok(!htmlColsOnly.includes('col-full'), 'Columns-only notes without content must not render col-full card');

  // 4. Combined content and columns
  const slideCombined = {
    type: 'notes',
    title: 'Combined Notes',
    content: [{ type: 'paragraph', text: 'Top instruction content' }],
    columns: [
      { title: 'Left Col', blocks: [{ type: 'paragraph', text: 'Left text' }] }
    ]
  };
  const htmlCombined = renderSlide(slideCombined, 0).innerHTML;
  assert.ok(htmlCombined.includes('Top instruction content'), 'Combined notes must render content');
  assert.ok(htmlCombined.includes('Left Col'), 'Combined notes must render columns');
  assert.ok(htmlCombined.indexOf('Top instruction content') < htmlCombined.indexOf('Left Col'), 'Content must appear before columns in combined notes');
  assert.ok(htmlCombined.includes('col-full'), 'Combined notes must include full width content card');
  assert.ok(htmlCombined.includes('col-half'), 'Combined notes columns default to col-half when width is omitted');
});

// ---------------------------------------------------------------------------
// 4. Slide Structure and Schema Validation Regression Tests
// ---------------------------------------------------------------------------

test('validates successful canonical examples of every supported slide type', () => {
  const lesson = {
    id: 'ALL-SLIDE-TYPES',
    title: 'All Supported Slide Types Lesson',
    slides: [
      {
        type: 'title',
        title: 'Probability and Data Displays',
        subtitle: 'Year 7 Mathematics Core Unit',
        overview: 'Comprehensive introduction to data displays and probability.',
        topics: ['Stem-and-Leaf', 'Sector Graphs', 'Probability'],
        phase: 'opening',
        estimatedMinutes: 2
      },
      {
        type: 'learning',
        title: 'Learning Intentions & WILF',
        learningIntention: 'To calculate theoretical probabilities accurately.',
        successCriteria: [
          'I can list sample spaces.',
          'I can calculate Pr(E) = n(E) / n(S).'
        ],
        keyPrinciple: 'Probabilities range from 0 (impossible) to 1 (certain).',
        extraBlocks: [{ type: 'paragraph', text: 'Important note on probability scale.' }],
        phase: 'opening',
        estimatedMinutes: 3
      },
      {
        type: 'do-now',
        title: 'Do Now: Warm Up',
        stimulusTitle: 'Starter Problem',
        stimulusPrompt: 'Consider a fair six-sided die.',
        questions: [
          { prompt: 'What is the probability of rolling an even number?', answer: '3/6 = 1/2' },
          { prompt: 'What is the probability of rolling a 5?', answer: '1/6' }
        ],
        sidebarNotes: [
          { type: 'note-box', variant: 'gold', text: 'Spend 3 minutes on this in workbooks.' }
        ],
        phase: 'opening',
        estimatedMinutes: 4
      },
      {
        type: 'notes',
        title: 'Key Definitions',
        columns: [
          {
            title: 'Theoretical Probability',
            width: '60',
            blocks: [
              { type: 'paragraph', text: 'Calculated before any experiment takes place.' }
            ]
          },
          {
            title: 'Formula',
            width: '40',
            blocks: [
              { type: 'formula', latex: '\\text{Pr}(E) = \\frac{n(E)}{n(S)}' }
            ]
          }
        ],
        phase: 'explicit',
        estimatedMinutes: 5
      },
      {
        type: 'notes',
        title: 'Single-Column Notes (Content Format)',
        content: [
          { type: 'note-box', variant: 'green', text: 'Single column workbook note.' }
        ],
        phase: 'explicit'
      },
      {
        type: 'worked-example',
        title: 'I Do: Calculating Probability of a Spinner',
        prompt: 'A spinner has 4 equal sections: Red, Blue, Green, Yellow.',
        data: 'Sample space S = {R, B, G, Y}',
        leftBlocks: [
          { type: 'raw-data', data: 'R, B, G, Y' }
        ],
        steps: [
          { label: 'Identify total outcomes', text: 'There are 4 equally likely outcomes.' },
          { label: 'Identify favourable outcomes', text: 'Red occurs once: n(Red) = 1.' },
          { label: 'Apply formula', latex: '\\text{Pr}(\\text{Red}) = \\frac{1}{4}' }
        ],
        phase: 'explicit',
        estimatedMinutes: 5
      },
      {
        type: 'board-task',
        title: 'We Do: Guided Calculation',
        studentAction: 'On whiteboards: calculate the probability of not rolling a 6.',
        prompt: 'Roll a fair standard die.',
        workspaceContent: [
          { type: 'paragraph', text: 'Calculate Pr(not 6).' }
        ],
        solution: [
          { type: 'paragraph', text: '$\\text{Pr}(\\text{not } 6) = 1 - \\frac{1}{6} = \\frac{5}{6}$' }
        ],
        notes: [
          { type: 'note-box', variant: 'alert', text: 'Check student board working.' }
        ],
        phase: 'guided',
        estimatedMinutes: 6
      },
      {
        type: 'we-do',
        title: 'We Do (Canonical Alias)',
        prompt: 'Calculate complementary event',
        content: [{ type: 'paragraph', text: 'Work together.' }],
        solution: [{ type: 'paragraph', text: 'Answer' }]
      },
      {
        type: 'comparison',
        title: 'Comparing Theoretical and Experimental Probability',
        columns: [
          {
            title: 'Theoretical',
            blocks: [{ type: 'paragraph', text: 'Based on mathematical reasoning.' }]
          },
          {
            title: 'Experimental',
            blocks: [{ type: 'paragraph', text: 'Based on observed frequency of trials.' }]
          }
        ],
        phase: 'guided',
        estimatedMinutes: 5
      },
      {
        type: 'practice',
        title: 'Independent Practice (Tasks Format)',
        timerMinutes: 10,
        estimatedMinutes: 12,
        phase: 'independent',
        tasks: [
          {
            title: 'Task 1: Dice Probabilities',
            prompt: 'Find Pr(rolling > 4) on a 6-sided die.',
            solution: [
              { type: 'paragraph', text: 'Outcomes 5 and 6: 2/6 = 1/3' }
            ]
          }
        ]
      },
      {
        type: 'practice',
        title: 'Independent Practice (Content Format)',
        content: [
          { type: 'paragraph', text: 'Complete questions 1 to 5 from page 142.' }
        ]
      },
      {
        type: 'exit-ticket',
        title: 'Exit Ticket Checkpoint',
        estimatedMinutes: 5,
        phase: 'assessment',
        questions: [
          {
            prompt: 'What is the sum of probabilities of all elementary outcomes?',
            solution: [
              { type: 'paragraph', text: 'The sum is always 1.' }
            ]
          }
        ]
      },
      {
        type: 'summary',
        title: 'Lesson Summary & Key Rules',
        estimatedMinutes: 3,
        phase: 'assessment',
        takeaways: [
          'Theoretical probability formula: Pr(E) = n(E) / n(S).',
          'Probabilities are always between 0 and 1 inclusive.',
          'Complementary probability: Pr(not E) = 1 - Pr(E).'
        ]
      }
    ]
  };

  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, true, `All canonical slide types must pass: ${res.errors.join('; ')}`);
  assert.equal(res.errors.length, 0);
});

test('rejects solution supplied as string where block array is required', () => {
  // 1. In board-task
  const lessonBoardTaskStr = {
    id: 'SOL-TEST-1',
    title: 'Board Task String Solution',
    slides: [
      {
        type: 'board-task',
        title: 'Board Task',
        prompt: 'Calculate',
        solution: 'String solution is invalid'
      }
    ]
  };
  const resBoard = validateLesson(lessonBoardTaskStr, { silent: true });
  assert.equal(resBoard.valid, false);
  assert.ok(resBoard.errors.some((e) => e.includes("Board task") && e.includes("'solution' must be an array of blocks, got string")));

  // 2. In practice task
  const lessonTaskStr = {
    id: 'SOL-TEST-2',
    title: 'Practice Task String Solution',
    slides: [
      {
        type: 'practice',
        title: 'Practice',
        tasks: [
          {
            title: 'Task 1',
            prompt: 'Solve',
            solution: 'String task solution'
          }
        ]
      }
    ]
  };
  const resTask = validateLesson(lessonTaskStr, { silent: true });
  assert.equal(resTask.valid, false);
  assert.ok(resTask.errors.some((e) => e.includes('Task [0]') && e.includes("'solution' must be an array of blocks, got string")));

  // 3. In exit-ticket question
  const lessonExitStr = {
    id: 'SOL-TEST-3',
    title: 'Exit Ticket String Solution',
    slides: [
      {
        type: 'exit-ticket',
        title: 'Exit Ticket',
        questions: [
          {
            prompt: 'What is 2 + 2?',
            solution: '4'
          }
        ]
      }
    ]
  };
  const resExit = validateLesson(lessonExitStr, { silent: true });
  assert.equal(resExit.valid, false);
  assert.ok(resExit.errors.some((e) => e.includes('Question [0]') && e.includes("'solution' must be an array of blocks, got string")));
});

test('rejects misspelled slide properties as fatal errors rather than warnings', () => {
  const lesson = {
    id: 'DRIFT-TEST',
    title: 'Misspelled Properties Slide',
    slides: [
      {
        type: 'notes',
        title: 'Notes Slide',
        subtitl: 'Misspelled subtitle', // typo
        colums: [                      // typo
          { title: 'Col 1', blocks: [{ type: 'paragraph', text: 'Text' }] }
        ]
      }
    ]
  };
  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, false);
  assert.ok(res.errors.some((e) => e.includes("Unknown or unexpected slide property 'subtitl'")));
  assert.ok(res.errors.some((e) => e.includes("Unknown or unexpected slide property 'colums'")));
});

test('validates pacing numbers strictly as finite positive numbers and rejects invalid timings', () => {
  const invalidPacingCases = [
    { estimatedMinutes: 0 },
    { estimatedMinutes: -5 },
    { estimatedMinutes: Infinity },
    { estimatedMinutes: -Infinity },
    { estimatedMinutes: NaN },
    { estimatedMinutes: '10' },
    { timerMinutes: 0 },
    { timerMinutes: -10 },
    { timerMinutes: Infinity },
    { timerMinutes: '5' }
  ];

  for (const pacing of invalidPacingCases) {
    const lesson = {
      id: 'PACING-TEST',
      title: 'Invalid Pacing Test',
      slides: [
        {
          type: 'summary',
          title: 'Summary',
          takeaways: ['Rule 1'],
          ...pacing
        }
      ]
    };
    const res = validateLesson(lesson, { silent: true });
    assert.equal(res.valid, false, `Expected pacing ${JSON.stringify(pacing)} to fail`);
    assert.ok(
      res.errors.some((e) => e.includes('must be a finite positive number')),
      `Error must describe finite positive number requirement for ${JSON.stringify(pacing)}`
    );
  }
});

test('preserves supported legacy formats explicitly', () => {
  // Exit ticket using legacy 'question' property instead of 'prompt'
  const lessonLegacyQuestion = {
    id: 'LEGACY-EXIT',
    title: 'Legacy Exit Ticket',
    slides: [
      {
        type: 'exit-ticket',
        title: 'Exit Ticket',
        questions: [
          {
            question: 'Legacy question wording?',
            solution: [{ type: 'paragraph', text: 'Answer' }]
          }
        ]
      }
    ]
  };
  const res = validateLesson(lessonLegacyQuestion, { silent: true });
  assert.equal(res.valid, true, 'Legacy question property should pass validation');
  assert.ok(res.warnings.some((w) => w.includes("Found 'question' property instead of canonical 'prompt'")));
});

test('rejects malformed sub-structures in questions, steps, columns, and tasks', () => {
  const lesson = {
    id: 'SUB-TEST',
    title: 'Malformed Substructures',
    slides: [
      {
        type: 'do-now',
        title: 'Do Now',
        questions: [
          { prompt: 'Missing answer' } // no answer
        ]
      },
      {
        type: 'worked-example',
        title: 'Worked Example',
        steps: [
          { label: 'Empty Step' } // no text, latex, or blocks
        ]
      },
      {
        type: 'comparison',
        title: 'Comparison',
        columns: [
          { title: 'Col with no blocks' } // no blocks
        ]
      },
      {
        type: 'practice',
        title: 'Practice',
        tasks: [
          { blocks: [{ type: 'paragraph', text: 'No title or prompt' }] }
        ]
      }
    ]
  };
  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, false);
  assert.ok(res.errors.some((e) => e.includes('Slide 1') && e.includes("Missing required 'answer' string")));
  assert.ok(res.errors.some((e) => e.includes('Slide 2') && e.includes("Worked example step requires at least 'text', 'latex', or 'blocks'")));
  assert.ok(res.errors.some((e) => e.includes('Slide 3') && e.includes("Column requires a non-empty 'blocks' array")));
  assert.ok(res.errors.some((e) => e.includes('Slide 4') && e.includes("Practice task requires at least a 'title' or 'prompt'")));
});

test('rejects solution supplied as string in we-do slide', () => {
  const lesson = {
    id: 'WE-DO-SOL-TEST',
    title: 'We Do String Solution Test',
    slides: [
      {
        type: 'we-do',
        title: 'We Do Slide',
        prompt: 'Calculate together',
        solution: 'This should fail as it is a string'
      }
    ]
  };
  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, false);
  assert.ok(res.errors.some((e) => e.includes("We Do") && e.includes("'solution' must be an array of blocks, got string")));
});

test('rejects misspelled properties inside nested sub-structures', () => {
  const lesson = {
    id: 'NESTED-TYPO-TEST',
    title: 'Nested Typo Test',
    slides: [
      {
        type: 'do-now',
        title: 'Do Now',
        questions: [
          { prompt: 'What is 5 x 5?', answr: '25' } // 'answr' typo
        ]
      },
      {
        type: 'comparison',
        title: 'Comparison',
        columns: [
          { title: 'Col A', widht: '50', blocks: [{ type: 'paragraph', text: 'Text A' }] } // 'widht' typo
        ]
      },
      {
        type: 'worked-example',
        title: 'Worked Example',
        steps: [
          { lable: 'Step 1', text: 'Step text' } // 'lable' typo
        ]
      },
      {
        type: 'practice',
        title: 'Practice',
        tasks: [
          { titl: 'Task 1', prompt: 'Solve', solution: [{ type: 'paragraph', text: 'Ans' }] } // 'titl' typo
        ]
      }
    ]
  };
  const res = validateLesson(lesson, { silent: true });
  assert.equal(res.valid, false);
  assert.ok(res.errors.some((e) => e.includes("Unknown property 'answr' in Do Now question")));
  assert.ok(res.errors.some((e) => e.includes("Unknown property 'widht' in column")));
  assert.ok(res.errors.some((e) => e.includes("Unknown property 'lable' in worked example step")));
  assert.ok(res.errors.some((e) => e.includes("Unknown property 'titl' in task")));
});

test('strictly validates learning, summary, and title slide structures', () => {
  // Learning slide missing required learningIntention and with empty successCriteria
  const lessonLearning = {
    id: 'LEARNING-ERR',
    title: 'Learning Errors',
    slides: [
      {
        type: 'learning',
        title: 'Learning',
        successCriteria: [] // empty
      }
    ]
  };
  const resL = validateLesson(lessonLearning, { silent: true });
  assert.equal(resL.valid, false);
  assert.ok(resL.errors.some((e) => e.includes("Learning slide requires a 'learningIntention' string")));
  assert.ok(resL.errors.some((e) => e.includes("Learning slide requires a non-empty 'successCriteria' array")));

  // Summary slide with empty takeaways
  const lessonSummary = {
    id: 'SUMMARY-ERR',
    title: 'Summary Errors',
    slides: [
      {
        type: 'summary',
        title: 'Summary',
        takeaways: [] // empty
      }
    ]
  };
  const resS = validateLesson(lessonSummary, { silent: true });
  assert.equal(resS.valid, false);
  assert.ok(resS.errors.some((e) => e.includes("Summary slide requires a non-empty 'takeaways' array")));

  // Title slide with invalid types
  const lessonTitle = {
    id: 'TITLE-ERR',
    title: 'Title Errors',
    slides: [
      {
        type: 'title',
        title: 'Title',
        overview: 12345, // not a string
        topics: 'topic 1, topic 2' // not an array
      }
    ]
  };
  const resT = validateLesson(lessonTitle, { silent: true });
  assert.equal(resT.valid, false);
  assert.ok(resT.errors.some((e) => e.includes("'overview' must be a string")));
  assert.ok(resT.errors.some((e) => e.includes("'topics' must be an array of strings")));
});

test('renderExitTicketSlide correctly renders canonical, legacy, precedence, and solution reveal containers', () => {
  // 1. A canonical question
  const slideCanonical = {
    type: 'exit-ticket',
    title: 'Exit Ticket Canonical',
    questions: [
      { prompt: 'Canonical exit question text $x = 5$', solution: [{ type: 'paragraph', text: 'Solution canonical' }] }
    ]
  };
  const htmlCanonical = renderSlide(slideCanonical, 0).innerHTML;
  assert.ok(htmlCanonical.includes('Canonical exit question text'), 'Rendered HTML must contain canonical prompt');

  // 2. A legacy question
  const slideLegacy = {
    type: 'exit-ticket',
    title: 'Exit Ticket Legacy',
    questions: [
      { question: 'Legacy exit question text $y = 10$', solution: [{ type: 'paragraph', text: 'Solution legacy' }] }
    ]
  };
  const htmlLegacy = renderSlide(slideLegacy, 0).innerHTML;
  assert.ok(htmlLegacy.includes('Legacy exit question text'), 'Rendered HTML must contain legacy question text');

  // 3. Both properties supplied, with canonical taking precedence
  const slideBoth = {
    type: 'exit-ticket',
    title: 'Exit Ticket Precedence',
    questions: [
      { prompt: 'Canonical takes precedence', question: 'Legacy ignored', solution: [{ type: 'paragraph', text: 'Solution both' }] }
    ]
  };
  const htmlBoth = renderSlide(slideBoth, 0).innerHTML;
  assert.ok(htmlBoth.includes('Canonical takes precedence'), 'Canonical prompt must take precedence');
  assert.ok(!htmlBoth.includes('Legacy ignored'), 'Legacy question must be ignored when canonical prompt is present');

  // 4. An existing solution retaining its reveal container
  assert.ok(htmlCanonical.includes('reveal-item solution-container'), 'Solution container must retain reveal-item class');
  assert.ok(htmlCanonical.includes('✔ Answer'), 'Solution container must include Answer badge');
  assert.ok(htmlCanonical.includes('Solution canonical'), 'Solution content must be rendered');
});

test('table renderer preserves numeric zero, empty text, ordinary strings, and reveal settings in headers and cells', () => {
  const slide = {
    type: 'notes',
    title: 'Table Regression Test',
    content: [
      {
        type: 'table',
        headers: [
          { text: 0 },                  // 1. Numeric zero in a header
          { text: 'Ordinary Header' }     // 4. An ordinary string
        ],
        rows: [
          [
            { text: 0 },                  // 2. Numeric zero in a cell
            { text: '' }                  // 3. Empty text
          ],
          [
            { text: 'Ordinary Cell' },    // 4. An ordinary string
            { text: 0, reveal: true, revealStep: 2 } // 5. A table cell with existing reveal settings
          ]
        ]
      }
    ]
  };

  const html = renderSlide(slide, 0).innerHTML;

  // 1. Numeric zero in a header
  assert.ok(html.includes('<th><span>0</span></th>'), 'Header must preserve numeric zero');

  // 2. Numeric zero in a cell
  assert.ok(html.includes('<td><span>0</span></td>'), 'Cell must preserve numeric zero');

  // 3. Empty text
  assert.ok(html.includes('<td><span></span></td>') || html.includes('<td><span ></span></td>'), 'Cell must preserve empty text');

  // 4. An ordinary string
  assert.ok(html.includes('Ordinary Header'), 'Header must preserve ordinary string');
  assert.ok(html.includes('Ordinary Cell'), 'Cell must preserve ordinary string');

  // 5. A table cell with existing reveal settings
  assert.ok(html.includes('class="reveal-item"'), 'Cell with reveal: true must include reveal-item class');
  assert.ok(html.includes('data-reveal-step="2"'), 'Cell with revealStep: 2 must include data-reveal-step attribute');
});


