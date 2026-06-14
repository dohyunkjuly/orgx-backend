import { Module } from '@nestjs/common'
import { DocCategoriesController } from './doc-categories.controller'
import { DocCategoriesRepository } from '../common/repositories/doc-categories.repository'
import { DocumentsRepository } from '../common/repositories/documents.repository'
import { DocCategoriesService } from './doc-categories.service'

@Module({
  controllers: [DocCategoriesController],
  providers: [DocCategoriesService, DocCategoriesRepository, DocumentsRepository],
})
export class DocCategoriesModule {}
