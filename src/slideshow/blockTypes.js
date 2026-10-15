/**
 * @file blockTypes.js
 * Dependency-free shared definitions of supported block types, simulation types, and aliases.
 * Used by validator and renderer dispatch without importing browser-dependent code.
 */

/**
 * List of canonical block type names supported by the slideshow renderer.
 */
export const CANONICAL_BLOCK_TYPES = Object.freeze([
  'heading',
  'paragraph',
  'bullet-list',
  'ordered-list',
  'note-box',
  'raw-data',
  'formula',
  'table',
  'stem-and-leaf',
  'sector-graph',
  'sector-construction',
  'measured-bar',
  'board-workspace',
  'solution',
  'simulation'
]);

/**
 * Mapping of block type aliases to canonical names.
 * 'divided-bar' is an alias for 'measured-bar'
 */
export const BLOCK_TYPE_ALIASES = Object.freeze({
  'divided-bar': 'measured-bar'
});

/**
 * Set of all supported block types (canonical types and aliases).
 */
export const SUPPORTED_BLOCK_TYPES = Object.freeze(
  new Set([
    ...CANONICAL_BLOCK_TYPES,
    ...Object.keys(BLOCK_TYPE_ALIASES)
  ])
);

/**
 * Normalise a block type identifier to its canonical name.
 * @param {string|Object} blockOrType
 * @returns {string}
 */
export function normalizeBlockType(blockOrType) {
  const type = typeof blockOrType === 'object' && blockOrType !== null
    ? blockOrType.type
    : blockOrType;
  if (typeof type !== 'string') return '';
  const trimmed = type.trim();
  return BLOCK_TYPE_ALIASES[trimmed] || trimmed;
}

/**
 * Check if a block type is supported.
 * @param {string|Object} blockOrType
 * @returns {boolean}
 */
export function isSupportedBlockType(blockOrType) {
  const type = typeof blockOrType === 'object' && blockOrType !== null
    ? blockOrType.type
    : blockOrType;
  if (typeof type !== 'string') return false;
  return SUPPORTED_BLOCK_TYPES.has(type.trim());
}

/**
 * List of canonical simulation types supported by the simulation widgets.
 */
export const CANONICAL_SIMULATION_TYPES = Object.freeze([
  'spinner',
  'counter-bag',
  'pen-draw',
  'coin-class',
  'coin-summary',
  'coin-cumulative',
  'basketball'
]);

/**
 * Mapping of simulation type aliases to canonical names.
 * 'spinners' -> 'spinner'
 * 'bag-draw' -> 'counter-bag'
 * 'box-draw' -> 'pen-draw'
 */
export const SIMULATION_TYPE_ALIASES = Object.freeze({
  'spinners': 'spinner',
  'bag-draw': 'counter-bag',
  'box-draw': 'pen-draw'
});

/**
 * Set of all supported simulation types (canonical types and aliases).
 */
export const SUPPORTED_SIMULATION_TYPES = Object.freeze(
  new Set([
    ...CANONICAL_SIMULATION_TYPES,
    ...Object.keys(SIMULATION_TYPE_ALIASES)
  ])
);

/**
 * Normalise a simulation type identifier to its canonical name.
 * @param {string|Object} simOrType
 * @returns {string}
 */
export function normalizeSimulationType(simOrType) {
  const type = typeof simOrType === 'object' && simOrType !== null
    ? simOrType.simType
    : simOrType;
  if (typeof type !== 'string') return '';
  const trimmed = type.trim();
  return SIMULATION_TYPE_ALIASES[trimmed] || trimmed;
}

/**
 * Check if a simulation type is supported.
 * @param {string|Object} simOrType
 * @returns {boolean}
 */
export function isSupportedSimulationType(simOrType) {
  const type = typeof simOrType === 'object' && simOrType !== null
    ? simOrType.simType
    : simOrType;
  if (typeof type !== 'string') return false;
  return SUPPORTED_SIMULATION_TYPES.has(type.trim());
}

export default {
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
};
