# Unified Development Mode: Code Review + BDD

## 概述

这是 AgentX 项目的统一开发协作模式，结合了 **Code Review 协作** 和 **BDD（行为驱动开发）**。

**核心理念**：

- 测试不是"事后补"的，而是开发过程中自然产出的
- Feature 文件 = 需求文档 + 验收标准 + 自动化测试
- 问题充分讨论后再动手，避免返工

---

## 角色定义

| 角色          | 担任者 | 职责                              |
| ------------- | ------ | --------------------------------- |
| **Reviewer**  | Claude | 审查代码/设计，发现问题，提出疑问 |
| **Architect** | 用户   | 解答问题，做决策，确定方案        |
| **Developer** | Claude | 实现代码，编写测试                |

---

## 开发流程

```
┌─────────────────────────────────────────────────────────────┐
│  Phase 1: 需求澄清 (Code Review Mode)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Reviewer 阅读相关代码/文档                              │
│           ↓                                                 │
│  2. 发现问题，提出疑问（使用问题格式）                      │
│           ↓                                                 │
│  3. Architect 解答，做出决策                                │
│           ↓                                                 │
│  4. Reviewer 确认理解，追问直到清晰                         │
│           ↓                                                 │
│  5. 方案确定，进入 Phase 2                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 2: 行为定义 (BDD)                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 编写 .feature 文件描述期望行为                          │
│           ↓                                                 │
│  2. Architect 确认 feature 正确                             │
│           ↓                                                 │
│  3. 实现 step definitions（如需要）                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 3: 实现 (TDD)                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 运行测试（预期失败）                                    │
│           ↓                                                 │
│  2. 实现代码                                                │
│           ↓                                                 │
│  3. 运行测试（通过 = 完成）                                 │
│           ↓                                                 │
│  4. 重构（保持测试通过）                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Code Review 模式

### 问题分类

| 类型     | 描述                     | 示例                              |
| -------- | ------------------------ | --------------------------------- |
| **盲点** | 缺失的逻辑，没想到的场景 | "断线重连时 cursor 怎么恢复？"    |
| **架构** | 职责模糊，依赖混乱       | "Queue 和 Network 谁负责路由？"   |
| **功能** | 接口定义了但没实现       | "handleConnection 方法未实现"     |
| **坑**   | 潜在 bug，边界条件       | "多 tab 共享 localStorage 会冲突" |

### 提问格式

```markdown
**问题 N：[简短标题]**

**代码位置**：`path/to/file.ts:line`

**问题描述**：
[具体描述问题是什么]

**涉及的关键点**：

1. 点 1
2. 点 2
3. 点 3

**状态**：待解答
```

### 原则

1. **问题驱动** - 带着批判性思维找问题，不是漫无目的读代码
2. **不轻易动手** - 方案没确定之前不执行
3. **持续追问** - 一个问题可以追问多轮，直到完全理解
4. **收敛机制** - 通过 API 边界来收紧问题范围

---

## Phase 2: BDD 模式

### BDD vs Unit 测试边界

| 测试类型 | 测试层级       | 视角       |
| -------- | -------------- | ---------- |
| **BDD**  | 最外层 API/APP | 用户视角   |
| **Unit** | 内部模块       | 开发者视角 |

**BDD 测试原则**：

- 只通过最外层公开 API 测试，不测试内部模块
- 测试用户可见的行为，不测试实现细节
- 这样做有助于从用户视角审视 API 设计

**Unit 测试原则**：

- 测试内部模块的具体实现
- 可以 mock 依赖，关注边界条件

### Feature 文件结构

```gherkin
@tag
Feature: 功能名称
  功能描述（一两句话说明这个功能是什么）

  Background:
    Given 前置条件（所有场景共享）

  @scenario-tag
  Scenario: 场景名称
    Given 前置条件
    When 执行动作
    Then 期望结果
    And 更多期望
```

### 文件组织

```
bdd/
├── features/
│   ├── resolve.feature
│   ├── deposit.feature
│   └── ...
├── steps/
│   ├── resolve.steps.ts
│   ├── deposit.steps.ts
│   └── common.steps.ts
└── cucumber.js                     # Cucumber 配置
```

### 编写原则

1. **业务语言** - 用业务术语，不用技术细节
2. **独立场景** - 每个 Scenario 独立，不依赖执行顺序
3. **声明式** - 描述"什么"，不描述"怎么做"
4. **可读性** - 非技术人员也能理解

### 示例

```gherkin
@resolve
Feature: Resolve Resource
  通过 ARP URL 解析资源

  Scenario: 解析本地文本资源
    Given ARP URL "arp:text:file://./data/hello.txt"
    When resolve the resource
    Then should return resource object
    And type should be "text"
    And content should contain "Hello"
```

---

## Phase 3: 实现

### 流程

```bash
# 1. 运行测试（预期失败）
cd bdd && bun run test:tags "@feature-tag"

# 2. 实现代码
# ... 编写实现 ...

# 3. 运行测试（通过）
cd bdd && bun run test:tags "@feature-tag"

# 4. 运行全部测试确保没有破坏其他功能
bun run test
```

### 原则

1. **最小实现** - 只实现让测试通过的代码
2. **不过度设计** - 不为假想的未来需求写代码
3. **持续重构** - 测试通过后可以重构，保持测试绿色

---

---

## 完整开发流程

### Step 0: Issue 创建

```bash
# 创建 issue 文档（如果还没有）
# issues/xxx-feature-name.md
```

**内容**：

- 背景和痛点
- 期望用法
- 设计方案
- 实现步骤

### Step 1: 创建分支

```bash
git checkout main
git pull
git checkout -b feat/feature-name
```

### Step 2: Phase 1 - 需求澄清（Code Review）

1. Reviewer（Claude）阅读相关代码/文档/issue
2. 发现问题，提出疑问（使用问题格式）
3. Architect（用户）解答，做决策
4. 确认方案，进入 Phase 2

### Step 3: Phase 2 - 行为定义（BDD）

```bash
# 1. 编写 feature 文件
# bdd/features/feature-name.feature

# 2. 运行测试（预期失败，step 未定义）
cd bdd && bun run test:tags "@feature-tag"

# 3. 实现 step definitions（如需要）
# bdd/steps/feature-name.steps.ts
```

### Step 4: Phase 3 - 实现（TDD）

```bash
# 1. 运行测试（预期失败）
cd bdd && bun run test:tags "@feature-tag"

# 2. 实现代码
# packages/core/src/...

# 3. 运行测试直到通过
cd bdd && bun run test:tags "@feature-tag"

# 4. 运行全部测试确保没破坏其他功能
bun run test
bun run test:bdd
```

### Step 5: 代码质量检查

```bash
# TypeCheck
bun run typecheck

# Lint
bun run lint

# Format
bun run format
```

### Step 6: 更新文档

需要更新的文档：

- `README.md` - 如果有新功能/API
- `README.zh-CN.md` - 中文版
- `CLAUDE.md` - 如果架构变化
- `packages/*/README.md` - 相关包的文档
- `issues/xxx.md` - 更新 issue 状态

### Step 7: 写 Changeset

```bash
# 手动创建 changeset
# .changeset/feature-name.md

---
"packageName": patch|minor|major
---

Description of changes
```

**版本规则**：

- `patch` - Bug 修复和内部改进
- `minor` - 新功能和增强
- `major` - Breaking changes

### Step 8: 提交代码

```bash
git add .
git status  # 检查要提交的文件
git commit -m "feat: feature description

Co-Authored-By: Claude Sonnet 4.5 (1M context) <noreply@anthropic.com>"
```

**Commit 规范**：

- 遵循 Conventional Commits
- `feat:` / `fix:` / `docs:` / `refactor:` / `test:` / `chore:`

### Step 9: 推送和创建 PR

```bash
# 推送分支
git push -u origin feat/feature-name

# 创建 PR
gh pr create --title "feat: feature description" --body "..."
```

**PR 检查**：

- ✅ CI 通过（lint, typecheck, test, build）
- ✅ Changeset 存在（自动检查）

### Step 10: 合并

```bash
# PR approved 后合并
gh pr merge --squash

# 切回 main 并更新
git checkout main
git pull

# 删除本地分支
git branch -d feat/feature-name
```

---

## 快速参考

### 开发新功能（完整版）

```
1. Issue 创建 → 拉分支
2. Code Review: 讨论需求，确定方案
3. BDD: 写 .feature 文件
4. 实现: 让测试通过
5. 质量检查: typecheck, lint, format
6. 更新文档
7. 写 changeset
8. 提交 → PR → 合并
```

### 修复 Bug

```
1. 写一个失败的测试用例（复现 bug）
2. 修复代码
3. 测试通过 = bug 已修复
4. 提交
```

### 重构

```
1. 确保现有测试全部通过
2. 重构代码
3. 运行测试，保持绿色
4. 提交
```

---

## 命令速查

```bash
# 运行所有 BDD 测试
bun run test:bdd

# 运行指定 tag 的测试
cd bdd && bun run test:tags "@resolve"
cd bdd && bun run test:tags "@resolve and @e2e"
cd bdd && bun run test:tags "not @pending"

# 运行单元测试
bun run test

# 类型检查
bun run typecheck
```

---

## 何时使用这个模式

| 场景       | 是否使用                          |
| ---------- | --------------------------------- |
| 新功能开发 | ✅ 完整流程                       |
| Bug 修复   | ✅ 简化版（写测试 → 修复 → 通过） |
| 重构       | ✅ 确保测试通过                   |
| 探索性调研 | ❌ 不需要，直接探索               |
| 紧急修复   | ⚠️ 可跳过 BDD，但事后补测试       |

---

## 相关文件

- `bdd/features/` - Feature 文件
- `bdd/steps/` - Step 实现
- `bdd/cucumber.js` - Cucumber 配置
