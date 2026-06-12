import { Module } from '@nestjs/common'
import { DocCategoriesController } from './doc-categories.controller'
import { DocCategoriesRepository } from '../common/repositories/doc-categories.repository'
import { DocCategoriesService } from './doc-categories.service'

@Module({
  controllers: [DocCategoriesController],
  providers: [DocCategoriesService, DocCategoriesRepository],
})
export class DocCategoriesModule {}
