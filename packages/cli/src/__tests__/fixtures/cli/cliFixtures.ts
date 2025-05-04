/**
 * CLI Test Fixtures
 *
 * Contains test fixtures for CLI tests.
 */

/**
 * Create standard command arguments fixture
 *
 * @returns Command arguments fixture
 */
export function createCommandArgsFixture() {
  return {
    list: ['--list'],
    version: ['--version'],
    help: ['--help'],
    domain: ['core', 'validate', 'file.xml'],
    unknownDomain: ['unknown-domain', 'command'],
    invalidArgs: ['--invalid-option']
  };
}

/**
 * Create domain info fixture
 *
 * @returns Domain info fixture
 */
export function createDomainInfoFixture() {
  return {
    core: {
      name: 'core',
      packageName: '@dpml/core',
      source: 'npx',
      version: '1.0.0'
    },
    agent: {
      name: 'agent',
      packageName: '@dpml/agent',
      source: 'npx',
      version: '1.0.0'
    },
    example: {
      name: 'example',
      packageName: '@dpml/example',
      source: 'npx',
      version: '1.0.0'
    },
    custom: {
      name: 'custom',
      packageName: '@dpml/custom',
      source: 'npx',
      version: '0.1.0'
    }
  };
}

/**
 * Create expected output fixture
 *
 * @returns Expected output fixture
 */
export function createExpectedOutputFixture() {
  return {
    listOutput: `Available DPML domains:

  core (1.0.0)
  agent (1.0.0)
  example (1.0.0)`,

    versionOutput: '1.0.0',

    helpOutput: `Usage: dpml [options] <domain> [args...]

DPML (Deepractice Prompt Markup Language) Command Line Tool

Options:
  -v, --version  Display Version
  -l, --list     List all available DPML domains
  -h, --help     display help for command

Example:
  dpml --list     or  dpml -l         List all available domains
  dpml -v         or  dpml --version  Display Version Information
  dpml -h         or  dpml --help     Display Help Information
  dpml core validate file.xml         Validate DPML Document
  dpml agent chat config.xml          Interact with Agent

For more information, please visit: https://github.com/Deepractice/dpml`
  };
}
