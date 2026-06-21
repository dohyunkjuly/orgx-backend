import { Injectable } from '@nestjs/common'
import { PrismaService } from '@lib/modules'
import type { Prisma, TransactionType } from '@prisma/client'

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(filters: {
    type?: TransactionType
    categoryId?: string
    skip: number
    take: number
  }) {
    const where: Prisma.TransactionWhereInput = {
      deletedAt: null,
      ...(filters.type && { type: filters.type }),
      ...(filters.categoryId && { categoryId: filters.categoryId }),
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        include: { category: { select: { id: true, name: true, type: true } } },
        orderBy: [{ occurredOn: 'desc' }, { createdAt: 'desc' }],
        skip: filters.skip,
        take: filters.take,
      }),
      this.prisma.transaction.count({ where }),
    ])

    return { items, total }
  }

  findById(id: string) {
    return this.prisma.transaction.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: { select: { id: true, name: true, type: true } },
        attachments: { orderBy: { createdAt: 'asc' } },
      },
    })
  }

  // ── Attachments ──
  createAttachment(data: Prisma.TransactionAttachmentUncheckedCreateInput) {
    return this.prisma.transactionAttachment.create({ data })
  }

  findAttachmentById(id: string) {
    return this.prisma.transactionAttachment.findUnique({ where: { id } })
  }

  deleteAttachment(id: string) {
    return this.prisma.transactionAttachment.delete({ where: { id } })
  }

  create(data: {
    type: TransactionType
    amount: number
    occurredOn: Date
    description?: string
    counterparty?: string
    categoryId: string
    recordedById: string
  }) {
    return this.prisma.transaction.create({
      data,
      include: { category: { select: { id: true, name: true, type: true } } },
    })
  }

  update(id: string, data: Prisma.TransactionUpdateInput) {
    return this.prisma.transaction.update({
      where: { id },
      data,
      include: { category: { select: { id: true, name: true, type: true } } },
    })
  }

  softDelete(id: string) {
    return this.prisma.transaction.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  getSummary() {
    return this.prisma.transaction.findMany({
      where: { deletedAt: null },
      include: { category: { select: { id: true, name: true } } },
    })
  }
}
