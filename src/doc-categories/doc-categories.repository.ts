import { Injectable } from '@nestjs/common'
import { PrismaService } from '@lib/modules'
import type { Prisma } from '@prisma/client'

@Injectable()
export class DocCategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.documentCategory.findMany({ orderBy: { name: 'asc' } })
  }

  findById(id: string) {
    return this.prisma.documentCategory.findUnique({ where: { id } })
  }

  findByName(name: string) {
    return this.prisma.documentCategory.findUnique({ where: { name } })
  }

  create(data: Prisma.DocumentCategoryCreateInput) {
    return this.prisma.documentCategory.create({ data })
  }

  update(id: string, data: Prisma.DocumentCategoryUpdateInput) {
    return this.prisma.documentCategory.update({ where: { id }, data })
  }

  delete(id: string) {
    return this.prisma.documentCategory.delete({ where: { id } })
  }
}
