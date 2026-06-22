import { Injectable } from '@nestjs/common'
import { PrismaService } from '@lib/modules'
import type { Prisma } from '@prisma/client'

@Injectable()
export class DocumentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.DocumentUncheckedCreateInput) {
    return this.prisma.document.create({ data })
  }

  findMany(filters: { categoryId?: string; search?: string }) {
    const where: Prisma.DocumentWhereInput = { deletedAt: null }

    if (filters.categoryId) where.categoryId = filters.categoryId

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { tags: { contains: filters.search } },
      ]
    }

    return this.prisma.document.findMany({
      where,
      include: { category: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  findById(id: string) {
    return this.prisma.document.findFirst({
      where: { id, deletedAt: null },
      include: { category: true },
    })
  }

  update(id: string, data: Prisma.DocumentUncheckedUpdateInput) {
    return this.prisma.document.update({
      where: { id },
      data,
      include: { category: true },
    })
  }

  softDelete(id: string) {
    return this.prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  // Counts every document referencing the category, including soft-deleted
  // ones, since the DB foreign key still blocks a hard category delete.
  countByCategory(categoryId: string) {
    return this.prisma.document.count({ where: { categoryId } })
  }

  count() {
    return this.prisma.document.count({ where: { deletedAt: null } })
  }

  findRecent(take: number) {
    return this.prisma.document.findMany({
      where: { deletedAt: null },
      select: { id: true, title: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take,
    })
  }
}
