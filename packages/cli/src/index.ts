/**
 * DPML CLI Module
 *
 * This module provides the DPML Command Line Interface functionality.
 * External users should only import from this file.
 */

// Export public API
export { execute } from './api/cli';

// Export public types
export type { CommandAdapter } from './types/CommandAdapter';
export type { DomainDiscoverer } from './types/DomainDiscoverer';
export type { DomainExecutor } from './types/DomainExecutor';
export type { DomainInfo } from './types/DomainInfo';
export { DPMLError, DPMLErrorType } from './types/DPMLError';
