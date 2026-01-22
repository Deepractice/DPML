/**
 * Resource Transformer - Built-in transformer for extracting <resource> elements
 */

import type { Transformer } from '@dpml/core';
import { defineTransformer } from '../defineTransformer';
import type { ResourceInfo, ResourceResult } from './types';

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
    // Handle both Map and plain object attributes
    let src: string | undefined;
    if (node.attributes instanceof Map) {
      src = node.attributes.get('src');
    } else if (node.attributes && typeof node.attributes === 'object') {
      src = node.attributes.src;
    }

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

/**
 * Built-in resource transformer
 *
 * Extracts all <resource> elements from the document and adds them
 * to the result as a `resources` array.
 */
export const resourceTransformer: Transformer<unknown, ResourceResult> =
  defineTransformer({
    name: 'dpml:resource-extractor',
    description: 'Built-in transformer that extracts <resource> elements',
    transform: (input: any) => {
      const rootNode = input.document?.rootNode;
      const resources = findResourceNodes(rootNode);

      return {
        ...input,
        resources,
      };
    },
  });
