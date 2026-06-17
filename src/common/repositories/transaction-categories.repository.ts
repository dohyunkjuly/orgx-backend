import { Injectable } from '@nestjs/common'
import { PrismaService } from '@lib/modules'
import type { Prisma, TransactionType } from '@prisma/client'

@Injectable()
export class TransactionCategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters: { type?: TransactionType } = {}) {
    return this.prisma.transactionCategory.findMany({
      where: filters.type ? { type: filters.type } : undefined,
      orderBy: { name: 'asc' },
    })
  }

  findById(id: string) {
    return this.prisma.transactionCategory.findUnique({ where: { id } })
  }

  findByNameAndType(name: string, type: TransactionType) {
    return this.prisma.transactionCategory.findUnique({
      where: { name_type: { name, type } },
    })
  }

  create(data: Prisma.TransactionCategoryCreateInput) {
    return this.prisma.transactionCategory.create({ data })
  }

  delete(id: string) {
    return this.prisma.transactionCategory.delete({ where: { id } })
  }
}
