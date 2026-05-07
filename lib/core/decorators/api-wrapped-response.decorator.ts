import { applyDecorators, Type } from '@nestjs/common'
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger'
import { ApiHttpResponse } from '../api/api-http-response'

export const ApiWrappedResponse = <T extends Type<unknown>>(dataDto: T) =>
  applyDecorators(
    ApiExtraModels(ApiHttpResponse, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiHttpResponse) },
          {
            properties: {
              data: { $ref: getSchemaPath(dataDto) },
            },
          },
        ],
      },
    }),
  )
