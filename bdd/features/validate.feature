@validate
Feature: DPML Validation

  As a DPML user
  I want to validate DPML documents against a schema
  So that I can detect issues before compilation

  # ============================================
  # Normal Scenarios
  # ============================================

  @smoke
  Scenario: Validate document matching schema
    Given a schema:
      """json
      {
        "element": "prompt"
      }
      """
    And a DPML instance is created
    When validating:
      """xml
      <prompt>Hello World</prompt>
      """
    Then validation passes

  Scenario: Validate document with required attribute
    Given a schema:
      """json
      {
        "element": "prompt",
        "attributes": [
          { "name": "role", "required": true }
        ]
      }
      """
    And a DPML instance is created
    When validating:
      """xml
      <prompt role="assistant">Hello</prompt>
      """
    Then validation passes

  Scenario: Validate document with optional attribute
    Given a schema:
      """json
      {
        "element": "prompt",
        "attributes": [
          { "name": "role", "required": false }
        ]
      }
      """
    And a DPML instance is created
    When validating:
      """xml
      <prompt>Hello</prompt>
      """
    Then validation passes

  # ============================================
  # Validation Failure Scenarios
  # ============================================

  @error
  Scenario: Validate missing required attribute
    Given a schema:
      """json
      {
        "element": "prompt",
        "attributes": [
          { "name": "role", "required": true }
        ]
      }
      """
    And a DPML instance is created
    When validating:
      """xml
      <prompt>Hello</prompt>
      """
    Then validation has errors
    And validation error contains "role"

  @error
  Scenario: Validate root element mismatch
    Given a schema:
      """json
      {
        "element": "prompt"
      }
      """
    And a DPML instance is created
    When validating:
      """xml
      <other>Hello</other>
      """
    Then validation has errors

  @error
  Scenario: Validate attribute value not in enum
    Given a schema:
      """json
      {
        "element": "prompt",
        "attributes": [
          { "name": "role", "enum": ["user", "assistant", "system"] }
        ]
      }
      """
    And a DPML instance is created
    When validating:
      """xml
      <prompt role="invalid">Hello</prompt>
      """
    Then validation has errors
    And validation error contains "invalid"

  # ============================================
  # Edge Cases
  # ============================================

  Scenario: Validate invalid XML content
    Given a schema:
      """json
      {
        "element": "prompt"
      }
      """
    And a DPML instance is created
    When validating:
      """xml
      <prompt>Unclosed
      """
    Then validation fails due to parse error

  Scenario: Validate empty content
    Given a schema:
      """json
      {
        "element": "prompt"
      }
      """
    And a DPML instance is created
    When validating:
      """
      """
    Then validation fails due to parse error
