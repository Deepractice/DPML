/**
 * Compile Steps - Step definitions for compilation scenarios
 */

import { Given, When, Then } from "@cucumber/cucumber";
import { strict as assert } from "assert";
import { createDPML, defineSchema, defineTransformer } from "dpml";
import type { DPMLWorld } from "../support/world";

// ============================================
// Given Steps
// ============================================

Given("a schema:", function (this: DPMLWorld, docString: string) {
  this.schemaDefinition = JSON.parse(docString);
  this.schema = defineSchema(this.schemaDefinition as any);
});

Given(
  "a transformer {string} that returns document content",
  function (this: DPMLWorld, name: string) {
    const transformer = defineTransformer({
      name,
      transform: (input: any) => {
        return {
          content:
            input.document?.rootNode?.content ||
            input.document?.rootNode?.textContent,
        };
      },
    });
    this.transformers.push(transformer);
  }
);

Given(
  "a transformer {string} that extracts attributes",
  function (this: DPMLWorld, name: string) {
    const transformer = defineTransformer({
      name,
      transform: (input: any) => {
        const attrsMap = input.document?.rootNode?.attributes;
        const attrs: Record<string, string> = {};
        if (attrsMap instanceof Map) {
          attrsMap.forEach((value: string, key: string) => {
            attrs[key] = value;
          });
        }
        return { attributes: attrs };
      },
    });
    this.transformers.push(transformer);
  }
);

Given(
  "a transformer {string} that extracts children",
  function (this: DPMLWorld, name: string) {
    const transformer = defineTransformer({
      name,
      transform: (input: any) => {
        const children = input.document?.rootNode?.children || [];
        const childMap: Record<string, any> = {};
        for (const child of children) {
          if (child.tagName) {
            childMap[child.tagName] = child;
          }
        }
        return { children: childMap };
      },
    });
    this.transformers.push(transformer);
  }
);

Given(
  "a transformer {string} that adds prefix {string}",
  function (this: DPMLWorld, name: string, prefix: string) {
    const transformer = defineTransformer({
      name,
      transform: (input: any) => {
        const content =
          input.content ||
          input.document?.rootNode?.content ||
          "";
        return {
          ...input,
          content: prefix + content,
        };
      },
    });
    this.transformers.push(transformer);
  }
);

Given(
  "a transformer {string} that adds suffix {string}",
  function (this: DPMLWorld, name: string, suffix: string) {
    const transformer = defineTransformer({
      name,
      transform: (input: any) => {
        const content =
          input.content ||
          input.document?.rootNode?.content ||
          "";
        return {
          ...input,
          content: content + suffix,
        };
      },
    });
    this.transformers.push(transformer);
  }
);

Given("a DPML instance is created", function (this: DPMLWorld) {
  assert(this.schema, "Schema must be defined before creating DPML instance");

  this.dpml = createDPML({
    schema: this.schema,
    transformers: this.transformers,
  });
});

// ============================================
// When Steps
// ============================================

When("compiling:", async function (this: DPMLWorld, docString: string) {
  assert(this.dpml, "DPML instance must be created before compiling");

  try {
    this.lastResult = await this.dpml.compile(docString);
    this.lastError = null;
  } catch (error) {
    this.lastError = error as Error;
    this.lastResult = null;
  }
});

// ============================================
// Then Steps
// ============================================

Then("compilation succeeds", function (this: DPMLWorld) {
  if (this.lastError) {
    throw new Error(`Compilation failed: ${this.lastError.message}`);
  }
  assert(this.lastResult !== null, "Compilation should produce a result");
});

Then("compilation fails", function (this: DPMLWorld) {
  assert(this.lastError !== null, "Compilation should have failed");
});

Then("compilation succeeds with validation warnings", function (this: DPMLWorld) {
  // Compilation itself should not throw
  if (this.lastError) {
    throw new Error(`Compilation failed: ${this.lastError.message}`);
  }
  assert(this.lastResult !== null, "Compilation should produce a result");
  // Note: validation warnings are collected but don't cause failure
});

Then(
  "result has attribute {string} with value {string}",
  function (this: DPMLWorld, attrName: string, expectedValue: string) {
    assert(this.lastResult, "Result should exist");
    const result = this.lastResult as any;
    assert(
      result.attributes?.[attrName] === expectedValue,
      `Expected attribute "${attrName}" to be "${expectedValue}", got "${result.attributes?.[attrName]}"`
    );
  }
);

Then(
  "result has child element {string}",
  function (this: DPMLWorld, childName: string) {
    assert(this.lastResult, "Result should exist");
    const result = this.lastResult as any;
    assert(
      result.children?.[childName],
      `Expected child element "${childName}" to exist`
    );
  }
);

Then(
  "error message contains {string}",
  function (this: DPMLWorld, expectedText: string) {
    assert(this.lastError, "Error should exist");
    assert(
      this.lastError.message.toLowerCase().includes(expectedText.toLowerCase()),
      `Expected error message to contain "${expectedText}", got "${this.lastError.message}"`
    );
  }
);

Then(
  "result content contains {string}",
  function (this: DPMLWorld, expectedText: string) {
    assert(this.lastResult, "Result should exist");
    const result = this.lastResult as any;
    const content = result.content || "";
    assert(
      content.includes(expectedText),
      `Expected content to contain "${expectedText}", got "${content}"`
    );
  }
);
