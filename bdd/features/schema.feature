@schema
Feature: Schema Definition

  As a DPML user
  I want to define schemas to constrain document structure
  So that I can ensure documents conform to expected formats

  # ============================================
  # Normal Scenarios
  # ============================================

  @smoke
  Scenario: Define simple ElementSchema
    When defining a schema:
      """json
      {
        "element": "prompt"
      }
      """
    Then schema definition succeeds
    And schema element name is "prompt"

  Scenario: Define schema with attributes
    When defining a schema:
      """json
      {
        "element": "prompt",
        "attributes": [
          { "name": "role", "required": true },
          { "name": "temperature", "type": "string" }
        ]
      }
      """
    Then schema definition succeeds
    And schema has 2 attribute definitions

  Scenario: Define schema with children
    When defining a schema:
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
    Then schema definition succeeds
    And schema has 2 child element definitions

  Scenario: Define schema with content constraints
    When defining a schema:
      """json
      {
        "element": "prompt",
        "content": {
          "type": "text",
          "required": true
        }
      }
      """
    Then schema definition succeeds

  Scenario: Define DocumentSchema format
    When defining a schema:
      """json
      {
        "root": {
          "element": "prompt"
        },
        "types": [
          { "element": "context" },
          { "element": "instruction" }
        ]
      }
      """
    Then schema definition succeeds

  # ============================================
  # Error Scenarios
  # ============================================

  @error
  Scenario: Define schema missing element
    When defining a schema:
      """json
      {
        "attributes": []
      }
      """
    Then schema definition fails
    And error message contains "element"

  @error
  Scenario: Define non-object schema
    When defining a schema value "not an object"
    Then schema definition fails

  @error
  Scenario: Define null schema
    When defining a schema value null
    Then schema definition fails
