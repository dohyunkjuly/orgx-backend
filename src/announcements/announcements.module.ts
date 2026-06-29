import { Module } from '@nestjs/common'
import { AnnouncementsRepository } from '../common/repositories/announcements.repository'
import { NotificationsModule } from '../notifications/notifications.module'
import { AnnouncementsController } from './announcements.controller'
import { AnnouncementsService } from './announcements.service'

@Module({
  imports: [NotificationsModule],
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService, AnnouncementsRepository],
})
export class AnnouncementsModule {}
