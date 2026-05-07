import { CookieOptions } from 'express'

export const ACCESS_COOKIE_NAME = 'accessToken'
export const REFRESH_COOKIE_NAME = 'refreshToken'

const isProd = process.env.NODE_ENV === 'production'

/**
 * Access token cookie - sent on every request to any path.
 * Short-lived (matches JWT expiry).
 */
export const accessCookieOptions = (maxAgeMs: number): CookieOptions => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'strict' : 'lax',
  path: '/',
  maxAge: maxAgeMs,
})

/**
 * Refresh token cookie - scoped to the auth refresh path so it isn't
 * sent on every API call. Long-lived.
 */
export const refreshCookieOptions = (maxAgeMs: number): CookieOptions => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'strict' : 'lax',
  // NOTE: must match the path used in res.clearCookie() at logout
  path: '/auth/refresh',
  maxAge: maxAgeMs,
})

/**
 * Used at logout - clearCookie must receive the same path/sameSite/secure
 * the cookie was set with, otherwise the browser ignores the clear.
 */
export const clearAccessCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'strict' : 'lax',
  path: '/',
})

export const clearRefreshCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'strict' : 'lax',
  path: '/auth/refresh',
})
