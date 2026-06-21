import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiWrappedResponse } from '@lib/core'
import { Role } from '@prisma/client'
import { Roles } from '../common/decorators/roles.decorator'
import { TransactionAttachmentsService } from './transaction-attachments.service'
import { TransactionAttachmentResponseDto } from './dto/transaction-attachment-response.dto'

@ApiTags('transaction-attachments')
@ApiCookieAuth()
@Controller('transactions/:transactionId/attachments')
export class TransactionAttachmentsController {
  constructor(private readonly service: TransactionAttachmentsService) {}

  // ── Any authenticated user (admin + member) ──

  @Get()
  @ApiOperation({ summary: 'List a transaction’s attachments' })
  @ApiWrappedResponse(TransactionAttachmentResponseDto, { isArray: true })
  list(@Param('transactionId') transactionId: string) {
    return this.service.list(transactionId)
  }

  @Get(':attachmentId/file')
  @ApiOperation({ summary: 'Get a presigned URL to download a transaction attachment' })
  getUrl(
    @Param('transactionId') transactionId: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    return this.service.getUrl(transactionId, attachmentId)
  }

  // ── Admin only ──

  @Post()
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } },
  })
  @ApiOperation({ summary: '[Admin] Upload an attachment to a transaction' })
  @ApiWrappedResponse(TransactionAttachmentResponseDto)
  add(
    @Param('transactionId') transactionId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.add(transactionId, file)
  }

  @Delete(':attachmentId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Delete a transaction attachment' })
  delete(
    @Param('transactionId') transactionId: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    return this.service.delete(transactionId, attachmentId)
  }
}
