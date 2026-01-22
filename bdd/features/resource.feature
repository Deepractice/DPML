@resource
Feature: Resource Element

  As a DPML user
  I want to use <resource> elements to reference external resources
  So that I can modularize and reuse prompt components

  # ============================================
  # Built-in Support Scenarios
  # ============================================

  @builtin
  Scenario: Built-in resource extraction without custom transformer
    Given a schema:
      """json
      {
        "element": "prompt"
      }
      """
    And an identity transformer "passthrough"
    And a DPML instance is created
    When compiling:
      """xml
      <prompt>
        <resource src="arp:text:file://./builtin-test.md"/>
      </prompt>
      """
    Then compilation succeeds
    And resources array has 1 item
    And resource 0 has src "arp:text:file://./builtin-test.md"
    And resource 0 has protocol "arp"

  # ============================================
  # Parsing Scenarios
  # ============================================

  @parse
  Scenario: Parse resource element with src attribute
    Given a schema:
      """json
      {
        "element": "prompt"
      }
      """
    And a transformer "resource-extractor" that extracts resources
    And a DPML instance is created
    When compiling:
      """xml
      <prompt>
        <resource src="arp:text:file://./config.md"/>
      </prompt>
      """
    Then compilation succeeds
    And resources array has 1 item
    And resource 0 has src "arp:text:file://./config.md"

  @parse
  Scenario: Parse multiple resource elements
    Given a schema:
      """json
      {
        "element": "prompt"
      }
      """
    And a transformer "resource-extractor" that extracts resources
    And a DPML instance is created
    When compiling:
      """xml
      <prompt>
        <resource src="arp:text:file://./a.md"/>
        <resource src="localhost/config.text@1.0"/>
      </prompt>
      """
    Then compilation succeeds
    And resources array has 2 items
    And resource 0 has src "arp:text:file://./a.md"
    And resource 1 has src "localhost/config.text@1.0"

  @parse
  Scenario: Parse resource as root element
    Given a schema:
      """json
      {
        "element": "resource",
        "attributes": [
          { "name": "src", "required": true }
        ]
      }
      """
    And a transformer "resource-extractor" that extracts resources
    And a DPML instance is created
    When compiling:
      """xml
      <resource src="arp:text:file://./standalone.md"/>
      """
    Then compilation succeeds
    And resources array has 1 item

  @parse
  Scenario: Parse nested resource elements
    Given a schema:
      """json
      {
        "element": "prompt"
      }
      """
    And a transformer "resource-extractor" that extracts resources
    And a DPML instance is created
    When compiling:
      """xml
      <prompt>
        <section>
          <resource src="arp:text:file://./nested.md"/>
        </section>
      </prompt>
      """
    Then compilation succeeds
    And resources array has 1 item
    And resource 0 has src "arp:text:file://./nested.md"

  # ============================================
  # Protocol Detection Scenarios
  # ============================================

  @protocol
  Scenario: Detect ARP protocol from src
    Given a schema:
      """json
      {
        "element": "prompt"
      }
      """
    And a transformer "resource-extractor" that extracts resources
    And a DPML instance is created
    When compiling:
      """xml
      <prompt>
        <resource src="arp:text:file://./config.md"/>
      </prompt>
      """
    Then compilation succeeds
    And resource 0 has protocol "arp"

  @protocol
  Scenario: Detect RXL protocol from src
    Given a schema:
      """json
      {
        "element": "prompt"
      }
      """
    And a transformer "resource-extractor" that extracts resources
    And a DPML instance is created
    When compiling:
      """xml
      <prompt>
        <resource src="deepractice.ai/sean/prompt.text@1.0"/>
      </prompt>
      """
    Then compilation succeeds
    And resource 0 has protocol "rxl"

  @protocol
  Scenario: Detect RXL protocol for localhost
    Given a schema:
      """json
      {
        "element": "prompt"
      }
      """
    And a transformer "resource-extractor" that extracts resources
    And a DPML instance is created
    When compiling:
      """xml
      <prompt>
        <resource src="localhost/my-config.text@1.0"/>
      </prompt>
      """
    Then compilation succeeds
    And resource 0 has protocol "rxl"

  @protocol
  Scenario: Unknown protocol for invalid src
    Given a schema:
      """json
      {
        "element": "prompt"
      }
      """
    And a transformer "resource-extractor" that extracts resources
    And a DPML instance is created
    When compiling:
      """xml
      <prompt>
        <resource src="invalid-format"/>
      </prompt>
      """
    Then compilation succeeds
    And resource 0 has protocol "unknown"

  # ============================================
  # Tolerance Scenarios (HTML-like behavior)
  # ============================================

  @tolerance
  Scenario: Accept empty src attribute
    Given a schema:
      """json
      {
        "element": "prompt"
      }
      """
    And a transformer "resource-extractor" that extracts resources
    And a DPML instance is created
    When compiling:
      """xml
      <prompt>
        <resource src=""/>
      </prompt>
      """
    Then compilation succeeds
    And resources array has 1 item
    And resource 0 has src ""
    And resource 0 has protocol "unknown"

  @tolerance
  Scenario: Accept arbitrary src content
    Given a schema:
      """json
      {
        "element": "prompt"
      }
      """
    And a transformer "resource-extractor" that extracts resources
    And a DPML instance is created
    When compiling:
      """xml
      <prompt>
        <resource src="this is not a valid url at all!!!"/>
      </prompt>
      """
    Then compilation succeeds
    And resources array has 1 item
    And resource 0 has src "this is not a valid url at all!!!"
    And resource 0 has protocol "unknown"

  # ============================================
  # Error Scenarios
  # ============================================

  @error
  Scenario: Resource without src attribute
    Given a schema:
      """json
      {
        "element": "prompt"
      }
      """
    And a transformer "resource-extractor" that extracts resources
    And a DPML instance is created
    When compiling:
      """xml
      <prompt>
        <resource/>
      </prompt>
      """
    Then compilation succeeds
    And resources array has 1 item
    And resource 0 has no src

  # ============================================
  # Mixed Content Scenarios
  # ============================================

  @mixed
  Scenario: Resource elements mixed with other content
    Given a schema:
      """json
      {
        "element": "prompt"
      }
      """
    And a transformer "resource-extractor" that extracts resources
    And a DPML instance is created
    When compiling:
      """xml
      <prompt>
        Some text before
        <resource src="arp:text:file://./a.md"/>
        Some text between
        <resource src="localhost/b.text@1.0"/>
        Some text after
      </prompt>
      """
    Then compilation succeeds
    And resources array has 2 items
