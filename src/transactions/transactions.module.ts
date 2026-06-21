import { Module } from '@nestjs/common'
import { StorageModule } from '@lib/modules'
import { TransactionCategoriesRepository } from '../common/repositories/transaction-categories.repository'
import { TransactionsRepository } from '../common/repositories/transactions.repository'
import { TransactionAttachmentsController } from './transaction-attachments.controller'
import { TransactionAttachmentsService } from './transaction-attachments.service'
import { TransactionsController } from './transactions.controller'
import { TransactionsService } from './transactions.service'

@Module({
  imports: [StorageModule],
  controllers: [TransactionsController, TransactionAttachmentsController],
  providers: [
    TransactionsService,
    TransactionAttachmentsService,
    TransactionsRepository,
    TransactionCategoriesRepository,
  ],
})
export class TransactionsModule {}
