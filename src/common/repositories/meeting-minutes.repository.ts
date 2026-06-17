import { Injectable } from '@nestjs/common'
import { PrismaService } from '@lib/modules'

@Injectable()
export class MeetingMinutesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByMeetingId(meetingId: string) {
    return this.prisma.meetingMinutes.findUnique({ where: { meetingId } })
  }

  // One minutes per meeting — create on first save, update thereafter.
  upsert(meetingId: string, content: string) {
    return this.prisma.meetingMinutes.upsert({
      where: { meetingId },
      create: { meetingId, content },
      update: { content },
    })
  }

  deleteByMeetingId(meetingId: string) {
    return this.prisma.meetingMinutes.delete({ where: { meetingId } })
  }
}
