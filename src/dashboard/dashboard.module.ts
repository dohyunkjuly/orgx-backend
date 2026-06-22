import { Module } from '@nestjs/common'
import { BallotsRepository } from '../common/repositories/ballots.repository'
import { DocumentsRepository } from '../common/repositories/documents.repository'
import { MeetingsRepository } from '../common/repositories/meetings.repository'
import { NotificationRepository } from '../common/repositories/notification.repository'
import { TransactionsRepository } from '../common/repositories/transactions.repository'
import { UsersRepository } from '../common/repositories/users.repository'
import { DashboardController } from './dashboard.controller'
import { DashboardService } from './dashboard.service'

@Module({
  controllers: [DashboardController],
  providers: [
    DashboardService,
    UsersRepository,
    MeetingsRepository,
    BallotsRepository,
    TransactionsRepository,
    NotificationRepository,
    DocumentsRepository,
  ],
})
export class DashboardModule {}
