/**
 * @file validator.js
 * Lightweight schema validation for lesson data models.
 * Validates canonical slide and block schemas, checks constraints,
 * and reports developer-friendly console errors and warnings for schema drift.
 */

import {
  SUPPORTED_SLIDE_TYPES,
  normalizeSlideType,
  isSupportedSlideType
} from './slideTypes.js';

import {
  SUPPORTED_BLOCK_TYPES,
  isSupportedBlockType,
  SUPPORTED_SIMULATION_TYPES,
  isSupportedSimulationType
} from './blockTypes.js';

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
      if (typeof slide.estimatedMinutes !== 'number' || isNaN(slide.estimatedMinutes) || slide.estimatedMinutes <= 0) {
        errors.push(`${slidePrefix}: 'estimatedMinutes' must be a positive number (got ${slide.estimatedMinutes}).`);
      }
    }

    // timerMinutes check
    if (slide.timerMinutes !== undefined) {
      if (typeof slide.timerMinutes !== 'number' || isNaN(slide.timerMinutes) || slide.timerMinutes <= 0) {
        errors.push(`${slidePrefix}: 'timerMinutes' must be a positive number (got ${slide.timerMinutes}).`);
      }
    }

    // Schema drift check: look for unexpected top-level slide properties
    if (canonicalType && TYPE_ALLOWED_PROPS[canonicalType]) {
      const allowedProps = TYPE_ALLOWED_PROPS[canonicalType];
      for (const prop of Object.keys(slide)) {
        if (!COMMON_SLIDE_PROPS.has(prop) && !allowedProps.has(prop)) {
          // Detect known drift cases
          if (canonicalType === 'exit-ticket' && prop === 'prompts') {
            errors.push(`${slidePrefix}: Found deprecated property 'prompts'. Use canonical 'questions: [{ prompt, solution }]'.`);
          } else {
            warnings.push(`${slidePrefix}: Unknown or unexpected slide property '${prop}'.`);
          }
        }
      }
    }

    // Practice slide task requirement (validates canonical 'practice' and alias 'you-do')
    if (canonicalType === 'practice') {
      const hasTasks = Array.isArray(slide.tasks) && slide.tasks.length > 0;
      const hasContent = Array.isArray(slide.content) && slide.content.length > 0;
      if (!hasTasks && !hasContent) {
        errors.push(`${slidePrefix}: Practice slide must define a non-empty 'tasks' array or 'content'.`);
      } else if (Array.isArray(slide.tasks)) {
        slide.tasks.forEach((t, tIdx) => {
          if (!t.title && !t.prompt) {
            errors.push(`${slidePrefix} Task [${tIdx}]: Practice task requires at least a 'title' or 'prompt'.`);
          }
        });
      }
    }

    // Exit ticket requirement
    if (canonicalType === 'exit-ticket') {
      if (!Array.isArray(slide.questions) || slide.questions.length === 0) {
        errors.push(`${slidePrefix}: Exit ticket requires a non-empty 'questions' array.`);
      } else {
        slide.questions.forEach((q, qIdx) => {
          if (!q.prompt && !q.question) {
            errors.push(`${slidePrefix} Question [${qIdx}]: Exit ticket question requires a 'prompt' string.`);
          } else if (q.question && !q.prompt) {
            warnings.push(`${slidePrefix} Question [${qIdx}]: Found 'question' property instead of canonical 'prompt'.`);
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

      // Stem-and-leaf validation
      if (bType === 'stem-and-leaf') {
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
          block.rows.forEach((r, rIdx) => {
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
      }

      // Sector graph validation
      if (bType === 'sector-graph') {
        if (!Array.isArray(block.items) || block.items.length === 0) {
          errors.push(`${blockDesc}: Sector graph requires a non-empty 'items' array.`);
        } else {
          block.items.forEach((item, itIdx) => {
            if (!item.label) {
              errors.push(`${blockDesc} Item [${itIdx}]: Sector graph item requires a 'label' string.`);
            }
            if (item.amount === undefined && item.fraction === undefined) {
              errors.push(`${blockDesc} Item [${itIdx}]: Sector graph item requires an 'amount' or 'fraction' value.`);
            }
          });
        }
      }

      // Sector construction validation
      if (bType === 'sector-construction') {
        const items = block.categories || block.items;
        if (!Array.isArray(items) || items.length === 0) {
          errors.push(`${blockDesc}: Sector construction requires a non-empty 'categories' or 'items' array.`);
        } else {
          items.forEach((item, itIdx) => {
            if (!item.label) {
              errors.push(`${blockDesc} Item [${itIdx}]: Sector construction item requires a 'label' string.`);
            }
            if (item.amount === undefined && item.fraction === undefined && item.value === undefined && item.angle === undefined) {
              errors.push(`${blockDesc} Item [${itIdx}]: Sector construction item requires a 'value', 'amount', 'fraction', or 'angle' value.`);
            }
          });
        }
      }

      // Divided bar & Measured bar validation
      if (bType === 'divided-bar' || bType === 'measured-bar') {
        const items = block.categories || block.items;
        if (!Array.isArray(items) || items.length === 0) {
          errors.push(`${blockDesc}: ${bType} requires a non-empty 'categories' or 'items' array.`);
        } else {
          items.forEach((item, itIdx) => {
            if (!item.label) {
              errors.push(`${blockDesc} Item [${itIdx}]: ${bType} item requires a 'label' string.`);
            }
            if (item.amount === undefined && item.fraction === undefined && item.value === undefined && item.length === undefined) {
              errors.push(`${blockDesc} Item [${itIdx}]: ${bType} item requires a 'value', 'amount', 'length', or 'fraction' value.`);
            }
          });
        }
      }

      // Simulation validation
      if (bType === 'simulation') {
        if (!block.simType || typeof block.simType !== 'string' || !block.simType.trim()) {
          errors.push(`${blockDesc}: Simulation block requires a valid 'simType' string.`);
        } else if (!isSupportedSimulationType(block.simType)) {
          errors.push(
            `${slidePrefix} [${path}] (simulation): Unsupported simulation type '${block.simType}'. Supported simulation types: ${Array.from(SUPPORTED_SIMULATION_TYPES).join(', ')}.`
          );
        }
      }
    });
  });

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
