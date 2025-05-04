import type { DomainExecutor } from '../../types/DomainExecutor';
import type { DomainInfo } from '../../types/DomainInfo';
import { DPMLError, DPMLErrorType } from '../../types/DPMLError';

import { NpxExecutor } from './NpxExecutor';

/**
 * Executor Factory
 *
 * Create appropriate executor instance based on domain information.
 */
export class ExecutorFactory {
  /**
   * Create Executor
   *
   * @param domainInfo Domain Information
   * @returns Domain Executor
   */
  public createExecutor(domainInfo: DomainInfo): DomainExecutor {
    // Select executor type based on source
    switch (domainInfo.source) {
      case 'npx':
        return new NpxExecutor(domainInfo);
      default:
        throw new DPMLError(
          `Unsupported domain source: ${domainInfo.source}`,
          DPMLErrorType.EXECUTION,
          'UNSUPPORTED_DOMAIN_SOURCE'
        );
    }
  }
}
