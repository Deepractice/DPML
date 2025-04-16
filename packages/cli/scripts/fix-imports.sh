#!/bin/bash

# 修复导入路径问题
echo "开始修复测试文件导入路径..."

# 替换模块导入路径
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/src\//from "\.\.\/\.\.\//g' {} \;
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/\.\.\/src\//from "\.\.\/\.\.\/\.\.\//g' {} \;

# 修复模块引用中的特殊情况
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's/Buffer\.from(/Buffer.from(/g' {} \;

# 修复 fs 模块的模拟问题
find src/tests -type f -name "fs.test.ts" -exec sed -i '' 's/vi\.mock(.fs., () => ({/vi.mock("fs", async (importOriginal) => {\n  const actual = await importOriginal();\n  return {/g' {} \;
find src/tests -type f -name "fs.test.ts" -exec sed -i '' 's/}));//...actual,\n  existsSync: vi.fn(),\n  promises: {\n    readFile: vi.fn(),\n    writeFile: vi.fn(),\n    copyFile: vi.fn(),\n    unlink: vi.fn(),\n    mkdir: vi.fn(),\n    rmdir: vi.fn(),\n    access: vi.fn(),\n    stat: vi.fn()\n  }\n});\n/g' {} \;

# 修复 vi.mocked 的问题
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's/vi\.mocked(require(.os.)\.tmpdir)\.mockReturnValue/vi.mocked(require("os").tmpdir).mockImplementation(() => /g' {} \;

echo "导入路径修复完成！" 