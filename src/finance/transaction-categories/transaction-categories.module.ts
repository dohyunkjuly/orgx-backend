import { Module } from '@nestjs/common'
import { TransactionCategoriesController } from './transaction-categories.controller'
import { TransactionCategoriesService } from './transaction-categories.service'
import { TransactionCategoriesRepository } from '../../common/repositories/transaction-categories.repository'

@Module({
  controllers: [TransactionCategoriesController],
  providers: [TransactionCategoriesService, TransactionCategoriesRepository],
})
export class TransactionCategoriesModule {}
