import { Injectable } from '@nestjs/common'
import { PrismaService } from '@lib/modules'
import { Prisma } from '@prisma/client'

@Injectable()
export class AuditLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    actorId: string
    action: string
    targetType: string
    targetId: string
    targetLabel?: string
    metadata?: Prisma.InputJsonValue
  }) {
    return this.prisma.auditLog.create({ data })
  }
}
