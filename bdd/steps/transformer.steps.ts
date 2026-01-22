/**
 * Transformer Steps - Step definitions for transformer definition scenarios
 */

import { When, Then } from "@cucumber/cucumber";
import { strict as assert } from "assert";
import { defineTransformer } from "dpml";
import type { DPMLWorld } from "../support/world";

// ============================================
// When Steps
// ============================================

When("defining a transformer:", function (this: DPMLWorld, docString: string) {
  try {
    const definition = JSON.parse(docString);
    // Add a default transform function if not provided in JSON
    const fullDefinition = {
      ...definition,
      transform: definition.transform || ((input: any) => input),
    };
    const transformer = defineTransformer(fullDefinition);
    this.transformers.push(transformer);
    this.transformerDefinitions.set(definition.name || "", definition);
    this.lastError = null;
  } catch (error) {
    this.lastError = error as Error;
  }
});

When(
  "defining a transformer with only name {string}",
  function (this: DPMLWorld, name: string) {
    try {
      // Deliberately pass incomplete definition (no transform function)
      const transformer = defineTransformer({ name } as any);
      this.transformers.push(transformer);
      this.lastError = null;
    } catch (error) {
      this.lastError = error as Error;
    }
  }
);

// ============================================
// Then Steps
// ============================================

Then("transformer definition succeeds", function (this: DPMLWorld) {
  if (this.lastError) {
    throw new Error(`Transformer definition failed: ${this.lastError.message}`);
  }
  assert(this.transformers.length > 0, "Transformer should be defined");
});

Then("transformer definition fails", function (this: DPMLWorld) {
  assert(this.lastError !== null, "Transformer definition should have failed");
});

Then(
  "transformer name is {string}",
  function (this: DPMLWorld, expectedName: string) {
    assert(this.transformers.length > 0, "Transformer should exist");
    const transformer = this.transformers[this.transformers.length - 1];
    assert(
      transformer.name === expectedName,
      `Expected transformer name to be "${expectedName}", got "${transformer.name}"`
    );
  }
);

Then(
  "transformer description contains {string}",
  function (this: DPMLWorld, expectedText: string) {
    assert(this.transformers.length > 0, "Transformer should exist");
    const transformer = this.transformers[this.transformers.length - 1];
    assert(
      transformer.description?.includes(expectedText),
      `Expected transformer description to contain "${expectedText}", got "${transformer.description}"`
    );
  }
);
