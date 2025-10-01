# Quick Start

Get started with DPML in 5 minutes.

## Installation

Install the DPML CLI globally:

```bash
npm install -g dpml
```

Or use with npx (no installation required):

```bash
npx dpml --version
```

## Your First Agent

### 1. Create a DPML File

Create a file named `travel-assistant.dpml`:

```xml
<agent>
  <llm
    api-type="openai"
    api-key="@env:OPENAI_API_KEY"
    api-url="https://api.openai.com/v1"
    model="gpt-4"/>

  <prompt>
## Role
You are a travel planner specializing in Zhangjiajie tourism.
You help customers plan their trips to Zhangjiajie.

## Skills
- Recommend attractions
- Plan itineraries
- Suggest accommodations
- Provide travel tips
  </prompt>
</agent>
```

### 2. Set Up Environment Variables

Create a `.env` file in the same directory:

```env
OPENAI_API_KEY=sk-your-api-key-here
```

### 3. Start Chatting

```bash
dpml agent chat travel-assistant.dpml --env-file .env
```

You should see an interactive chat prompt:

```
🤖 Travel Assistant ready. Type 'exit' to quit.

You: Hello! I want to visit Zhangjiajie next month.
Assistant: Great choice! Zhangjiajie is beautiful...
```

## Understanding the Code

Let's break down what each part does:

```xml
<agent>
  <!-- LLM configuration -->
  <llm
    api-type="openai"           <!-- Which LLM provider -->
    api-key="@env:OPENAI_API_KEY" <!-- API key from environment -->
    model="gpt-4"/>             <!-- Which model to use -->

  <!-- System prompt -->
  <prompt>
    You are a travel planner...
  </prompt>
</agent>
```

### Environment Variable References

The `@env:` prefix tells DPML to read from environment variables:

```xml
api-key="@env:OPENAI_API_KEY"
```

This is safer than hardcoding sensitive information.

## Next Steps

Now that you have a basic agent running, try:

### Explore Other Domains

- [Define a Task](/guide/task/) - Create verifiable AI tasks
- [Create a Role](/guide/role/) - Structure AI personalities

### Add More Features

- [Tool Calling](/guide/agent/tools) - Let agents use external tools
- [MCP Integration](/guide/agent/mcp) - Connect to MCP servers
- [Prompt Engineering](/guide/agent/prompts) - Write better prompts

### See More Examples

- [Agent Examples](/examples/agent/) - Travel, customer service, coding assistants
- [Task Examples](/examples/task/) - Monorepo setup, feature development
- [Complete Projects](/examples/projects/) - Full applications built with DPML

## Troubleshooting

### "Command not found: dpml"

Make sure you installed globally:

```bash
npm install -g dpml
```

Or use npx:

```bash
npx dpml agent chat travel-assistant.dpml
```

### "API key not found"

Check your `.env` file:

```bash
# Make sure this file exists and contains your key
cat .env
```

### "Invalid DPML syntax"

Validate your DPML file:

```bash
dpml validate travel-assistant.dpml
```

## Getting Help

- [Documentation](/guide/) - Full guide
- [GitHub Issues](https://github.com/Deepractice/DPML/issues) - Report bugs
- [Discussions](https://github.com/Deepractice/DPML/discussions) - Ask questions
