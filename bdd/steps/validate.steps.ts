/**
 * Validate Steps - Step definitions for validation scenarios
 */

import { When, Then } from "@cucumber/cucumber";
import { strict as assert } from "assert";
import type { DPMLWorld } from "../support/world";

// ============================================
// When Steps
// ============================================

When("validating:", function (this: DPMLWorld, docString: string) {
  assert(this.dpml, "DPML instance must be created before validating");

  try {
    this.lastValidation = this.dpml.validate(docString);
    this.lastError = null;
  } catch (error) {
    this.lastError = error as Error;
    this.lastValidation = null;
  }
});

// ============================================
// Then Steps
// ============================================

Then("validation passes", function (this: DPMLWorld) {
  if (this.lastError) {
    throw new Error(`Validation failed with error: ${this.lastError.message}`);
  }
  assert(this.lastValidation, "Validation result should exist");
  assert(
    this.lastValidation.isValid === true,
    `Validation should pass, but got errors: ${JSON.stringify(this.lastValidation.errors)}`
  );
});

Then("validation has errors", function (this: DPMLWorld) {
  if (this.lastError) {
    // Parse error is also considered a validation failure
    return;
  }
  assert(this.lastValidation, "Validation result should exist");
  assert(
    this.lastValidation.isValid === false || this.lastValidation.errors.length > 0,
    "Validation should have errors"
  );
});

Then("validation fails due to parse error", function (this: DPMLWorld) {
  assert(this.lastError !== null, "Should have a parse error");
});

Then(
  "validation error contains {string}",
  function (this: DPMLWorld, expectedText: string) {
    if (this.lastError) {
      assert(
        this.lastError.message.toLowerCase().includes(expectedText.toLowerCase()),
        `Expected error to contain "${expectedText}", got "${this.lastError.message}"`
      );
      return;
    }

    assert(this.lastValidation, "Validation result should exist");
    const errorMessages = this.lastValidation.errors.map((e: any) => e.message).join(" ");
    assert(
      errorMessages.toLowerCase().includes(expectedText.toLowerCase()),
      `Expected validation errors to contain "${expectedText}", got "${errorMessages}"`
    );
  }
);
