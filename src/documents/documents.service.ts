import { Injectable, Logger } from '@nestjs/common'
import { ApiHttpError, DOC_CATEGORY_NOT_FOUND, DOCUMENT_NOT_FOUND } from '@lib/core'
import { StorageService } from '@lib/modules'
import { NotificationType } from '@prisma/client'
import { DocCategoriesRepository } from '../common/repositories/doc-categories.repository'
import { DocumentsRepository } from '../common/repositories/documents.repository'
import { NotificationsService } from '../notifications/notifications.service'
import type { UpdateDocumentDto } from './dto/update-document.dto'
import type { UploadDocumentDto } from './dto/upload-document.dto'

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name)

  constructor(
    private readonly repo: DocumentsRepository,
    private readonly categories: DocCategoriesRepository,
    private readonly storage: StorageService,
    private readonly notifications: NotificationsService,
  ) {}

  async upload(dto: UploadDocumentDto, file: Express.Multer.File, uploadedById: string) {
    const key = `documents/${Date.now()}-${file.originalname}`

    await this.storage.upload({ key, body: file.buffer, contentType: file.mimetype })

    const document = await this.repo.create({
      title: dto.title,
      description: dto.description,
      tags: dto.tags,
      fileKey: key,
      fileName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      categoryId: dto.categoryId,
      uploadedById,
    })

    // Fire-and-forget: a failed broadcast must not fail the upload.
    void this.notifications
      .notifyAll({
        type: NotificationType.DOCUMENT_UPLOADED,
        eventId: `document:${document.id}`,
        title: 'New document',
        body: `A new document "${document.title}" has been uploaded.`,
      })
      .catch((error) =>
        this.logger.error(`Failed to notify members of document ${document.id}`, error),
      )

    return document
  }

  async findAll(filters: { categoryId?: string; search?: string }) {
    const documents = await this.repo.findMany(filters)

    return Promise.all(
      documents.map(async (document) => ({
        ...document,
        downloadUrl: await this.storage.getUrl(document.fileKey),
      })),
    )
  }

  async update(id: string, dto: UpdateDocumentDto) {
    const document = await this.repo.findById(id)
    if (!document) throw new ApiHttpError(DOCUMENT_NOT_FOUND)

    if (dto.categoryId !== document.categoryId) {
      const category = await this.categories.findById(dto.categoryId)
      if (!category) throw new ApiHttpError(DOC_CATEGORY_NOT_FOUND)
    }

    return this.repo.update(id, { categoryId: dto.categoryId })
  }

  async delete(id: string) {
    const document = await this.repo.findById(id)
    if (!document) throw new ApiHttpError(DOCUMENT_NOT_FOUND)
    await this.repo.softDelete(id)
  }
}
