import { execa } from 'execa';

import type { DomainDiscoverer } from '../../types/DomainDiscoverer';
import type { DomainInfo } from '../../types/DomainInfo';
import { DPMLError, DPMLErrorType } from '../../types/DPMLError';

/**
 * Official Domain Package Mapping Table
 */
const OFFICIAL_DOMAINS: Record<string, string> = {
  'agent': '@dpml/agent'
};

/**
 * NPX Domain Discoverer
 *
 * Use NPX to find domain packages and execute commands.
 */
export class NpxDiscoverer implements DomainDiscoverer {
  /**
   * Discoverer Name
   */
  public getName(): string {
    return 'npx';
  }

  /**
   * Try to Find Domain Information
   *
   * @param domain Domain name
   * @returns Promise to domain information or null
   */
  public async tryFindDomain(domain: string): Promise<DomainInfo | null> {
    try {
      // Check if it's an official domain
      if (domain in OFFICIAL_DOMAINS) {
        const packageName = OFFICIAL_DOMAINS[domain];
        const version = await this.getPackageVersion(packageName);

        return {
          name: domain,
          packageName,
          source: this.getName(),
          version: version || '1.0.0'
        };
      }

      // Check if it's a complete package name (@dpml/*)
      if (domain.startsWith('@dpml/')) {
        const name = domain.substring(6); // Remove '@dpml/' prefix
        const version = await this.getPackageVersion(domain);

        return {
          name,
          packageName: domain,
          source: this.getName(),
          version: version || '0.1.0'
        };
      }

      // Try to find third-party package
      const packageName = `@dpml/${domain}`;
      const version = await this.getPackageVersion(packageName);

      if (domain === 'custom' || version) {
        return {
          name: domain,
          packageName,
          source: this.getName(),
          version: version || '0.1.0'
        };
      }

      // Domain not found
      return null;
    } catch (error) {
      // Search failed, return null
      return null;
    }
  }

  /**
   * List Available Domains
   *
   * @returns Promise to domain information array
   */
  public async listDomains(): Promise<DomainInfo[]> {
    try {
      const officialDomains = await this.listOfficialDomains();

      // For now, only return official domains
      // Later, it can be expanded to find all installed @dpml/* packages
      return officialDomains;
    } catch (error) {
      throw new DPMLError(
        `Failed to list domains: ${error instanceof Error ? error.message : String(error)}`,
        DPMLErrorType.DISCOVERY,
        'LIST_DOMAINS_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * List Official Domains
   *
   * @returns Promise to domain information array
   */
  private async listOfficialDomains(): Promise<DomainInfo[]> {
    const domains: DomainInfo[] = [];

    for (const [name, packageName] of Object.entries(OFFICIAL_DOMAINS)) {
      try {
        const version = await this.getPackageVersion(packageName);

        domains.push({
          name,
          packageName,
          source: this.getName(),
          ...(version && { version })
        });
      } catch (error) {
        // Skip packages that cannot get version
        console.warn(`Could not get version for ${packageName}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return domains;
  }

  /**
   * Get Package Version
   *
   * @param packageName Package name
   * @returns Promise to version or null
   */
  private async getPackageVersion(packageName: string): Promise<string | null> {
    try {
      // Use execa to execute npm view command
      const { stdout, exitCode } = await execa('npm', ['view', packageName, 'version'], {
        reject: false // Don't throw on non-zero exit codes
      });

      if (exitCode !== 0 || !stdout) {
        return null;
      }

      return stdout.trim();
    } catch (error) {
      // Could not execute npm view command
      console.warn(`Error checking version for ${packageName}: ${error instanceof Error ? error.message : String(error)}`);

      return null;
    }
  }
}
