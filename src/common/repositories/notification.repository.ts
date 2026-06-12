import { Injectable } from '@nestjs/common'
import { PrismaService } from '@lib/modules'
import { NotificationType, Prisma } from '@prisma/client'

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(args: { userId: string; skip: number; take: number; unread?: boolean }) {
    const where: Prisma.NotificationWhereInput = {
      userId: args.userId,
      ...(args.unread === true && { readAt: null }),
      ...(args.unread === false && { readAt: { not: null } }),
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        skip: args.skip,
        take: args.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ])

    return { items, total }
  }

  countUnread(userId: string) {
    return this.prisma.notification.count({ where: { userId, readAt: null } })
  }

  upsert(data: {
    userId: string
    type: NotificationType
    eventId: string
    title: string
    body: string
  }) {
    return this.prisma.notification.upsert({
      where: { userId_eventId: { userId: data.userId, eventId: data.eventId } },
      create: data,
      update: {},
    })
  }

  /** Marks a single unread notification read, scoped to its owner. Returns affected count. */
  markAsRead(userId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId, readAt: null },
      data: { readAt: new Date() },
    })
  }

  /** Marks all of a user's unread notifications read. Returns affected count. */
  markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    })
  }
}
