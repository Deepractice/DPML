/**
 * 创建测试用字符串，包含环境变量引用
 */
export function createTestString(includeExisting = true, includeNonExistent = false): string {
  let result = 'Basic text with ';

  if (includeExisting) {
    result += '@agentenv:TEST_VAR and @agentenv:API_KEY';
  }

  if (includeNonExistent) {
    result += ' and @agentenv:NON_EXISTENT_VAR';
  }

  return result;
}

/**
 * 创建测试用对象，包含环境变量引用
 */
export function createTestObject(depth = 2): Record<string, any> {
  const obj: Record<string, any> = {
    simple: '@agentenv:TEST_VAR',
    normal: 'no variables here',
    array: ['plain', '@agentenv:API_KEY', 123]
  };

  if (depth > 0) {
    obj.nested = createTestObject(depth - 1);
  }

  return obj;
}

/**
 * 创建包含多种数据类型的复杂对象
 */
export function createComplexObject(): Record<string, any> {
  return {
    string: '@agentenv:TEST_VAR',
    number: 42,
    boolean: true,
    null: null,
    undefined: undefined,
    array: [
      '@agentenv:API_KEY',
      123,
      { key: '@agentenv:SERVER_URL' }
    ],
    nested: {
      level1: {
        level2: {
          deep: '@agentenv:USERNAME'
        }
      },
      sibling: '@agentenv:PASSWORD'
    },
    mixed: 'Start @agentenv:TEST_VAR middle @agentenv:API_KEY end'
  };
}
