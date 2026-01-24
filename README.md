<div align="center">
  <h1>DPML</h1>
  <p><strong>Deepractice Prompt Markup Language</strong></p>
  <p>结构化 AI 提示工程的声明式标记语言</p>

  <p>Define, validate, and transform AI prompts with XML-like syntax</p>
  <p>使用类 XML 语法定义、验证和转换 AI 提示</p>

  <p>
    <b>Declarative</b> · <b>Type Safe</b> · <b>Extensible</b>
  </p>
  <p>
    <b>声明式</b> · <b>类型安全</b> · <b>可扩展</b>
  </p>

  <p>
    <a href="https://github.com/Deepractice/dpml"><img src="https://img.shields.io/github/stars/Deepractice/dpml?style=social" alt="Stars"/></a>
    <a href="LICENSE"><img src="https://img.shields.io/github/license/Deepractice/dpml?color=blue" alt="License"/></a>
    <a href="https://www.npmjs.com/package/dpml"><img src="https://img.shields.io/npm/v/dpml?color=cb3837&logo=npm" alt="npm"/></a>
    <a href="https://github.com/Deepractice/dpml/actions/workflows/ci.yml"><img src="https://github.com/Deepractice/dpml/actions/workflows/ci.yml/badge.svg" alt="CI"/></a>
  </p>

  <p>
    <a href="#quick-start">Quick Start</a> •
    <a href="./docs/README.md">Documentation</a> •
    <a href="./docs/api/dpml.md">API Reference</a>
  </p>
</div>

---

## Why DPML?

AI systems need structured ways to define behaviors: **prompts**, **contexts**, **instructions**, **constraints**, and more. DPML provides a unified markup language with schema validation and extensible transformers. _Everything is declarative._

```
┌─────────────────────────────────────────────────────────────┐
│                      DPML Document                          │
│                                                             │
│  <prompt role="assistant">                                  │
│    <context>You are a travel planner</context>              │
│    <instruction>Help users plan trips</instruction>         │
│    <resource src="arp:text:file://./knowledge.md"/>         │
│  </prompt>                                                  │
├─────────────────────────────────────────────────────────────┤
│                     Processing Pipeline                     │
│                                                             │
│  Parse          →  DPML Text → DPMLDocument                 │
│  Validate       →  Schema → ValidationResult                │
│  Transform      →  Transformers → Target Format             │
├─────────────────────────────────────────────────────────────┤
│                      Core Concepts                          │
│                                                             │
│  Element        →  <tag>content</tag>                       │
│  Attribute      →  name="value"                             │
│  Schema         →  Structure & validation rules             │
│  Transformer    →  Convert to any format                    │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

```bash
npm install dpml
```

```typescript
import { createDPML, defineSchema, defineTransformer } from 'dpml';

// 1. Define schema
const schema = defineSchema({
  element: 'prompt',
  attributes: [{ name: 'role', required: true }],
  children: { elements: [{ element: 'context' }, { element: 'instruction' }] },
});

// 2. Define transformer
const transformer = defineTransformer({
  name: 'prompt-extractor',
  transform: (input) => ({
    role: input.document.rootNode.attributes.get('role'),
    context: input.document.rootNode.children[0]?.content,
    instruction: input.document.rootNode.children[1]?.content,
  }),
});

// 3. Compile
const dpml = createDPML({ schema, transformers: [transformer] });
const result = await dpml.compile(`
  <prompt role="assistant">
    <context>You are a helpful assistant</context>
    <instruction>Answer questions clearly</instruction>
  </prompt>
`);
// → { role: 'assistant', context: '...', instruction: '...' }
```

## [Documentation](./docs/README.md)

### [Getting Started](./docs/getting-started/introduction.md)

- [Introduction](./docs/getting-started/introduction.md) - Why DPML
- [Installation](./docs/getting-started/installation.md) - Setup guide
- [Quick Start](./docs/getting-started/quick-start.md) - 5-minute tutorial

### [Core Concepts](./docs/concepts/overview.md)

- [Architecture Overview](./docs/concepts/overview.md) - Three-party model
- [Syntax](./docs/concepts/syntax.md) - Element, Attribute, Content
- [Schema System](./docs/concepts/schema.md) - Validation & constraints
- [Transformer](./docs/concepts/transformer.md) - Data transformation
- [Built-in Elements](./docs/concepts/built-in-elements.md) - `<resource>` element

### [Guides](./docs/guides/defining-schema.md)

- [Defining Schema](./docs/guides/defining-schema.md) - Schema definition patterns
- [Custom Transformer](./docs/guides/custom-transformer.md) - Transformer development
- [Validation](./docs/guides/validation.md) - Error handling best practices
- [Integration](./docs/guides/integration.md) - AI tools & build systems

### [API Reference](./docs/api/dpml.md)

- [dpml API](./docs/api/dpml.md) - Main package API
- [@dpml/core API](./docs/api/core.md) - Core library internals
- [Errors](./docs/api/errors.md) - Error handling

### [Design & Contributing](./docs/design/README.md)

- [Design Decisions](./docs/design/README.md) - Architecture rationale (ADRs)
- [Specification](./specs/README.md) - Language specification
- [Whitepaper](./specs/v1.0/en/whitepaper/index.md) - Design philosophy

## Packages

| Package                         | Description                             |
| ------------------------------- | --------------------------------------- |
| [`dpml`](./packages/dpml)       | Main package - public API               |
| [`@dpml/core`](./packages/core) | Core library - parse, validate, transform |

## Ecosystem

Part of the [Deepractice](https://github.com/Deepractice) AI infrastructure:

- **[AgentVM](https://github.com/Deepractice/AgentVM)** - AI Agent runtime
- **[AgentX](https://github.com/Deepractice/AgentX)** - AI Agent framework
- **[ResourceX](https://github.com/Deepractice/ResourceX)** - Resource management protocol
- **DPML** - Prompt markup language (this project)

## Development

```bash
# Clone & setup
git clone https://github.com/Deepractice/dpml.git
cd dpml && bun install

# Build & test
bun run build
bun run test
bun run test:bdd
```

See [Development Guide](./issues/000-unified-development-mode.md) for BDD workflow.

## Contributing

Contributions welcome! Please read our contributing guidelines before submitting PRs.

## License

[MIT](./LICENSE) © [Deepractice](https://github.com/Deepractice)

---

<div align="center">
  Built with care by <a href="https://github.com/Deepractice">Deepractice</a>
</div>
