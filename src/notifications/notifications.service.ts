import { randomUUID } from 'node:crypto'
import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { WsError, WS_NOTIFICATION_NOT_FOUND } from '@lib/core'
import { NotificationType } from '@prisma/client'
import { NotificationRepository } from '../common/repositories/notification.repository'
import { UsersRepository } from '../common/repositories/users.repository'
import { EventsGateway } from '../socket/events.gateway'
import { ListNotificationsDto } from './dto/list-notifications.dto'
import { TestNotificationDto } from './dto/test-notification.dto'

@Injectable()
export class NotificationsService {
  constructor(
    private readonly repo: NotificationRepository,
    private readonly users: UsersRepository,
    @Inject(forwardRef(() => EventsGateway))
    private readonly gateway: EventsGateway,
  ) {}

  /** Create a notification and push it live to the user over WebSocket. */
  async notify(input: {
    userId: string
    type: NotificationType
    eventId: string
    title: string
    body: string
  }) {
    const notification = await this.repo.upsert(input)
    this.gateway.emitToUser(input.userId, 'notification', notification)
    return notification
  }

  /** Create the same notification for every active member (single bulk insert) and push each one live. */
  async notifyAll(input: {
    type: NotificationType
    eventId: string
    title: string
    body: string
  }) {
    const userIds = await this.users.findActiveIds()
    if (userIds.length === 0) return []

    const notifications = await this.repo.createForUsers({ userIds, ...input })

    for (const notification of notifications) {
      this.gateway.emitToUser(notification.userId, 'notification', notification)
    }

    return notifications
  }

  /** Sends a test notification to the user (unique eventId per call so it always pushes). */
  sendTest(userId: string, input: TestNotificationDto) {
    return this.notify({
      userId,
      type: NotificationType.DOCUMENT_UPLOADED,
      eventId: `test:${randomUUID()}`,
      title: input.title ?? 'Test notification',
      body: input.body ?? 'This is a test notification.',
    })
  }

  async list(userId: string, query: ListNotificationsDto) {
    const page = query.page ?? 1
    const limit = query.limit ?? 20
    const { items, total } = await this.repo.list({
      userId,
      skip: (page - 1) * limit,
      take: limit,
      unread: query.unread,
    })
    return { items, total, page, limit }
  }

  async unreadCount(userId: string) {
    const count = await this.repo.countUnread(userId)
    return { count }
  }

  async markAsRead(userId: string, notificationId: string) {
    const { count } = await this.repo.markAsRead(userId, notificationId)
    if (count === 0) throw new WsError(WS_NOTIFICATION_NOT_FOUND)
  }

  async markAllAsRead(userId: string) {
    const { count } = await this.repo.markAllAsRead(userId)
    return count
  }
}
