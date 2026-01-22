@parse
Feature: DPML Parsing

  As a DPML user
  I want to parse DPML documents
  So that I can get a structured representation of the document

  # ============================================
  # Normal Scenarios
  # ============================================

  @smoke
  Scenario: Parse simple document
    Given a schema:
      """json
      {
        "element": "prompt"
      }
      """
    And a DPML instance is created
    When parsing:
      """xml
      <prompt>Hello World</prompt>
      """
    Then parsing succeeds
    And document root element is "prompt"

  Scenario: Parse document with attributes
    Given a schema:
      """json
      {
        "element": "prompt"
      }
      """
    And a DPML instance is created
    When parsing:
      """xml
      <prompt role="assistant" temperature="0.7">Hello</prompt>
      """
    Then parsing succeeds
    And root element attribute "role" is "assistant"
    And root element attribute "temperature" is "0.7"

  Scenario: Parse nested structure
    Given a schema:
      """json
      {
        "element": "prompt"
      }
      """
    And a DPML instance is created
    When parsing:
      """xml
      <prompt>
        <context>Background info</context>
        <instruction>Execute command</instruction>
      </prompt>
      """
    Then parsing succeeds
    And root element has 2 child

  Scenario: Parse document with text content
    Given a schema:
      """json
      {
        "element": "prompt"
      }
      """
    And a DPML instance is created
    When parsing:
      """xml
      <prompt>This is text content</prompt>
      """
    Then parsing succeeds
    And root element text content is "This is text content"

  Scenario: Parse mixed content
    Given a schema:
      """json
      {
        "element": "prompt"
      }
      """
    And a DPML instance is created
    When parsing:
      """xml
      <prompt>
        Prefix text
        <emphasis>Important</emphasis>
        Suffix text
      </prompt>
      """
    Then parsing succeeds
    And root element has 1 child

  # ============================================
  # Error Scenarios
  # ============================================

  @error
  Scenario: Parse invalid XML - unclosed tag
    Given a schema:
      """json
      {
        "element": "prompt"
      }
      """
    And a DPML instance is created
    When parsing:
      """xml
      <prompt>Unclosed
      """
    Then parsing fails
    And error message contains "标签"

  @error
  Scenario: Parse invalid XML - mismatched tags
    Given a schema:
      """json
      {
        "element": "prompt"
      }
      """
    And a DPML instance is created
    When parsing:
      """xml
      <prompt>Content</wrong>
      """
    Then parsing fails

  @error
  Scenario: Parse empty content
    Given a schema:
      """json
      {
        "element": "prompt"
      }
      """
    And a DPML instance is created
    When parsing:
      """
      """
    Then parsing fails

  @error
  Scenario: Parse plain text (non-XML)
    Given a schema:
      """json
      {
        "element": "prompt"
      }
      """
    And a DPML instance is created
    When parsing:
      """
      This is not XML content
      """
    Then parsing fails
