import { Module } from '@nestjs/common'
import { StorageModule } from '@lib/modules'
import { MeetingsRepository } from '../common/repositories/meetings.repository'
import { NotificationsModule } from '../notifications/notifications.module'
import { MeetingAttachmentsController } from './meeting-attachments.controller'
import { MeetingAttachmentsService } from './meeting-attachments.service'
import { MeetingsController } from './meetings.controller'
import { MeetingsService } from './meetings.service'

@Module({
  imports: [NotificationsModule, StorageModule],
  controllers: [MeetingsController, MeetingAttachmentsController],
  providers: [MeetingsService, MeetingAttachmentsService, MeetingsRepository],
  exports: [MeetingsService],
})
export class MeetingsModule {}
