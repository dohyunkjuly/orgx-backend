import { Module } from '@nestjs/common'
import { MeetingMinutesRepository } from '../common/repositories/meeting-minutes.repository'
import { MeetingsModule } from '../meetings/meetings.module'
import { MeetingMinutesController } from './meeting-minutes.controller'
import { MeetingMinutesService } from './meeting-minutes.service'

@Module({
  imports: [MeetingsModule],
  controllers: [MeetingMinutesController],
  providers: [MeetingMinutesService, MeetingMinutesRepository],
})
export class MeetingMinutesModule {}
