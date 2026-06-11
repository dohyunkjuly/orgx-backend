import { WsErrorCode } from '../codes/ws-error-code'

/**
 * Throwable wrapper around a WsErrorCode.
 *
 * Usage:
 *   throw new WsError(WS_NOTIFICATION_NOT_FOUND)
 *
 * Gateway handlers catch it and return WsResponse.fail(err.error).
 */
export class WsError extends Error {
  constructor(public readonly error: WsErrorCode) {
    super(error.message)
    this.name = 'WsError'
  }
}
