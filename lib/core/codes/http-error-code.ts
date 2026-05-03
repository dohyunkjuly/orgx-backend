import { HttpStatus } from '@nestjs/common'
import { ApiHttpResponse } from '@lib/core'

export const USER_NOT_FOUND = new ApiHttpResponse(
  HttpStatus.BAD_REQUEST, // 400
  1000,
  null,
  'User not found',
)
