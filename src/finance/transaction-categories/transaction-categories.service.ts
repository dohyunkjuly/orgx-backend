import { Injectable } from '@nestjs/common'
import {
  ApiHttpError,
  TRANSACTION_CATEGORY_NAME_TAKEN,
  TRANSACTION_CATEGORY_NOT_FOUND,
} from '@lib/core'
import { TransactionCategoriesRepository } from '../../common/repositories/transaction-categories.repository'
import type { CreateTransactionCategoryDto } from './dto/create-transaction-category.dto'
import type { ListTransactionCategoriesDto } from './dto/list-transaction-categories.dto'

@Injectable()
export class TransactionCategoriesService {
  constructor(private readonly repo: TransactionCategoriesRepository) {}

  findAll(query: ListTransactionCategoriesDto) {
    return this.repo.findAll({ type: query.type })
  }

  async findById(id: string) {
    const category = await this.repo.findById(id)
    if (!category) throw new ApiHttpError(TRANSACTION_CATEGORY_NOT_FOUND)
    return category
  }

  async create(dto: CreateTransactionCategoryDto) {
    const existing = await this.repo.findByNameAndType(dto.name, dto.type)
    if (existing) throw new ApiHttpError(TRANSACTION_CATEGORY_NAME_TAKEN)
    return this.repo.create({ name: dto.name, type: dto.type })
  }

  async delete(id: string) {
    const category = await this.repo.findById(id)
    if (!category) throw new ApiHttpError(TRANSACTION_CATEGORY_NOT_FOUND)
    await this.repo.delete(id)
  }
}
