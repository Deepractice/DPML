@compile
Feature: DPML Compilation

  As a DPML user
  I want to compile DPML documents
  So that I can transform structured prompt definitions into target formats

  # ============================================
  # Normal Scenarios
  # ============================================

  @smoke
  Scenario: Compile simple document
    Given a schema:
      """json
      {
        "element": "prompt"
      }
      """
    And a transformer "simple" that returns document content
    And a DPML instance is created
    When compiling:
      """xml
      <prompt>Hello World</prompt>
      """
    Then compilation succeeds

  Scenario: Compile document with attributes
    Given a schema:
      """json
      {
        "element": "prompt",
        "attributes": [
          { "name": "role", "required": true }
        ]
      }
      """
    And a transformer "attr-extractor" that extracts attributes
    And a DPML instance is created
    When compiling:
      """xml
      <prompt role="assistant">Hello</prompt>
      """
    Then compilation succeeds
    And result has attribute "role" with value "assistant"

  Scenario: Compile document with child elements
    Given a schema:
      """json
      {
        "element": "prompt",
        "children": {
          "elements": [
            { "element": "context" },
            { "element": "instruction" }
          ]
        }
      }
      """
    And a transformer "children-extractor" that extracts children
    And a DPML instance is created
    When compiling:
      """xml
      <prompt>
        <context>You are a helpful assistant</context>
        <instruction>Answer the question</instruction>
      </prompt>
      """
    Then compilation succeeds
    And result has child element "context"
    And result has child element "instruction"

  # ============================================
  # Error Scenarios
  # ============================================

  @error
  Scenario: Compile invalid XML
    Given a schema:
      """json
      {
        "element": "prompt"
      }
      """
    And a transformer "simple" that returns document content
    And a DPML instance is created
    When compiling:
      """xml
      <prompt>Unclosed tag
      """
    Then compilation fails
    And error message contains "标签"

  @error
  Scenario: Compile document missing required attribute
    Given a schema:
      """json
      {
        "element": "prompt",
        "attributes": [
          { "name": "role", "required": true }
        ]
      }
      """
    And a transformer "simple" that returns document content
    And a DPML instance is created
    When compiling:
      """xml
      <prompt>Hello</prompt>
      """
    Then compilation succeeds with validation warnings

  @error
  Scenario: Compile empty content
    Given a schema:
      """json
      {
        "element": "prompt"
      }
      """
    And a transformer "simple" that returns document content
    And a DPML instance is created
    When compiling:
      """
      """
    Then compilation fails
    And error message contains "空"

  Scenario: Chain multiple transformers
    Given a schema:
      """json
      {
        "element": "prompt"
      }
      """
    And a transformer "first" that adds prefix "[PREFIX]"
    And a transformer "second" that adds suffix "[SUFFIX]"
    And a DPML instance is created
    When compiling:
      """xml
      <prompt>Content</prompt>
      """
    Then compilation succeeds
    And result content contains "[PREFIX]"
    And result content contains "[SUFFIX]"
