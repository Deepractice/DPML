/**
 * 字符串和数组工具函数示例
 *
 * 这个示例演示了@dpml/common/utils中的字符串和数组工具函数的使用方法。
 */

import { stringUtils, arrayUtils } from '../../src/utils';

// ============= 字符串工具 =============

console.log('===== 字符串工具函数示例 =====');

// 检查字符串是否为空
console.log('isEmpty:');
console.log(`  isEmpty('') = ${stringUtils.isEmpty('')}`);
console.log(`  isEmpty('  ') = ${stringUtils.isEmpty('  ')}`);
console.log(`  isEmpty('test') = ${stringUtils.isEmpty('test')}`);

// 确保字符串以特定字符开始/结束
console.log('\nensureStartsWith/ensureEndsWith:');
console.log(
  `  ensureStartsWith('test', 'pre') = '${stringUtils.ensureStartsWith('test', 'pre')}'`
);
console.log(
  `  ensureStartsWith('prefix-test', 'prefix-') = '${stringUtils.ensureStartsWith('prefix-test', 'prefix-')}'`
);
console.log(
  `  ensureEndsWith('file', '.txt') = '${stringUtils.ensureEndsWith('file', '.txt')}'`
);
console.log(
  `  ensureEndsWith('file.txt', '.txt') = '${stringUtils.ensureEndsWith('file.txt', '.txt')}'`
);

// 截断过长字符串
console.log('\ntruncate:');
const longText = 'This is a very long text that should be truncated';

console.log(`  原文本: '${longText}'`);
console.log(`  truncate(text, 10) = '${stringUtils.truncate(longText, 10)}'`);
console.log(
  `  truncate(text, 20, '---') = '${stringUtils.truncate(longText, 20, '---')}'`
);

// 格式化字符串
console.log('\nformat/template:');
console.log(
  `  format('Hello, {0}!', 'World') = '${stringUtils.format('Hello, {0}!', 'World')}'`
);
console.log(
  `  format('{0} + {1} = {2}', 2, 3, 5) = '${stringUtils.format('{0} + {1} = {2}', 2, 3, 5)}'`
);
console.log(
  `  template('Hello, {name}!', { name: 'World' }) = '${stringUtils.template('Hello, {name}!', { name: 'World' })}'`
);

// ============= 数组工具 =============

console.log('\n\n===== 数组工具函数示例 =====');

// 数组分块
console.log('chunk:');
const numbers = [1, 2, 3, 4, 5, 6, 7, 8];

console.log(`  原数组: [${numbers}]`);
console.log(
  `  chunk(数组, 2) = ${JSON.stringify(arrayUtils.chunk(numbers, 2))}`
);
console.log(
  `  chunk(数组, 3) = ${JSON.stringify(arrayUtils.chunk(numbers, 3))}`
);

// 数组去重
console.log('\nunique:');
const duplicates = [1, 2, 2, 3, 1, 4, 3, 5];

console.log(`  原数组: [${duplicates}]`);
console.log(`  unique(数组) = [${arrayUtils.unique(duplicates)}]`);

// 数组分组
console.log('\ngroupBy:');
const users = [
  { id: 1, role: 'admin', name: 'Alice' },
  { id: 2, role: 'user', name: 'Bob' },
  { id: 3, role: 'admin', name: 'Charlie' },
  { id: 4, role: 'user', name: 'David' },
];

console.log('  原数组: ', JSON.stringify(users, null, 2));
console.log(
  '  groupBy(users, "role") = ',
  JSON.stringify(arrayUtils.groupBy(users, 'role'), null, 2)
);

// 数组交集和差集
console.log('\nintersection/difference:');
const array1 = [1, 2, 3, 4];
const array2 = [3, 4, 5, 6];

console.log(`  数组1: [${array1}]`);
console.log(`  数组2: [${array2}]`);
console.log(
  `  intersection(数组1, 数组2) = [${arrayUtils.intersection(array1, array2)}]`
);
console.log(
  `  difference(数组1, 数组2) = [${arrayUtils.difference(array1, array2)}]`
);
console.log(
  `  difference(数组2, 数组1) = [${arrayUtils.difference(array2, array1)}]`
);

// 运行示例
// pnpm tsx examples/utils/string-array-utils.ts
