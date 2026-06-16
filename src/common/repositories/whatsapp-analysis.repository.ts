import { Injectable } from '@nestjs/common'
import { PrismaService } from '@lib/modules'
import type { Prisma } from '@prisma/client'

// List view omits the heavy `analytics` JSON blob.
const SUMMARY_SELECT = {
  id: true,
  uploadedById: true,
  fileName: true,
  periodStart: true,
  periodEnd: true,
  messageCount: true,
  uploadedAt: true,
} satisfies Prisma.WhatsAppAnalysisSelect

@Injectable()
export class WhatsAppAnalysisRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.WhatsAppAnalysisUncheckedCreateInput) {
    return this.prisma.whatsAppAnalysis.create({ data })
  }

  findMany(uploadedById?: string) {
    return this.prisma.whatsAppAnalysis.findMany({
      where: uploadedById ? { uploadedById } : undefined,
      select: SUMMARY_SELECT,
      orderBy: { uploadedAt: 'desc' },
    })
  }

  findById(id: string) {
    return this.prisma.whatsAppAnalysis.findUnique({ where: { id } })
  }

  delete(id: string) {
    return this.prisma.whatsAppAnalysis.delete({ where: { id } })
  }
}
