import { Injectable, Logger } from '@nestjs/common'
import { ApiHttpError, TRANSACTION_ATTACHMENT_NOT_FOUND, TRANSACTION_NOT_FOUND } from '@lib/core'
import { StorageService } from '@lib/modules'
import { TransactionsRepository } from '../common/repositories/transactions.repository'

@Injectable()
export class TransactionAttachmentsService {
  private readonly logger = new Logger(TransactionAttachmentsService.name)

  constructor(
    private readonly repo: TransactionsRepository,
    private readonly storage: StorageService,
  ) {}

  async list(transactionId: string) {
    const transaction = await this.repo.findById(transactionId)
    if (!transaction) throw new ApiHttpError(TRANSACTION_NOT_FOUND)
    return transaction.attachments
  }

  async add(transactionId: string, file: Express.Multer.File) {
    const transaction = await this.repo.findById(transactionId)
    if (!transaction) throw new ApiHttpError(TRANSACTION_NOT_FOUND)

    const key = `transactions/${transactionId}/attachments/${Date.now()}-${file.originalname}`
    await this.storage.upload({ key, body: file.buffer, contentType: file.mimetype })

    return this.repo.createAttachment({
      transactionId,
      fileKey: key,
      fileName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
    })
  }

  /** Presigned URL that force-downloads the attachment with its original filename. */
  async getUrl(transactionId: string, attachmentId: string) {
    const attachment = await this.find(transactionId, attachmentId)
    return {
      url: await this.storage.getUrl(attachment.fileKey, {
        downloadFileName: attachment.fileName,
      }),
    }
  }

  async delete(transactionId: string, attachmentId: string) {
    const attachment = await this.find(transactionId, attachmentId)
    await this.storage
      .delete(attachment.fileKey)
      .catch((error) => this.logger.error(`Failed to delete object ${attachment.fileKey}`, error))
    await this.repo.deleteAttachment(attachmentId)
  }

  private async find(transactionId: string, attachmentId: string) {
    const attachment = await this.repo.findAttachmentById(attachmentId)
    // Guard against an attachment id from a different transaction.
    if (!attachment || attachment.transactionId !== transactionId) {
      throw new ApiHttpError(TRANSACTION_ATTACHMENT_NOT_FOUND)
    }
    return attachment
  }
}
