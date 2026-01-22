@transformer
Feature: Transformer Definition

  As a DPML user
  I want to define transformers to convert compilation results
  So that I can transform documents into target formats

  # ============================================
  # Normal Scenarios
  # ============================================

  @smoke
  Scenario: Define simple transformer
    When defining a transformer:
      """json
      {
        "name": "simple",
        "description": "A simple transformer"
      }
      """
    Then transformer definition succeeds
    And transformer name is "simple"

  Scenario: Define transformer with description
    When defining a transformer:
      """json
      {
        "name": "documented",
        "description": "This is a well documented transformer"
      }
      """
    Then transformer definition succeeds
    And transformer description contains "documented"

  # ============================================
  # Error Scenarios
  # ============================================

  @error
  Scenario: Define transformer missing name
    When defining a transformer:
      """json
      {
        "description": "No name provided"
      }
      """
    Then transformer definition fails
    And error message contains "name"

  @error
  Scenario: Define transformer missing transform function
    When defining a transformer with only name "incomplete"
    Then transformer definition fails
    And error message contains "transform"

  @error
  Scenario: Define transformer with empty name
    When defining a transformer:
      """json
      {
        "name": ""
      }
      """
    Then transformer definition fails
