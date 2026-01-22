/**
 * Intrinsic Elements - DPML built-in elements
 *
 * Like HTML has built-in elements (<img>, <a>, <script>),
 * DPML has built-in elements that are recognized regardless of user schema.
 */

import type { ElementSchema } from '../../types';

/**
 * Resource reference information extracted from <resource> elements
 */
export interface ResourceInfo {
  /** Original src attribute value */
  src: string | undefined;
  /** Detected protocol type */
  protocol: 'arp' | 'rxl' | 'unknown';
  /** Reference to the original node */
  node: unknown;
}

/**
 * Built-in intrinsic element definitions
 */
export const INTRINSIC_ELEMENTS: Record<string, ElementSchema> = {
  resource: {
    element: 'resource',
    attributes: [
      { name: 'src', required: false }, // Not enforced at parse time (HTML-like tolerance)
    ],
    content: { type: 'text', required: false },
  },
};

/**
 * Check if a tag name is an intrinsic element
 */
export function isIntrinsicElement(tagName: string): boolean {
  return tagName in INTRINSIC_ELEMENTS;
}

/**
 * Get the schema definition for an intrinsic element
 */
export function getIntrinsicSchema(tagName: string): ElementSchema | null {
  return INTRINSIC_ELEMENTS[tagName] || null;
}

/**
 * Detect protocol from src string
 *
 * @param src - The src attribute value
 * @returns Detected protocol: 'arp', 'rxl', or 'unknown'
 *
 * Detection rules:
 * - Starts with "arp:" → ARP protocol
 * - Matches domain/path pattern → RXL protocol
 * - Otherwise → unknown
 */
export function detectProtocol(
  src: string | undefined
): 'arp' | 'rxl' | 'unknown' {
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
