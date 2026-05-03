import { HttpStatus } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'

export class ApiHttpResponse<T = unknown> {
  @ApiProperty({ example: 200 })
  statusCode: number

  @ApiProperty({ example: 0 })
  code: number

  @ApiProperty()
  data: T | null

  @ApiProperty({ example: 'OK' })
  message: string

  constructor(
    statusCode: number = HttpStatus.OK,
    code: number = 0,
    data: T | null = null,
    message: string = 'OK',
  ) {
    this.statusCode = statusCode
    this.code = code
    this.data = data
    this.message = message
  }
}
