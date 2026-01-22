/**
 * Resource Steps - Step definitions for resource element scenarios
 */

import { Given, Then } from '@cucumber/cucumber';
import { strict as assert } from 'assert';
import { defineTransformer } from 'dpml';
import type { DPMLWorld } from '../support/world';

// ============================================
// Types
// ============================================

interface ResourceInfo {
  src: string | undefined;
  protocol: 'arp' | 'rxl' | 'unknown';
  node: unknown;
}

interface ResourceResult {
  resources: ResourceInfo[];
  [key: string]: unknown;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Detect protocol from src string
 */
function detectProtocol(src: string | undefined): 'arp' | 'rxl' | 'unknown' {
  if (!src || src.trim() === '') {
    return 'unknown';
  }

  // ARP protocol: starts with "arp:"
  if (src.startsWith('arp:')) {
    return 'arp';
  }

  // RXL protocol: domain/path/name.type@version format
  // Examples: "localhost/name.type@1.0", "deepractice.ai/path/name.type@1.0"
  const rxlPattern = /^[\w.-]+\/.+/;
  if (rxlPattern.test(src)) {
    return 'rxl';
  }

  return 'unknown';
}

/**
 * Recursively find all resource nodes in the document tree
 */
function findResourceNodes(node: any): ResourceInfo[] {
  const resources: ResourceInfo[] = [];

  if (!node) {
    return resources;
  }

  // Check if current node is a resource element
  if (node.tagName === 'resource') {
    const src = node.attributes?.get?.('src') ?? node.attributes?.src;
    resources.push({
      src,
      protocol: detectProtocol(src),
      node,
    });
  }

  // Recursively check children
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      resources.push(...findResourceNodes(child));
    }
  }

  return resources;
}

// ============================================
// Given Steps
// ============================================

Given(
  'an identity transformer {string}',
  function (this: DPMLWorld, name: string) {
    // Identity transformer that just passes through the input
    // Used to verify built-in resource transformer works automatically
    const transformer = defineTransformer({
      name,
      transform: (input: any) => input,
    });
    this.transformers.push(transformer);
  }
);

Given(
  'a transformer {string} that extracts resources',
  function (this: DPMLWorld, name: string) {
    const transformer = defineTransformer({
      name,
      transform: (input: any) => {
        const rootNode = input.document?.rootNode;
        const resources = findResourceNodes(rootNode);

        return {
          ...input,
          resources,
        };
      },
    });
    this.transformers.push(transformer);
  }
);

// ============================================
// Then Steps
// ============================================

Then(
  /^resources array has (\d+) items?$/,
  function (this: DPMLWorld, expectedCount: string) {
    assert(this.lastResult, 'Result should exist');
    const result = this.lastResult as ResourceResult;
    const actualCount = result.resources?.length ?? 0;
    const expected = parseInt(expectedCount, 10);
    assert.strictEqual(
      actualCount,
      expected,
      `Expected ${expected} resource(s), got ${actualCount}`
    );
  }
);

Then(
  'resource {int} has src {string}',
  function (this: DPMLWorld, index: number, expectedSrc: string) {
    assert(this.lastResult, 'Result should exist');
    const result = this.lastResult as ResourceResult;
    const resource = result.resources?.[index];
    assert(resource, `Resource at index ${index} should exist`);
    assert.strictEqual(
      resource.src,
      expectedSrc,
      `Expected resource ${index} src to be "${expectedSrc}", got "${resource.src}"`
    );
  }
);

Then(
  'resource {int} has protocol {string}',
  function (this: DPMLWorld, index: number, expectedProtocol: string) {
    assert(this.lastResult, 'Result should exist');
    const result = this.lastResult as ResourceResult;
    const resource = result.resources?.[index];
    assert(resource, `Resource at index ${index} should exist`);
    assert.strictEqual(
      resource.protocol,
      expectedProtocol,
      `Expected resource ${index} protocol to be "${expectedProtocol}", got "${resource.protocol}"`
    );
  }
);

Then('resource {int} has no src', function (this: DPMLWorld, index: number) {
  assert(this.lastResult, 'Result should exist');
  const result = this.lastResult as ResourceResult;
  const resource = result.resources?.[index];
  assert(resource, `Resource at index ${index} should exist`);
  assert(
    resource.src === undefined || resource.src === null,
    `Expected resource ${index} to have no src, got "${resource.src}"`
  );
});
