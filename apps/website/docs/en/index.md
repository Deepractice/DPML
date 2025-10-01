---
layout: home

hero:
  name: DPML
  text: Deepractice Prompt Markup Language
  tagline: Define AI applications with declarative markup, just like writing HTML
  image:
    src: /logo.png
    alt: DPML
  actions:
    - theme: brand
      text: Get Started
      link: /guide/quickstart
    - theme: alt
      text: View on GitHub
      link: https://github.com/Deepractice/DPML

features:
  - icon: 📝
    title: Declarative Syntax
    details: Use XML/HTML-like tags to define AI behavior without complex programming

  - icon: 🎯
    title: Low Barrier to Entry
    details: Get started in 5 minutes, no need to understand AI model internals

  - icon: 🚀
    title: Multi-Domain Support
    details: Agent, Task, Role, and Workflow domains - one language for all AI scenarios

  - icon: 🔌
    title: Extensible
    details: Plugin system and domain extensions for custom requirements

  - icon: 🛠️
    title: Complete Toolchain
    details: CLI tools, VSCode plugin, online editor - everything you need

  - icon: 🌐
    title: Standard-Based
    details: RFC-style specification ensures consistency and interoperability
---

## Quick Example

Create an AI travel assistant in just a few lines:

```xml
<agent>
  <llm model="gpt-4" api-key="@env:OPENAI_API_KEY"/>
  <prompt>
    You are a travel planner specializing in Zhangjiajie tourism.
  </prompt>
</agent>
```

Run it instantly:

```bash
dpml agent chat travel.dpml
```

## What You Can Do

### 🤖 Create AI Agents
Define and run conversational AI assistants with simple markup. This is available now!

### 📋 Define Tasks (Coming Soon)
Use state machine principles to create verifiable AI tasks.

### 🎭 Build Roles (Coming Soon)
Structure AI personalities with knowledge and capabilities.

## Why DPML?

Traditional AI development requires deep understanding of model APIs, prompt engineering, and complex code. DPML changes that:

- **Simple**: Write tags instead of code
- **Standard**: One format for all AI tasks
- **Shareable**: Easy to distribute and reuse
- **Maintainable**: Clear structure, easy to understand

## Get Started

```bash
# Install DPML CLI
npm install -g dpml

# Create your first agent
dpml init my-agent

# Start chatting
dpml agent chat my-agent.dpml
```

[Read the full guide →](/en/guide/quickstart)
