# Introduction

DPML (Deep Prompt Markup Language) is a declarative markup language for defining AI applications. It uses XML/HTML-like syntax to make AI development accessible to everyone.

## What is DPML?

Think of DPML as HTML for AI. Just as HTML lets you define web pages with tags like `<div>` and `<p>`, DPML lets you define AI applications with tags like `<agent>` and `<task>`.

```xml
<!-- This is a complete AI assistant definition -->
<agent>
  <llm model="gpt-4"/>
  <prompt>You are a helpful travel planner.</prompt>
</agent>
```

## Key Concepts

### Declarative, Not Imperative

Instead of writing procedural code:

```javascript
// Traditional approach
const agent = new Agent({
  model: 'gpt-4',
  apiKey: process.env.OPENAI_API_KEY,
  systemPrompt: 'You are a helpful assistant'
})
agent.chat('Hello')
```

You declare what you want:

```xml
<!-- DPML approach -->
<agent>
  <llm model="gpt-4" api-key="@env:OPENAI_API_KEY"/>
  <prompt>You are a helpful assistant</prompt>
</agent>
```

### Multi-Domain Architecture

DPML is not just for agents. It supports multiple domains:

- **Agent Domain**: Define and run AI assistants
- **Task Domain**: Define verifiable AI tasks with state machines
- **Role Domain**: Structure AI roles with knowledge and personality
- **Workflow Domain**: Orchestrate complex AI workflows (coming soon)

## Why Use DPML?

### 1. Lower Barrier to Entry

No need to learn complex AI frameworks or APIs. If you can write HTML, you can write DPML.

### 2. Standardization

One consistent format across all AI scenarios. Share, reuse, and collaborate easily.

### 3. Separation of Concerns

Keep your AI configuration separate from application code. Update prompts without touching code.

### 4. Tooling Support

- CLI for running DPML files
- VSCode plugin with syntax highlighting and auto-completion
- Online editor for quick experiments
- Validators for ensuring correctness

## Next Steps

- [Quick Start](/guide/quickstart) - Create your first DPML application
- [Agent Domain Guide](/guide/agent/) - Learn about AI agents
- [Task Domain Guide](/guide/task/) - Learn about task definitions
- [Examples](/examples/) - See DPML in action
