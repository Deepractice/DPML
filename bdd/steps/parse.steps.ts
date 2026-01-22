/**
 * Parse Steps - Step definitions for parsing scenarios
 */

import { When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'assert';
import type { DPMLWorld } from '../support/world';

// ============================================
// When Steps
// ============================================

When('parsing:', function (this: DPMLWorld, docString: string) {
  assert(this.dpml, 'DPML instance must be created before parsing');

  try {
    this.lastDocument = this.dpml.parse(docString);
    this.lastError = null;
  } catch (error) {
    this.lastError = error as Error;
    this.lastDocument = null;
  }
});

// ============================================
// Then Steps
// ============================================

Then('parsing succeeds', function (this: DPMLWorld) {
  if (this.lastError) {
    throw new Error(`Parsing failed: ${this.lastError.message}`);
  }
  assert(this.lastDocument !== null, 'Parsing should produce a document');
});

Then('parsing fails', function (this: DPMLWorld) {
  assert(this.lastError !== null, 'Parsing should have failed');
});

Then(
  'document root element is {string}',
  function (this: DPMLWorld, expectedTagName: string) {
    assert(this.lastDocument, 'Document should exist');
    const doc = this.lastDocument as any;
    assert(
      doc.rootNode?.tagName === expectedTagName,
      `Expected root element to be "${expectedTagName}", got "${doc.rootNode?.tagName}"`
    );
  }
);

Then(
  'root element attribute {string} is {string}',
  function (this: DPMLWorld, attrName: string, expectedValue: string) {
    assert(this.lastDocument, 'Document should exist');
    const doc = this.lastDocument as any;
    const attrs = doc.rootNode?.attributes;
    let value: string | undefined;
    if (attrs instanceof Map) {
      value = attrs.get(attrName);
    } else if (attrs) {
      value = attrs[attrName];
    }
    assert(
      value === expectedValue,
      `Expected attribute "${attrName}" to be "${expectedValue}", got "${value}"`
    );
  }
);

Then(
  /^root element has (\d+) child(?:ren)?$/,
  function (this: DPMLWorld, expectedCount: string) {
    assert(this.lastDocument, 'Document should exist');
    const doc = this.lastDocument as any;
    const childCount = doc.rootNode?.children?.length || 0;
    const expected = parseInt(expectedCount, 10);
    assert(
      childCount === expected,
      `Expected ${expected} children, got ${childCount}`
    );
  }
);

Then(
  'root element text content is {string}',
  function (this: DPMLWorld, expectedContent: string) {
    assert(this.lastDocument, 'Document should exist');
    const doc = this.lastDocument as any;
    const content = doc.rootNode?.content?.trim() || '';
    assert(
      content === expectedContent,
      `Expected text content to be "${expectedContent}", got "${content}"`
    );
  }
);
