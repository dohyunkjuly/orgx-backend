import { HttpStatus } from '@nestjs/common'
import { ApiHttpResponse } from '@lib/core'

// ─── User (1xxx) ──────────────────────────────────────
export const USER_NOT_FOUND = new ApiHttpResponse(
  HttpStatus.BAD_REQUEST,
  1000,
  null,
  'User not found',
)

export const EMAIL_ALREADY_REGISTERED = new ApiHttpResponse(
  HttpStatus.CONFLICT,
  1001,
  null,
  'Email already registered',
)

// ─── Auth (2xxx) ──────────────────────────────────────
export const INVALID_CREDENTIALS = new ApiHttpResponse(
  HttpStatus.UNAUTHORIZED,
  2000,
  null,
  'Invalid email or password',
)

export const ACCOUNT_NOT_ACTIVE = new ApiHttpResponse(
  HttpStatus.FORBIDDEN,
  2001,
  null,
  'Account is not active',
)

export const EMAIL_NOT_VERIFIED = new ApiHttpResponse(
  HttpStatus.FORBIDDEN,
  2002,
  null,
  'Email is not verified',
)

export const INVALID_OR_EXPIRED_TOKEN = new ApiHttpResponse(
  HttpStatus.BAD_REQUEST,
  2003,
  null,
  'Token is invalid or expired',
)

export const REFRESH_TOKEN_INVALID = new ApiHttpResponse(
  HttpStatus.UNAUTHORIZED,
  2004,
  null,
  'Refresh token is invalid or expired',
)

export const ACCOUNT_SUSPENDED = new ApiHttpResponse(
  HttpStatus.FORBIDDEN,
  2005,
  null,
  'Account is suspended',
)

export const CURRENT_PASSWORD_INCORRECT = new ApiHttpResponse(
  HttpStatus.BAD_REQUEST,
  2006,
  null,
  'Current password is incorrect',
)

export const ACCOUNT_REJECTED = new ApiHttpResponse(
  HttpStatus.FORBIDDEN,
  2008,
  null,
  'Account application rejected',
)

export const ACCOUNT_PENDING = new ApiHttpResponse(
  HttpStatus.FORBIDDEN,
  2007,
  null,
  'Account is pending admin approval',
)

// ─── Resource (5xxx) ──────────────────────────────────
export const DOC_CATEGORY_NOT_FOUND = new ApiHttpResponse(
  HttpStatus.NOT_FOUND,
  5000,
  null,
  'Document category not found',
)

export const DOC_CATEGORY_NAME_TAKEN = new ApiHttpResponse(
  HttpStatus.CONFLICT,
  5001,
  null,
  'A document category with that name already exists',
)

// ─── Permission (4xxx) ────────────────────────────────
export const FORBIDDEN_ROLE = new ApiHttpResponse(
  HttpStatus.FORBIDDEN,
  4000,
  null,
  'Insufficient role permissions',
)
