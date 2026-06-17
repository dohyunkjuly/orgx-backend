import { Module } from '@nestjs/common'
import { TransactionCategoriesModule } from './transaction-categories/transaction-categories.module'
import { TransactionsModule } from './transactions/transactions.module'

@Module({
  imports: [TransactionCategoriesModule, TransactionsModule],
})
export class FinanceModule {}
