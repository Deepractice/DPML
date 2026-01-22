# dpml

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

### Patch Changes

- Updated dependencies [2a07834]
  - @dpml/core@0.2.0
