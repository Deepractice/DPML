/**
 * DPML Error Type
 */
export enum DPMLErrorType {
  /**
   * Command Error
   */
  COMMAND = 'COMMAND',

  /**
   * Domain Discovery Error
   */
  DISCOVERY = 'DISCOVERY',

  /**
   * Execution Error
   */
  EXECUTION = 'EXECUTION',

  /**
   * Configuration Error
   */
  CONFIG = 'CONFIG',

  /**
   * Unknown Error
   */
  UNKNOWN = 'UNKNOWN'
}

/**
 * DPML Error
 *
 * Unified error class for handling all errors in DPML CLI.
 */
export class DPMLError extends Error {
  /**
   * Error Type
   */
  readonly type: DPMLErrorType;

  /**
   * Error Code
   */
  readonly code: string;

  /**
   * Original Error
   */
  readonly cause?: Error;

  /**
   * Create DPML Error
   *
   * @param message Error message
   * @param type Error type
   * @param code Error code
   * @param cause Original error
   */
  constructor(
    message: string,
    type: DPMLErrorType = DPMLErrorType.UNKNOWN,
    code: string = 'DPML_ERROR',
    cause?: Error
  ) {
    super(message);
    this.name = 'DPMLError';
    this.type = type;
    this.code = code;
    this.cause = cause;
  }
}
