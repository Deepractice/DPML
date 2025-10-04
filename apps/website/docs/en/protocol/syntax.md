# DPML Protocol Specification

**Version**: v1.0
**Status**: Draft
**Date**: October 2025
**Author**: Sean Jiang (Deepractice.ai)

---

## Abstract

DPML (Deepractice Prompt Markup Language) is an XML-based markup language for unified information exchange among computers, AI, and humans in AI systems.

This specification defines the syntax, semantics, and validation rules of DPML. For design rationale, see [DPML Design Whitepaper](../../whitepapers/v1.0/dpml-whitepaper.en.md).

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Syntax Specification](#2-syntax-specification)
3. [Element Specification](#3-element-specification)
4. [Attribute Specification](#4-attribute-specification)
5. [Content Specification](#5-content-specification)
6. [File Format](#6-file-format)
7. [Validation Rules](#7-validation-rules)
8. [Conformance Requirements](#8-conformance-requirements)
9. [IANA Considerations](#9-iana-considerations)
10. [References](#10-references)
11. [Appendices](#appendices)

---

## 1. Introduction

### 1.1 Goals

The DPML protocol aims to:

1. **Define Precise Syntax** - Clarify what constitutes a valid DPML document
2. **Specify Parsing Behavior** - Ensure consistency across different implementations
3. **Maintain Simplicity** - Core concepts ≤ 5
4. **Reserve Extensibility** - Support future evolution

**5 Core Concepts**:

- **Element** - XML tags representing concepts
- **Attribute** - Machine-parsable configuration
- **Content** - Text readable by AI and humans
- **Reserved Attributes (type/id)** - Universal attributes defined at protocol layer
- **File Format (.dpml/.pml)** - Standardized container

### 1.2 Scope

**This specification defines**:
- Core syntax (format rules for elements, attributes, and content)
- Validation rules (format correctness and structural validity)
- Conformance requirements (compatibility guarantees across implementations)

**This specification does NOT define**:
- Domain semantics (specific meanings of `<agent>`, `<task>` are defined by domain specifications)
- Runtime behavior (how elements execute is determined by implementations)
- Advanced extensions (namespaces, version control reserved for future versions)

### 1.3 Terminology

**DPML Document**
A file containing DPML markup, using `.dpml` or `.pml` extension.

**Element**
An XML tag structure representing a concept, consisting of start tag, end tag (or self-closing), and optional attributes and content.

**Attribute**
A key-value pair attached to an element, formatted as `name="value"`.

**Content**
Text data or child elements within an element.

**Reserved Attributes**
Universal attributes defined at the protocol layer: `type` (content format type), `id` (unique identifier).

**Well-Formed**
A document conforming to XML 1.0 syntax rules.

**Valid**
A document that is both well-formed and satisfies DPML validation rules.

**kebab-case**
All lowercase letters with words separated by hyphens (e.g., `travel-planner`).

**Domain**
A specialized application area of DPML (e.g., Agent, Task), defined by independent specifications.

### 1.4 Requirements Language

The key words "MUST", "MUST NOT", "SHOULD", "SHOULD NOT", and "MAY" are interpreted as described in RFC 2119.

### 1.5 Protocol Overview

DPML is a **constrained subset of XML 1.0**:

- **Based on** XML 1.0 specification [XML]
- **Adds** naming conventions, reserved attributes, validation rules
- **Removes** DTD, XML Schema, processing instructions, entities (for simplicity)

**Layered Architecture**:

```
┌─────────────────────────────────────────────┐
│         DPML Protocol (This Spec)           │
│  • Syntax rules                             │
│  • Meta-semantics (tag/attribute/content/   │
│    structure)                               │
│  • Reserved attributes (type/id)            │
│  • Validation rules                         │
└─────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────┐
│      Domain Specifications (Separate Docs)  │
│  • Define specific elements (e.g., <agent>) │
│  • Define domain-specific attributes and    │
│    validation rules                         │
└─────────────────────────────────────────────┘
```

**Conformance Levels**:

- **Level 1: Basic Parser** - Correctly parse well-formed documents, validate kebab-case, recognize reserved attributes
- **Level 2: Validating Parser** - Level 1 + execute complete validation rules
- **Level 3: Domain-Aware Parser** - Level 2 + support validation for at least one domain specification

---

## 2. Syntax Specification

### 2.1 Basic Structure

DPML documents MUST be well-formed XML:

```xml
<element-name attribute-name="attribute-value">
  Content or child elements
</element-name>
```

**ABNF Definition**:

```abnf
dpml-document  = [xml-decl] root-element
root-element   = element
element        = start-tag content end-tag / empty-element
start-tag      = "<" element-name *attribute ">"
end-tag        = "</" element-name ">"
empty-element  = "<" element-name *attribute "/>"
```

### 2.2 Naming Conventions

#### 2.2.1 Element Names

Element names MUST follow **kebab-case**:

**Syntax Rules**:
- All lowercase letters (a-z)
- May contain digits (0-9), but MUST NOT start with a digit
- Words separated by hyphens (-)
- Underscores (_) and camelCase are prohibited

**ABNF Definition**:

```abnf
element-name   = lowercase-word *("-" lowercase-word)
lowercase-word = ALPHA *(ALPHA / DIGIT)
ALPHA          = %x61-7A  ; a-z
DIGIT          = %x30-39  ; 0-9
```

**Valid Examples**:

```xml
<agent>
<travel-planner>
<api-config>
<tool-call-v2>
```

**Invalid Examples**:

```xml
<Agent>           <!-- Uppercase -->
<travelPlanner>   <!-- camelCase -->
<api_config>      <!-- Underscore -->
<2fa-auth>        <!-- Starts with digit -->
```

#### 2.2.2 Attribute Names

Attribute names MUST follow the same **kebab-case** rules as element names.

### 2.3 Character Encoding

DPML documents SHOULD use **UTF-8** encoding.

**Rules**:
- UTF-8 is the recommended encoding; implementations MUST support it
- If using other encodings, an XML declaration MUST be included:
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  ```

### 2.4 Whitespace Handling

**Whitespace Definition**: Space (U+0020), tab (U+0009), line feed (U+000A), carriage return (U+000D)

**Processing Rules**:
- **Element Content**: Protocol layer MUST preserve all whitespace characters (per XML 1.0)
- **Attribute Values**: MUST preserve leading, trailing, and internal whitespace
- **Between Tags**: Formatting whitespace MAY be ignored

---

## 3. Element Specification

### 3.1 Element Structure

#### 3.1.1 Container Elements

```xml
<agent>
  <llm model="gpt-4"/>
  <prompt>You are an assistant</prompt>
</agent>
```

#### 3.1.2 Self-Closing Elements

```xml
<llm model="gpt-4" api-key="sk-xxx"/>
```

#### 3.1.3 Text Content Elements

```xml
<prompt>You are a helpful assistant</prompt>
```

### 3.2 Mixed Content

Mixed content (text + child elements) is syntactically valid:

```xml
<prompt>
  You are an assistant with the following skills:
  <skill>Planning</skill>
  <skill>Analysis</skill>
</prompt>
```

**Processing Rules**:
- Protocol layer: Syntactically legal
- Domain layer: MAY restrict to pure text or pure child elements
- Implementation: MUST preserve the order of text and elements

### 3.3 Protocol Layer Constraints

**Protocol defines**:
- Naming MUST be kebab-case
- SHOULD use consensus concepts

**Protocol does NOT define**:
- Which elements exist (defined by domain specifications)
- Element hierarchy rules
- Required or optional elements
- Element ordering

---

## 4. Attribute Specification

### 4.1 Attribute Syntax

**Basic Format**:

```xml
<element attr1="value1" attr2="value2">
```

**Rules**:
- Attribute names MUST be kebab-case
- Attribute values MUST be quoted (single or double quotes)
- Attribute names MUST NOT be duplicated within the same element
- Attribute order has no semantic significance

**Escape Rules**:
- `<` → `&lt;`
- `>` → `&gt;`
- `&` → `&amp;`
- `"` → `&quot;` (in double-quoted attribute values)
- `'` → `&apos;` (in single-quoted attribute values)

### 4.2 Reserved Attributes

#### 4.2.1 `type` Attribute

**Purpose**: Indicates the format type of element content

**Default Value**: `text`

**Standard Type Values**:

| Type Value | Content Format | Description |
|-----------|---------------|-------------|
| `text` | Plain text | Default, natural language |
| `markdown` | Markdown | Formatted text |
| `json` | JSON | Data structure |
| `javascript` | JavaScript | Code |
| `python` | Python | Code |
| `yaml` | YAML | Data structure |

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
```

**Processing Rules**:
- Implementations MUST recognize the `type` attribute
- Implementations SHOULD support standard type values
- Implementations MAY support custom type values
- Unrecognized type values SHOULD be treated as `text`

#### 4.2.2 `id` Attribute

**Purpose**: Unique identifier for an element

**Syntax Rules**:
- MUST be unique within a single document
- MAY contain letters, digits, hyphens, underscores
- kebab-case is RECOMMENDED

**Example**:

```xml
<prompt id="travel-system-prompt">
  You are a travel planning expert.
</prompt>
```

**Reserved Usage**:
- v1.0: For identification only, does not support references
- Future versions: Will support reference mechanisms

### 4.3 Domain-Specific Attributes

Domains MAY define their own attributes:

```xml
<llm
  model="gpt-4"
  api-key="sk-xxx"
  temperature="0.7"
  max-tokens="2000"
/>
```

**Constraints**:
- MUST follow kebab-case
- All attributes are strings at the protocol layer
- Type interpretation is defined by domain specifications

---

## 5. Content Specification

### 5.1 Content Types

Element content can be:

1. **Text Content** - Natural language or data
2. **Child Elements** - Nested concepts
3. **Mixed Content** - Text + child elements
4. **Empty** - Self-closing elements

### 5.2 Special Characters and Escaping

**Characters that MUST be escaped**:

| Character | Escape Form | Usage Context |
|-----------|------------|---------------|
| `<` | `&lt;` | Always |
| `&` | `&amp;` | Always |
| `>` | `&gt;` | Recommended |

**Code Content Handling**:

For code types such as `type="javascript"`, `type="python"`, CDATA is RECOMMENDED:

```xml
<script type="javascript"><![CDATA[
if (x < 10 && y > 5) {
  console.log("Valid");
}
]]></script>
```

### 5.3 Whitespace Normalization

**Rules**:
- Protocol layer: MUST preserve all whitespace characters
- Domain layer: MAY define normalization rules

---

## 6. File Format

### 6.1 File Extensions

DPML documents MUST use one of the following extensions:

- **`.dpml`** - Primary official extension (RECOMMENDED)
- **`.pml`** - Short alias, fully equivalent

### 6.2 MIME Types

**Primary MIME Type**: `application/dpml+xml`
**Alternative MIME Type**: `text/dpml+xml`

### 6.3 Document Structure

#### 6.3.1 Root Element

DPML documents MUST have exactly one root element.

**Valid**:

```xml
<agent>
  ...
</agent>
```

**Invalid**:

```xml
<agent>...</agent>
<task>...</task>  <!-- Multiple root elements -->
```

#### 6.3.2 XML Declaration

XML declaration is optional:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<agent>
  ...
</agent>
```

**Recommendations**:
- If encoding is not UTF-8, XML declaration MUST be included
- For clarity, it is RECOMMENDED to always include it

#### 6.3.3 Comments

XML comments are supported:

```xml
<!-- This is a comment -->
<agent>
  <!-- Configure LLM -->
  <llm model="gpt-4"/>
</agent>
```

**Rules**:
- Comments MAY appear between elements
- Comments MUST NOT appear inside tags
- Comments MUST NOT be nested
- Comment content MUST NOT contain `--`

### 6.4 Minimal Document

The smallest valid DPML document:

```xml
<agent/>
```

---

## 7. Validation Rules

### 7.1 Well-Formedness

Documents MUST satisfy XML 1.0 well-formedness rules:

1. **Single root element**
2. **Properly nested tags**
3. **Properly quoted attribute values**
4. **Properly escaped special characters**

### 7.2 DPML-Specific Rules

#### Rule V1: Naming Conventions

- **V1.1**: All element names MUST be kebab-case
- **V1.2**: All attribute names MUST be kebab-case

#### Rule V2: Reserved Attributes

- **V2.1**: `type` attribute value MUST be non-empty
- **V2.2**: `id` attribute value MUST match pattern `^[a-zA-Z0-9_-]+$`
- **V2.3**: `id` MUST be unique within the document

### 7.3 Error Codes

**Fatal Errors (E Series)**:

| Code | Description |
|------|-------------|
| E01 | File read failure |
| E02 | Malformed XML |

**Validation Errors (V Series)**:

| Code | Description |
|------|-------------|
| V11 | Element name is not kebab-case |
| V12 | Attribute name is not kebab-case |
| V21 | Invalid type attribute value |
| V22 | Invalid id attribute value format |
| V23 | Duplicate id |

**Warnings (W Series)**:

| Code | Description |
|------|-------------|
| W01 | Unknown type value |
| W02 | UTF-8 encoding recommended |

### 7.4 Error Report Format

Implementations SHOULD provide structured error reports:

```json
{
  "valid": false,
  "errors": [
    {
      "code": "V11",
      "level": "error",
      "message": "Element name 'TravelPlanner' is not kebab-case",
      "location": {
        "line": 5,
        "column": 3
      },
      "suggestion": "Use 'travel-planner'"
    }
  ]
}
```

---

## 8. Conformance Requirements

### 8.1 MUST Implement

All implementations MUST:

1. Correctly parse well-formed DPML documents
2. Support UTF-8 encoding
3. Validate kebab-case naming conventions
4. Recognize reserved attributes (type, id)
5. Report specified error codes

### 8.2 SHOULD Implement

Implementations SHOULD:

1. Support standard type values (text/markdown/json/javascript/python/yaml)
2. Provide DOM API
3. Support independent validation functionality

### 8.3 Extension Mechanisms

#### 8.3.1 Custom Elements

Domain specifications MAY define custom elements, but MUST follow kebab-case.

#### 8.3.2 Custom Attributes

Domain specifications MAY define custom attributes, but:
- MUST follow kebab-case
- MUST NOT conflict with reserved attributes (type, id)
- SHOULD use `x-` prefix for experimental attributes

#### 8.3.3 Custom Type Values

Implementations MAY support custom type values:

```xml
<code type="rust">
fn main() {
    println!("Hello, world!");
}
</code>
```

**Processing Rules**:
- Unrecognized type values SHOULD be treated as `text`
- SHOULD log warning W01
- SHOULD NOT cause validation failure

### 8.4 Version Compatibility

DPML v1.0 documents MUST remain valid in future versions.

**Rules**:
- All v1.0 syntax remains valid in v2.0+
- New versions MAY add new features but MUST NOT break old syntax
- When version declaration is absent, v1.0 SHOULD be assumed

### 8.5 Security Requirements

Implementations MUST follow XML 1.0 security best practices:

- **MUST disable** DTD and external entities (prevent XXE attacks)
- **MUST disable** entity expansion (prevent billion laughs attacks)
- **MUST default to disabled** code execution (`type="javascript"` / `type="python"`)

---

## 9. IANA Considerations

### 9.1 Media Type Registration

**Type Name**: application
**Subtype Name**: dpml+xml
**Required Parameters**: None
**Optional Parameters**: charset (default UTF-8)

**Security Considerations**: Implementations MUST disable DTD and external entities, and default to disabled code execution.

**Published Specification**: This document

**Applications Using This Media Type**: AI development tools, prompt engineering platforms, agent configuration systems, workflow orchestration engines

**File Extensions**: `.dpml`, `.pml`

**Contact**: Sean Jiang <sean@deepractice.ai>

**Intended Usage**: COMMON

**Author/Change Controller**: Deepractice.ai

---

## 10. References

### 10.1 Normative References

**[XML]**
Bray, T., et al.,
"Extensible Markup Language (XML) 1.0 (Fifth Edition)",
W3C Recommendation, November 2008.
https://www.w3.org/TR/xml/

**[RFC2119]**
Bradner, S.,
"Key words for use in RFCs to Indicate Requirement Levels",
BCP 14, RFC 2119, March 1997.
https://www.rfc-editor.org/rfc/rfc2119

### 10.2 Informative References

**[DPML-WHITEPAPER]**
Jiang, S.,
"DPML Design Whitepaper",
Deepractice.ai, October 2025.
../../whitepapers/v1.0/dpml-whitepaper.en.md

---

## Appendices

### Appendix A: Complete Examples

#### A.1 Simple Agent

```xml
<agent>
  <llm model="gpt-4" api-key="sk-xxx"/>
  <prompt>You are a helpful programming assistant.</prompt>
</agent>
```

#### A.2 Agent with Markdown Prompt

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
- Write clear, documented code
- Explain your reasoning
- Provide working examples
  </prompt>
</agent>
```

#### A.3 Agent with JSON Configuration

```xml
<?xml version="1.0" encoding="UTF-8"?>
<agent>
  <llm model="gpt-4" api-key="sk-xxx"/>

  <prompt id="system">
    You are a Zhangjiajie travel planning expert.
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

#### A.4 Multi-Layer Structure

```xml
<agent>
  <llm model="gpt-4" api-key="sk-xxx"/>

  <role>
    <personality type="markdown">
I am an empathetic assistant with strong analytical abilities.
When users feel frustrated, I first acknowledge their feelings.
When users are confused, I explain step by step in detail.
    </personality>

    <principle>
Always prioritize user experience over technical correctness.
Use analogies and examples to explain complex concepts.
    </principle>
  </role>
</agent>
```

---

### Appendix B: Complete ABNF Grammar

```abnf
; DPML Document
dpml-document  = [xml-decl] root-element

; XML Declaration
xml-decl       = "<?xml" WSP "version" WSP "=" WSP quoted-string
                 [WSP "encoding" WSP "=" WSP quoted-string] WSP "?>"

; Root Element
root-element   = element

; Element
element        = empty-element / start-tag content end-tag
empty-element  = "<" element-name *attribute WSP "/>"
start-tag      = "<" element-name *attribute ">"
end-tag        = "</" element-name ">"

; Element Name (kebab-case)
element-name   = lowercase-word *("-" lowercase-word)
lowercase-word = ALPHA *(ALPHA / DIGIT)

; Attribute
attribute      = WSP attribute-name "=" quoted-string
attribute-name = lowercase-word *("-" lowercase-word)

; Content
content        = *(text / element / comment / cdata)

; Text
text           = 1*CHAR  ; Exclude < and &, or use escapes

; Comment
comment        = "<!--" *(CHAR - "--") "-->"

; CDATA
cdata          = "<![CDATA[" *(CHAR - "]]>") "]]>"

; Quoted String
quoted-string  = DQUOTE *QCHAR DQUOTE / SQUOTE *QCHAR SQUOTE

; Basic Characters
ALPHA          = %x61-7A  ; a-z
DIGIT          = %x30-39  ; 0-9
CHAR           = %x09 / %x0A / %x0D / %x20-D7FF / %xE000-FFFD
WSP            = %x20 / %x09 / %x0A / %x0D
DQUOTE         = %x22
SQUOTE         = %x27
```

---

## Author Address

**Sean Jiang**
Deepractice.ai
Email: sean@deepractice.ai
Website: https://deepractice.ai

---

**DPML Protocol Specification v1.0**
