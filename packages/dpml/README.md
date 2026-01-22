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

## Built-in Elements

DPML provides built-in elements that are automatically recognized regardless of your schema definition.

### `<resource>` Element

The `<resource>` element is used to reference external resources. It's automatically processed by the built-in resource transformer.

```xml
<prompt>
  <resource src="arp:text:file://./config.md"/>
  <resource src="deepractice.ai/sean/knowledge@1.0"/>
</prompt>
```

**Attributes:**

- `src` - Resource locator (required for meaningful use, but tolerant like HTML)

**Protocol Detection:**

The `src` attribute is automatically parsed to detect the protocol:

| Protocol  | Format              | Example                             |
| --------- | ------------------- | ----------------------------------- |
| `arp`     | Starts with `arp:`  | `arp:text:file://./config.md`       |
| `rxl`     | Domain/path pattern | `deepractice.ai/path/name.type@1.0` |
| `unknown` | Everything else     | Invalid or empty src                |

**Accessing Resources:**

```typescript
import { createDPML, defineSchema } from 'dpml';
import type { ResourceResult } from 'dpml';

const schema = defineSchema({ element: 'prompt' });
const dpml = createDPML({ schema, transformers: [] });

const result = await dpml.compile<ResourceResult>(`
  <prompt>
    <resource src="arp:text:file://./rules.md"/>
    <resource src="localhost/config.text@1.0"/>
  </prompt>
`);

console.log(result.resources);
// [
//   { src: 'arp:text:file://./rules.md', protocol: 'arp', node: DPMLNode },
//   { src: 'localhost/config.text@1.0', protocol: 'rxl', node: DPMLNode }
// ]
```

**Design Philosophy (HTML-like tolerance):**

- DPML does not validate the `src` content at parse time
- Invalid or empty `src` values are accepted (marked as `protocol: 'unknown'`)
- Resource loading is delegated to the application layer
- This follows HTML's approach: parse tolerantly, handle errors at runtime

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

## Built-in Transformers

DPML automatically registers the following built-in transformers:

### Resource Transformer (`dpml:resource-extractor`)

Automatically extracts all `<resource>` elements from the document and adds them to the result as a `resources` array.

- Runs before user-defined transformers
- Adds `resources: ResourceInfo[]` to the result
- Does not modify the document structure

## Types

```typescript
import type {
  // Core types
  DPML,
  DPMLConfig,
  Schema,
  Transformer,
  DPMLDocument,
  DPMLNode,
  ValidationResult,
  // Resource types
  ResourceInfo,
  ResourceResult,
} from 'dpml';
```

### ResourceInfo

```typescript
interface ResourceInfo {
  /** Original src attribute value */
  src: string | undefined;
  /** Detected protocol: 'arp', 'rxl', or 'unknown' */
  protocol: 'arp' | 'rxl' | 'unknown';
  /** Reference to the original DPMLNode */
  node: unknown;
}
```

### ResourceResult

```typescript
interface ResourceResult {
  /** Extracted resource references */
  resources: ResourceInfo[];
  /** Other properties from processing result */
  [key: string]: unknown;
}
```

## License

MIT
