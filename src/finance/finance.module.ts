import { Module } from '@nestjs/common'
import { TransactionCategoriesModule } from './transaction-categories/transaction-categories.module'

@Module({
  imports: [TransactionCategoriesModule],
})
export class FinanceModule {}
