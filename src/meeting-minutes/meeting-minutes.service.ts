import { Injectable } from '@nestjs/common'
import { ApiHttpError, MEETING_MINUTES_NOT_FOUND } from '@lib/core'
import { MeetingMinutesRepository } from '../common/repositories/meeting-minutes.repository'
import { MeetingsService } from '../meetings/meetings.service'

@Injectable()
export class MeetingMinutesService {
  constructor(
    private readonly repo: MeetingMinutesRepository,
    private readonly meetingsService: MeetingsService,
  ) {}

  /** Read minutes. 404 if the meeting has no minutes yet. */
  async get(meetingId: string) {
    await this.meetingsService.findById(meetingId) // 404s if meeting is missing
    const minutes = await this.repo.findByMeetingId(meetingId)
    if (!minutes) throw new ApiHttpError(MEETING_MINUTES_NOT_FOUND)
    return minutes
  }

  /** Create or replace the minutes content for a meeting. */
  async save(meetingId: string, content: string) {
    await this.meetingsService.findById(meetingId)
    return this.repo.upsert(meetingId, content)
  }

  async delete(meetingId: string) {
    await this.get(meetingId)
    await this.repo.deleteByMeetingId(meetingId)
  }
}
