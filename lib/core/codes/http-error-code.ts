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

export const MEMBER_IMPORT_BATCH_NOT_FOUND = new ApiHttpResponse(
  HttpStatus.BAD_REQUEST,
  1002,
  null,
  'Import batch not found or already committed',
)

export const MEMBER_IMPORT_EMPTY_FILE = new ApiHttpResponse(
  HttpStatus.BAD_REQUEST,
  1003,
  null,
  'The uploaded file has no rows to import',
)

export const MEMBER_IMPORT_INVALID_FILE = new ApiHttpResponse(
  HttpStatus.BAD_REQUEST,
  1004,
  null,
  'Could not parse the uploaded file as CSV',
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

export const ACCESS_TOKEN_INVALID = new ApiHttpResponse(
  HttpStatus.UNAUTHORIZED,
  2012,
  null,
  'Access token is missing, invalid, or expired',
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

export const TWO_FACTOR_INVALID_CODE = new ApiHttpResponse(
  HttpStatus.UNAUTHORIZED,
  2009,
  null,
  'Invalid two-factor code',
)

export const TWO_FACTOR_NOT_SET_UP = new ApiHttpResponse(
  HttpStatus.BAD_REQUEST,
  2010,
  null,
  'Two-factor authentication has not been set up',
)

export const TWO_FACTOR_ALREADY_ENABLED = new ApiHttpResponse(
  HttpStatus.CONFLICT,
  2011,
  null,
  'Two-factor authentication is already enabled',
)

// ─── Validation (3xxx) ────────────────────────────────────
export const TRANSACTION_TYPE_CATEGORY_MISMATCH = new ApiHttpResponse(
  HttpStatus.UNPROCESSABLE_ENTITY,
  3001,
  null,
  'Transaction type does not match the category type',
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

export const DOCUMENT_NOT_FOUND = new ApiHttpResponse(
  HttpStatus.NOT_FOUND,
  5002,
  null,
  'Document not found',
)

export const DOC_CATEGORY_IN_USE = new ApiHttpResponse(
  HttpStatus.CONFLICT,
  5003,
  null,
  'Cannot delete a category that still has documents',
)

export const WHATSAPP_ANALYSIS_NOT_FOUND = new ApiHttpResponse(
  HttpStatus.NOT_FOUND,
  5004,
  null,
  'WhatsApp analysis not found',
)


export const MEETING_NOT_FOUND = new ApiHttpResponse(
  HttpStatus.NOT_FOUND,
  5005,
  null,
  'Meeting not found',
)

export const MEETING_MINUTES_NOT_FOUND = new ApiHttpResponse(
  HttpStatus.NOT_FOUND,
  5006,
  null,
  'Meeting minutes not found',
)

export const MEETING_ATTACHMENT_NOT_FOUND = new ApiHttpResponse(
  HttpStatus.NOT_FOUND,
  5007,
  null,
  'Meeting attachment not found',
)

export const TRANSACTION_CATEGORY_NOT_FOUND = new ApiHttpResponse(
  HttpStatus.NOT_FOUND,
  5008,
  null,
  'Transaction category not found',
)

export const TRANSACTION_CATEGORY_NAME_TAKEN = new ApiHttpResponse(
  HttpStatus.CONFLICT,
  5009,
  null,
  'A transaction category with that name and type already exists',
)

export const TRANSACTION_NOT_FOUND = new ApiHttpResponse(
  HttpStatus.NOT_FOUND,
  5010,
  null,
  'Transaction not found',
 )

export const TRANSACTION_ATTACHMENT_NOT_FOUND = new ApiHttpResponse(
  HttpStatus.NOT_FOUND,
  5011,
  null,
  'Transaction attachment not found',
)

export const BALLOT_NOT_FOUND = new ApiHttpResponse(
  HttpStatus.NOT_FOUND,
  5012,
  null,
  'Ballot not found',
)

export const ANNOUNCEMENT_NOT_FOUND = new ApiHttpResponse(
  HttpStatus.NOT_FOUND,
  5013,
  null,
  'Announcement not found',
)

// ─── Ballot validation/state (3xxx) ───────────────────
export const BALLOT_ALREADY_VOTED = new ApiHttpResponse(
  HttpStatus.CONFLICT,
  3002,
  null,
  'You have already voted in this ballot',
)

export const BALLOT_NOT_OPEN = new ApiHttpResponse(
  HttpStatus.CONFLICT,
  3003,
  null,
  'This ballot is not open for voting',
)

export const BALLOT_INVALID_STATE = new ApiHttpResponse(
  HttpStatus.CONFLICT,
  3004,
  null,
  'Ballot is not in a valid state for this action',
)

export const BALLOT_INVALID_SELECTION = new ApiHttpResponse(
  HttpStatus.BAD_REQUEST,
  3005,
  null,
  'Invalid option selection for this ballot',
)

export const BALLOT_INVALID_TIME_RANGE = new ApiHttpResponse(
  HttpStatus.BAD_REQUEST,
  3006,
  null,
  'Ballot end time must be after the start time',
)


// ─── Validation (3xxx) ────────────────────────────────
export const MEETING_INVALID_TIME_RANGE = new ApiHttpResponse(
  HttpStatus.BAD_REQUEST,
  3000,
  null,
  'Meeting end time must be after the start time',
)

// ─── Permission (4xxx) ────────────────────────────────
export const FORBIDDEN_ROLE = new ApiHttpResponse(
  HttpStatus.FORBIDDEN,
  4000,
  null,
  'Insufficient role permissions',
)
