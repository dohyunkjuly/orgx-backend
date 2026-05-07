import { ApiHttpResponse } from './api-http-response'

/**
 * Throwable wrapper around an ApiHttpResponse.
 *
 * Usage:
 *   throw new ApiHttpError(USER_NOT_FOUND)
 *   throw new ApiHttpError(INVALID_CREDENTIALS)
 *
 * The HttpExceptionFilter unwraps `.response` and serializes it to the client.
 */
export class ApiHttpError extends Error {
  constructor(public readonly response: ApiHttpResponse) {
    super(response.message)
    this.name = 'ApiHttpError'
  }
}