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
import { MeetingAttachmentsService } from './meeting-attachments.service'
import { MeetingAttachmentResponseDto } from './dto/attachment-response.dto'

@ApiTags('meeting-attachments')
@ApiCookieAuth()
@Controller('meetings/:meetingId/attachments')
export class MeetingAttachmentsController {
  constructor(private readonly service: MeetingAttachmentsService) {}

  // ── Any authenticated user (admin + member) ──

  @Get(':attachmentId/file')
  @ApiOperation({ summary: 'Get a presigned URL to download a meeting attachment' })
  getUrl(@Param('meetingId') meetingId: string, @Param('attachmentId') attachmentId: string) {
    return this.service.getUrl(meetingId, attachmentId)
  }

  // ── Admin only ──

  @Post()
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } },
  })
  @ApiOperation({ summary: '[Admin] Upload an attachment to a meeting' })
  @ApiWrappedResponse(MeetingAttachmentResponseDto)
  add(@Param('meetingId') meetingId: string, @UploadedFile() file: Express.Multer.File) {
    return this.service.add(meetingId, file)
  }

  @Delete(':attachmentId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Delete a meeting attachment' })
  delete(@Param('meetingId') meetingId: string, @Param('attachmentId') attachmentId: string) {
    return this.service.delete(meetingId, attachmentId)
  }
}
