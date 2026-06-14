import { applyDecorators, Type } from '@nestjs/common'
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger'
import { ApiHttpResponse } from '../api/api-http-response'

export const ApiWrappedResponse = <T extends Type<unknown>>(
  dataDto: T,
  options?: { isArray?: boolean },
) =>
  applyDecorators(
    ApiExtraModels(ApiHttpResponse, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiHttpResponse) },
          {
            properties: {
              data: options?.isArray
                ? { type: 'array', items: { $ref: getSchemaPath(dataDto) } }
                : { $ref: getSchemaPath(dataDto) },
            },
          },
        ],
      },
    }),
  )
