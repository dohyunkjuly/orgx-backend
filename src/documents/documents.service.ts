import { Injectable } from '@nestjs/common'
import { StorageService } from '@lib/modules'
import { DocumentsRepository } from '../common/repositories/documents.repository'
import type { UploadDocumentDto } from './dto/upload-document.dto'

@Injectable()
export class DocumentsService {
  constructor(
    private readonly repo: DocumentsRepository,
    private readonly storage: StorageService,
  ) {}

  async upload(dto: UploadDocumentDto, file: Express.Multer.File, uploadedById: string) {
    const key = `documents/${Date.now()}-${file.originalname}`

    await this.storage.upload({ key, body: file.buffer, contentType: file.mimetype })

    return this.repo.create({
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
  }

  findAll(filters: { categoryId?: string; search?: string }) {
    return this.repo.findMany(filters)
  }
}
