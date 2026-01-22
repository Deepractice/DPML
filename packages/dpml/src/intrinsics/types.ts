/**
 * Intrinsic Types - Type definitions for built-in elements
 */

/**
 * Resource reference information extracted from <resource> elements
 */
export interface ResourceInfo {
  /** Original src attribute value */
  src: string | undefined;
  /** Detected protocol type: 'arp', 'rxl', or 'unknown' */
  protocol: 'arp' | 'rxl' | 'unknown';
  /** Reference to the original DPMLNode */
  node: unknown;
}

/**
 * Result type that includes extracted resources
 */
export interface ResourceResult {
  /** Extracted resource references */
  resources: ResourceInfo[];
  /** Other properties from the processing result */
  [key: string]: unknown;
}
