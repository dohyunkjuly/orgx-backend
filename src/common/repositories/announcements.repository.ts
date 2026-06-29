import { Injectable } from '@nestjs/common'
import { PrismaService } from '@lib/modules'
import type { Prisma } from '@prisma/client'

// Author info shown alongside each announcement.
const AUTHOR_SELECT = {
  createdBy: { select: { id: true, fullName: true } },
} satisfies Prisma.AnnouncementInclude

@Injectable()
export class AnnouncementsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.AnnouncementUncheckedCreateInput) {
    return this.prisma.announcement.create({ data, include: AUTHOR_SELECT })
  }

  findMany() {
    return this.prisma.announcement.findMany({
      include: AUTHOR_SELECT,
      orderBy: { createdAt: 'desc' },
    })
  }

  findById(id: string) {
    return this.prisma.announcement.findUnique({ where: { id }, include: AUTHOR_SELECT })
  }

  update(id: string, data: Prisma.AnnouncementUncheckedUpdateInput) {
    return this.prisma.announcement.update({ where: { id }, data, include: AUTHOR_SELECT })
  }

  delete(id: string) {
    return this.prisma.announcement.delete({ where: { id } })
  }
}
