import { Module } from '@nestjs/common'
import { TransactionCategoriesRepository } from '../../common/repositories/transaction-categories.repository'
import { TransactionsRepository } from '../../common/repositories/transactions.repository'
import { TransactionsController } from './transactions.controller'
import { TransactionsService } from './transactions.service'

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionsRepository, TransactionCategoriesRepository],
})
export class TransactionsModule {}
