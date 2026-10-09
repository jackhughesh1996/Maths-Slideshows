/**
 * @file validator.js
 * Lightweight schema validation for lesson data models.
 * Validates canonical slide and block schemas, checks constraints,
 * and reports developer-friendly console errors and warnings for schema drift.
 */

const SUPPORTED_SLIDE_TYPES = new Set([
  'title',
  'learning',
  'do-now',
  'worked-example',
  'i-do',
  'we-do',
  'board-task',
  'comparison',
  'practice',
  'you-do',
  'exit-ticket',
  'summary',
  'notes'
]);

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
  'do-now': new Set(['questions', 'sidebarNotes']),
  'worked-example': new Set(['prompt', 'data', 'leftBlocks', 'steps']),
  'i-do': new Set(['prompt', 'data', 'leftBlocks', 'steps']),
  'we-do': new Set(['prompt', 'data', 'notes', 'workspaceContent', 'solution', 'studentAction', 'leftBlocks', 'rightBlocks', 'content']),
  'board-task': new Set(['prompt', 'data', 'notes', 'workspaceContent', 'solution', 'studentAction', 'leftBlocks', 'rightBlocks', 'content']),
  'comparison': new Set(['columns']),
  'practice': new Set(['tasks', 'content']),
  'you-do': new Set(['tasks', 'content']),
  'exit-ticket': new Set(['questions']),
  'summary': new Set(['takeaways']),
  'notes': new Set(['columns', 'content'])
};

/**
 * Recursively extracts all content blocks with structural context paths.
 * @param {Object} slide
 * @returns {Array<{ block: Object, context: string }>}
 */
function extractBlocks(slide) {
  const blocks = [];

  function collect(obj, context) {
    if (!obj || typeof obj !== 'object') return;

    if (Array.isArray(obj)) {
      obj.forEach((item, idx) => collect(item, `${context}[${idx}]`));
      return;
    }

    if (obj.type && typeof obj.type === 'string') {
      blocks.push({ block: obj, context });
    }

    const candidateKeys = [
      'content',
      'blocks',
      'extraBlocks',
      'sidebarNotes',
      'leftBlocks',
      'notes',
      'workspaceContent',
      'solution',
      'steps',
      'columns',
      'tasks',
      'questions'
    ];

    for (const key of candidateKeys) {
      if (key in obj) {
        collect(obj[key], `${context}.${key}`);
      }
    }
  }

  collect(slide, 'slide');
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

    const type = slide.type;
    const slidePrefix = prefix(sIdx, type || 'untyped');

    // Supported slide type
    if (!type || typeof type !== 'string') {
      errors.push(`${slidePrefix}: Missing required 'type' property.`);
    } else if (!SUPPORTED_SLIDE_TYPES.has(type)) {
      errors.push(`${slidePrefix}: Unsupported slide type '${type}'. Supported types: ${Array.from(SUPPORTED_SLIDE_TYPES).join(', ')}.`);
    }

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
    if (type && TYPE_ALLOWED_PROPS[type]) {
      const allowedProps = TYPE_ALLOWED_PROPS[type];
      for (const prop of Object.keys(slide)) {
        if (!COMMON_SLIDE_PROPS.has(prop) && !allowedProps.has(prop)) {
          // Detect known drift cases
          if (type === 'exit-ticket' && prop === 'prompts') {
            errors.push(`${slidePrefix}: Found deprecated property 'prompts'. Use canonical 'questions: [{ prompt, solution }]'.`);
          } else {
            warnings.push(`${slidePrefix}: Unknown or unexpected slide property '${prop}'.`);
          }
        }
      }
    }

    // Practice slide task requirement
    if (type === 'practice' || type === 'you-do') {
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
    if (type === 'exit-ticket') {
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
    blocksWithCtx.forEach(({ block, context }) => {
      const bType = block.type;
      const blockDesc = `${slidePrefix} [${context}] (${bType})`;

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
