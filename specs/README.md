# DPML Protocol Specifications

This directory contains the authoritative source of DPML protocol specifications.

## Directory Structure

```
specs/
├── v1.0/                              # DPML Protocol v1.0 (Current)
│   ├── dpml-protocol-v1.md            # English specification
│   └── dpml-protocol-v1.zh-CN.md      # Chinese specification
├── drafts/                            # Draft specifications (work in progress)
│   └── ...
└── README.md                          # This file
```

## Version Management

- **v1.0/**: Current stable version
- **drafts/**: Drafts for future versions (v1.1, v2.0, etc.)

Each version directory contains:

- English specification (`dpml-protocol-v{version}.md`)
- Chinese specification (`dpml-protocol-v{version}.zh-CN.md`)

## Editing Specifications

### Single Source of Truth

The files in `specs/` are the **authoritative source**. The website documentation is automatically synced from here.

### Workflow

1. Edit specifications in `specs/v1.0/`
2. Run sync script (automatic on dev/build):
   ```bash
   cd apps/website
   pnpm sync:specs
   ```
3. View changes on website:
   ```bash
   pnpm dev
   ```

### Automatic Sync

The sync script (`apps/website/scripts/sync-specs.js`) runs automatically:

- `pnpm dev` - Syncs before starting dev server
- `pnpm build` - Syncs before building

### Manual Sync

To manually sync specifications:

```bash
cd apps/website
pnpm sync:specs
```

## Publishing New Versions

When publishing a new version (e.g., v1.1):

1. Create new version directory:

   ```bash
   mkdir specs/v1.1
   ```

2. Copy or create new specification files:

   ```bash
   cp specs/v1.0/dpml-protocol-v1.md specs/v1.1/dpml-protocol-v1.1.md
   cp specs/v1.0/dpml-protocol-v1.zh-CN.md specs/v1.1/dpml-protocol-v1.1.zh-CN.md
   ```

3. Update sync script to point to new version

4. Update specification metadata (status, date, version number)

## Specification Format

All specifications follow RFC-style format:

- **Status**: Draft | Proposed Standard | Standard
- **Date**: Publication date
- **Authors**: Author list with affiliations
- **Table of Contents**: Hierarchical structure
- **Sections**: Numbered sections (1, 1.1, 1.2, etc.)
- **References**: Normative and informative references
- **Appendices**: Examples, grammar, etc.

## License

Specifications are released under the MIT License.

---

**Maintained by**: Deepractice.ai
**Contact**: sean@deepractice.ai
