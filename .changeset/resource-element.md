---
"dpml": minor
"@dpml/core": minor
---

feat: add built-in `<resource>` element for external resource references

- Add intrinsic `<resource>` element that works without schema definition
- Auto-detect protocol from `src` attribute (arp/rxl/unknown)
- Built-in resource transformer automatically extracts resources
- HTML-like tolerance: accept invalid/empty src, delegate validation to runtime
- Export ResourceInfo and ResourceResult types for TypeScript users
- Update documentation with resource element usage examples

Breaking: resourceTransformer is now auto-registered as the first transformer in the pipeline
