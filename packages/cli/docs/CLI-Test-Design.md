# DPML CLI Module Test Case Design

This document follows the [Testing Strategy Rules](../../../rules/architecture/testing-strategy.md) and [Testing Case Design Rules](../../../rules/architecture/test-case-design.md) to design test cases for the DPML CLI module.

## 1. Test Scope

This test plan covers the core functionality of the CLI module, including:
- API layer and Types layer contract stability
- Command processing and execution flow
- Domain discovery mechanisms 
- Domain execution processes
- Error handling and reporting
- Complete end-to-end flow from command-line input to domain command execution
- Key dependencies handling (read-package-up, execa)

## 2. Test Types and Goals

- **Contract Tests**: Ensure API and type definition stability, prevent accidental breaking changes
- **Unit Tests**: Verify independent functionality of components, especially the core components
- **Integration Tests**: Verify how CLI components work together, ensuring correct command flow
- **End-to-End Tests**: Verify complete workflow from user command to final execution

## 3. Test Case Details

### 3.1 Contract Tests (Contract Tests)

#### File: `packages/cli/src/__tests__/contract/api/cli.contract.test.ts`

| ID | Test Case Name | Test Purpose | Test Input | Expected Result | Mock Situation |
|:---|:---------------|:-------------|:-----------|:----------------|:---------------|
| CT-API-CLI-01 | `execute` API should maintain type signature | Verify API contract stability | Type check | Function signature matching public documentation | No mocking needed |
| CT-API-CLI-02 | `execute` API should handle args parameter correctly | Verify parameter contract | Valid args array | Function accepts args array | Mock cliService.execute to verify args passing |

#### File: `packages/cli/src/__tests__/contract/types/CommandAdapter.contract.test.ts`

| ID | Test Case Name | Test Purpose | Test Input | Expected Result | Mock Situation |
|:---|:---------------|:-------------|:-----------|:----------------|:---------------|
| CT-TYPE-CMDADP-01 | CommandAdapter interface should maintain structural stability | Verify type structure contract | Type check | Interface contains parseAndExecute and getVersion methods | No mocking needed |
| CT-TYPE-CMDADP-02 | CommandAdapter methods should maintain signature stability | Verify method signature contract | Type check | Method signatures match documentation | No mocking needed |

#### File: `packages/cli/src/__tests__/contract/types/DomainDiscoverer.contract.test.ts`

| ID | Test Case Name | Test Purpose | Test Input | Expected Result | Mock Situation |
|:---|:---------------|:-------------|:-----------|:----------------|:---------------|
| CT-TYPE-DSCVR-01 | DomainDiscoverer interface should maintain structural stability | Verify type structure contract | Type check | Interface contains tryFindDomain, listDomains, and getName methods | No mocking needed |
| CT-TYPE-DSCVR-02 | DomainDiscoverer.tryFindDomain should return Promise<DomainInfo\|null> | Verify return type contract | Type check | Method returns Promise<DomainInfo\|null> | No mocking needed |

#### File: `packages/cli/src/__tests__/contract/types/DomainExecutor.contract.test.ts`

| ID | Test Case Name | Test Purpose | Test Input | Expected Result | Mock Situation |
|:---|:---------------|:-------------|:-----------|:----------------|:---------------|
| CT-TYPE-DEXEC-01 | DomainExecutor interface should maintain structural stability | Verify type structure contract | Type check | Interface contains getDomainInfo and execute methods | No mocking needed |
| CT-TYPE-DEXEC-02 | DomainExecutor.execute should handle args parameter correctly | Verify parameter contract | Type check | Method accepts string[] argument | No mocking needed |

#### File: `packages/cli/src/__tests__/contract/types/DomainInfo.contract.test.ts`

| ID | Test Case Name | Test Purpose | Test Input | Expected Result | Mock Situation |
|:---|:---------------|:-------------|:-----------|:----------------|:---------------|
| CT-TYPE-DINFO-01 | DomainInfo interface should maintain structural stability | Verify type structure contract | Type check | Interface contains name, packageName, source and optional version fields | No mocking needed |
| CT-TYPE-DINFO-02 | DomainInfo.version should be optional | Verify optionality | Type check | Creating DomainInfo with omitted version field should compile | No mocking needed |

#### File: `packages/cli/src/__tests__/contract/types/DPMLError.contract.test.ts`

| ID | Test Case Name | Test Purpose | Test Input | Expected Result | Mock Situation |
|:---|:---------------|:-------------|:-----------|:----------------|:---------------|
| CT-TYPE-ERROR-01 | DPMLError class should maintain structural stability | Verify class structure contract | Type check | Class extends Error and contains type, code, and cause properties | No mocking needed |
| CT-TYPE-ERROR-02 | DPMLErrorType enum should maintain value stability | Verify enum value contract | Type check | Enum contains expected values (COMMAND, DISCOVERY, EXECUTION, CONFIG, UNKNOWN) | No mocking needed |

### 3.2 Unit Tests (Unit Tests)

#### File: `packages/cli/src/__tests__/unit/core/cliService.test.ts`

* **Test Object**: cliService module (`core/cliService.ts`)
* **Key Methods**: `execute`, `initialize`, `handleError`
* **Test Focus**: Verify how cliService coordinates command parsing and execution

| ID | Test Case Name | Test Purpose | Test Input | Expected Result | Mock Situation |
|:---|:---------------|:-------------|:-----------|:----------------|:---------------|
| **Positive Tests** |
| UT-CLISVC-01 | execute should initialize components and execute command | Verify command execution | Valid args array | Successfully execute command | Mock initialize and commandAdapter |
| UT-CLISVC-02 | initialize should create all required components | Verify initialization | None | Return initialized components | Mock component constructors |
| **Negative Tests** |
| UT-CLISVC-NEG-01 | execute should handle errors | Verify error handling | Args causing error | Error handled by handleError | Mock commandAdapter to throw error |
| UT-CLISVC-NEG-02 | handleError should process different error types correctly | Verify error processing | Different error types | Appropriate error message displayed and process exited | Mock console.error and process.exit |

#### File: `packages/cli/src/__tests__/unit/core/adapters/CommanderAdapter.test.ts`

* **Test Object**: CommanderAdapter class (`core/adapters/CommanderAdapter.ts`)
* **Key Methods**: constructor, `parseAndExecute`, `getVersion`, `setupCommands`, `handleListOption`, `handleDomainCommand`
* **Test Focus**: Verify how CommanderAdapter parses and executes commands

| ID | Test Case Name | Test Purpose | Test Input | Expected Result | Mock Situation |
|:---|:---------------|:-------------|:-----------|:----------------|:---------------|
| **Positive Tests** |
| UT-CMDADP-01 | constructor should initialize Commander program | Verify initialization | Mock discoverer and factory | Commander program initialized and commands set up | Mock Commander constructor |
| UT-CMDADP-02 | parseAndExecute should parse arguments | Verify command parsing | Valid args array | Arguments parsed by Commander program | Mock program.parseAsync |
| UT-CMDADP-03 | getVersion should read version using read-package-up | Verify version retrieval | None | Return correct version | Mock read-package-up to return mock package.json |
| UT-CMDADP-04 | handleListOption should list domains | Verify list domains option | None | Domains listed correctly | Mock domainDiscoverer.listDomains |
| UT-CMDADP-05 | handleDomainCommand should execute domain command | Verify domain command handling | Valid domain and args | Domain command executed | Mock discoverer, factory and executor |
| **Negative Tests** |
| UT-CMDADP-NEG-01 | handleListOption should handle domain listing errors | Verify error handling | None | Error thrown with appropriate message | Mock domainDiscoverer to throw error |
| UT-CMDADP-NEG-02 | handleDomainCommand should handle domain not found | Verify domain not found handling | Unknown domain | DPMLError thrown with DOMAIN_NOT_FOUND code | Mock discoverer to return null |
| UT-CMDADP-NEG-03 | handleDomainCommand should handle execution errors | Verify execution error handling | Valid domain causing execution error | DPMLError thrown with appropriate details | Mock executor to throw error |
| UT-CMDADP-NEG-04 | getVersion should handle read-package-up errors | Verify package reading error handling | None | Default version returned or error handled gracefully | Mock read-package-up to throw error |

#### File: `packages/cli/src/__tests__/unit/core/discovery/NpxDiscoverer.test.ts`

* **Test Object**: NpxDiscoverer class (`core/discovery/NpxDiscoverer.ts`)
* **Key Methods**: `getName`, `tryFindDomain`, `listDomains`, `listOfficialDomains`, `getPackageVersion`
* **Test Focus**: Verify how NpxDiscoverer finds domains using NPX

| ID | Test Case Name | Test Purpose | Test Input | Expected Result | Mock Situation |
|:---|:---------------|:-------------|:-----------|:----------------|:---------------|
| **Positive Tests** |
| UT-NPXDISC-01 | getName should return "npx" | Verify name retrieval | None | Return "npx" | No mocking needed |
| UT-NPXDISC-02 | tryFindDomain should find official domain | Verify official domain discovery | Official domain name | Return correct DomainInfo | No mocking needed |
| UT-NPXDISC-03 | tryFindDomain should handle @dpml prefixed packages | Verify full package name handling | "@dpml/custom" | Return correct DomainInfo | No mocking needed |
| UT-NPXDISC-04 | tryFindDomain should find third-party domain | Verify third-party domain discovery | Third-party domain name | Return correct DomainInfo | Mock getPackageVersion |
| UT-NPXDISC-05 | listDomains should return official domains | Verify domain listing | None | Return array of official domains | Mock listOfficialDomains |
| UT-NPXDISC-06 | getPackageVersion should use execa to check npm version | Verify version retrieval | Valid package name | Return version string | Mock execa |
| **Negative Tests** |
| UT-NPXDISC-NEG-01 | tryFindDomain should return null for unknown domain | Verify unknown domain handling | Unknown domain | Return null | Mock getPackageVersion to return null |
| UT-NPXDISC-NEG-02 | getPackageVersion should handle execa errors | Verify npm error handling | Invalid package | Return null | Mock execa to throw error |
| UT-NPXDISC-NEG-03 | getPackageVersion should handle malformed npm output | Verify bad output handling | Valid package with unusual output | Handle unexpected format | Mock execa to return strange output |

#### File: `packages/cli/src/__tests__/unit/core/execution/ExecutorFactory.test.ts`

* **Test Object**: ExecutorFactory class (`core/execution/ExecutorFactory.ts`)
* **Key Methods**: `createExecutor`
* **Test Focus**: Verify how ExecutorFactory creates appropriate executors

| ID | Test Case Name | Test Purpose | Test Input | Expected Result | Mock Situation |
|:---|:---------------|:-------------|:-----------|:----------------|:---------------|
| **Positive Tests** |
| UT-EXECFACT-01 | createExecutor should create NpxExecutor for npx source | Verify executor creation | DomainInfo with source "npx" | Return NpxExecutor instance | Mock NpxExecutor constructor |
| **Negative Tests** |
| UT-EXECFACT-NEG-01 | createExecutor should throw for unsupported source | Verify unsupported source handling | DomainInfo with unknown source | Throw DPMLError with UNSUPPORTED_DOMAIN_SOURCE code | No mocking needed |

#### File: `packages/cli/src/__tests__/unit/core/execution/NpxExecutor.test.ts`

* **Test Object**: NpxExecutor class (`core/execution/NpxExecutor.ts`)
* **Key Methods**: constructor, `getDomainInfo`, `execute`
* **Test Focus**: Verify how NpxExecutor executes domain commands using NPX

| ID | Test Case Name | Test Purpose | Test Input | Expected Result | Mock Situation |
|:---|:---------------|:-------------|:-----------|:----------------|:---------------|
| **Positive Tests** |
| UT-NPXEXEC-01 | constructor should store domain info | Verify initialization | Valid DomainInfo | DomainInfo stored correctly | No mocking needed |
| UT-NPXEXEC-02 | getDomainInfo should return domain info | Verify info retrieval | None | Return stored DomainInfo | No mocking needed |
| UT-NPXEXEC-03 | execute should use execa to spawn NPX process correctly | Verify command execution | Command args array | Process spawned with correct parameters | Mock execa |
| **Negative Tests** |
| UT-NPXEXEC-NEG-01 | execute should handle execa process exit with non-zero code | Verify exit code handling | Args triggering non-zero exit | DPMLError thrown with EXECUTION_FAILED code | Mock execa to exit with non-zero code |
| UT-NPXEXEC-NEG-02 | execute should handle execa error events | Verify error event handling | Args triggering error event | DPMLError thrown with EXECUTION_ERROR code | Mock execa to throw error |

### 3.3 Integration Tests (Integration Tests)

#### File: `packages/cli/src/__tests__/integration/core/commandFlow.integration.test.ts`

* **Test Object**: Command processing flow (`api/cli.ts` and `core/cliService.ts` with CommandAdapter)
* **Test Focus**: Verify how commands flow through the system from API to execution

| ID | Test Case Name | Test Purpose | Test Input | Expected Result | Mock Situation |
|:---|:---------------|:-------------|:-----------|:----------------|:---------------|
| IT-CMDFLOW-01 | CLI should process --list option correctly | Verify list option flow | ["--list"] | domains listed correctly | Mock DomainDiscoverer and console.log |
| IT-CMDFLOW-02 | CLI should process domain command correctly | Verify domain command flow | ["domain", "command"] | Domain command executed correctly | Mock DomainDiscoverer, ExecutorFactory and NpxExecutor |
| IT-CMDFLOW-03 | CLI should handle version option correctly | Verify version option | ["--version"] | Version displayed correctly | Mock CommandAdapter.getVersion and console.log |
| IT-CMDFLOW-04 | CLI should handle help option correctly | Verify help option | ["--help"] | Help information displayed correctly | Mock Commander help display |
| IT-CMDFLOW-05 | CLI should handle unknown domain correctly | Verify unknown domain | ["unknown", "command"] | Error handled correctly | Mock DomainDiscoverer to return null for unknown domain |

#### File: `packages/cli/src/__tests__/integration/core/discovery/domainResolution.integration.test.ts`

* **Test Object**: Domain discovery process (NpxDiscoverer with ExecutorFactory)
* **Test Focus**: Verify how domains are discovered and executors are created

| ID | Test Case Name | Test Purpose | Test Input | Expected Result | Mock Situation |
|:---|:---------------|:-------------|:-----------|:----------------|:---------------|
| IT-DOMAINDSCV-01 | System should resolve and create executor for official domain | Verify official domain resolution | "core" | NpxExecutor created with correct configuration | Minimal mocking |
| IT-DOMAINDSCV-02 | System should resolve and create executor for third-party domain | Verify third-party domain resolution | "custom" | NpxExecutor created with correct configuration | Mock npm version check |
| IT-DOMAINDSCV-03 | System should handle unknown domain | Verify unknown domain handling | "unknown" | Error thrown with appropriate details | No mocking needed |

### 3.4 End-to-End Tests (End-to-End Tests)

#### File: `packages/cli/src/__tests__/e2e/cli/cliExecution.e2e.test.ts`

* **Test Object**: Complete CLI execution (using actual process execution)
* **Test Focus**: Verify real CLI behavior with minimal mocking

| ID | Test Case Name | Test Purpose | Test Input | Expected Result | Mock Situation |
|:---|:---------------|:-------------|:-----------|:----------------|:---------------|
| E2E-CLI-01 | CLI should execute --list option in real environment | Verify --list option in real scenario | dpml --list | List of domains in stdout | No mocking, use CLI runner |
| E2E-CLI-02 | CLI should execute --version option in real environment | Verify --version option in real scenario | dpml --version | Version string in stdout | No mocking, use CLI runner |
| E2E-CLI-03 | CLI should execute --help option in real environment | Verify --help option in real scenario | dpml --help | Help text in stdout | No mocking, use CLI runner |
| E2E-CLI-04 | CLI should handle domain command in real environment | Verify domain command in real scenario | dpml core --help | Core domain help text in stdout | Minimal mocking if needed |
| E2E-CLI-05 | CLI should handle unknown domain in real environment | Verify unknown domain in real scenario | dpml unknown command | Error message in stderr and non-zero exit code | No mocking, use CLI runner |

## 4. Test Fixture Design

To support the test cases above, the following test fixtures should be created:

```typescript
// packages/cli/src/__tests__/fixtures/cli/cliFixtures.ts

// Create standard command arguments fixture
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

// Create domain info fixture
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

// Create expected output fixture
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

// Create CLI process runner fixture (helper to run CLI as a child process)
export function createCliProcessRunnerFixture() {
  // This is a simplified version - actual implementation should use child_process or execa
  return {
    async runCli(args: string[]): Promise<{stdout: string, stderr: string, exitCode: number}> {
      try {
        // In a real implementation, this would spawn a child process
        // Here we'll just invoke the CLI directly for simplicity
        let stdout = '';
        let stderr = '';
        let exitCode = 0;
        
        // Mock console.log and console.error to capture output
        const originalConsoleLog = console.log;
        const originalConsoleError = console.error;
        console.log = (...messages) => { stdout += messages.join(' ') + '\n'; };
        console.error = (...messages) => { stderr += messages.join(' ') + '\n'; };
        
        try {
          // Execute CLI with args (simplified)
          await execute(args);
        } catch (error) {
          exitCode = 1;
          stderr += String(error) + '\n';
        } finally {
          // Restore console methods
          console.log = originalConsoleLog;
          console.error = originalConsoleError;
        }
        
        return { stdout, stderr, exitCode };
      } catch (error) {
        return {
          stdout: '',
          stderr: String(error),
          exitCode: 1
        };
      }
    }
  };
}
```

### 4.1 CLI Process Runner Implementation

For E2E tests, a more robust CLI process runner is needed. Below is a more realistic implementation based on the provided example:

```typescript
// packages/cli/src/__tests__/helpers/cli-process-runner.ts
import path from 'path';
import { execa } from 'execa';

/**
 * Run CLI command as a child process
 *
 * @param args Command line arguments array
 * @returns Object containing stdout, stderr and exit code
 */
export async function runCLIProcess(args: string[] = []): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number;
}> {
  // Find CLI entry script in dist directory
  const binPath = path.resolve(process.cwd(), 'dist/bin.js');

  // Check if debug mode
  const isDebug = args.includes('--debug');

  if (isDebug) {
    console.log(`[DEBUG] Executing command: node ${binPath} ${args.join(' ')}`);
  }

  try {
    // Execute command
    const result = await execa('node', [binPath, ...args], {
      reject: false,  // Don't throw exception even if command fails
      env: {
        ...process.env,
        NODE_ENV: 'test',
        DEBUG: isDebug ? 'true' : undefined
      },
      all: true  // Capture stdout and stderr to the same stream
    });

    if (isDebug) {
      console.log('[DEBUG] Command execution result:');
      console.log('[DEBUG] stdout:', result.stdout);
      console.log('[DEBUG] stderr:', result.stderr);
      console.log('[DEBUG] exitCode:', result.exitCode);
      console.log('[DEBUG] all:', result.all);
    }

    // Ensure we capture all error output
    let enhancedStderr = result.stderr || '';

    // If 'all' contains error info but stderr doesn't, add to stderr
    if (result.all && !enhancedStderr.includes('Domain not found') &&
        result.all.includes('Domain not found')) {
      enhancedStderr += '\n' + result.all;
    }

    return {
      stdout: result.stdout || '',
      stderr: enhancedStderr,
      exitCode: result.exitCode || 1
    };
  } catch (error: unknown) {
    // Handle execution errors
    const errorMessage = error instanceof Error ? error.message : 'Execution error';

    if (isDebug) {
      console.error('[DEBUG] Error executing command:', errorMessage);
    }

    return {
      stdout: '',
      stderr: errorMessage,
      exitCode: 1
    };
  }
}

/**
 * Create a test config file
 *
 * @param content File content
 * @param fileName File name
 * @returns Created file path
 */
export async function createTestConfigFile(content: string, fileName: string): Promise<string> {
  const fs = await import('fs/promises');
  const os = await import('os');
  const path = await import('path');

  const tempDir = path.join(os.tmpdir(), 'dpml-tests', Date.now().toString());

  await fs.mkdir(tempDir, { recursive: true });

  const filePath = path.join(tempDir, fileName);

  await fs.writeFile(filePath, content);

  return filePath;
}

/**
 * Clean up test file
 *
 * @param filePath File path
 */
export async function cleanupTestFile(filePath: string): Promise<void> {
  const fs = await import('fs/promises');

  try {
    await fs.unlink(filePath);
    // Try to remove temp directory
    const path = await import('path');
    const dirPath = path.dirname(filePath);

    await fs.rmdir(dirPath, { recursive: true });
  } catch (error: unknown) {
    // Ignore deletion errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.warn(`Failed to clean up test file: ${errorMessage}`);
  }
}
```

## 5. Test Implementation Examples

```typescript
// packages/cli/src/__tests__/unit/core/cliService.test.ts
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { cliService } from '../../../src/core/cliService';
import { DPMLError } from '../../../src/types/DPMLError';
import { createCommandArgsFixture } from '../../fixtures/cli/cliFixtures';

// Mock dependencies
vi.mock('../../../src/core/adapters/CommanderAdapter', () => ({
  CommanderAdapter: vi.fn().mockImplementation(() => ({
    parseAndExecute: vi.fn().mockResolvedValue(undefined),
    getVersion: vi.fn().mockReturnValue('1.0.0')
  }))
}));

vi.mock('../../../src/core/discovery/NpxDiscoverer', () => ({
  NpxDiscoverer: vi.fn().mockImplementation(() => ({
    getName: vi.fn().mockReturnValue('npx'),
    tryFindDomain: vi.fn().mockResolvedValue(null),
    listDomains: vi.fn().mockResolvedValue([])
  }))
}));

vi.mock('../../../src/core/execution/ExecutorFactory', () => ({
  ExecutorFactory: vi.fn().mockImplementation(() => ({
    createExecutor: vi.fn().mockReturnValue({
      getDomainInfo: vi.fn(),
      execute: vi.fn().mockResolvedValue(undefined)
    })
  }))
}));

// Mock console.error and process.exit for error handling tests
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
const mockProcessExit = vi.spyOn(process, 'exit').mockImplementation((code) => { throw new Error(`Exit with code ${code}`); }) as unknown as typeof process.exit;

describe('UT-CLISVC', () => {
  const commandArgs = createCommandArgsFixture();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('execute should initialize components and execute command', async () => {
    // Setup
    const initializeSpy = vi.spyOn(cliService, 'initialize');
    
    // Execute
    await cliService.execute(commandArgs.list);
    
    // Assert
    expect(initializeSpy).toHaveBeenCalled();
    // Additional assertions for command execution would go here
  });
  
  test('handleError should process DPML errors correctly', () => {
    // Setup
    const error = new DPMLError('Test error', 'COMMAND', 'TEST_ERROR');
    
    // Execute & Assert
    expect(() => cliService.handleError(error)).toThrow('Exit with code 1');
    expect(mockConsoleError).toHaveBeenCalledWith('Error: Test error');
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });
  
  test('handleError should convert unknown errors to DPML errors', () => {
    // Setup
    const error = new Error('Unknown error');
    
    // Execute & Assert
    expect(() => cliService.handleError(error)).toThrow('Exit with code 1');
    expect(mockConsoleError).toHaveBeenCalledWith('Unknown Error: Unknown error');
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });
});

// packages/cli/src/__tests__/e2e/cli/cliExecution.e2e.test.ts
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { runCLIProcess, createTestConfigFile, cleanupTestFile } from '../../helpers/cli-process-runner';
import { createExpectedOutputFixture } from '../../fixtures/cli/cliFixtures';

describe('E2E-CLI', () => {
  const expectedOutput = createExpectedOutputFixture();
  let testFilePath: string;
  
  beforeAll(async () => {
    // Create a test XML file for domain commands
    testFilePath = await createTestConfigFile('<test></test>', 'test-config.xml');
  });
  
  afterAll(async () => {
    // Clean up test files
    await cleanupTestFile(testFilePath);
  });
  
  test('CLI should execute --list option in real environment', async () => {
    // Execute
    const result = await runCLIProcess(['--list']);
    
    // Assert
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Available DPML domains');
    // Specific domains may vary in test environment, so just check for the header
  });
  
  test('CLI should execute --version option in real environment', async () => {
    // Execute
    const result = await runCLIProcess(['--version']);
    
    // Assert
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toMatch(/^\d+\.\d+\.\d+$/); // Should be a semver string
  });
  
  test('CLI should execute --help option in real environment', async () => {
    // Execute
    const result = await runCLIProcess(['--help']);
    
    // Assert
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Usage: dpml [options]');
    expect(result.stdout).toContain('--list');
    expect(result.stdout).toContain('--version');
  });
  
  test('CLI should handle unknown domain in real environment', async () => {
    // Execute
    const result = await runCLIProcess(['unknown-domain', 'command']);
    
    // Assert
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain('Domain not found');
  });
});
```

## 6. Test Coverage Goals

- **Contract Tests**: Cover all public APIs and Types, ensuring interface stability.
- **Unit Tests**: Cover core logic in all service components and classes, target 85%+ line coverage.
- **Integration Tests**: Cover main command flows and processes, target 80%+ line coverage.
- **End-to-End Tests**: Cover key user scenarios from command line to execution.

Overall test coverage target: 85% line coverage, 80% branch coverage.

## 7. Mocking Strategy

- **Contract Tests**: Primarily type checking, minimal mocking where needed.
- **Unit Tests**:
  - When testing cliService, mock CommanderAdapter, NpxDiscoverer, and ExecutorFactory.
  - When testing CommanderAdapter, mock Commander, read-package-up, DomainDiscoverer, and ExecutorFactory.
  - When testing NpxDiscoverer, mock execa for npm commands.
  - When testing ExecutorFactory, mock NpxExecutor constructor.
  - When testing NpxExecutor, mock execa.
- **Integration Tests**: Minimize mocking, focus on component interaction.
- **End-to-End Tests**: Use real process execution with minimal to no mocking.

## 8. Key Dependencies Testing

### 8.1 read-package-up

For testing components that rely on `read-package-up`:

1. **Mocking Strategy**:
   ```typescript
   vi.mock('read-package-up', () => ({
     default: vi.fn().mockResolvedValue({
       packageJson: { name: '@dpml/cli', version: '1.0.0' }
     })
   }));
   ```

2. **Edge Cases to Test**:
   - Missing package.json
   - Package.json without version field
   - read-package-up throwing errors
   - Nested project structures with multiple package.json files

3. **Test Scenarios**:
   - Verify correct version extraction
   - Verify fallback behavior when version cannot be determined
   - Test error handling for package.json access issues

### 8.2 execa

For testing components that rely on `execa`:

1. **Mocking Strategy**:
   ```typescript
   vi.mock('execa', () => ({
     execa: vi.fn().mockImplementation((command, args) => {
       // Return different results based on command and args
       if (command === 'npm' && args.includes('valid-package')) {
         return Promise.resolve({ stdout: '1.0.0', stderr: '', exitCode: 0 });
       }
       if (command === 'npm' && args.includes('invalid-package')) {
         return Promise.reject(new Error('Package not found'));
       }
       if (command === 'npx' && args.includes('failing-command')) {
         return Promise.resolve({ stdout: '', stderr: 'Error message', exitCode: 1 });
       }
       // Default success response
       return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 });
     })
   }));
   ```

2. **Edge Cases to Test**:
   - Command not found errors
   - Commands that exit with non-zero status
   - Commands that produce output on stderr but still succeed
   - Commands that time out
   - Commands that produce unexpected output formats
   - Killed processes or interrupted execution

3. **Test Scenarios**:
   - Verify correct command and arguments passed to execa
   - Test handling of successful command execution
   - Test error handling for failed commands
   - Test timeout handling
   - Verify correct stdio configuration
   - Test signal handling for process termination

## 9. Test Summary

This test design covers all core components and key functionality of the CLI module, following DPML architecture testing strategy rules. Different types of tests have been designed:

1. **Contract Tests**: Ensure API and type stability and consistency
2. **Unit Tests**: Verify individual functionality of each component
3. **Integration Tests**: Verify component coordination and command flow
4. **End-to-End Tests**: Verify complete user workflows using actual process execution

The test case design balances positive and negative tests, ensuring both normal functionality paths and error handling mechanisms are tested. Special attention is given to key dependencies like `read-package-up` for package information and `execa` for process execution, ensuring their correct usage and proper error handling.

The test fixtures provide rich configuration data and CLI input/output examples for effective testing implementation and maintenance. A specialized CLI process runner is included for end-to-end testing, enabling realistic execution validation with minimal mocking.

Through comprehensive test coverage, we ensure that the CLI module can reliably discover and execute domain commands, provide helpful information to users, and handle errors gracefully, all while maintaining a stable and well-documented API. 