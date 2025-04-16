/**
 * Result类型和错误处理示例
 * 
 * 这个示例演示了@dpml/common/types中的Result类型和错误处理机制的使用方法。
 */

import { 
  Result, 
  success, 
  failure, 
  DPMLError,
  DPMLErrorCode, 
  createDPMLError 
} from '../../src/types';

// ============= Result类型示例 =============

console.log('===== Result类型示例 =====');

// 创建成功结果
function divide(a: number, b: number): Result<number, Error> {
  if (b === 0) {
    return failure(new Error('除数不能为零'));
  }
  return success(a / b);
}

// 使用Result
console.log('除法操作:');

const result1 = divide(10, 2);
if (result1.success) {
  console.log(`  10 / 2 = ${result1.value}`);
} else {
  console.log(`  错误: ${result1.error.message}`);
}

const result2 = divide(10, 0);
if (result2.success) {
  console.log(`  10 / 0 = ${result2.value}`);
} else {
  console.log(`  错误: ${result2.error.message}`);
}

// Result链式操作
console.log('\nResult链式操作:');

function square(x: number): Result<number, Error> {
  return success(x * x);
}

// 使用map和flatMap
const chainResult = divide(10, 2)
  .map(value => value + 5)       // 5 + 5 = 10
  .flatMap(value => square(value)); // 10² = 100

if (chainResult.success) {
  console.log(`  结果: ${chainResult.value}`);
} else {
  console.log(`  错误: ${chainResult.error.message}`);
}

// ============= 错误处理示例 =============

console.log('\n\n===== 错误处理示例 =====');

// 创建标准DPML错误
const fileError = createDPMLError(
  '无法读取文件',
  DPMLErrorCode.FILE_NOT_FOUND,
  { path: '/path/to/file.txt' }
);

console.log('DPML标准错误:');
console.log(`  消息: ${fileError.message}`);
console.log(`  代码: ${fileError.code}`);
console.log(`  详情: ${JSON.stringify(fileError.details)}`);

// 错误类型检查
console.log('\n错误类型检查:');

function processError(err: Error): string {
  if (err instanceof DPMLError) {
    return `DPML错误: ${err.code} - ${err.message}`;
  } else {
    return `一般错误: ${err.message}`;
  }
}

console.log(`  ${processError(fileError)}`);
console.log(`  ${processError(new Error('普通JavaScript错误'))}`);

// 包含完整错误上下文的Result
console.log('\nResult与错误上下文:');

function readUserFile(userId: string, filePath: string): Result<string, DPMLError> {
  // 模拟文件不存在的情况
  if (filePath.includes('不存在')) {
    return failure(createDPMLError(
      `用户文件不存在: ${filePath}`,
      DPMLErrorCode.FILE_NOT_FOUND,
      { userId, filePath, timestamp: new Date().toISOString() }
    ));
  }
  
  // 模拟权限错误
  if (userId === 'guest') {
    return failure(createDPMLError(
      '没有权限访问文件',
      DPMLErrorCode.PERMISSION_DENIED,
      { userId, filePath }
    ));
  }
  
  // 成功情况
  return success(`这是文件 ${filePath} 的内容`);
}

// 测试不同情况
const userResult1 = readUserFile('admin', '/path/to/file.txt');
const userResult2 = readUserFile('admin', '/path/to/不存在.txt');
const userResult3 = readUserFile('guest', '/path/to/file.txt');

function handleUserResult(result: Result<string, DPMLError>): void {
  if (result.success) {
    console.log(`  成功: ${result.value}`);
  } else {
    console.log(`  失败: ${result.error.code} - ${result.error.message}`);
    console.log(`  详情: ${JSON.stringify(result.error.details)}`);
  }
}

console.log('案例1 - 成功读取:');
handleUserResult(userResult1);

console.log('\n案例2 - 文件不存在:');
handleUserResult(userResult2);

console.log('\n案例3 - 权限错误:');
handleUserResult(userResult3);

// 运行示例
// pnpm tsx examples/types/result-error-handling.ts 