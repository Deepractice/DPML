# DPML Website

Official documentation website for DPML (Deep Prompt Markup Language).

## Tech Stack

- **Framework**: VitePress
- **UI**: Vue 3
- **Styling**: Tailwind CSS (to be added)
- **Code Editor**: Monaco Editor (to be added)

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
apps/website/
├── docs/
│   ├── .vitepress/
│   │   ├── config.ts        # VitePress configuration
│   │   └── theme/           # Custom theme (to be added)
│   ├── public/              # Static assets
│   ├── guide/               # User guides
│   ├── spec/                # Specifications
│   ├── examples/            # Code examples
│   ├── tools/               # Tools documentation
│   └── index.md             # Homepage
├── package.json
└── README.md
```

## Content Guidelines

### Writing Documentation

- Use simple, clear language
- Provide code examples for every concept
- Include both basic and advanced examples
- Add links to related content

### Code Examples

All DPML code examples should be runnable. Include:

```xml
<!-- Complete, working example -->
<agent>
  <llm model="gpt-4" api-key="@env:OPENAI_API_KEY"/>
  <prompt>Your prompt here</prompt>
</agent>
```

## Deployment

The website is automatically deployed when changes are pushed to the main branch.

- **Preview**: Automatically generated for pull requests
- **Production**: https://dpml.deepractice.ai (to be configured)

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.
