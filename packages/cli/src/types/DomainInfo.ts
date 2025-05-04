/**
 * Domain Information
 *
 * Contains basic information about the domain and execution information.
 */
export interface DomainInfo {
  /**
   * Domain Name
   */
  readonly name: string;

  /**
   * Package Name
   */
  readonly packageName: string;

  /**
   * Source Identifier, such as "builtin", "npx", etc.
   */
  readonly source: string;

  /**
   * Version Information, Optional
   */
  readonly version?: string;
}
