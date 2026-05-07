import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { ApiHttpResponse } from '../api/api-http-response'
import { ApiHttpError } from '../api/api-http-error'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    // Our domain errors: throw new ApiHttpError(USER_NOT_FOUND)
    if (exception instanceof ApiHttpError) {
      response.status(exception.response.statusCode).json(exception.response)
      return
    }

    // Standard NestJS HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const apiResponse = new ApiHttpResponse(status, status, null, exception.message)
      response.status(status).json(apiResponse)
      return
    }

    // Unexpected error — log full details, return generic message
    const message = exception instanceof Error ? exception.message : 'Unknown error'
    this.logger.error(
      `Unhandled exception on ${request.method} ${request.url}: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    )

    const apiResponse = new ApiHttpResponse(
      HttpStatus.INTERNAL_SERVER_ERROR,
      9000,
      null,
      'Internal server error',
    )
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiResponse)
  }
}