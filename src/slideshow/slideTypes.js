/**
 * @file slideTypes.js
 * Dependency-free shared definitions of supported slide types and canonical names.
 */

/**
 * List of canonical slide type names supported by the slideshow engine.
 */
export const CANONICAL_SLIDE_TYPES = Object.freeze([
  'title',
  'learning',
  'do-now',
  'worked-example',
  'we-do',
  'board-task',
  'comparison',
  'practice',
  'exit-ticket',
  'summary',
  'notes'
]);

/**
 * Mapping of slide type aliases to their canonical names.
 * 'i-do' aliases 'worked-example'
 * 'you-do' aliases 'practice'
 */
export const SLIDE_TYPE_ALIASES = Object.freeze({
  'i-do': 'worked-example',
  'you-do': 'practice'
});

/**
 * Set of all accepted slide type identifiers (canonical names and accepted aliases).
 */
export const SUPPORTED_SLIDE_TYPES = Object.freeze(
  new Set([
    ...CANONICAL_SLIDE_TYPES,
    ...Object.keys(SLIDE_TYPE_ALIASES)
  ])
);

/**
 * Normalise a slide type identifier to its canonical name without mutating the input object.
 * Returns the canonical name if the type is a known alias,
 * or the trimmed string if it is already canonical or another string.
 *
 * @param {string|Object} slideOrType - Slide object or slide type string
 * @returns {string}
 */
export function normalizeSlideType(slideOrType) {
  const type = typeof slideOrType === 'object' && slideOrType !== null
    ? slideOrType.type
    : slideOrType;
  if (typeof type !== 'string') return '';
  const trimmed = type.trim();
  return SLIDE_TYPE_ALIASES[trimmed] || trimmed;
}

/**
 * Check if a slide type is supported (either canonical or a recognised alias).
 *
 * @param {string|Object} slideOrType - Slide object or slide type string
 * @returns {boolean}
 */
export function isSupportedSlideType(slideOrType) {
  const type = typeof slideOrType === 'object' && slideOrType !== null
    ? slideOrType.type
    : slideOrType;
  if (typeof type !== 'string') return false;
  return SUPPORTED_SLIDE_TYPES.has(type.trim());
}

export default {
  CANONICAL_SLIDE_TYPES,
  SLIDE_TYPE_ALIASES,
  SUPPORTED_SLIDE_TYPES,
  normalizeSlideType,
  isSupportedSlideType
};
