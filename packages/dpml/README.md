# dpml

The main package for DPML (Deepractice Prompt Markup Language).

## Installation

```bash
npm install dpml
# or
bun add dpml
```

## Usage

```typescript
import { createDPML, defineSchema, defineTransformer } from 'dpml';

// Define schema
const schema = defineSchema({
  element: 'prompt',
  attributes: [{ name: 'role', required: true }],
});

// Define transformer
const transformer = defineTransformer({
  name: 'my-transformer',
  transform: input => ({
    role: input.document.rootNode.attributes.get('role'),
    content: input.document.rootNode.content,
  }),
});

// Create DPML instance
const dpml = createDPML({
  schema,
  transformers: [transformer],
});

// Compile content
const result = await dpml.compile('<prompt role="assistant">Hello</prompt>');
```

## API

### `createDPML(config)`

Creates a DPML instance.

**Config:**

- `schema` - Schema definition for validation
- `transformers` - Array of transformers to apply

**Returns:** DPML instance with methods:

- `compile<T>(content)` - Parse, validate, and transform content
- `parse(content)` - Parse content to document
- `validate(content)` - Validate content against schema
- `extend(config)` - Extend configuration
- `getSchema()` - Get current schema
- `getTransformers()` - Get current transformers

### `defineSchema(definition)`

Creates a schema definition.

**Definition:**

- `element` - Element name (for ElementSchema)
- `root` - Root element (for DocumentSchema)
- `attributes` - Attribute definitions
- `children` - Child element definitions
- `content` - Content constraints

### `defineTransformer(definition)`

Creates a transformer definition.

**Definition:**

- `name` - Transformer name (required)
- `description` - Optional description
- `transform` - Transform function (required)

## Types

```typescript
import type {
  DPML,
  DPMLConfig,
  Schema,
  Transformer,
  DPMLDocument,
  ValidationResult,
} from 'dpml';
```

## License

MIT
