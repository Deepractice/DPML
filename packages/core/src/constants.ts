/**
 * Constants for the DPML language
 */

/**
 * Current DPML version
 */
export const CURRENT_VERSION = '1.0';

/**
 * Default parsing mode
 */
export const DEFAULT_PARSING_MODE = 'loose';

/**
 * Default reference mode
 */
export const DEFAULT_REF_MODE = 'extend';

/**
 * Extension attribute prefix
 */
export const EXTENSION_PREFIX = 'x-';

/**
 * Reference symbol
 */
export const REFERENCE_SYMBOL = '@';

/**
 * Fragment symbol for references
 */
export const FRAGMENT_SYMBOL = '#';

/**
 * Support URI protocols
 */
export const SUPPORTED_PROTOCOLS = [
  'http',
  'https',
  'file',
  'data'
];

/**
 * Core tag names
 * (These are just examples and not part of the specification itself)
 */
export const CORE_TAGS = {
  ROOT: 'prompt',
  ROLE: 'role',
  THINKING: 'thinking',
  EXECUTING: 'executing',
  TASK: 'task',
  REFERENCE: 'reference'
}; 