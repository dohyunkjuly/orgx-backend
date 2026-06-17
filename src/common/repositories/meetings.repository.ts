import { Injectable } from '@nestjs/common'
import { PrismaService } from '@lib/modules'
import { Prisma, type MeetingStatus } from '@prisma/client'

@Injectable()
export class MeetingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.MeetingUncheckedCreateInput) {
    return this.prisma.meeting.create({ data })
  }

  // Calendar query: meetings whose start falls within [from, to].
  findMany(filters: { from?: Date; to?: Date; status?: MeetingStatus }) {
    const where: Prisma.MeetingWhereInput = {}
    if (filters.status) where.status = filters.status
    if (filters.from || filters.to) {
      where.startsAt = {
        ...(filters.from && { gte: filters.from }),
        ...(filters.to && { lte: filters.to }),
      }
    }

    return this.prisma.meeting.findMany({
      where,
      orderBy: { startsAt: 'asc' },
    })
  }

  findById(id: string) {
    return this.prisma.meeting.findUnique({
      where: { id },
      include: {
        minutes: { select: { id: true } },
        attachments: { orderBy: { createdAt: 'asc' } },
      },
    })
  }

  update(id: string, data: Prisma.MeetingUncheckedUpdateInput) {
    return this.prisma.meeting.update({ where: { id }, data })
  }

  delete(id: string) {
    return this.prisma.meeting.delete({ where: { id } })
  }

  // ── Attachments (meeting-scoped) ──
  createAttachment(data: Prisma.MeetingAttachmentUncheckedCreateInput) {
    return this.prisma.meetingAttachment.create({ data })
  }

  findAttachmentById(id: string) {
    return this.prisma.meetingAttachment.findUnique({ where: { id } })
  }

  deleteAttachment(id: string) {
    return this.prisma.meetingAttachment.delete({ where: { id } })
  }
}
