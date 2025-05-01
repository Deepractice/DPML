#!/usr/bin/env node

/**
 * 这个脚本用于检查所有包的配置是否符合项目标准
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const packagesDir = path.join(rootDir, 'packages');

// 配置标准
const standards = {
  packageJson: {
    required: ['name', 'version', 'type', 'main', 'module', 'types', 'exports'],
    type: 'module',
    mainPattern: 'dist/index.cjs',
    modulePattern: 'dist/index.js',
    typesPattern: 'dist/index.d.ts',
    exportsRequired: ['.'],
  },
  tsconfig: {
    required: ['extends', 'compilerOptions'],
    compilerOptionsRequired: ['rootDir', 'outDir'],
  },
  tsupConfig: {
    required: ['baseConfig', 'entry', 'esbuildOptions'],
  },
};

// 颜色用于终端输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

// 获取所有包目录
const getPackageDirs = () => {
  return fs
    .readdirSync(packagesDir)
    .filter(dir => {
      const stats = fs.statSync(path.join(packagesDir, dir));

      return stats.isDirectory() && dir !== 'node_modules' && dir !== 'dist';
    })
    .map(dir => path.join(packagesDir, dir));
};

// 检查package.json
const checkPackageJson = packageDir => {
  const packageJsonPath = path.join(packageDir, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    return { success: false, errors: ['package.json不存在'] };
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const errors = [];

    // 检查必需字段
    standards.packageJson.required.forEach(field => {
      if (!packageJson[field]) {
        errors.push(`缺少必需字段: ${field}`);
      }
    });

    // 检查type字段
    if (packageJson.type !== standards.packageJson.type) {
      errors.push(
        `type应为"${standards.packageJson.type}", 实际为"${packageJson.type || '未设置'}"`
      );
    }

    // 检查导出路径格式
    if (packageJson.main !== standards.packageJson.mainPattern) {
      errors.push(
        `main字段应为"${standards.packageJson.mainPattern}", 实际为"${packageJson.main}"`
      );
    }

    if (packageJson.module !== standards.packageJson.modulePattern) {
      errors.push(
        `module字段应为"${standards.packageJson.modulePattern}", 实际为"${packageJson.module}"`
      );
    }

    // 检查exports字段
    if (packageJson.exports) {
      standards.packageJson.exportsRequired.forEach(field => {
        if (!packageJson.exports[field]) {
          errors.push(`exports缺少必需路径: "${field}"`);
        } else {
          // 检查导出格式
          const exportObj = packageJson.exports[field];

          if (!exportObj.types || !exportObj.import || !exportObj.require) {
            errors.push(
              `exports["${field}"]缺少必需字段: types, import, require`
            );
          }
        }
      });
    }

    return { success: errors.length === 0, errors };
  } catch (error) {
    return {
      success: false,
      errors: [`解析package.json失败: ${error.message}`],
    };
  }
};

// 检查tsconfig.json
const checkTsConfig = packageDir => {
  const tsconfigPath = path.join(packageDir, 'tsconfig.json');

  if (!fs.existsSync(tsconfigPath)) {
    return { success: false, errors: ['tsconfig.json不存在'] };
  }

  try {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    const errors = [];

    // 检查必需字段
    standards.tsconfig.required.forEach(field => {
      if (!tsconfig[field]) {
        errors.push(`缺少必需字段: ${field}`);
      }
    });

    // 检查extends是否正确
    if (tsconfig.extends !== '../../tsconfig.json') {
      errors.push(
        `extends应为"../../tsconfig.json", 实际为"${tsconfig.extends}"`
      );
    }

    // 检查compilerOptions
    if (tsconfig.compilerOptions) {
      standards.tsconfig.compilerOptionsRequired.forEach(field => {
        if (!tsconfig.compilerOptions[field]) {
          errors.push(`compilerOptions缺少必需字段: ${field}`);
        }
      });

      // 检查rootDir和outDir
      if (tsconfig.compilerOptions.rootDir !== './src') {
        errors.push(
          `compilerOptions.rootDir应为"./src", 实际为"${tsconfig.compilerOptions.rootDir}"`
        );
      }

      if (tsconfig.compilerOptions.outDir !== './dist') {
        errors.push(
          `compilerOptions.outDir应为"./dist", 实际为"${tsconfig.compilerOptions.outDir}"`
        );
      }
    }

    return { success: errors.length === 0, errors };
  } catch (error) {
    return {
      success: false,
      errors: [`解析tsconfig.json失败: ${error.message}`],
    };
  }
};

// 检查tsconfig.build.json
const checkTsConfigBuild = packageDir => {
  const tsconfigBuildPath = path.join(packageDir, 'tsconfig.build.json');

  // 这个文件是可选的，所以如果不存在就不报错
  if (!fs.existsSync(tsconfigBuildPath)) {
    return { success: true, errors: [] };
  }

  try {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigBuildPath, 'utf8'));
    const errors = [];

    // 检查extends是否正确
    if (tsconfig.extends !== '../../tsconfig.build.json') {
      errors.push(
        `extends应为"../../tsconfig.build.json", 实际为"${tsconfig.extends}"`
      );
    }

    // 检查paths是否存在
    if (tsconfig.compilerOptions && !tsconfig.compilerOptions.paths) {
      errors.push('缺少paths配置');
    }

    return { success: errors.length === 0, errors };
  } catch (error) {
    return {
      success: false,
      errors: [`解析tsconfig.build.json失败: ${error.message}`],
    };
  }
};

// 检查tsup.config.ts
const checkTsupConfig = packageDir => {
  const tsupConfigPath = path.join(packageDir, 'tsup.config.ts');

  if (!fs.existsSync(tsupConfigPath)) {
    return { success: false, errors: ['tsup.config.ts不存在'] };
  }

  try {
    const content = fs.readFileSync(tsupConfigPath, 'utf8');
    const errors = [];

    // 简单内容检查 (不执行代码)
    if (!content.includes('import { baseConfig }')) {
      errors.push('没有引入baseConfig');
    }

    if (!content.includes('...baseConfig')) {
      errors.push('没有使用baseConfig作为基础配置');
    }

    if (!content.includes('entry:')) {
      errors.push('没有定义entry入口');
    }

    if (!content.includes('esbuildOptions')) {
      errors.push('没有配置esbuildOptions');
    }

    return { success: errors.length === 0, errors };
  } catch (error) {
    return {
      success: false,
      errors: [`读取tsup.config.ts失败: ${error.message}`],
    };
  }
};

// 运行检查
const main = () => {


  const packageDirs = getPackageDirs();



  let hasErrors = false;

  packageDirs.forEach(packageDir => {
    const packageName = path.basename(packageDir);



    // 检查package.json
    const packageJsonResult = checkPackageJson(packageDir);

    if (packageJsonResult.success) {

    } else {
      hasErrors = true;

      packageJsonResult.errors.forEach(error => {

      });
    }

    // 检查tsconfig.json
    const tsconfigResult = checkTsConfig(packageDir);

    if (tsconfigResult.success) {

    } else {
      hasErrors = true;

      tsconfigResult.errors.forEach(error => {

      });
    }

    // 检查tsconfig.build.json (如果存在)
    const tsconfigBuildResult = checkTsConfigBuild(packageDir);

    if (fs.existsSync(path.join(packageDir, 'tsconfig.build.json'))) {
      if (tsconfigBuildResult.success) {
        console.log(
          `${colors.green}✓ tsconfig.build.json 配置正确${colors.reset}`
        );
      } else {
        hasErrors = true;
        console.log(
          `${colors.red}✗ tsconfig.build.json 存在问题:${colors.reset}`
        );
        tsconfigBuildResult.errors.forEach(error => {

        });
      }
    }

    // 检查tsup.config.ts
    const tsupConfigResult = checkTsupConfig(packageDir);

    if (tsupConfigResult.success) {

    } else {
      hasErrors = true;

      tsupConfigResult.errors.forEach(error => {

      });
    }


  });

  if (hasErrors) {
    console.log(
      `${colors.red}检查完成，发现配置问题，请参考 docs/package-configuration-guide.md 进行修复${colors.reset}`
    );
    process.exit(1);
  } else {

  }
};

main();
