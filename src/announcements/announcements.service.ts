import { Injectable, Logger } from '@nestjs/common'
import { ApiHttpError, ANNOUNCEMENT_NOT_FOUND } from '@lib/core'
import { NotificationType } from '@prisma/client'
import { AnnouncementsRepository } from '../common/repositories/announcements.repository'
import { NotificationsService } from '../notifications/notifications.service'
import type { CreateAnnouncementDto } from './dto/create-announcement.dto'
import type { UpdateAnnouncementDto } from './dto/update-announcement.dto'

@Injectable()
export class AnnouncementsService {
  private readonly logger = new Logger(AnnouncementsService.name)

  constructor(
    private readonly repo: AnnouncementsRepository,
    private readonly notifications: NotificationsService,
  ) {}

  async create(dto: CreateAnnouncementDto, createdById: string) {
    const announcement = await this.repo.create({ title: dto.title, body: dto.body, createdById })

    // Fire-and-forget: a failed broadcast must not fail the request.
    void this.notifications
      .notifyAll({
        type: NotificationType.ANNOUNCEMENT_CREATED,
        eventId: `announcement:created:${announcement.id}`,
        title: 'New announcement',
        body: announcement.title,
      })
      .catch((error) =>
        this.logger.error(`Failed to broadcast announcement ${announcement.id}`, error),
      )

    return announcement
  }

  findAll() {
    return this.repo.findMany()
  }

  async findById(id: string) {
    const announcement = await this.repo.findById(id)
    if (!announcement) throw new ApiHttpError(ANNOUNCEMENT_NOT_FOUND)
    return announcement
  }

  async update(id: string, dto: UpdateAnnouncementDto) {
    await this.findById(id)
    return this.repo.update(id, { title: dto.title, body: dto.body })
  }

  async delete(id: string) {
    await this.findById(id)
    await this.repo.delete(id)
  }
}
