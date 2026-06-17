import { Injectable, Logger } from '@nestjs/common'
import { ApiHttpError, MEETING_ATTACHMENT_NOT_FOUND } from '@lib/core'
import { StorageService } from '@lib/modules'
import { MeetingsRepository } from '../common/repositories/meetings.repository'
import { MeetingsService } from './meetings.service'

@Injectable()
export class MeetingAttachmentsService {
  private readonly logger = new Logger(MeetingAttachmentsService.name)

  constructor(
    private readonly repo: MeetingsRepository,
    private readonly meetingsService: MeetingsService,
    private readonly storage: StorageService,
  ) {}

  async add(meetingId: string, file: Express.Multer.File) {
    await this.meetingsService.findById(meetingId) // 404s if the meeting is missing
    const key = `meetings/${meetingId}/attachments/${Date.now()}-${file.originalname}`

    await this.storage.upload({ key, body: file.buffer, contentType: file.mimetype })

    return this.repo.createAttachment({
      meetingId,
      fileKey: key,
      fileName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
    })
  }

  /** Presigned URL that force-downloads the attachment with its original filename. */
  async getUrl(meetingId: string, attachmentId: string) {
    const attachment = await this.find(meetingId, attachmentId)
    return {
      url: await this.storage.getUrl(attachment.fileKey, {
        downloadFileName: attachment.fileName,
      }),
    }
  }

  async delete(meetingId: string, attachmentId: string) {
    const attachment = await this.find(meetingId, attachmentId)
    await this.storage
      .delete(attachment.fileKey)
      .catch((error) => this.logger.error(`Failed to delete object ${attachment.fileKey}`, error))
    await this.repo.deleteAttachment(attachmentId)
  }

  private async find(meetingId: string, attachmentId: string) {
    const attachment = await this.repo.findAttachmentById(attachmentId)
    // Guard against an attachment id from a different meeting.
    if (!attachment || attachment.meetingId !== meetingId) {
      throw new ApiHttpError(MEETING_ATTACHMENT_NOT_FOUND)
    }
    return attachment
  }
}
