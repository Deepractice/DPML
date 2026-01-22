# Changesets

This project uses [changesets](https://github.com/changesets/changesets) for version management.

## Adding a Changeset

When you make changes that should be released, run:

```bash
bunx changeset
```

This will prompt you to:
1. Select which packages have changed
2. Choose the version bump type (major/minor/patch)
3. Write a summary of the changes

## Version Bump Guide

- **patch**: Bug fixes, documentation updates, internal refactoring
- **minor**: New features that are backward compatible
- **major**: Breaking changes

## Publishing

Publishing is automated via GitHub Actions. When changesets are merged to main:
1. A "Version Packages" PR is created
2. Merging that PR publishes to npm
