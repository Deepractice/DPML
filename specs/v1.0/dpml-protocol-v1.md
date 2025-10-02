# DPML Protocol Specification v1.0

**Status**: Draft  
**Date**: October 2025  
**Authors**: Sean Jiang (Deepractice.ai)

---

## Abstract

This document defines the Deepractice Prompt Markup Language (DPML) Protocol version 1.0.

DPML is a **three-party prompt protocol** that uses structured information to enable computers, AI, and humans to collaborate on the same document:

- **Prompt for Computers**: Attributes drive configuration and execution
- **Prompt for AI**: Content drives understanding and reasoning
- **Prompt for Humans**: Structure enables observation and control

Traditional prompts serve only AI. DPML recognizes that modern AI systems require three distinct types of prompts—instructions for machines, context for AI, and visibility for humans—unified in a single structured document.

XML's unique combination of attributes (machine semantics), content (AI semantics), and DOM structure (human observability) makes it the only format capable of serving all three stakeholders simultaneously.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Design Philosophy: The Three-Party Prompt Protocol](#2-design-philosophy-the-three-party-prompt-protocol)
3. [Terminology](#3-terminology)
4. [Design Principles](#4-design-principles)
5. [Protocol Overview](#5-protocol-overview)
6. [Syntax Specification](#6-syntax-specification)
7. [Element Specification](#7-element-specification)
8. [Attribute Specification](#8-attribute-specification)
9. [Content Specification](#9-content-specification)
10. [File Format](#10-file-format)
11. [Validation Rules](#11-validation-rules)
12. [Security Considerations](#12-security-considerations)
13. [IANA Considerations](#13-iana-considerations)
14. [References](#14-references)
15. [Appendix A: Complete Examples](#appendix-a-complete-examples)
16. [Appendix B: ABNF Grammar](#appendix-b-abnf-grammar)
17. [Appendix C: Why XML vs YAML/JSON](#appendix-c-why-xml-vs-yamljson)

---

## 1. Introduction

### 1.1 Motivation

Modern AI systems involve three distinct stakeholders, each requiring different types of information:

- **Computers** need structured configuration to initialize models, register APIs, and manage execution
- **AI** needs natural language instructions to understand roles, principles, and behaviors
- **Humans** need observable structure to audit, debug, and control AI systems

Traditional approaches force these three types of information into incompatible formats:

- Pure text prompts serve AI but are unparseable by computers and unobservable by humans
- YAML/JSON configurations serve computers but create cognitive load for AI and lack visualization structure for humans
- Separate files fragment information, requiring synchronization and increasing maintenance burden

**DPML solves this by recognizing that all three needs are fundamentally "prompts"**—structured information that guides system behavior—and unifying them in a single document.

### 1.2 Goals

The DPML Protocol aims to:

1. **Unify three-party prompts**: Enable computers, AI, and humans to collaborate on the same document
2. **Leverage structured information**: Use XML's multi-dimensional semantics (tag/attribute/content) to separate concerns
3. **Enable observability**: Support real-time visualization and audit trails for AI systems
4. **Maintain simplicity**: Minimize cognitive load while maximizing expressive power

### 1.3 Scope

This specification defines:

- **Core syntax**: Element, attribute, and content structures
- **Meta-semantics**: How concepts are expressed and organized
- **File format**: Document structure and conventions
- **Validation rules**: Well-formedness and structural validity

This specification does NOT define:

- **Domain semantics**: Specific meanings of `<agent>`, `<task>`, etc. (defined in Domain Specifications)
- **Runtime behavior**: How elements are executed or interpreted
- **Extension mechanisms**: Detailed plugin or namespace systems (reserved for future versions)

### 1.4 Requirements Language

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in RFC 2119.

---

## 2. Design Philosophy: The Three-Party Prompt Protocol

### 2.1 Rethinking "Prompt"

**Traditional definition**: A prompt is text given to AI to guide its behavior.

**DPML definition**: A prompt is **structured information that guides system behavior**.

In any AI application, there are actually three systems that need prompting:

| System | Needs to know | Traditional approach | Problem |
|--------|--------------|---------------------|---------|
| **Computer** | Model name, API keys, timeout values | Config files (YAML/JSON) | AI cannot understand, humans see flat structure |
| **AI** | Role, principles, capabilities | Text prompts | Computer cannot parse, humans cannot audit structure |
| **Human** | System purpose, current state, changes | Documentation + logs | Separated from definition, hard to maintain |

DPML's core insight: **These are all prompts, just for different audiences.**

### 2.2 Structured Information as the Foundation

The level of information structure determines how many stakeholders can be served:

```
Unstructured (pure text)
├─ ✓ AI can understand
├─ ✗ Computer cannot parse reliably
└─ ✗ Human cannot observe structure

Semi-structured (YAML/JSON)
├─ ✓ Computer can parse
├─ △ AI needs to process key-value paths
└─ ✗ Human sees flat hierarchy

Multi-dimensional structured (XML)
├─ ✓ Computer: Attributes = configuration
├─ ✓ AI: Content = natural language
└─ ✓ Human: DOM tree = visual structure
```

**Key principle**: Information structure is not overhead—it's the mechanism that enables multi-party collaboration.

### 2.3 How DPML Achieves Three-Party Prompting

A single DPML document is three prompts layered together:

```xml
<agent>
  <!-- Layer 1: Prompting the Computer (Attributes) -->
  <llm model="gpt-4" temperature="0.7" max-tokens="2000"/>

  <!-- Layer 2: Prompting the AI (Content) -->
  <prompt>
    You are a professional travel planning assistant.
    You specialize in creating detailed itineraries and recommending local experiences.
  </prompt>

  <!-- Layer 3: Prompting the Human (Structure + Metadata) -->
  <metadata
    purpose="Travel planning assistant"
    version="2.0"
    last-reviewed="2025-10-01"
    reviewer="Zhang San"/>
</agent>
```

**Processing flow**:

1. **Computer reads** `model="gpt-4"` → Initializes GPT-4 client
2. **Computer reads** `temperature="0.7"` → Configures parameters
3. **AI reads** `You are a professional...` → Understands role
4. **Human sees** DOM structure + metadata → Audits system configuration

**Critical design**: These three layers coexist without interfering with each other.

### 2.4 Why XML is the Only Viable Choice

#### The Semantic Dimension Problem

Different formats have different semantic dimensions:

| Format | Semantic Dimensions | Computer | AI | Human |
|--------|-------------------|----------|-----|--------|
| **YAML** | 2 (key + value) | ✓ Can parse | ✗ Indentation cognitive load | ✗ Flat visualization |
| **JSON** | 2 (key + value) | ✓ Can parse | △ Bracket noise | ✗ Flat visualization |
| **XML** | 4 (tag + attribute + content + structure) | ✓ Mature parsing | ✓ Natural content | ✓ DOM tree |

#### Why YAML Fails

```yaml
# All information is compressed into key-value pairs
agent:
  llm:
    model: gpt-4
    temperature: 0.7
  prompt: |
    You are an assistant
  metadata:
    version: "2.0"
```

Problems:
- AI must understand hierarchical paths (`agent.llm.model`)
- Indentation is semantic (cognitive load for AI)
- All information is at the same conceptual level (machine config + AI instruction mixed)
- No natural "content" space for AI's natural language

#### Why XML Succeeds

```xml
<agent>
  <!-- Attributes: Machine's domain -->
  <llm model="gpt-4" temperature="0.7"/>

  <!-- Content: AI's domain -->
  <prompt>You are an assistant</prompt>

  <!-- Structure: Human's domain -->
  <metadata version="2.0"/>
</agent>
```

Advantages:
- **Tag**: Concept definition (`<prompt>` means "this is a prompt")
- **Attribute**: Machine configuration (key-value pairs for parsers)
- **Content**: AI's natural expression space (no format constraints)
- **Structure**: Human-visible hierarchy (DOM tree)

**This is the only format with sufficient semantic dimensions to serve all three parties.**

### 2.5 Observable AI Systems

Humans need more than "read the config"—they need **real-time observation and control**.

#### Static Definition (Development)
```xml
<agent>
  <llm model="gpt-4"/>
  <prompt>You are an assistant</prompt>
</agent>
```

#### Dynamic State (Runtime)
```xml
<agent status="running" uptime="3600s">
  <llm model="gpt-4" tokens-used="1520" requests="23"/>
  <prompt version="2.0"/>
  <tools>
    <tool name="search" calls="15" avg-latency="120ms"/>
  </tools>
</agent>
```

#### Visualization Rendering

The same XML structure maps directly to UI components:

```
┌─ Agent: Travel Assistant ──────────────┐
│ Status: ⚫ Running (1h)                 │
│ Model:  GPT-4                          │
│ Tokens: 1,520 / 10,000                 │
│                                         │
│ 📝 Prompt (v2.0)                       │
│ You are a professional travel...       │
│                                         │
│ 🛠️ Tools                                │
│ • search      15 calls  120ms avg     │
└─────────────────────────────────────────┘
```

**Key advantage**: DPML's DOM structure makes visualization a natural transformation, not an afterthought.

### 2.6 Core Value Proposition

**DPML is not "XML for prompts".**

**DPML is the first protocol that recognizes:**

1. Modern AI systems require **three types of prompts** (for computers, AI, and humans)
2. These prompts must be **unified** (not scattered across files)
3. Information must be **structurally separated** (attributes ≠ content ≠ structure)
4. AI systems must be **observable** (runtime state + static definition)

**Only XML's multi-dimensional semantics can satisfy all four requirements.**

---

## 3. Terminology

### 3.1 Core Terms

**DPML Document**: A file containing DPML markup, typically with `.dpml` or `.pml` extension.

**Concept**: A semantic unit represented by an element tag. Concepts are consensus terms (e.g., `role`, `agent`, `task`) that carry meaning understandable by both humans and AI without additional explanation.

**Element**: An XML tag structure representing a concept. Elements have opening tags, closing tags (or self-closing), and may contain attributes and content.

**Attribute**: A key-value pair attached to an element, primarily serving machine semantics (parsing, type marking, identification).

**Content**: The text or child elements within an element, serving either AI semantics (natural language) or machine semantics (structured data), depending on context.

**Reserved Attribute**: An attribute defined at the protocol level that all domains can use (currently: `type`, `id`).

**Domain**: A specialized area of DPML with specific element definitions (e.g., Agent Domain, Task Domain).

**Prompt**: In DPML, a prompt is **structured information that guides system behavior**. DPML documents contain three types of prompts simultaneously:
- **Machine Prompt**: Attributes and configuration that drive computer behavior
- **AI Prompt**: Content and instructions that drive AI reasoning
- **Human Prompt**: Structure and metadata that enable human observation and control

### 3.2 Design Principle Terms

**Constrain but not Restrict (约而不束)**: Establish structure and conventions (constrain) without limiting AI's logical flexibility (not restrict).

**Cognitive Load**: The mental effort required to understand and process information, which DPML minimizes through simplicity and consensus concepts.

**Consensus Concept**: A term with widely understood meaning that requires no additional explanation (e.g., `role`, `personality`, `agent`).

**Dual Semantics**: Every syntax element serves both machine semantics (parsing, validation) and AI semantics (understanding, reasoning).

---

## 4. Design Principles

### 4.1 Constrain but not Restrict Principle

**Core Philosophy**: Provide structure and direction without limiting AI's creative and adaptive capabilities.

**What We Constrain**:
- Structure: XML tag system, hierarchy, naming conventions
- Syntax: kebab-case naming, reserved attributes
- Consensus: Use established concepts, not invented terms

**What We Do NOT Restrict**:
- Logic: No if-else control flow within content
- Expression: Natural language freedom in content
- Behavior: Principles over rules, intent over procedures

**Example**:

```xml
<!-- [INVALID] WRONG: Restricting logic -->
<rules>
  <if condition="user_angry">
    <response>I apologize for the inconvenience</response>
  </if>
  <if condition="user_confused">
    <response>Let me explain step by step</response>
  </if>
</rules>

<!-- [VALID] CORRECT: Constraining structure, not logic -->
<personality>
I am an empathetic assistant. When users are upset, I first
address their emotions. When users are confused, I explain
patiently. I maintain professionalism while being friendly.
</personality>
```

### 4.2 Minimize Cognitive Load Principle

**Core Philosophy**: AI's attention is a scarce resource. Complex rules consume cognitive bandwidth.

**Evidence**: Empirical testing shows:
- OpenAPI spec (high cognitive load): 30%+ error rate
- Markdown docs (low cognitive load): <10% error rate
- DPML (minimal cognitive load): <5% error rate

**Strategies**:

1. **Use Consensus Concepts**: Terms like `role`, `agent`, `personality` carry inherent meaning
   ```xml
   <!-- Low entropy: concept = definition -->
   <role>
     <personality>...</personality>
   </role>

   <!-- High entropy: requires explanation -->
   <xuanwu>
     <qiankun>...</qiankun>
   </xuanwu>
   ```

2. **Minimize Core Concepts**: Keep protocol-level concepts under 5
   - Element naming rule: 1 (kebab-case)
   - Reserved attributes: 2 (`type`, `id`)
   - Core structure rules: 2 (XML-based, single root)

3. **Layered Complexity**: Structure (simple) + Content (flexible)

### 4.3 Consensus Concept First Principle

**Core Philosophy**: When defining domain concepts (element names), rigorously select concepts with maximum contemporaneity, precision, semanticity, and connotation.

**The Four Selection Criteria**:

1. **Contemporaneity** (共时性)
   - Widely understood in current era and domain
   - Cross-cultural, cross-linguistic comprehension
   - Not outdated or niche terminology

2. **Precision** (精准性)
   - Clear conceptual boundaries
   - Unambiguous meaning
   - One concept maps to one clear semantic

3. **Semanticity** (语义性)
   - The term itself carries rich semantics
   - No additional explanation required
   - Both AI and humans understand directly

4. **Connotation** (内涵性)
   - Deep theoretical foundation behind the concept
   - Embodies domain best practices
   - Implies structure and relationships

**Information Theory Basis**:

Consensus concepts are **compressed knowledge**:

```
Concept "role" information
├─ Explicit: 4 letters "r-o-l-e"
└─ Implicit information (free):
   ├─ Responsibility framework
   ├─ Capability boundaries
   ├─ Behavioral patterns
   └─ Social relationships

Total entropy: Minimal (concept = definition)
```

Self-invented terms are **high entropy**:

```
Concept "lero" information
├─ Explicit: 4 letters "l-e-r-o"
└─ Implicit information: None
└─ Requires explanation:
   ├─ "What is lero?"
   ├─ "What does lero contain?"
   ├─ "How to use lero?"
   └─ Costs 50-100 words to explain

Total entropy: Extremely high
```

**Token Economics**:

Using consensus concepts saves ~90% token cost:

| Approach | Token Cost | AI Understanding | Information Transfer |
|----------|-----------|------------------|---------------------|
| Consensus (`role`) | ~10 tokens | Immediate, accurate | Complete, clear |
| Self-invented (`lero`) | ~100+ tokens | Requires reasoning | Needs explanation |

**Decision Framework**:

When defining new domain concepts:

```
Step 1: Identify concept need
Step 2: Search for consensus concepts
        ├─ Query domain standard terms
        ├─ Reference authoritative literature
        └─ Consult domain experts
Step 3: Evaluate candidates
        ├─ Contemporaneity: Widely used now?
        ├─ Precision: Clear boundaries?
        ├─ Semanticity: Self-explanatory?
        └─ Connotation: Rich implications?
Step 4: Calculate entropy cost
        └─ How many words needed to explain?
Step 5: Decision
        ├─ All criteria + → Adopt
        ├─ Any criteria - → Reject
        └─ Can't find suitable → Re-examine requirements
```

**Examples**:

[VALID] **Good choices**:
- `role`, `agent`, `personality`, `task`, `principle` - All are consensus concepts with  across criteria

[INVALID] **Poor choices**:
- `lero` - Self-invented, no consensus (Cost: 50+ words to explain)
- `xuanwu` - Culture-specific, not universal (Cost: 30+ words)
- `thing` - Too generic, imprecise (Cost: 20+ words)

**Validation Method**:

A concept is NOT a good consensus concept if:
- Requires >10 words to explain
- AI needs additional context to understand
- Not directly understandable across cultures/languages

**Core Insight**:

> **Consensus concepts = Free prompts**
>
> Choosing the right concept = Choosing information density
>
> Good concepts = Compressed knowledge
>
> Self-invented concepts = Entropy disaster

This principle ensures DPML's **economy** and **efficiency** as a markup language, applying Occam's Razor at the vocabulary level.

### 4.4 Dual Semantics Principle

Every syntax element serves two audiences:

**Machine Semantics**:
- Structured, parseable, validatable
- For: Compilers, validators, tools
- Focus: Correctness, efficiency

**AI Semantics**:
- Conceptual, contextual, inferable
- For: Large language models
- Focus: Understanding, reasoning

**Element Balance**: Equal weight on both semantics
**Attribute Balance**: Heavy on machine semantics, light on AI semantics
**Content Balance**: Determined by `type`

---

## 5. Protocol Overview

### 5.1 Foundation

DPML is a **subset of XML 1.0**, adding specific conventions and constraints:

- **Based on**: XML 1.0 specification
- **Adds**: Naming conventions, reserved attributes, meta-semantic rules
- **Removes**: DTD, XML Schema, Processing Instructions, Entities (for simplicity)

### 5.2 Architecture

```
┌─────────────────────────────────────────────┐
│           DPML Protocol (Meta Layer)        │
│  • Syntax rules                             │
│  • Element/Attribute/Content meta-semantics │
│  • Reserved attributes                      │
│  • File format conventions                  │
└─────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────┐
│        Domain Specifications                │
│  • Agent Domain (conversational AI)         │
│  • Task Domain (state machine tasks)        │
│  • Role Domain (AI personas)                │
│  • Workflow Domain (orchestration)          │
└─────────────────────────────────────────────┘
```

### 5.3 Layer Responsibilities

**Protocol Layer** (this document):
- HOW to define concepts (syntax, structure)
- Meta-semantics (what elements/attributes/content mean in general)
- Validation rules (well-formedness)

**Domain Layer** (separate specifications):
- WHAT concepts exist (specific elements like `<agent>`)
- Domain semantics (what `<agent>` means and requires)
- Domain-specific validation

---

## 6. Syntax Specification

### 6.1 Basic Structure

DPML documents MUST be well-formed XML:

```xml
<concept-name attribute-name="attribute-value">
  content or child elements
</concept-name>
```

### 6.2 Naming Conventions

#### 6.2.1 Element Names

Element names MUST follow **kebab-case**:

- All lowercase letters
- Words separated by hyphens
- No underscores, no camelCase, no PascalCase

**Valid**: `<agent>`, `<travel-planner>`, `<api-config>`
**Invalid**: `<Agent>`, `<travelPlanner>`, `<api_config>`

**Rationale**:
- Consistent with HTML tradition
- Readable for both humans and AI
- Avoids case-sensitivity issues

#### 6.2.2 Attribute Names

Attribute names MUST follow **kebab-case** (same as elements):

**Valid**: `api-key="..."`, `type="..."`, `model-name="..."`
**Invalid**: `apiKey="..."`, `API_KEY="..."`, `ModelName="..."`

### 6.3 Character Encoding

DPML documents SHOULD use UTF-8 encoding. If using other encodings, an XML declaration SHOULD be included:

```xml
<?xml version="1.0" encoding="UTF-8"?>
```

### 6.4 Whitespace

- Whitespace within content is PRESERVED (per XML specification)
- Leading/trailing whitespace handling is determined by Domain specifications
- Whitespace in attribute values is PRESERVED

---

## 7. Element Specification

### 7.1 Elements as Concepts

In DPML, elements represent **concepts** rather than mere structural markers.

**Characteristics of Concepts**:
- **Completeness**: Self-contained semantic units
- **Consensus**: Widely understood terms (not invented)
- **Clarity**: Clear boundaries and composition

**Example**:
```xml
<role>        <!-- Concept: A role definition -->
  <personality>  <!-- Concept: Personality traits -->
    ...
  </personality>
</role>
```

### 7.2 Element Structure

Elements MAY be:

1. **Container elements**: With opening and closing tags
   ```xml
   <agent>
     <llm model="gpt-4"/>
     <prompt>You are an assistant</prompt>
   </agent>
   ```

2. **Self-closing elements**: For leaf concepts
   ```xml
   <llm model="gpt-4" api-key="sk-xxx"/>
   ```

3. **Text-content elements**: With text content only
   ```xml
   <prompt>You are a helpful assistant</prompt>
   ```

### 7.3 Protocol-Level Rules

The protocol defines:
- [VALID] **Naming convention**: kebab-case
- [VALID] **Concept principle**: Use consensus terms

The protocol does NOT define:
- [INVALID] **Specific elements**: What `<agent>`, `<task>` mean (Domain responsibility)
- [INVALID] **Hierarchy rules**: Which elements can contain which (Domain responsibility)
- [INVALID] **Required/optional**: Which elements are mandatory (Domain responsibility)
- [INVALID] **Order**: Element ordering constraints (Domain responsibility)

### 7.4 Mixed Content

Mixed content (text + child elements) is syntactically VALID at protocol level:

```xml
<prompt>
  You are an assistant with these skills:
  <skill>Planning</skill>
  <skill>Analysis</skill>
</prompt>
```

However, most domains will likely accept EITHER text OR child elements, not mixed. Domain specifications MUST clarify their content model.

---

## 8. Attribute Specification

### 8.1 Attribute Semantics

Attributes primarily serve **machine semantics**:
- Type marking (`type="json"`)
- Identification (`id="main-prompt"`)
- Configuration parameters

AI can understand attribute meanings, but attributes are optimized for machine processing.

### 8.2 Attribute Syntax

Attributes follow XML attribute syntax:

```xml
<element attr1="value1" attr2="value2">
```

**Rules**:
- Attribute names MUST be kebab-case
- Attribute values MUST be quoted (single or double quotes)
- Attribute values are ALWAYS strings at protocol level

### 8.3 Reserved Attributes

The protocol defines TWO reserved attributes that all elements MAY use:

#### 8.3.1 `type`

**Purpose**: Indicates the format type of element content
**Values**: `markdown`, `json`, `javascript`, `python`, `yaml`, `text`, or other format identifiers
**Default**: `text` (plain text)

**Machine Semantics**: Tells parser how to process content
**AI Semantics**: Helps AI understand content nature

**Examples**:
```xml
<prompt type="markdown">
# System Prompt
You are an assistant.
</prompt>

<config type="json">
{
  "timeout": 30,
  "retry": 3
}
</config>

<script type="javascript">
function greet(name) {
  return `Hello, ${name}!`;
}
</script>

<!-- Default: plain text -->
<prompt>
You are an assistant.
</prompt>
```

#### 8.3.2 `id`

**Purpose**: Unique identifier for an element
**Values**: String identifier
**Usage**: For future reference mechanisms (though not implemented in v1.0)

**Example**:
```xml
<prompt id="travel-system-prompt">
  You are a travel planning specialist.
</prompt>
```

### 8.4 Domain-Specific Attributes

Domains MAY define their own attributes:

```xml
<!-- Agent Domain might define: -->
<llm
  model="gpt-4"
  api-key="sk-xxx"
  temperature="0.7"
/>
```

These are NOT protocol-level reserved attributes; their semantics are defined by the respective Domain Specification.

### 8.5 Type System

The protocol has NO type system for attribute values:
- All attribute values are strings at protocol level
- Type interpretation is Domain responsibility

**Example**:
```xml
<llm temperature="0.7"/>
```

At protocol level: `temperature` is the string `"0.7"`
At Domain level: Agent Domain interprets `"0.7"` as number 0.7

---

## 9. Content Specification

### 9.1 Content Types

Element content can be:

1. **Text content**: Natural language or data
2. **Child elements**: Nested concepts
3. **Mixed content**: Combination (syntactically valid, semantically domain-dependent)
4. **Empty**: Self-closing elements

### 9.2 Content Semantics by Type

Content semantics depend on `type` attribute:

| type | Machine Semantics | AI Semantics | Use Case |
|-------------|-------------------|--------------|----------|
| `text` (default) | String storage | Natural language understanding | Prompts, descriptions |
| `markdown` | Markdown parsing | Formatted text understanding | Structured prompts, docs |
| `json` | JSON parsing | Data structure understanding | Configuration, parameters |
| `javascript` | Code parsing/execution | Code logic understanding | Executable scripts |
| `python` | Code parsing/execution | Code logic understanding | Executable scripts |
| `yaml` | YAML parsing | Data structure understanding | Configuration |

### 9.3 Whitespace Handling

- Protocol level: All whitespace is PRESERVED (XML standard)
- Domain level: MAY trim or normalize whitespace
- `type` MAY influence handling (e.g., `markdown` preserves newlines)

### 9.4 Special Characters

Use XML escaping for special characters in text content:

**XML Escaping**:
```xml
<prompt>Use &lt;tag&gt; for markup &amp; &quot;quotes&quot;</prompt>
```

**Code Content**:
For code content (with `type="javascript"`, `type="python"`, etc.), special characters like `<`, `>`, `&` can be used directly without escaping, as parsers understand the content type:

```xml
<script type="javascript">
if (x < 10 && y > 5) {
  console.log("Valid");
}
</script>
```

### 9.5 Protocol Responsibility

Protocol defines:
- [VALID] `type` attribute mechanism
- [VALID] XML content rules (whitespace, escaping)

Protocol does NOT define:
- [INVALID] What content SHOULD contain (Domain responsibility)
- [INVALID] Content validation rules (Domain responsibility)
- [INVALID] Content interpretation (Domain responsibility)

---

## 10. File Format

### 10.1 File Extensions

DPML documents MUST use one of these extensions:

- **`.dpml`** - Primary, official extension (RECOMMENDED)
- **`.pml`** - Short alias, fully equivalent

Both extensions are treated identically by parsers.

**Rationale**:
- `.dpml` is explicit and unambiguous
- `.pml` provides convenience without conflict in AI domain

### 10.2 MIME Type

**Primary**: `application/dpml+xml`
**Alternative**: `text/dpml+xml`

The `+xml` suffix indicates XML-based format.

### 10.3 Document Structure

#### 10.3.1 Root Element

A DPML document MUST have exactly ONE root element:

```xml
<!-- [VALID] VALID -->
<agent>
  ...
</agent>

<!-- [INVALID] INVALID: Multiple roots -->
<agent>...</agent>
<task>...</task>
```

The root element can be any concept defined by a Domain Specification.

#### 10.3.2 XML Declaration

XML declaration is OPTIONAL:

```xml
<!-- Recommended if encoding is not UTF-8 -->
<?xml version="1.0" encoding="UTF-8"?>
<agent>
  ...
</agent>

<!-- Also valid -->
<agent>
  ...
</agent>
```

#### 10.3.3 Comments

XML comments are SUPPORTED:

```xml
<!-- This is a comment -->
<agent>
  <!-- Comments can appear anywhere -->
  <llm model="gpt-4"/>
</agent>
```

### 10.4 Minimal Example

The smallest valid DPML document:

```xml
<agent>
  <llm model="gpt-4" api-key="sk-xxx"/>
  <prompt>You are an assistant</prompt>
</agent>
```

### 10.5 Complete Example

A well-formed DPML document with all features:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!-- Travel Planning Assistant -->
<agent>
  <llm
    model="gpt-4"
    api-key="sk-xxx"
  />

  <prompt id="system-prompt" type="markdown">
# Role
You are a Zhangjiajie travel planning specialist.

## Skills
- Recommend attractions
- Plan itineraries
- Suggest accommodations
  </prompt>

  <config type="json">
  {
    "temperature": 0.7,
    "max_tokens": 2000
  }
  </config>
</agent>
```

---

## 11. Validation Rules

### 11.1 Well-Formedness

A DPML document MUST be well-formed XML:

- Tags properly nested and closed
- Attribute values quoted
- Special characters in text content properly escaped
- Exactly one root element

### 11.2 Protocol-Level Validation

Validators MUST check:

1. **Naming conventions**: kebab-case for elements and attributes
2. **Reserved attributes**: `type` and `id` used correctly (if present)
3. **File structure**: Single root element

### 11.3 Domain-Level Validation

Domain specifications define additional validation:

- Required elements
- Allowed child elements
- Attribute requirements
- Content constraints

Protocol-level validators SHOULD allow any well-formed DPML document, leaving domain validation to domain-specific tools.

---

## 12. Security Considerations

### 12.1 Code Injection

Content with `type="javascript"` or `type="python"` contains executable code. Implementations MUST:

- Validate code before execution
- Run code in sandboxed environments
- Respect user consent before executing

### 12.2 Data Sensitivity

Attributes like `api-key` may contain sensitive information. Implementations SHOULD:

- Support secure storage (e.g., environment variables)
- Warn against hardcoding secrets
- Provide key management best practices

### 12.3 XML Security

DPML inherits XML security considerations:

- **XXE attacks**: Disable external entity processing
- **Billion laughs**: Limit entity expansion
- **DTD attacks**: DTDs are not supported in DPML v1.0

### 12.4 Content Trust

AI-generated or user-provided DPML documents should be validated and reviewed before execution in production environments.

---

## 13. IANA Considerations

### 13.1 Media Type Registration

**Type name**: application
**Subtype name**: dpml+xml
**Required parameters**: None
**Optional parameters**: charset (defaults to UTF-8)
**Encoding considerations**: Same as XML
**Security considerations**: See Section 11
**Interoperability considerations**: Based on XML 1.0
**Published specification**: This document
**Applications that use this media type**: AI development tools, prompt engineering platforms
**Additional information**:
- Magic number(s): Same as XML (`<?xml`)
- File extension(s): `.dpml`, `.pml`
- Macintosh file type code(s): TEXT

### 13.2 File Extension Registration

**Extension**: `.dpml`
**MIME type**: `application/dpml+xml`
**Description**: Deepractice Prompt Markup Language document

**Extension**: `.pml`
**MIME type**: `application/dpml+xml`
**Description**: DPML document (short alias)

---

## 14. References

### 14.1 Normative References

- **[XML]** Extensible Markup Language (XML) 1.0 (Fifth Edition), W3C Recommendation, November 2008.
  https://www.w3.org/TR/xml/

- **[RFC2119]** Bradner, S., "Key words for use in RFCs to Indicate Requirement Levels", BCP 14, RFC 2119, March 1997.
  https://www.rfc-editor.org/rfc/rfc2119

### 14.2 Informative References

- **[RFC7322]** Flanagan, H. and S. Ginoza, "RFC Style Guide", RFC 7322, September 2014.
  https://www.rfc-editor.org/rfc/rfc7322

- **[HTML5]** HTML5 Specification, W3C Recommendation.
  https://www.w3.org/TR/html5/

---

## Appendix A: Complete Examples

### A.1 Simple Agent

```xml
<agent>
  <llm model="gpt-4" api-key="sk-xxx"/>
  <prompt>You are a helpful coding assistant.</prompt>
</agent>
```

### A.2 Agent with Markdown Prompt

```xml
<agent>
  <llm model="gpt-4" api-key="sk-xxx"/>

  <prompt type="markdown">
# Role
You are a Python expert specializing in data science.

## Skills
- Data analysis with pandas
- Visualization with matplotlib
- Machine learning with scikit-learn

## Principles
- Write clean, documented code
- Explain your reasoning
- Provide working examples
  </prompt>
</agent>
```

### A.3 Agent with JSON Configuration

```xml
<?xml version="1.0" encoding="UTF-8"?>
<agent>
  <llm
    model="gpt-4"
    api-key="sk-xxx"
  />

  <prompt id="system">
    You are a travel planning specialist for Zhangjiajie.
  </prompt>

  <config type="json">
  {
    "temperature": 0.7,
    "max_tokens": 2000,
    "top_p": 0.9
  }
  </config>
</agent>
```

### A.4 Multi-Level Structure

```xml
<agent>
  <llm model="gpt-4" api-key="sk-xxx"/>

  <role>
    <personality type="markdown">
I am an empathetic assistant with strong analytical skills.
When users are frustrated, I first acknowledge their feelings.
When users are confused, I break down explanations step by step.
    </personality>

    <principle>
Always prioritize user experience over technical correctness.
Explain complex concepts using analogies and examples.
    </principle>
  </role>
</agent>
```

---

## Appendix B: ABNF Grammar

Simplified ABNF grammar for DPML (based on XML):

```abnf
dpml-document  = [xml-decl] element

xml-decl       = "<?xml" version encoding? "?>"
version        = "version" "=" quoted-string
encoding       = "encoding" "=" quoted-string

element        = start-tag content end-tag / empty-tag

start-tag      = "<" element-name *attribute ">"
end-tag        = "</" element-name ">"
empty-tag      = "<" element-name *attribute "/>"

element-name   = lowercase-word *("-" lowercase-word)
lowercase-word = 1*ALPHA

attribute      = attribute-name "=" quoted-string
attribute-name = lowercase-word *("-" lowercase-word)

content        = *( text / element / comment )

text           = 1*CHAR  ; excluding < and &
comment        = "<!--" *CHAR "-->"

quoted-string  = DQUOTE *CHAR DQUOTE / SQUOTE *CHAR SQUOTE
```

**Note**: This is a simplified representation. Full XML grammar applies.

---

## Appendix C: Why XML vs YAML/JSON

This appendix provides an in-depth comparison of XML, YAML, and JSON formats from the perspective of DPML's three-party prompt protocol design.

### C.1 The Semantic Dimension Problem

The fundamental challenge in designing a three-party protocol is that different stakeholders need different types of information from the same document. The format must provide sufficient **semantic dimensions** to express all three types simultaneously without interference.

#### Semantic Dimensions Comparison

| Format | Semantic Dimensions | Can Express |
|--------|-------------------|-------------|
| **YAML** | 2 (key, value) | Names and data only |
| **JSON** | 2 (key, value) | Names and data only |
| **XML** | 4 (tag, attribute, content, structure) | Concepts, config, content, and hierarchy |

### C.2 Why YAML Fails for Three-Party Prompting

#### Problem 1: Indentation as Semantic

In YAML, indentation carries semantic meaning, creating cognitive load for AI:

```yaml
agent:
  llm:
    model: gpt-4
    temperature: 0.7
  prompt: |
    You are an assistant
```

**AI processing burden**:
- Must count spaces to determine hierarchy (`agent` → `llm` → `model`)
- Indentation errors break structure (2 vs 4 spaces changes meaning)
- AI needs to maintain a "indentation stack" mentally

**XML equivalent (no indentation burden)**:

```xml
<agent>
  <llm model="gpt-4" temperature="0.7"/>
  <prompt>You are an assistant</prompt>
</agent>
```

Indentation is purely for human readability; structure is explicit in tags.

#### Problem 2: No Distinct Content Space

YAML has no concept of "content" separate from "value":

```yaml
prompt:
  type: markdown
  content: |
    You are an assistant.
    You specialize in travel planning.
```

The actual prompt content is just another `content:` key-value pair. AI sees it as structurally equivalent to `type:`, creating noise.

**XML's content space**:

```xml
<prompt type="markdown">
  You are an assistant.
  You specialize in travel planning.
</prompt>
```

Content lives in its own semantic space, clearly separated from attributes.

#### Problem 3: All Information on Same Plane

In YAML, machine configuration and AI instructions exist at the same conceptual level:

```yaml
agent:
  llm:
    model: gpt-4         # Machine config
    temperature: 0.7     # Machine config
  prompt: |              # AI instruction
    You are an assistant
  metadata:
    version: "2.0"       # Human metadata
```

There's no inherent distinction between `model` (for computers), `prompt` (for AI), and `metadata` (for humans). They're all just keys.

**XML's layered semantics**:

```xml
<agent>
  <!-- Machine domain: Attributes -->
  <llm model="gpt-4" temperature="0.7"/>

  <!-- AI domain: Content -->
  <prompt>You are an assistant</prompt>

  <!-- Human domain: Metadata + Structure -->
  <metadata version="2.0"/>
</agent>
```

Each stakeholder has a dedicated semantic space.

#### Problem 4: Poor Visualization Structure

YAML is inherently flat, making it difficult to render as visual hierarchy:

```yaml
# How do you map this to UI components?
agent:
  llm:
    model: gpt-4
  tools:
    - name: search
      endpoint: /api/search
    - name: calc
```

There's no natural mapping to visual elements (cards, panels, sections).

**XML's DOM maps naturally to UI**:

```xml
<agent>                    → Card: "Agent"
  <llm model="gpt-4"/>     →   Section: "LLM Config"
  <tools>                  →   Section: "Tools"
    <tool name="search"/>  →     Item: "search"
    <tool name="calc"/>    →     Item: "calc"
  </tools>
</agent>
```

Each element is a potential UI component.

### C.3 Why JSON Has the Same Limitations

JSON suffers from similar issues as YAML, despite having explicit brackets:

```json
{
  "agent": {
    "llm": {
      "model": "gpt-4",
      "temperature": 0.7
    },
    "prompt": "You are an assistant",
    "metadata": {
      "version": "2.0"
    }
  }
}
```

**Problems**:
- Only 2 semantic dimensions (key + value)
- No distinct content space (prompt is a string value like any other)
- Bracket and quote noise adds cognitive load
- Same flat hierarchy as YAML

### C.4 Why XML Succeeds

#### Advantage 1: Four Independent Semantic Dimensions

```xml
<concept-name attribute="value">
  content text
</concept-name>
```

**Four dimensions**:
1. **Tag name**: Concept identity (`<prompt>` means "this is a prompt")
2. **Attributes**: Machine configuration (key-value pairs)
3. **Content**: AI's natural expression space
4. **Structure**: Human-visible hierarchy (DOM tree)

#### Advantage 2: Clear Responsibility Separation

| Dimension | Primary Consumer | Secondary Consumer | Example |
|-----------|-----------------|-------------------|---------|
| **Tag** | Human (understanding structure) | Computer & AI (context) | `<prompt>`, `<tool>` |
| **Attribute** | Computer (parsing config) | AI (understanding metadata) | `model="gpt-4"` |
| **Content** | AI (understanding intent) | Human (reading definition) | `You are an assistant` |
| **Structure** | Human (observation) | Computer (validation) | Nesting, hierarchy |

#### Advantage 3: Extensibility Without Restructuring

Adding new information doesn't require changing the document structure:

**YAML**:
```yaml
# Original
prompt:
  type: markdown
  content: You are an assistant

# Adding metadata requires restructuring
prompt:
  type: markdown
  metadata:           # New layer!
    author: Zhang San
    created: 2025-01-01
  content: You are an assistant  # Moved down
```

**XML**:
```xml
<!-- Original -->
<prompt type="markdown">You are an assistant</prompt>

<!-- Adding metadata - no restructuring -->
<prompt type="markdown" author="Zhang San" created="2025-01-01">
  You are an assistant
</prompt>

<!-- Or as child element -->
<prompt type="markdown">
  <metadata author="Zhang San" created="2025-01-01"/>
  You are an assistant
</prompt>
```

#### Advantage 4: Observable AI Systems

XML's DOM structure enables real-time observability:

**Development (static definition)**:
```xml
<agent>
  <llm model="gpt-4"/>
  <prompt>You are an assistant</prompt>
</agent>
```

**Runtime (dynamic state injection)**:
```xml
<agent status="running" uptime="3600s">
  <llm model="gpt-4" tokens-used="1520" requests="23"/>
  <prompt version="2.0"/>
  <tools>
    <tool name="search" calls="15" latency="120ms"/>
  </tools>
</agent>
```

**Visualization (automatic rendering)**:
```
┌─ Agent ──────────────────────┐
│ Status: Running (1h)          │
│ Model:  GPT-4                 │
│ Tokens: 1,520 / 10,000        │
│                                │
│ Tools:                         │
│ • search  15 calls  120ms     │
└────────────────────────────────┘
```

This is difficult to achieve with YAML/JSON's flat structure.

### C.5 Cognitive Load Comparison

From AI's perspective:

**Generating YAML**:
```yaml
agent:
  llm:
    model: gpt-4    # Must maintain indentation level (4 spaces)
  prompt: |         # Must remember to use |
    Content here    # Must indent content correctly
```

AI mental checklist:
- ✗ Count spaces for each level
- ✗ Remember current indentation depth
- ✗ Use `|` for multi-line strings
- ✗ Ensure content indentation matches

**Generating XML**:
```xml
<agent>
  <llm model="gpt-4"/>
  <prompt>
    Content here
  </prompt>
</agent>
```

AI mental checklist:
- ✓ Write `<tag>`
- ✓ Write `</tag>`
- ✓ Indentation doesn't matter

XML's explicit closing tags act as "error detection"—AI knows when a structure is complete.

### C.6 Summary: The Format Decision Matrix

| Requirement | YAML | JSON | XML |
|------------|------|------|-----|
| **Three-party prompts** | ✗ | ✗ | ✓ |
| **Semantic dimensions** | 2 | 2 | 4 |
| **Distinct content space** | ✗ | ✗ | ✓ |
| **Visual hierarchy** | ✗ | ✗ | ✓ |
| **Low AI cognitive load** | ✗ | △ | ✓ |
| **Extensibility** | △ | △ | ✓ |
| **Observability** | ✗ | ✗ | ✓ |

**Conclusion**: XML is not chosen because it's "familiar" or "mature"—it's chosen because it's the **only format with sufficient semantic dimensions** to serve computers, AI, and humans simultaneously.

DPML's three-party protocol fundamentally requires four semantic spaces (tag/attribute/content/structure), and only XML provides them.

---

## Authors' Addresses

**Sean Jiang**
Deepractice.ai
Email: sean@deepractice.ai
Website: https://deepractice.ai

---

**End of DPML Protocol Specification v1.0**
