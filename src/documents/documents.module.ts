import { Module } from '@nestjs/common'
import { StorageModule } from '@lib/modules'
import { DocumentsRepository } from '../common/repositories/documents.repository'
import { DocumentsController } from './documents.controller'
import { DocumentsService } from './documents.service'

@Module({
  imports: [StorageModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentsRepository],
})
export class DocumentsModule {}
