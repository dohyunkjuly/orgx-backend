/**
 * WebSocket error codes. Separate envelope from HTTP (no HTTP status), but the
 * numeric `code` follows the same app-wide scheme: 2xxx auth, 5xxx resource, etc.
 */
export class WsErrorCode {
  constructor(
    public readonly code: number,
    public readonly message: string,
  ) {}
}

// ─── Auth (2xxx) ──────────────────────────────────────
export const WS_UNAUTHORIZED = new WsErrorCode(2009, 'WebSocket authentication failed')

// ─── Resource (5xxx) ──────────────────────────────────
export const WS_NOTIFICATION_NOT_FOUND = new WsErrorCode(5000, 'Notification not found')
