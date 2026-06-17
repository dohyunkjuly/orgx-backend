import { Injectable, Logger } from '@nestjs/common'
import { ApiHttpError, MEETING_INVALID_TIME_RANGE, MEETING_NOT_FOUND } from '@lib/core'
import { StorageService } from '@lib/modules'
import { MeetingStatus, NotificationType } from '@prisma/client'
import { MeetingsRepository } from '../common/repositories/meetings.repository'
import { NotificationsService } from '../notifications/notifications.service'
import type { CreateMeetingDto } from './dto/create-meeting.dto'
import type { ListMeetingsDto } from './dto/list-meetings.dto'
import type { UpdateMeetingDto } from './dto/update-meeting.dto'

@Injectable()
export class MeetingsService {
  private readonly logger = new Logger(MeetingsService.name)

  constructor(
    private readonly repo: MeetingsRepository,
    private readonly storage: StorageService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(dto: CreateMeetingDto, createdById: string) {
    this.assertTimeRange(dto.startsAt, dto.endsAt)

    const meeting = await this.repo.create({
      title: dto.title,
      agenda: dto.agenda,
      location: dto.location,
      meetingLink: dto.meetingLink,
      startsAt: new Date(dto.startsAt),
      endsAt: new Date(dto.endsAt),
      createdById,
    })

    this.broadcast(NotificationType.MEETING_CREATED, `meeting:created:${meeting.id}`, {
      title: 'New meeting scheduled',
      body: `"${meeting.title}" is scheduled for ${meeting.startsAt.toISOString()}.`,
    })

    return meeting
  }

  findAll(filters: ListMeetingsDto) {
    return this.repo.findMany({
      from: filters.from ? new Date(filters.from) : undefined,
      to: filters.to ? new Date(filters.to) : undefined,
      status: filters.status,
    })
  }

  async findById(id: string) {
    const meeting = await this.repo.findById(id)
    if (!meeting) throw new ApiHttpError(MEETING_NOT_FOUND)
    return meeting
  }

  async update(id: string, dto: UpdateMeetingDto) {
    const existing = await this.findById(id)

    const startsAt = dto.startsAt ?? existing.startsAt.toISOString()
    const endsAt = dto.endsAt ?? existing.endsAt.toISOString()
    if (dto.startsAt || dto.endsAt) this.assertTimeRange(startsAt, endsAt)

    const meeting = await this.repo.update(id, {
      title: dto.title,
      agenda: dto.agenda,
      location: dto.location,
      meetingLink: dto.meetingLink,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
      status: dto.status,
    })

    this.broadcast(
      NotificationType.MEETING_UPDATED,
      `meeting:updated:${meeting.id}:${meeting.updatedAt.getTime()}`,
      { title: 'Meeting updated', body: `"${meeting.title}" has been updated.` },
    )

    return meeting
  }

  async cancel(id: string) {
    await this.findById(id)
    const meeting = await this.repo.update(id, { status: MeetingStatus.CANCELLED })

    this.broadcast(NotificationType.MEETING_CANCELLED, `meeting:cancelled:${meeting.id}`, {
      title: 'Meeting cancelled',
      body: `"${meeting.title}" has been cancelled.`,
    })

    return meeting
  }

  async delete(id: string) {
    const meeting = await this.findById(id)

    // DB cascade removes minutes + attachment rows, but S3 objects must be
    // cleared explicitly to avoid orphaned files.
    await Promise.all(
      meeting.attachments.map((a) =>
        this.storage
          .delete(a.fileKey)
          .catch((error) => this.logger.error(`Failed to delete object ${a.fileKey}`, error)),
      ),
    )

    await this.repo.delete(id)
  }

  private assertTimeRange(startsAt: string, endsAt: string) {
    if (new Date(endsAt) <= new Date(startsAt)) {
      throw new ApiHttpError(MEETING_INVALID_TIME_RANGE)
    }
  }

  /** Fire-and-forget broadcast to all members; a failure must not fail the request. */
  private broadcast(
    type: NotificationType,
    eventId: string,
    content: { title: string; body: string },
  ) {
    void this.notifications
      .notifyAll({ type, eventId, ...content })
      .catch((error) => this.logger.error(`Failed to broadcast ${eventId}`, error))
  }
}
