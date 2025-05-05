import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 获取暂存区的文件
const stagedFiles = execSync('git diff --cached --name-only').toString().split('\n').filter(Boolean);

// 检测packages目录下的所有包
const packagesDir = path.join(__dirname, '../packages');
const packages = fs.readdirSync(packagesDir).filter(pkg =>
  fs.statSync(path.join(packagesDir, pkg)).isDirectory()
);

// 跟踪哪些包被修改了
const changedPackages = new Set();

// 检查每个暂存文件属于哪个包
stagedFiles.forEach(file => {
  const packageMatch = file.match(/^packages\/([^/]+)/);

  if (packageMatch && packages.includes(packageMatch[1])) {
    changedPackages.add(packageMatch[1]);
  }
});

// 对修改的包执行构建和测试
if (changedPackages.size > 0) {
  ;

  let exitCode = 0;

  for (const pkg of changedPackages) {
    ;
    try {
      // 检查包中是否有build和test脚本
      const pkgJsonPath = path.join(packagesDir, pkg, 'package.json');
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
      const scripts = pkgJson.scripts || {};

      // 执行构建命令（如果存在）
      if (scripts.build) {
        ;
        execSync(`cd packages/${pkg} && pnpm lint`, { stdio: 'inherit' });
      }

      // 执行测试命令（如果存在）
      if (scripts.test) {
        ;
        execSync(`cd packages/${pkg} && pnpm test`, { stdio: 'inherit' });
      }
    } catch (e) {
      console.error(`包 ${pkg} 验证失败`);
      exitCode = 1;
    }
  }

  if (exitCode !== 0) {
    process.exit(exitCode); // 任何包失败都会阻止提交
  }
} else {
  ;
}
