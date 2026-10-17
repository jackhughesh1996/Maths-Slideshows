/**
 * @file validator.js
 * Lightweight schema validation for lesson data models.
 * Validates canonical slide and block schemas, checks constraints,
 * and reports developer-friendly console errors and warnings for schema drift.
 */

import { auditLessonMath, formatMathIssue } from './mathExpressions.js';
import { graphConsistency } from './graphConsistency.js';

import {
  SUPPORTED_SLIDE_TYPES,
  normalizeSlideType,
  isSupportedSlideType
} from './slideTypes.js';

import {
  SUPPORTED_BLOCK_TYPES,
  isSupportedBlockType,
  normalizeBlockType,
  SUPPORTED_SIMULATION_TYPES,
  isSupportedSimulationType,
  normalizeSimulationType
} from './blockTypes.js';

export const SUPPORTED_NOTE_VARIANTS = Object.freeze(new Set([
  'default',
  'alert',
  'gold',
  'green'
]));

const COMMON_BLOCK_PROPS = new Set([
  'type',
  'reveal',
  'revealStep',
  'badgeTitle',
  'className'
]);

const TYPE_ALLOWED_BLOCK_PROPS = {
  'heading': new Set(['text', 'level']),
  'paragraph': new Set(['text']),
  'bullet-list': new Set(['items']),
  'ordered-list': new Set(['items']),
  'note-box': new Set(['title', 'text', 'variant', 'copyToWorkbook']),
  'raw-data': new Set(['data']),
  'formula': new Set(['latex']),
  'table': new Set(['headers', 'rows', 'compact']),
  'stem-and-leaf': new Set(['rows', 'key', 'isBackToBack', 'leftHeader', 'rightHeader', 'typeVariant', 'titleLeft', 'titleRight']),
  'sector-graph': new Set(['items', 'total', 'size', 'radius']),
  'sector-construction': new Set(['categories', 'items', 'total', 'size', 'radius', 'showTable', 'tableHeaders', 'check', 'checkMath', 'checkLabel', 'notes', 'unitLabel']),
  'measured-bar': new Set(['categories', 'items', 'totalLength', 'totalLengthCm', 'unit', 'total', 'showTicks', 'showMinorTicks', 'progressive', 'title', 'subtitle', 'check', 'checkMath', 'checkSum', 'checkLabel']),
  'board-workspace': new Set(['content']),
  'solution': new Set(['title', 'text', 'latex', 'blocks']),
  'simulation': new Set(['simType', 'title', 'subtitle', 'expected', 'items', 'spinners', 'defaultClassSize', 'trialsPerStudent', 'totalSpins', 'badge'])
};

TYPE_ALLOWED_BLOCK_PROPS['divided-bar'] = TYPE_ALLOWED_BLOCK_PROPS['measured-bar'];

const COMMON_SLIDE_PROPS = new Set([
  'type',
  'title',
  'subtitle',
  'phase',
  'estimatedMinutes',
  'timerMinutes'
]);

const TYPE_ALLOWED_PROPS = {
  'title': new Set(['overview', 'topics']),
  'learning': new Set(['learningIntention', 'successCriteria', 'keyPrinciple', 'extraBlocks']),
  'do-now': new Set(['questions', 'sidebarNotes', 'spinners', 'stimulusTitle', 'stimulusPrompt']),
  'worked-example': new Set(['prompt', 'data', 'leftBlocks', 'steps']),
  'we-do': new Set(['prompt', 'data', 'notes', 'workspaceContent', 'solution', 'studentAction', 'leftBlocks', 'rightBlocks', 'content', 'separateSolutions']),
  'board-task': new Set(['prompt', 'data', 'notes', 'workspaceContent', 'solution', 'studentAction', 'leftBlocks', 'rightBlocks', 'content', 'separateSolutions']),
  'comparison': new Set(['columns']),
  'practice': new Set(['tasks', 'content']),
  'exit-ticket': new Set(['questions']),
  'summary': new Set(['takeaways']),
  'notes': new Set(['columns', 'content'])
};

// Aliases share the exact allowed properties of their canonical counterparts
TYPE_ALLOWED_PROPS['i-do'] = TYPE_ALLOWED_PROPS['worked-example'];
TYPE_ALLOWED_PROPS['you-do'] = TYPE_ALLOWED_PROPS['practice'];

/**
 * Recursively extracts all content blocks with structural context paths.
 * @param {Object} slide
 * @returns {Array<{ block: any, path: string, isInvalidEntry: boolean }>}
 */
function extractBlocks(slide) {
  const blocks = [];

  function visitBlock(block, path) {
    if (!block || typeof block !== 'object') {
      blocks.push({ block, path, isInvalidEntry: true });
      return;
    }

    blocks.push({ block, path, isInvalidEntry: false });

    // Traverse nested block containers inside this block
    if (Array.isArray(block.blocks)) {
      block.blocks.forEach((child, idx) => {
        visitBlock(child, `${path}.blocks[${idx}]`);
      });
    }

    if (Array.isArray(block.content)) {
      block.content.forEach((child, idx) => {
        visitBlock(child, `${path}.content[${idx}]`);
      });
    }

    if (Array.isArray(block.notes)) {
      block.notes.forEach((child, idx) => {
        visitBlock(child, `${path}.notes[${idx}]`);
      });
    }

    if ('solution' in block && block.solution) {
      visitBlockContainer(block.solution, `${path}.solution`);
    }

    if (Array.isArray(block.steps)) {
      block.steps.forEach((step, idx) => {
        if (step && typeof step === 'object' && 'blocks' in step) {
          visitBlockContainer(step.blocks, `${path}.steps[${idx}].blocks`);
        }
      });
    }

    if (Array.isArray(block.columns)) {
      block.columns.forEach((col, idx) => {
        if (col && typeof col === 'object' && 'blocks' in col) {
          visitBlockContainer(col.blocks, `${path}.columns[${idx}].blocks`);
        }
      });
    }
  }

  function visitBlockContainer(container, path) {
    if (!container) return;
    if (Array.isArray(container)) {
      container.forEach((item, idx) => {
        visitBlock(item, `${path}[${idx}]`);
      });
    } else if (typeof container === 'object') {
      // Single block object passed to container (e.g. solution: { type: 'paragraph', ... })
      visitBlock(container, path);
    }
  }

  // 1. Direct slide block containers
  const directContainers = [
    'content',
    'blocks',
    'extraBlocks',
    'sidebarNotes',
    'leftBlocks',
    'rightBlocks',
    'workspaceContent',
    'notes'
  ];

  for (const key of directContainers) {
    if (key in slide) {
      visitBlockContainer(slide[key], `slide.${key}`);
    }
  }

  // 2. Slide solution (array of blocks or single block)
  if ('solution' in slide) {
    visitBlockContainer(slide.solution, 'slide.solution');
  }

  // 3. Slide columns
  if (Array.isArray(slide.columns)) {
    slide.columns.forEach((col, colIdx) => {
      if (col && typeof col === 'object' && 'blocks' in col) {
        visitBlockContainer(col.blocks, `slide.columns[${colIdx}].blocks`);
      }
    });
  }

  // 4. Slide steps
  if (Array.isArray(slide.steps)) {
    slide.steps.forEach((step, stepIdx) => {
      if (step && typeof step === 'object' && 'blocks' in step) {
        visitBlockContainer(step.blocks, `slide.steps[${stepIdx}].blocks`);
      }
    });
  }

  // 5. Slide tasks
  if (Array.isArray(slide.tasks)) {
    slide.tasks.forEach((task, taskIdx) => {
      if (task && typeof task === 'object') {
        if ('blocks' in task) {
          visitBlockContainer(task.blocks, `slide.tasks[${taskIdx}].blocks`);
        }
        if ('solution' in task) {
          visitBlockContainer(task.solution, `slide.tasks[${taskIdx}].solution`);
        }
      }
    });
  }

  // 6. Slide questions (in exit-ticket)
  if (Array.isArray(slide.questions)) {
    slide.questions.forEach((q, qIdx) => {
      if (q && typeof q === 'object') {
        if ('blocks' in q) {
          visitBlockContainer(q.blocks, `slide.questions[${qIdx}].blocks`);
        }
        if ('solution' in q) {
          visitBlockContainer(q.solution, `slide.questions[${qIdx}].solution`);
        }
      }
    });
  }

  return blocks;
}

/**
 * Validates a lesson against the canonical schema.
 * @param {Object} lesson
 * @param {Object} [options]
 * @param {boolean} [options.silent=false] - If true, suppress console logging
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateLesson(lesson, options = {}) {
  const errors = [];
  const warnings = [];

  if (!lesson || typeof lesson !== 'object') {
    errors.push('Lesson must be a non-null object.');
    if (!options.silent) {
      console.error('[LessonValidation: unknown]', 'Lesson must be a non-null object.');
    }
    return { valid: false, errors, warnings };
  }

  const lessonId = lesson.id ? String(lesson.id) : 'unknown';
  const prefix = (slideIdx = null, detail = null) => {
    let loc = `[LessonValidation: ${lessonId}]`;
    if (slideIdx !== null) loc += ` Slide ${slideIdx + 1}`;
    if (detail) loc += ` (${detail})`;
    return loc;
  };

  // 1. Lesson ID
  if (!lesson.id || typeof lesson.id !== 'string' || !lesson.id.trim()) {
    errors.push(`${prefix()}: Missing or invalid 'id' (must be a non-empty string).`);
  }

  // 2. Lesson Title
  if (!lesson.title || typeof lesson.title !== 'string' || !lesson.title.trim()) {
    errors.push(`${prefix()}: Missing or invalid 'title' (must be a non-empty string).`);
  }

  // 3. Lesson Slides
  if (!Array.isArray(lesson.slides) || lesson.slides.length === 0) {
    errors.push(`${prefix()}: Lesson must contain a non-empty 'slides' array.`);
    reportToConsole(errors, warnings, options.silent);
    return { valid: false, errors, warnings };
  }

  // 4. Slide-by-slide checks
  lesson.slides.forEach((slide, sIdx) => {
    if (!slide || typeof slide !== 'object') {
      errors.push(`${prefix(sIdx)}: Slide must be an object.`);
      return;
    }

    const rawType = slide.type;
    const slidePrefix = prefix(sIdx, rawType || 'untyped');

    // Supported slide type
    if (!rawType || typeof rawType !== 'string') {
      errors.push(`${slidePrefix}: Missing required 'type' property.`);
    } else if (!isSupportedSlideType(rawType)) {
      errors.push(`${slidePrefix}: Unsupported slide type '${rawType}'. Supported types: ${Array.from(SUPPORTED_SLIDE_TYPES).join(', ')}.`);
    }

    const canonicalType = normalizeSlideType(rawType);

    // estimatedMinutes check
    if (slide.estimatedMinutes !== undefined) {
      if (typeof slide.estimatedMinutes !== 'number' || !Number.isFinite(slide.estimatedMinutes) || isNaN(slide.estimatedMinutes) || slide.estimatedMinutes <= 0) {
        errors.push(`${slidePrefix}: 'estimatedMinutes' must be a finite positive number (got ${slide.estimatedMinutes}).`);
      }
    }

    // timerMinutes check
    if (slide.timerMinutes !== undefined) {
      if (typeof slide.timerMinutes !== 'number' || !Number.isFinite(slide.timerMinutes) || isNaN(slide.timerMinutes) || slide.timerMinutes <= 0) {
        errors.push(`${slidePrefix}: 'timerMinutes' must be a finite positive number (got ${slide.timerMinutes}).`);
      }
    }

    // Slide common properties type validation
    if (slide.title === undefined || slide.title === null) {
      errors.push(`${slidePrefix}: Missing required 'title' property.`);
    } else if (typeof slide.title !== 'string' || !slide.title.trim()) {
      errors.push(`${slidePrefix}: 'title' must be a non-empty string.`);
    }

    if (slide.subtitle !== undefined && typeof slide.subtitle !== 'string') {
      errors.push(`${slidePrefix}: 'subtitle' must be a string.`);
    }

    if (slide.phase !== undefined && typeof slide.phase !== 'string') {
      errors.push(`${slidePrefix}: 'phase' must be a string.`);
    }

    // Schema drift check: look for unexpected / misspelled top-level slide properties (must fail)
    if (canonicalType && TYPE_ALLOWED_PROPS[canonicalType]) {
      const allowedProps = TYPE_ALLOWED_PROPS[canonicalType];
      for (const prop of Object.keys(slide)) {
        if (!COMMON_SLIDE_PROPS.has(prop) && !allowedProps.has(prop)) {
          // Detect known drift cases with explicit actionable guidance
          if (canonicalType === 'exit-ticket' && prop === 'prompts') {
            errors.push(`${slidePrefix}: Found deprecated property 'prompts'. Use canonical 'questions: [{ prompt, solution }]'.`);
          } else {
            errors.push(`${slidePrefix}: Unknown or unexpected slide property '${prop}'.`);
          }
        }
      }
    }

    // 1. Title slide
    if (canonicalType === 'title') {
      if (slide.overview !== undefined && typeof slide.overview !== 'string') {
        errors.push(`${slidePrefix}: 'overview' must be a string.`);
      }
      if (slide.topics !== undefined) {
        if (!Array.isArray(slide.topics)) {
          errors.push(`${slidePrefix}: 'topics' must be an array of strings.`);
        } else {
          slide.topics.forEach((top, tIdx) => {
            if (typeof top !== 'string' || !top.trim()) {
              errors.push(`${slidePrefix} Topic [${tIdx}]: Topic must be a non-empty string.`);
            }
          });
        }
      }
    }

    // 2. Learning intentions slide
    if (canonicalType === 'learning') {
      if (slide.learningIntention === undefined || slide.learningIntention === null) {
        errors.push(`${slidePrefix}: Learning slide requires a 'learningIntention' string.`);
      } else if (typeof slide.learningIntention !== 'string' || !slide.learningIntention.trim()) {
        errors.push(`${slidePrefix}: 'learningIntention' must be a non-empty string.`);
      }

      if (!Array.isArray(slide.successCriteria) || slide.successCriteria.length === 0) {
        errors.push(`${slidePrefix}: Learning slide requires a non-empty 'successCriteria' array.`);
      } else {
        slide.successCriteria.forEach((sc, scIdx) => {
          if (typeof sc !== 'string' || !sc.trim()) {
            errors.push(`${slidePrefix} Success Criteria [${scIdx}]: Must be a non-empty string.`);
          }
        });
      }

      if (slide.keyPrinciple !== undefined && typeof slide.keyPrinciple !== 'string') {
        errors.push(`${slidePrefix}: 'keyPrinciple' must be a string.`);
      }
      if (slide.extraBlocks !== undefined && !Array.isArray(slide.extraBlocks)) {
        errors.push(`${slidePrefix}: 'extraBlocks' must be an array of blocks.`);
      }
    }

    // 3. Do Now slide
    if (canonicalType === 'do-now') {
      if (!Array.isArray(slide.questions) || slide.questions.length === 0) {
        errors.push(`${slidePrefix}: Do Now slide requires a non-empty 'questions' array.`);
      } else {
        const allowedQProps = new Set(['prompt', 'answer']);
        slide.questions.forEach((q, qIdx) => {
          if (!q || typeof q !== 'object') {
            errors.push(`${slidePrefix} Question [${qIdx}]: Question must be an object.`);
            return;
          }
          for (const p of Object.keys(q)) {
            if (!allowedQProps.has(p)) {
              errors.push(`${slidePrefix} Question [${qIdx}]: Unknown property '${p}' in Do Now question.`);
            }
          }
          if (q.prompt === undefined || q.prompt === null) {
            errors.push(`${slidePrefix} Question [${qIdx}]: Missing required 'prompt' string.`);
          } else if (typeof q.prompt !== 'string' || !q.prompt.trim()) {
            errors.push(`${slidePrefix} Question [${qIdx}]: 'prompt' must be a non-empty string.`);
          }
          if (q.answer === undefined || q.answer === null) {
            errors.push(`${slidePrefix} Question [${qIdx}]: Missing required 'answer' string.`);
          } else if (typeof q.answer !== 'string' || !q.answer.trim()) {
            errors.push(`${slidePrefix} Question [${qIdx}]: 'answer' must be a non-empty string.`);
          }
        });
      }

      if (slide.sidebarNotes !== undefined && !Array.isArray(slide.sidebarNotes)) {
        errors.push(`${slidePrefix}: 'sidebarNotes' must be an array of blocks.`);
      }
      if (slide.spinners !== undefined) {
        if (!Array.isArray(slide.spinners)) {
          errors.push(`${slidePrefix}: 'spinners' must be an array.`);
        } else {
          const allowedSpinnerProps = new Set(['id', 'name', 'sectors', 'needleAngle', 'sectorsDescription']);
          slide.spinners.forEach((sp, spIdx) => {
            if (!sp || typeof sp !== 'object') {
              errors.push(`${slidePrefix} Spinner [${spIdx}]: Spinner must be an object.`);
              return;
            }
            for (const p of Object.keys(sp)) {
              if (!allowedSpinnerProps.has(p)) {
                errors.push(`${slidePrefix} Spinner [${spIdx}]: Unknown property '${p}' in spinner.`);
              }
            }
          });
        }
      }
      if (slide.stimulusTitle !== undefined && typeof slide.stimulusTitle !== 'string') {
        errors.push(`${slidePrefix}: 'stimulusTitle' must be a string.`);
      }
      if (slide.stimulusPrompt !== undefined && typeof slide.stimulusPrompt !== 'string') {
        errors.push(`${slidePrefix}: 'stimulusPrompt' must be a string.`);
      }
    }

    // 4. Notes slide
    if (canonicalType === 'notes') {
      const hasCols = Array.isArray(slide.columns) && slide.columns.length > 0;
      const hasContent = Array.isArray(slide.content) && slide.content.length > 0;
      if (!hasCols && !hasContent) {
        errors.push(`${slidePrefix}: Notes slide must define a non-empty 'columns' or 'content' array.`);
      }
      if (slide.columns !== undefined) {
        if (!Array.isArray(slide.columns)) {
          errors.push(`${slidePrefix}: 'columns' must be an array.`);
        } else {
          const allowedColProps = new Set(['title', 'width', 'blocks']);
          slide.columns.forEach((col, cIdx) => {
            if (!col || typeof col !== 'object') {
              errors.push(`${slidePrefix} Column [${cIdx}]: Column must be an object.`);
              return;
            }
            for (const p of Object.keys(col)) {
              if (!allowedColProps.has(p)) {
                errors.push(`${slidePrefix} Column [${cIdx}]: Unknown property '${p}' in column.`);
              }
            }
            if (col.title !== undefined && typeof col.title !== 'string') {
              errors.push(`${slidePrefix} Column [${cIdx}]: 'title' must be a string.`);
            }
            if (col.width !== undefined && typeof col.width !== 'string' && typeof col.width !== 'number') {
              errors.push(`${slidePrefix} Column [${cIdx}]: 'width' must be a string or number.`);
            }
            if (!Array.isArray(col.blocks) || col.blocks.length === 0) {
              errors.push(`${slidePrefix} Column [${cIdx}]: Column requires a non-empty 'blocks' array.`);
            }
          });
        }
      }
      if (slide.content !== undefined && !Array.isArray(slide.content)) {
        errors.push(`${slidePrefix}: 'content' must be an array of blocks.`);
      }
    }

    // 5. Worked Example slide (canonical 'worked-example' and alias 'i-do')
    if (canonicalType === 'worked-example') {
      if (!Array.isArray(slide.steps) || slide.steps.length === 0) {
        errors.push(`${slidePrefix}: Worked example slide requires a non-empty 'steps' array.`);
      } else {
        const allowedStepProps = new Set(['label', 'text', 'latex', 'blocks']);
        slide.steps.forEach((step, stIdx) => {
          if (!step || typeof step !== 'object') {
            errors.push(`${slidePrefix} Step [${stIdx}]: Step must be an object.`);
            return;
          }
          for (const p of Object.keys(step)) {
            if (!allowedStepProps.has(p)) {
              errors.push(`${slidePrefix} Step [${stIdx}]: Unknown property '${p}' in worked example step.`);
            }
          }
          if (step.label !== undefined && typeof step.label !== 'string') {
            errors.push(`${slidePrefix} Step [${stIdx}]: 'label' must be a string.`);
          }
          if (step.text !== undefined && typeof step.text !== 'string') {
            errors.push(`${slidePrefix} Step [${stIdx}]: 'text' must be a string.`);
          }
          if (step.latex !== undefined && typeof step.latex !== 'string') {
            errors.push(`${slidePrefix} Step [${stIdx}]: 'latex' must be a string.`);
          }
          if (step.blocks !== undefined && !Array.isArray(step.blocks)) {
            errors.push(`${slidePrefix} Step [${stIdx}]: 'blocks' must be an array.`);
          }
          const hasStepContent = step.text || step.latex || (Array.isArray(step.blocks) && step.blocks.length > 0);
          if (!hasStepContent) {
            errors.push(`${slidePrefix} Step [${stIdx}]: Worked example step requires at least 'text', 'latex', or 'blocks'.`);
          }
        });
      }
      if (slide.prompt !== undefined && typeof slide.prompt !== 'string') {
        errors.push(`${slidePrefix}: 'prompt' must be a string.`);
      }
      if (slide.data !== undefined && typeof slide.data !== 'string') {
        errors.push(`${slidePrefix}: 'data' must be a string.`);
      }
      if (slide.leftBlocks !== undefined && !Array.isArray(slide.leftBlocks)) {
        errors.push(`${slidePrefix}: 'leftBlocks' must be an array of blocks.`);
      }
    }

    // 6. Board Task / We Do slide
    if (canonicalType === 'board-task' || canonicalType === 'we-do') {
      const hasContent = (Array.isArray(slide.workspaceContent) && slide.workspaceContent.length > 0) ||
        (Array.isArray(slide.leftBlocks) && slide.leftBlocks.length > 0) ||
        (Array.isArray(slide.content) && slide.content.length > 0) ||
        (Array.isArray(slide.rightBlocks) && slide.rightBlocks.length > 0) ||
        (typeof slide.prompt === 'string' && slide.prompt.trim().length > 0);
      if (!hasContent) {
        errors.push(`${slidePrefix}: Board task slide requires at least 'workspaceContent', 'leftBlocks', 'content', 'rightBlocks', or 'prompt'.`);
      }
      if (slide.studentAction !== undefined && typeof slide.studentAction !== 'string') {
        errors.push(`${slidePrefix}: 'studentAction' must be a string.`);
      }
      if (slide.prompt !== undefined && typeof slide.prompt !== 'string') {
        errors.push(`${slidePrefix}: 'prompt' must be a string.`);
      }
      if (slide.data !== undefined && typeof slide.data !== 'string') {
        errors.push(`${slidePrefix}: 'data' must be a string.`);
      }
      if (slide.notes !== undefined && !Array.isArray(slide.notes)) {
        errors.push(`${slidePrefix}: 'notes' must be an array of blocks.`);
      }
      if (slide.workspaceContent !== undefined && !Array.isArray(slide.workspaceContent)) {
        errors.push(`${slidePrefix}: 'workspaceContent' must be an array of blocks.`);
      }
      if (slide.leftBlocks !== undefined && !Array.isArray(slide.leftBlocks)) {
        errors.push(`${slidePrefix}: 'leftBlocks' must be an array of blocks.`);
      }
      if (slide.rightBlocks !== undefined && !Array.isArray(slide.rightBlocks)) {
        errors.push(`${slidePrefix}: 'rightBlocks' must be an array of blocks.`);
      }
      if (slide.content !== undefined && !Array.isArray(slide.content)) {
        errors.push(`${slidePrefix}: 'content' must be an array of blocks.`);
      }
      if (slide.separateSolutions !== undefined && typeof slide.separateSolutions !== 'boolean') {
        errors.push(`${slidePrefix}: 'separateSolutions' must be a boolean.`);
      }
      if (slide.solution !== undefined) {
        const slideDesc = canonicalType === 'we-do' ? 'We Do' : 'Board task';
        if (typeof slide.solution === 'string') {
          errors.push(`${slidePrefix}: ${slideDesc} 'solution' must be an array of blocks, got string.`);
        } else if (!Array.isArray(slide.solution)) {
          errors.push(`${slidePrefix}: ${slideDesc} 'solution' must be an array of blocks.`);
        } else if (slide.solution.length === 0) {
          errors.push(`${slidePrefix}: ${slideDesc} 'solution' array cannot be empty.`);
        }
      }
    }

    // 7. Comparison slide
    if (canonicalType === 'comparison') {
      if (!Array.isArray(slide.columns) || slide.columns.length === 0) {
        errors.push(`${slidePrefix}: Comparison slide requires a non-empty 'columns' array.`);
      } else {
        const allowedColProps = new Set(['title', 'width', 'blocks']);
        slide.columns.forEach((col, cIdx) => {
          if (!col || typeof col !== 'object') {
            errors.push(`${slidePrefix} Column [${cIdx}]: Column must be an object.`);
            return;
          }
          for (const p of Object.keys(col)) {
            if (!allowedColProps.has(p)) {
              errors.push(`${slidePrefix} Column [${cIdx}]: Unknown property '${p}' in column.`);
            }
          }
          if (col.title !== undefined && typeof col.title !== 'string') {
            errors.push(`${slidePrefix} Column [${cIdx}]: 'title' must be a string.`);
          }
          if (col.width !== undefined && typeof col.width !== 'string' && typeof col.width !== 'number') {
            errors.push(`${slidePrefix} Column [${cIdx}]: 'width' must be a string or number.`);
          }
          if (!Array.isArray(col.blocks) || col.blocks.length === 0) {
            errors.push(`${slidePrefix} Column [${cIdx}]: Column requires a non-empty 'blocks' array.`);
          }
        });
      }
    }

    // 8. Practice slide (canonical 'practice' and alias 'you-do')
    if (canonicalType === 'practice') {
      const hasTasks = Array.isArray(slide.tasks) && slide.tasks.length > 0;
      const hasContent = Array.isArray(slide.content) && slide.content.length > 0;
      if (!hasTasks && !hasContent) {
        errors.push(`${slidePrefix}: Practice slide must define a non-empty 'tasks' array or 'content'.`);
      }
      if (slide.tasks !== undefined) {
        if (!Array.isArray(slide.tasks)) {
          errors.push(`${slidePrefix}: 'tasks' must be an array.`);
        } else {
          const allowedTaskProps = new Set(['title', 'prompt', 'blocks', 'solution']);
          slide.tasks.forEach((t, tIdx) => {
            if (!t || typeof t !== 'object') {
              errors.push(`${slidePrefix} Task [${tIdx}]: Practice task must be an object.`);
              return;
            }
            for (const p of Object.keys(t)) {
              if (!allowedTaskProps.has(p)) {
                errors.push(`${slidePrefix} Task [${tIdx}]: Unknown property '${p}' in task.`);
              }
            }
            if (!t.title && !t.prompt) {
              errors.push(`${slidePrefix} Task [${tIdx}]: Practice task requires at least a 'title' or 'prompt'.`);
            }
            if (t.title !== undefined && typeof t.title !== 'string') {
              errors.push(`${slidePrefix} Task [${tIdx}]: 'title' must be a string.`);
            }
            if (t.prompt !== undefined && typeof t.prompt !== 'string') {
              errors.push(`${slidePrefix} Task [${tIdx}]: 'prompt' must be a string.`);
            }
            if (t.blocks !== undefined && !Array.isArray(t.blocks)) {
              errors.push(`${slidePrefix} Task [${tIdx}]: 'blocks' must be an array.`);
            }
            if (t.solution !== undefined) {
              if (typeof t.solution === 'string') {
                errors.push(`${slidePrefix} Task [${tIdx}]: 'solution' must be an array of blocks, got string.`);
              } else if (!Array.isArray(t.solution)) {
                errors.push(`${slidePrefix} Task [${tIdx}]: 'solution' must be an array of blocks.`);
              } else if (t.solution.length === 0) {
                errors.push(`${slidePrefix} Task [${tIdx}]: 'solution' array cannot be empty.`);
              }
            }
          });
        }
      }
      if (slide.content !== undefined && !Array.isArray(slide.content)) {
        errors.push(`${slidePrefix}: 'content' must be an array of blocks.`);
      }
    }

    // 9. Exit ticket slide
    if (canonicalType === 'exit-ticket') {
      if (!Array.isArray(slide.questions) || slide.questions.length === 0) {
        errors.push(`${slidePrefix}: Exit ticket requires a non-empty 'questions' array.`);
      } else {
        const allowedExitQProps = new Set(['prompt', 'question', 'blocks', 'solution']);
        slide.questions.forEach((q, qIdx) => {
          if (!q || typeof q !== 'object') {
            errors.push(`${slidePrefix} Question [${qIdx}]: Exit ticket question must be an object.`);
            return;
          }
          for (const p of Object.keys(q)) {
            if (!allowedExitQProps.has(p)) {
              errors.push(`${slidePrefix} Question [${qIdx}]: Unknown property '${p}' in exit ticket question.`);
            }
          }
          if (!q.prompt && !q.question) {
            errors.push(`${slidePrefix} Question [${qIdx}]: Exit ticket question requires a 'prompt' string.`);
          } else if (q.question && !q.prompt) {
            warnings.push(`${slidePrefix} Question [${qIdx}]: Found 'question' property instead of canonical 'prompt'.`);
          }
          if (q.prompt !== undefined && typeof q.prompt !== 'string') {
            errors.push(`${slidePrefix} Question [${qIdx}]: 'prompt' must be a string.`);
          }
          if (q.question !== undefined && typeof q.question !== 'string') {
            errors.push(`${slidePrefix} Question [${qIdx}]: 'question' must be a string.`);
          }
          if (q.blocks !== undefined && !Array.isArray(q.blocks)) {
            errors.push(`${slidePrefix} Question [${qIdx}]: 'blocks' must be an array.`);
          }
          if (q.solution !== undefined) {
            if (typeof q.solution === 'string') {
              errors.push(`${slidePrefix} Question [${qIdx}]: 'solution' must be an array of blocks, got string.`);
            } else if (!Array.isArray(q.solution)) {
              errors.push(`${slidePrefix} Question [${qIdx}]: 'solution' must be an array of blocks.`);
            } else if (q.solution.length === 0) {
              errors.push(`${slidePrefix} Question [${qIdx}]: 'solution' array cannot be empty.`);
            }
          }
        });
      }
    }

    // 10. Summary slide
    if (canonicalType === 'summary') {
      if (!Array.isArray(slide.takeaways) || slide.takeaways.length === 0) {
        errors.push(`${slidePrefix}: Summary slide requires a non-empty 'takeaways' array.`);
      } else {
        slide.takeaways.forEach((t, tIdx) => {
          if (typeof t !== 'string' || !t.trim()) {
            errors.push(`${slidePrefix} Takeaway [${tIdx}]: Takeaway must be a non-empty string.`);
          }
        });
      }
    }


    // Block-level validation
    const blocksWithCtx = extractBlocks(slide);
    blocksWithCtx.forEach(({ block, path, isInvalidEntry }) => {
      if (isInvalidEntry) {
        errors.push(`${slidePrefix} [${path}]: Invalid block entry; expected a block object.`);
        return;
      }

      const bType = block.type;
      const blockDesc = `${slidePrefix} [${path}] (${bType || 'untyped'})`;
      const blockErrorStart = errors.length;

      if (!bType || typeof bType !== 'string' || !bType.trim()) {
        errors.push(`${slidePrefix} [${path}]: Missing required 'type' property in block.`);
        return;
      }

      if (!isSupportedBlockType(bType)) {
        errors.push(
          `${slidePrefix} [${path}]: Unsupported block type '${bType}'. Supported block types: ${Array.from(SUPPORTED_BLOCK_TYPES).join(', ')}.`
        );
        return;
      }

      const canonicalBType = normalizeBlockType(bType);

      // Check allowed properties on this block type (reject misspelled/unexpected properties)
      const allowedBlockProps = TYPE_ALLOWED_BLOCK_PROPS[canonicalBType];
      if (allowedBlockProps) {
        for (const prop of Object.keys(block)) {
          if (!COMMON_BLOCK_PROPS.has(prop) && !allowedBlockProps.has(prop)) {
            if (prop === 'varient') {
              errors.push(`${blockDesc}: Unknown or unexpected block property 'varient' (did you mean 'variant'?).`);
            } else {
              errors.push(`${blockDesc}: Unknown or unexpected block property '${prop}'.`);
            }
          }
        }
      }

      // Composite blocks own their reveal sequence, or have no root to reveal.
      if (canonicalBType === 'sector-construction' || canonicalBType === 'board-workspace') {
        for (const prop of ['reveal', 'revealStep']) {
          if (block[prop] !== undefined) {
            errors.push(`${blockDesc}: Block-level '${prop}' is unsupported for ${canonicalBType}; configure child/internal reveals instead.`);
          }
        }
      }
      if (canonicalBType === 'measured-bar' && block.progressive === true &&
          (block.reveal === true || block.revealStep !== undefined)) {
        errors.push(`${blockDesc}: Progressive ${bType} cannot combine outer 'reveal'/'revealStep' with internal reveal steps.`);
      }

      if (slide.separateSolutions === true && /^slide\.solution\[\d+\]/.test(path)) {
        if (canonicalBType === 'sector-construction' || (canonicalBType === 'measured-bar' && block.progressive === true)) {
          errors.push(`${blockDesc}: An internally progressive graph cannot be nested in a separate solution reveal; place it in workspaceContent or rightBlocks instead.`);
        }
        if (/^slide\.solution\[\d+\]$/.test(path) && block.reveal === false) {
          errors.push(`${blockDesc}: A separate solution entry cannot use 'reveal: false'; its solution container owns the reveal.`);
        }
      }

      // Shared property data type checks
      if (block.reveal !== undefined && typeof block.reveal !== 'boolean') {
        errors.push(`${blockDesc}: 'reveal' must be a boolean (got ${typeof block.reveal}).`);
      }
      if (block.reveal === false && block.revealStep !== undefined) {
        errors.push(`${blockDesc}: 'reveal: false' cannot be combined with 'revealStep'.`);
      }
      if (block.revealStep !== undefined && (typeof block.revealStep !== 'number' || !Number.isInteger(block.revealStep) || block.revealStep < 1)) {
        errors.push(`${blockDesc}: 'revealStep' must be a positive integer (got ${block.revealStep}).`);
      }
      if (block.badgeTitle !== undefined && typeof block.badgeTitle !== 'string') {
        errors.push(`${blockDesc}: 'badgeTitle' must be a string.`);
      }
      if (block.className !== undefined && typeof block.className !== 'string') {
        errors.push(`${blockDesc}: 'className' must be a string.`);
      }

      // Block-specific field and structure validation
      if (canonicalBType === 'heading') {
        if (block.text === undefined || block.text === null) {
          errors.push(`${blockDesc}: Heading block requires a 'text' string.`);
        } else if (typeof block.text !== 'string') {
          errors.push(`${blockDesc}: Heading 'text' must be a string (got ${typeof block.text}).`);
        } else if (!block.text.trim()) {
          errors.push(`${blockDesc}: Heading 'text' cannot be empty.`);
        }
        if (block.level !== undefined) {
          if (typeof block.level !== 'number' || !Number.isInteger(block.level) || block.level < 1 || block.level > 6) {
            errors.push(`${blockDesc}: Heading 'level' must be an integer between 1 and 6 (got ${block.level}).`);
          }
        }
      }

      if (canonicalBType === 'paragraph') {
        if (block.text === undefined || block.text === null) {
          errors.push(`${blockDesc}: Paragraph block requires a 'text' string.`);
        } else if (typeof block.text !== 'string') {
          errors.push(`${blockDesc}: Paragraph 'text' must be a string (got ${typeof block.text}).`);
        }
      }

      if (canonicalBType === 'bullet-list' || canonicalBType === 'ordered-list') {
        if (!Array.isArray(block.items)) {
          errors.push(`${blockDesc}: ${canonicalBType} requires an 'items' array.`);
        } else if (block.items.length === 0) {
          errors.push(`${blockDesc}: ${canonicalBType} requires a non-empty 'items' array.`);
        } else {
          block.items.forEach((item, itIdx) => {
            if (typeof item !== 'string' && typeof item !== 'number') {
              errors.push(`${blockDesc} Item [${itIdx}]: List item must be a string or number.`);
            }
          });
        }
      }

      if (canonicalBType === 'note-box') {
        if (block.text === undefined || block.text === null) {
          errors.push(`${blockDesc}: Note-box requires a 'text' string.`);
        } else if (typeof block.text !== 'string') {
          errors.push(`${blockDesc}: Note-box 'text' must be a string (got ${typeof block.text}).`);
        }
        if (block.title !== undefined && typeof block.title !== 'string') {
          errors.push(`${blockDesc}: Note-box 'title' must be a string.`);
        }
        if (block.copyToWorkbook !== undefined && typeof block.copyToWorkbook !== 'boolean') {
          errors.push(`${blockDesc}: Note-box 'copyToWorkbook' must be a boolean.`);
        }
        if (block.variant !== undefined) {
          if (typeof block.variant !== 'string') {
            errors.push(`${blockDesc}: Note-box 'variant' must be a string. Supported variants: ${Array.from(SUPPORTED_NOTE_VARIANTS).join(', ')}.`);
          } else if (!SUPPORTED_NOTE_VARIANTS.has(block.variant.trim())) {
            errors.push(`${blockDesc}: Unsupported note-box variant '${block.variant}'. Supported variants: ${Array.from(SUPPORTED_NOTE_VARIANTS).join(', ')}.`);
          }
        }
      }

      if (canonicalBType === 'raw-data') {
        if (block.data === undefined || block.data === null) {
          errors.push(`${blockDesc}: Raw-data block requires a 'data' string.`);
        } else if (typeof block.data !== 'string') {
          errors.push(`${blockDesc}: Raw-data 'data' must be a string (got ${typeof block.data}).`);
        }
      }

      if (canonicalBType === 'formula') {
        if (block.latex === undefined || block.latex === null) {
          errors.push(`${blockDesc}: Formula block requires a 'latex' string.`);
        } else if (typeof block.latex !== 'string') {
          errors.push(`${blockDesc}: Formula 'latex' must be a string (got ${typeof block.latex}).`);
        } else if (!block.latex.trim()) {
          errors.push(`${blockDesc}: Formula 'latex' cannot be empty.`);
        }
      }

      if (canonicalBType === 'table') {
        if (!Array.isArray(block.rows)) {
          errors.push(`${blockDesc}: Table block requires a 'rows' array.`);
        } else if (block.rows.length === 0) {
          errors.push(`${blockDesc}: Table block requires a non-empty 'rows' array.`);
        }

        let expectedWidth = null;

        if (block.headers !== undefined) {
          if (!Array.isArray(block.headers)) {
            errors.push(`${blockDesc}: Table 'headers' must be an array.`);
          } else {
            expectedWidth = block.headers.length;
            block.headers.forEach((h, hIdx) => {
              if (h === null || h === undefined) {
                errors.push(`${blockDesc} Header [${hIdx}]: Header cell cannot be null or undefined.`);
              } else if (typeof h === 'object') {
                if (Array.isArray(h)) {
                  errors.push(`${blockDesc} Header [${hIdx}]: Header cell cannot be an array.`);
                } else {
                  const allowedCellProps = new Set(['text', 'reveal', 'revealStep']);
                  for (const p of Object.keys(h)) {
                    if (!allowedCellProps.has(p)) {
                      errors.push(`${blockDesc} Header [${hIdx}]: Unknown cell property '${p}'.`);
                    }
                  }
                  if (h.text === undefined || (typeof h.text !== 'string' && typeof h.text !== 'number')) {
                    errors.push(`${blockDesc} Header [${hIdx}]: Header object requires a 'text' string or number.`);
                  }
                  if (h.reveal !== undefined && typeof h.reveal !== 'boolean') {
                    errors.push(`${blockDesc} Header [${hIdx}]: 'reveal' must be a boolean.`);
                  }
                  if (h.reveal === false && h.revealStep !== undefined) {
                    errors.push(`${blockDesc} Header [${hIdx}]: 'reveal: false' cannot be combined with 'revealStep'.`);
                  }
                  if (h.revealStep !== undefined && (typeof h.revealStep !== 'number' || !Number.isInteger(h.revealStep) || h.revealStep < 1)) {
                    errors.push(`${blockDesc} Header [${hIdx}]: 'revealStep' must be a positive integer.`);
                  }
                }
              } else if (typeof h !== 'string' && typeof h !== 'number') {
                errors.push(`${blockDesc} Header [${hIdx}]: Header must be a string, number, or { text, reveal, revealStep } object.`);
              }
            });
          }
        }

        if (Array.isArray(block.rows)) {
          if (expectedWidth === null && block.rows.length > 0 && Array.isArray(block.rows[0])) {
            expectedWidth = block.rows[0].length;
          }

          block.rows.forEach((row, rIdx) => {
            if (!Array.isArray(row)) {
              errors.push(`${blockDesc} Row [${rIdx}]: Table row must be an array of cells.`);
              return;
            }

            if (expectedWidth !== null && row.length !== expectedWidth) {
              const reason = (block.headers && Array.isArray(block.headers))
                ? `expected ${expectedWidth} cells (matching headers count)`
                : `expected ${expectedWidth} cells (matching first row width)`;
              errors.push(`${blockDesc} Row [${rIdx}]: Unequal table row width: row has ${row.length} cells, ${reason}.`);
            }

            row.forEach((cell, cIdx) => {
              if (cell === null || cell === undefined) {
                errors.push(`${blockDesc} Row [${rIdx}] Cell [${cIdx}]: Cell cannot be null or undefined.`);
              } else if (typeof cell === 'object') {
                if (Array.isArray(cell)) {
                  errors.push(`${blockDesc} Row [${rIdx}] Cell [${cIdx}]: Cell cannot be an array.`);
                } else {
                  const allowedCellProps = new Set(['text', 'reveal', 'revealStep']);
                  for (const p of Object.keys(cell)) {
                    if (!allowedCellProps.has(p)) {
                      errors.push(`${blockDesc} Row [${rIdx}] Cell [${cIdx}]: Unknown cell property '${p}'.`);
                    }
                  }
                  if (cell.text === undefined || (typeof cell.text !== 'string' && typeof cell.text !== 'number')) {
                    errors.push(`${blockDesc} Row [${rIdx}] Cell [${cIdx}]: Cell object requires a 'text' string or number.`);
                  }
                  if (cell.reveal !== undefined && typeof cell.reveal !== 'boolean') {
                    errors.push(`${blockDesc} Row [${rIdx}] Cell [${cIdx}]: 'reveal' must be a boolean.`);
                  }
                  if (cell.reveal === false && cell.revealStep !== undefined) {
                    errors.push(`${blockDesc} Row [${rIdx}] Cell [${cIdx}]: 'reveal: false' cannot be combined with 'revealStep'.`);
                  }
                  if (cell.revealStep !== undefined && (typeof cell.revealStep !== 'number' || !Number.isInteger(cell.revealStep) || cell.revealStep < 1)) {
                    errors.push(`${blockDesc} Row [${rIdx}] Cell [${cIdx}]: 'revealStep' must be a positive integer.`);
                  }
                }
              } else if (typeof cell !== 'string' && typeof cell !== 'number') {
                errors.push(`${blockDesc} Row [${rIdx}] Cell [${cIdx}]: Cell must be a string, number, or { text, reveal, revealStep } object.`);
              }
            });
          });
        }

        if (block.compact !== undefined && typeof block.compact !== 'boolean') {
          errors.push(`${blockDesc}: Table 'compact' property must be a boolean.`);
        }
      }

      // Stem-and-leaf validation
      if (canonicalBType === 'stem-and-leaf') {
        const isB2B = Boolean(block.isBackToBack);

        // Check for deprecated schema drift fields
        if (block.typeVariant) {
          errors.push(`${blockDesc}: Found 'typeVariant: "${block.typeVariant}"'. Use canonical 'isBackToBack: true'.`);
        }
        if (block.titleLeft) {
          errors.push(`${blockDesc}: Found 'titleLeft'. Use canonical 'leftHeader'.`);
        }
        if (block.titleRight) {
          errors.push(`${blockDesc}: Found 'titleRight'. Use canonical 'rightHeader'.`);
        }

        if (isB2B) {
          if (!block.leftHeader || typeof block.leftHeader !== 'string') {
            errors.push(`${blockDesc}: Back-to-back stem-and-leaf requires 'leftHeader' string.`);
          }
          if (!block.rightHeader || typeof block.rightHeader !== 'string') {
            errors.push(`${blockDesc}: Back-to-back stem-and-leaf requires 'rightHeader' string.`);
          }
        }

        if (!Array.isArray(block.rows) || block.rows.length === 0) {
          errors.push(`${blockDesc}: Stem-and-leaf plot requires a non-empty 'rows' array.`);
        } else {
          const allowedRowProps = isB2B
            ? new Set(['stem', 'leftLeaves', 'leaves', 'leavesLeft', 'leavesRight'])
            : new Set(['stem', 'leaves']);

          block.rows.forEach((r, rIdx) => {
            if (!r || typeof r !== 'object') {
              errors.push(`${blockDesc} Row [${rIdx}]: Stem-and-leaf row must be an object.`);
              return;
            }

            for (const p of Object.keys(r)) {
              if (!allowedRowProps.has(p)) {
                errors.push(`${blockDesc} Row [${rIdx}]: Unknown property '${p}' in stem-and-leaf row.`);
              }
            }

            if (r.stem === undefined || r.stem === null) {
              errors.push(`${blockDesc} Row [${rIdx}]: Missing required 'stem' property.`);
            }

            if (isB2B) {
              if (r.leavesLeft !== undefined) {
                errors.push(`${blockDesc} Row [${rIdx}]: Found 'leavesLeft'. Use canonical 'leftLeaves'.`);
              }
              if (r.leavesRight !== undefined) {
                errors.push(`${blockDesc} Row [${rIdx}]: Found 'leavesRight'. Use canonical 'leaves'.`);
              }
              if (r.leftLeaves === undefined) {
                errors.push(`${blockDesc} Row [${rIdx}]: Back-to-back row requires 'leftLeaves' string.`);
              }
              if (r.leaves === undefined) {
                errors.push(`${blockDesc} Row [${rIdx}]: Back-to-back row requires 'leaves' string.`);
              }
            } else {
              if (r.leaves === undefined) {
                errors.push(`${blockDesc} Row [${rIdx}]: Normal stem-and-leaf row requires 'leaves' string.`);
              }
            }
          });
        }

        if (block.key !== undefined && typeof block.key !== 'string') {
          errors.push(`${blockDesc}: Stem-and-leaf 'key' must be a string.`);
        }
      }

      // Sector graph validation
      if (canonicalBType === 'sector-graph') {
        if (!Array.isArray(block.items) || block.items.length === 0) {
          errors.push(`${blockDesc}: Sector graph requires a non-empty 'items' array.`);
        } else {
          const allowedItemProps = new Set(['label', 'amount', 'fraction', 'color', 'angle']);
          block.items.forEach((item, itIdx) => {
            if (!item || typeof item !== 'object' || Array.isArray(item)) {
              errors.push(`${blockDesc} Item [${itIdx}]: Sector graph item must be an object.`);
              return;
            }
            for (const p of Object.keys(item)) {
              if (!allowedItemProps.has(p)) {
                errors.push(`${blockDesc} Item [${itIdx}]: Unknown property '${p}' in sector graph item.`);
              }
            }
            if (!item.label || typeof item.label !== 'string') {
              errors.push(`${blockDesc} Item [${itIdx}]: Sector graph item requires a 'label' string.`);
            }
            if (item.amount === undefined && item.fraction === undefined) {
              errors.push(`${blockDesc} Item [${itIdx}]: Sector graph item requires an 'amount' or 'fraction' value.`);
            }
            for (const prop of ['amount', 'fraction', 'angle']) {
              if (item[prop] !== undefined && !Number.isFinite(item[prop])) {
                errors.push(`${blockDesc} Item [${itIdx}]: '${prop}' must be a finite number.`);
              }
            }
            for (const prop of ['color']) {
              if (item[prop] !== undefined && typeof item[prop] !== 'string') {
                errors.push(`${blockDesc} Item [${itIdx}]: '${prop}' must be a string.`);
              }
            }
          });
        }

        if (block.total !== undefined && (typeof block.total !== 'number' || isNaN(block.total) || block.total <= 0)) {
          errors.push(`${blockDesc}: Sector graph 'total' must be a positive number.`);
        }
        if (block.size !== undefined && (typeof block.size !== 'number' || isNaN(block.size) || block.size <= 0)) {
          errors.push(`${blockDesc}: Sector graph 'size' must be a positive number.`);
        }
        if (block.radius !== undefined && (typeof block.radius !== 'number' || isNaN(block.radius) || block.radius <= 0)) {
          errors.push(`${blockDesc}: Sector graph 'radius' must be a positive number.`);
        }
      }

      // Sector construction validation
      if (canonicalBType === 'sector-construction') {
        const items = block.categories || block.items;
        if (!Array.isArray(items) || items.length === 0) {
          errors.push(`${blockDesc}: Sector construction requires a non-empty 'categories' or 'items' array.`);
        } else {
          const allowedCatProps = new Set(['label', 'value', 'amount', 'fraction', 'calculation', 'angle', 'color']);
          items.forEach((item, itIdx) => {
            if (!item || typeof item !== 'object' || Array.isArray(item)) {
              errors.push(`${blockDesc} Item [${itIdx}]: Sector construction item must be an object.`);
              return;
            }
            for (const p of Object.keys(item)) {
              if (!allowedCatProps.has(p)) {
                errors.push(`${blockDesc} Item [${itIdx}]: Unknown property '${p}' in sector construction item.`);
              }
            }
            if (!item.label || typeof item.label !== 'string') {
              errors.push(`${blockDesc} Item [${itIdx}]: Sector construction item requires a 'label' string.`);
            }
            if (item.amount === undefined && item.fraction === undefined && item.value === undefined && item.angle === undefined) {
              errors.push(`${blockDesc} Item [${itIdx}]: Sector construction item requires a 'value', 'amount', 'fraction', or 'angle' value.`);
            }
            for (const prop of ['value', 'amount', 'angle']) {
              if (item[prop] !== undefined && !Number.isFinite(item[prop])) {
                errors.push(`${blockDesc} Item [${itIdx}]: '${prop}' must be a finite number.`);
              }
            }
            if (item.fraction !== undefined && !Number.isFinite(item.fraction) &&
                !(typeof item.fraction === 'string' && item.fraction.trim())) {
              errors.push(`${blockDesc} Item [${itIdx}]: 'fraction' must be a finite number or non-empty LaTeX string.`);
            }
            for (const prop of ['calculation', 'color']) {
              if (item[prop] !== undefined && typeof item[prop] !== 'string') {
                errors.push(`${blockDesc} Item [${itIdx}]: '${prop}' must be a string.`);
              }
            }
          });
        }

        if (block.total !== undefined && (typeof block.total !== 'number' || isNaN(block.total) || block.total <= 0)) {
          errors.push(`${blockDesc}: Sector construction 'total' must be a positive number.`);
        }
        if (block.size !== undefined && (typeof block.size !== 'number' || isNaN(block.size) || block.size <= 0)) {
          errors.push(`${blockDesc}: Sector construction 'size' must be a positive number.`);
        }
        if (block.radius !== undefined && (typeof block.radius !== 'number' || isNaN(block.radius) || block.radius <= 0)) {
          errors.push(`${blockDesc}: Sector construction 'radius' must be a positive number.`);
        }
        if (block.showTable !== undefined && typeof block.showTable !== 'boolean') {
          errors.push(`${blockDesc}: Sector construction 'showTable' must be a boolean.`);
        }
        if (block.tableHeaders !== undefined) {
          if (!Array.isArray(block.tableHeaders)) {
            errors.push(`${blockDesc}: Sector construction 'tableHeaders' must be an array of strings.`);
          } else {
            block.tableHeaders.forEach((header, hIdx) => {
              if (typeof header !== 'string') {
                errors.push(`${blockDesc} tableHeaders[${hIdx}]: Header must be a string.`);
              }
            });
          }
        }
        if (block.notes !== undefined && !Array.isArray(block.notes)) {
          errors.push(`${blockDesc}: Sector construction 'notes' must be an array of blocks.`);
        }
        if (block.check !== undefined && typeof block.check !== 'string') {
          errors.push(`${blockDesc}: Sector construction 'check' must be a string.`);
        }
        if (block.checkMath !== undefined && typeof block.checkMath !== 'string') {
          errors.push(`${blockDesc}: Sector construction 'checkMath' must be a string.`);
        }
        if (block.checkLabel !== undefined && typeof block.checkLabel !== 'string') {
          errors.push(`${blockDesc}: Sector construction 'checkLabel' must be a string.`);
        }
        if (block.unitLabel !== undefined && typeof block.unitLabel !== 'string') {
          errors.push(`${blockDesc}: Sector construction 'unitLabel' must be a string.`);
        }
      }

      // Divided bar & Measured bar validation
      if (canonicalBType === 'measured-bar') {
        const items = block.categories || block.items;
        if (!Array.isArray(items) || items.length === 0) {
          errors.push(`${blockDesc}: ${bType} requires a non-empty 'categories' or 'items' array.`);
        } else {
          const allowedBarItemProps = new Set(['label', 'value', 'amount', 'length', 'fraction', 'color']);
          items.forEach((item, itIdx) => {
            if (!item || typeof item !== 'object' || Array.isArray(item)) {
              errors.push(`${blockDesc} Item [${itIdx}]: ${bType} item must be an object.`);
              return;
            }
            for (const p of Object.keys(item)) {
              if (!allowedBarItemProps.has(p)) {
                errors.push(`${blockDesc} Item [${itIdx}]: Unknown property '${p}' in ${bType} item.`);
              }
            }
            if (!item.label || typeof item.label !== 'string') {
              errors.push(`${blockDesc} Item [${itIdx}]: ${bType} item requires a 'label' string.`);
            }
            if (item.amount === undefined && item.fraction === undefined && item.value === undefined && item.length === undefined) {
              errors.push(`${blockDesc} Item [${itIdx}]: ${bType} item requires a 'value', 'amount', 'length', or 'fraction' value.`);
            }
            for (const prop of ['value', 'amount', 'length', 'fraction']) {
              if (item[prop] !== undefined && !Number.isFinite(item[prop])) {
                errors.push(`${blockDesc} Item [${itIdx}]: '${prop}' must be a finite number.`);
              }
            }
            for (const prop of ['color']) {
              if (item[prop] !== undefined && typeof item[prop] !== 'string') {
                errors.push(`${blockDesc} Item [${itIdx}]: '${prop}' must be a string.`);
              }
            }
          });
        }

        if (block.totalLength !== undefined && (typeof block.totalLength !== 'number' || isNaN(block.totalLength) || block.totalLength <= 0)) {
          errors.push(`${blockDesc}: ${bType} 'totalLength' must be a positive number.`);
        }
        if (block.totalLengthCm !== undefined && (typeof block.totalLengthCm !== 'number' || isNaN(block.totalLengthCm) || block.totalLengthCm <= 0)) {
          errors.push(`${blockDesc}: ${bType} 'totalLengthCm' must be a positive number.`);
        }
        if (block.total !== undefined && (typeof block.total !== 'number' || isNaN(block.total) || block.total <= 0)) {
          errors.push(`${blockDesc}: ${bType} 'total' must be a positive number.`);
        }
        if (block.unit !== undefined && typeof block.unit !== 'string') {
          errors.push(`${blockDesc}: ${bType} 'unit' must be a string.`);
        }
        if (block.showTicks !== undefined && typeof block.showTicks !== 'boolean') {
          errors.push(`${blockDesc}: ${bType} 'showTicks' must be a boolean.`);
        }
        if (block.showMinorTicks !== undefined && typeof block.showMinorTicks !== 'boolean') {
          errors.push(`${blockDesc}: ${bType} 'showMinorTicks' must be a boolean.`);
        }
        if (block.progressive !== undefined && typeof block.progressive !== 'boolean') {
          errors.push(`${blockDesc}: ${bType} 'progressive' must be a boolean.`);
        }
        if (block.title !== undefined && typeof block.title !== 'string') {
          errors.push(`${blockDesc}: ${bType} 'title' must be a string.`);
        }
        if (block.subtitle !== undefined && typeof block.subtitle !== 'string') {
          errors.push(`${blockDesc}: ${bType} 'subtitle' must be a string.`);
        }
        if (block.check !== undefined && typeof block.check !== 'string') {
          errors.push(`${blockDesc}: ${bType} 'check' must be a string.`);
        }
        if (block.checkMath !== undefined && typeof block.checkMath !== 'string') {
          errors.push(`${blockDesc}: ${bType} 'checkMath' must be a string.`);
        }
        if (block.checkSum !== undefined && typeof block.checkSum !== 'string') {
          errors.push(`${blockDesc}: ${bType} 'checkSum' must be a string.`);
        }
        if (block.checkLabel !== undefined && typeof block.checkLabel !== 'string') {
          errors.push(`${blockDesc}: ${bType} 'checkLabel' must be a string.`);
        }
      }

      if (errors.length === blockErrorStart && ['sector-graph', 'sector-construction', 'measured-bar'].includes(canonicalBType)) {
        for (const issue of graphConsistency(block, canonicalBType)) {
          errors.push(`${slidePrefix} [${path}.${issue.path}]: ${issue.message} Observed ${issue.observed}; expected ${issue.expected}.`);
        }
      }

      // Board-workspace validation
      if (canonicalBType === 'board-workspace') {
        if (block.content !== undefined && !Array.isArray(block.content)) {
          errors.push(`${blockDesc}: Board-workspace 'content' must be an array.`);
        }
      }

      // Solution block validation
      if (canonicalBType === 'solution') {
        if (block.title !== undefined && typeof block.title !== 'string') {
          errors.push(`${blockDesc}: Solution 'title' must be a string.`);
        }
        if (block.text !== undefined && typeof block.text !== 'string') {
          errors.push(`${blockDesc}: Solution 'text' must be a string.`);
        }
        if (block.latex !== undefined && typeof block.latex !== 'string') {
          errors.push(`${blockDesc}: Solution 'latex' must be a string.`);
        }
        if (block.blocks !== undefined && !Array.isArray(block.blocks)) {
          errors.push(`${blockDesc}: Solution 'blocks' must be an array.`);
        }
      }

      // Simulation validation
      if (canonicalBType === 'simulation') {
        if (!block.simType || typeof block.simType !== 'string' || !block.simType.trim()) {
          errors.push(`${blockDesc}: Simulation block requires a valid 'simType' string.`);
        } else if (!isSupportedSimulationType(block.simType)) {
          errors.push(
            `${slidePrefix} [${path}] (simulation): Unsupported simulation type '${block.simType}'. Supported simulation types: ${Array.from(SUPPORTED_SIMULATION_TYPES).join(', ')}.`
          );
        }
        const simType = normalizeSimulationType(block.simType);
        const nestedError = (nestedPath, message) => {
          errors.push(`${slidePrefix} [${nestedPath}] (simulation): ${message}`);
        };
        const validateObject = (value, nestedPath, allowedProps) => {
          if (!value || typeof value !== 'object' || Array.isArray(value)) {
            nestedError(nestedPath, 'Expected an object.');
            return false;
          }
          for (const prop of Object.keys(value)) {
            if (!allowedProps.includes(prop)) {
              nestedError(`${nestedPath}.${prop}`, `Unknown simulation property '${prop}'.`);
            }
          }
          return true;
        };
        const validateStrings = (value, nestedPath, props) => {
          for (const prop of props) {
            if (value[prop] !== undefined && typeof value[prop] !== 'string') {
              nestedError(`${nestedPath}.${prop}`, 'Must be a string.');
            }
          }
        };
        const validateLabel = (value, nestedPath) => {
          if (typeof value.label !== 'string' || !value.label.trim()) {
            nestedError(`${nestedPath}.label`, 'Must be a non-empty string.');
          }
        };

        if (simType === 'spinner') {
          if (!Array.isArray(block.spinners) || block.spinners.length === 0) {
            nestedError(`${path}.spinners`, 'Spinner simulation requires a non-empty array.');
          } else {
            block.spinners.forEach((spinner, spinnerIdx) => {
              const spinnerPath = `${path}.spinners[${spinnerIdx}]`;
              if (!validateObject(spinner, spinnerPath, ['id', 'name', 'badge', 'expected', 'sectors'])) return;
              validateStrings(spinner, spinnerPath, ['id', 'name', 'badge', 'expected']);
              if (!Array.isArray(spinner.sectors) || spinner.sectors.length === 0) {
                nestedError(`${spinnerPath}.sectors`, 'Spinner requires a non-empty array.');
              } else {
                spinner.sectors.forEach((sector, sectorIdx) => {
                  const sectorPath = `${spinnerPath}.sectors[${sectorIdx}]`;
                  if (!validateObject(sector, sectorPath, ['label', 'angle', 'color', 'term'])) return;
                  validateLabel(sector, sectorPath);
                  if (!Number.isFinite(sector.angle)) {
                    nestedError(`${sectorPath}.angle`, 'Must be a finite number.');
                  }
                  validateStrings(sector, sectorPath, ['color', 'term']);
                });
              }
            });
          }
        }
        if (simType === 'counter-bag' || simType === 'pen-draw') {
          if (!Array.isArray(block.items) || block.items.length === 0) {
            nestedError(`${path}.items`, 'Draw simulation requires a non-empty array.');
          } else {
            block.items.forEach((item, itemIdx) => {
              const itemPath = `${path}.items[${itemIdx}]`;
              if (!validateObject(item, itemPath, ['label', 'count', 'color', 'term'])) return;
              validateLabel(item, itemPath);
              if (!Number.isInteger(item.count) || item.count < 0) {
                nestedError(`${itemPath}.count`, 'Must be a non-negative integer.');
              }
              validateStrings(item, itemPath, ['color', 'term']);
            });
          }
        }
        if (block.totalSpins !== undefined && !Number.isFinite(block.totalSpins)) {
          nestedError(`${path}.totalSpins`, 'Must be a finite number.');
        }
        if (block.badge !== undefined && typeof block.badge !== 'string') {
          nestedError(`${path}.badge`, 'Must be a string.');
        }
        if (block.title !== undefined && typeof block.title !== 'string') {
          errors.push(`${blockDesc}: Simulation 'title' must be a string.`);
        }
        if (block.subtitle !== undefined && typeof block.subtitle !== 'string') {
          errors.push(`${blockDesc}: Simulation 'subtitle' must be a string.`);
        }
        if (block.expected !== undefined && typeof block.expected !== 'string') {
          errors.push(`${blockDesc}: Simulation 'expected' must be a string.`);
        }
        if (block.items !== undefined && !Array.isArray(block.items)) {
          errors.push(`${blockDesc}: Simulation 'items' must be an array.`);
        }
        if (block.spinners !== undefined && !Array.isArray(block.spinners)) {
          errors.push(`${blockDesc}: Simulation 'spinners' must be an array.`);
        }
        if (block.defaultClassSize !== undefined && (!Number.isFinite(block.defaultClassSize) || block.defaultClassSize <= 0)) {
          nestedError(`${path}.defaultClassSize`, 'Must be a finite positive number.');
        }
        if (block.trialsPerStudent !== undefined && (!Number.isFinite(block.trialsPerStudent) || block.trialsPerStudent <= 0)) {
          nestedError(`${path}.trialsPerStudent`, 'Must be a finite positive number.');
        }
      }
    });
  });

  errors.push(...auditLessonMath(lesson).issues.map(formatMathIssue));

  reportToConsole(errors, warnings, options.silent);

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Output errors and warnings to console.
 */
function reportToConsole(errors, warnings, silent) {
  if (silent) return;
  warnings.forEach((w) => console.warn(w));
  errors.forEach((e) => console.error(e));
}
