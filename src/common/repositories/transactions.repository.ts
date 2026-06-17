import { Injectable } from '@nestjs/common'
import { PrismaService } from '@lib/modules'
import type { Prisma, TransactionType } from '@prisma/client'

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(filters: { type?: TransactionType; categoryId?: string }) {
    return this.prisma.transaction.findMany({
      where: {
        deletedAt: null,
        ...(filters.type && { type: filters.type }),
        ...(filters.categoryId && { categoryId: filters.categoryId }),
      },
      include: { category: { select: { id: true, name: true, type: true } } },
      orderBy: { occurredOn: 'desc' },
    })
  }

  findById(id: string) {
    return this.prisma.transaction.findFirst({
      where: { id, deletedAt: null },
      include: { category: { select: { id: true, name: true, type: true } } },
    })
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

  async getSummary(filters: { from?: Date; to?: Date }) {
    const where = {
      deletedAt: null,
      ...(filters.from || filters.to
        ? { occurredOn: { ...(filters.from && { gte: filters.from }), ...(filters.to && { lte: filters.to }) } }
        : {}),
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: { category: { select: { id: true, name: true } } },
    })

    return transactions
  }
}
