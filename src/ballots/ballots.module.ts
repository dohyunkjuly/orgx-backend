import { Module } from '@nestjs/common'
import { BallotsRepository } from '../common/repositories/ballots.repository'
import { NotificationsModule } from '../notifications/notifications.module'
import { BallotsController } from './ballots.controller'
import { BallotsService } from './ballots.service'

@Module({
  imports: [NotificationsModule],
  controllers: [BallotsController],
  providers: [BallotsService, BallotsRepository],
})
export class BallotsModule {}
