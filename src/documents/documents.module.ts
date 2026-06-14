import { Module } from '@nestjs/common'
import { StorageModule } from '@lib/modules'
import { DocCategoriesRepository } from '../common/repositories/doc-categories.repository'
import { DocumentsRepository } from '../common/repositories/documents.repository'
import { NotificationsModule } from '../notifications/notifications.module'
import { DocumentsController } from './documents.controller'
import { DocumentsService } from './documents.service'

@Module({
  imports: [StorageModule, NotificationsModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentsRepository, DocCategoriesRepository],
})
export class DocumentsModule {}
