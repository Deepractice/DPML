import type { DomainInfo } from './DomainInfo';

/**
 * Domain Discoverer interface
 *
 * Define standard interfaces for discovering DPML domains.
 */
export interface DomainDiscoverer {
  /**
   * Try to Find Domain Information
   * @param domain Domain name
   * @returns Promise to domain information or null
   */
  tryFindDomain(domain: string): Promise<DomainInfo | null>;

  /**
   * List Available Domains
   * @returns Promise to domain information array
   */
  listDomains(): Promise<DomainInfo[]>;

  /**
   * Get Discoverer Name
   * @returns Discoverer name
   */
  getName(): string;
}
