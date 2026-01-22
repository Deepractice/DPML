/**
 * Schema Steps - Step definitions for schema definition scenarios
 */

import { When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'assert';
import { defineSchema } from 'dpml';
import type { DPMLWorld } from '../support/world';

// ============================================
// When Steps
// ============================================

When('defining a schema:', function (this: DPMLWorld, docString: string) {
  try {
    const definition = JSON.parse(docString);
    this.schema = defineSchema(definition);
    this.schemaDefinition = definition;
    this.lastError = null;
  } catch (error) {
    this.lastError = error as Error;
    this.schema = null;
  }
});

When(
  'defining a schema value {string}',
  function (this: DPMLWorld, value: string) {
    try {
      this.schema = defineSchema(value as any);
      this.lastError = null;
    } catch (error) {
      this.lastError = error as Error;
      this.schema = null;
    }
  }
);

When('defining a schema value null', function (this: DPMLWorld) {
  try {
    this.schema = defineSchema(null as any);
    this.lastError = null;
  } catch (error) {
    this.lastError = error as Error;
    this.schema = null;
  }
});

// ============================================
// Then Steps
// ============================================

Then('schema definition succeeds', function (this: DPMLWorld) {
  if (this.lastError) {
    throw new Error(`Schema definition failed: ${this.lastError.message}`);
  }
  assert(this.schema !== null, 'Schema should be defined');
});

Then('schema definition fails', function (this: DPMLWorld) {
  assert(this.lastError !== null, 'Schema definition should have failed');
});

Then(
  'schema element name is {string}',
  function (this: DPMLWorld, expectedName: string) {
    assert(this.schemaDefinition, 'Schema definition should exist');
    const def = this.schemaDefinition as any;
    const elementName = def.element || def.root?.element;
    assert(
      elementName === expectedName,
      `Expected element name to be "${expectedName}", got "${elementName}"`
    );
  }
);

Then(
  /^schema has (\d+) attribute definitions?$/,
  function (this: DPMLWorld, expectedCount: string) {
    assert(this.schemaDefinition, 'Schema definition should exist');
    const def = this.schemaDefinition as any;
    const attrCount = def.attributes?.length || 0;
    const expected = parseInt(expectedCount, 10);
    assert(
      attrCount === expected,
      `Expected ${expected} attribute definitions, got ${attrCount}`
    );
  }
);

Then(
  /^schema has (\d+) child element definitions?$/,
  function (this: DPMLWorld, expectedCount: string) {
    assert(this.schemaDefinition, 'Schema definition should exist');
    const def = this.schemaDefinition as any;
    const childCount = def.children?.elements?.length || 0;
    const expected = parseInt(expectedCount, 10);
    assert(
      childCount === expected,
      `Expected ${expected} child element definitions, got ${childCount}`
    );
  }
);
