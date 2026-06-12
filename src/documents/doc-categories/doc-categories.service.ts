import { Injectable } from '@nestjs/common'
import { ApiHttpError, DOC_CATEGORY_NAME_TAKEN, DOC_CATEGORY_NOT_FOUND } from '@lib/core'
import { DocCategoriesRepository } from '../../common/repositories/doc-categories.repository'
import type { CreateDocCategoryDto } from './dto/create-doc-category.dto'
import type { UpdateDocCategoryDto } from './dto/update-doc-category.dto'

@Injectable()
export class DocCategoriesService {
  constructor(private readonly repo: DocCategoriesRepository) {}

  findAll() {
    return this.repo.findAll()
  }

  async findById(id: string) {
    const category = await this.repo.findById(id)
    if (!category) throw new ApiHttpError(DOC_CATEGORY_NOT_FOUND)
    return category
  }

  async create(dto: CreateDocCategoryDto) {
    const existing = await this.repo.findByName(dto.name)
    if (existing) throw new ApiHttpError(DOC_CATEGORY_NAME_TAKEN)
    return this.repo.create({ name: dto.name, description: dto.description })
  }

  async update(id: string, dto: UpdateDocCategoryDto) {
    const category = await this.repo.findById(id)
    if (!category) throw new ApiHttpError(DOC_CATEGORY_NOT_FOUND)

    if (dto.name && dto.name !== category.name) {
      const existing = await this.repo.findByName(dto.name)
      if (existing) throw new ApiHttpError(DOC_CATEGORY_NAME_TAKEN)
    }

    return this.repo.update(id, dto)
  }

  async delete(id: string) {
    const category = await this.repo.findById(id)
    if (!category) throw new ApiHttpError(DOC_CATEGORY_NOT_FOUND)
    await this.repo.delete(id)
  }
}
