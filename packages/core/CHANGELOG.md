# @dpml/core

## 0.3.0

### Minor Changes

- 0d7ad30: feat: add built-in `<resource>` element for external resource references
  - Add intrinsic `<resource>` element that works without schema definition
  - Auto-detect protocol from `src` attribute (arp/rxl/unknown)
  - Built-in resource transformer automatically extracts resources
  - HTML-like tolerance: accept invalid/empty src, delegate validation to runtime
  - Export ResourceInfo and ResourceResult types for TypeScript users
  - Update documentation with resource element usage examples

  Breaking: resourceTransformer is now auto-registered as the first transformer in the pipeline

## 0.2.0

### Minor Changes

- 2a07834: Major architecture refactor: migrate to Bun and simplify to pure language library

  **Breaking Changes:**
  - Removed CLI functionality (agent, cli packages deleted)
  - Removed framework/domain compiler system
  - Removed logging system (use commonxjs/logger instead)

  **New Architecture:**
  - `dpml` - Public API package with `createDPML`, `defineSchema`, `defineTransformer`
  - `@dpml/core` - Internal core library for parsing, validation, transformation

  **New Features:**
  - BDD test suite with Cucumber.js (37 scenarios, 154 steps)
  - Simplified API: `createDPML({ schema, transformers })`
  - Full TypeScript support with ESM-only builds

  **Infrastructure:**
  - Migrated from PNPM to Bun
  - Added GitHub Actions CI/CD workflows
  - Configured changesets for versioning
