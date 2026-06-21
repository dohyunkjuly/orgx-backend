import { Injectable } from '@nestjs/common'
import {
  ApiHttpError,
  TRANSACTION_CATEGORY_NOT_FOUND,
  TRANSACTION_NOT_FOUND,
  TRANSACTION_TYPE_CATEGORY_MISMATCH,
} from '@lib/core'
import { PrismaService } from '@lib/modules'
import type { Prisma } from '@prisma/client'
import { TransactionCategoriesRepository } from '../common/repositories/transaction-categories.repository'
import { TransactionsRepository } from '../common/repositories/transactions.repository'
import type { CreateTransactionDto } from './dto/create-transaction.dto'
import type { ListTransactionsDto } from './dto/list-transactions.dto'
import type { UpdateTransactionDto } from './dto/update-transaction.dto'

@Injectable()
export class TransactionsService {
  constructor(
    private readonly repo: TransactionsRepository,
    private readonly categories: TransactionCategoriesRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateTransactionDto, recordedById: string) {
    const category = await this.categories.findById(dto.categoryId)
    if (!category) throw new ApiHttpError(TRANSACTION_CATEGORY_NOT_FOUND)
    if (category.type !== dto.type) throw new ApiHttpError(TRANSACTION_TYPE_CATEGORY_MISMATCH)

    return this.repo.create({
      type: dto.type,
      amount: dto.amount,
      occurredOn: new Date(dto.occurredOn),
      description: dto.description,
      counterparty: dto.counterparty,
      categoryId: dto.categoryId,
      recordedById,
    })
  }

  async findAll(filters: ListTransactionsDto) {
    const page = filters.page ?? 1
    const limit = filters.limit ?? 20
    const { items, total } = await this.repo.findMany({
      type: filters.type,
      categoryId: filters.categoryId,
      skip: (page - 1) * limit,
      take: limit,
    })
    return { items, total, page, limit }
  }

  async getSummary() {
    const transactions = await this.repo.getSummary()

    let totalIncome = 0
    let totalExpense = 0
    const byCategory = new Map<string, { categoryId: string; categoryName: string; type: string; total: number }>()

    for (const tx of transactions) {
      const amount = Number(tx.amount)
      if (tx.type === 'INCOME') totalIncome += amount
      else totalExpense += amount

      const key = tx.categoryId
      const existing = byCategory.get(key)
      if (existing) {
        existing.total += amount
      } else {
        byCategory.set(key, {
          categoryId: tx.categoryId,
          categoryName: tx.category?.name ?? 'Unknown',
          type: tx.type,
          total: amount,
        })
      }
    }

    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      byCategory: Array.from(byCategory.values()),
    }
  }

  async update(id: string, dto: UpdateTransactionDto, actorId: string) {
    const existing = await this.repo.findById(id)
    if (!existing) throw new ApiHttpError(TRANSACTION_NOT_FOUND)

    if (dto.categoryId !== undefined || dto.type !== undefined) {
      const newCategoryId = dto.categoryId ?? existing.categoryId
      const newType = dto.type ?? existing.type
      const category = await this.categories.findById(newCategoryId)
      if (!category) throw new ApiHttpError(TRANSACTION_CATEGORY_NOT_FOUND)
      if (category.type !== newType) throw new ApiHttpError(TRANSACTION_TYPE_CATEGORY_MISMATCH)
    }

    const updateData: Record<string, unknown> = {}
    if (dto.type !== undefined) updateData.type = dto.type
    if (dto.amount !== undefined) updateData.amount = dto.amount
    if (dto.occurredOn !== undefined) updateData.occurredOn = new Date(dto.occurredOn)
    if (dto.description !== undefined) updateData.description = dto.description
    if (dto.counterparty !== undefined) updateData.counterparty = dto.counterparty
    if (dto.categoryId !== undefined) updateData.categoryId = dto.categoryId

    const updated = await this.repo.update(id, updateData)

    const changed: Record<string, { before: unknown; after: unknown }> = {}
    if (dto.type !== undefined && dto.type !== existing.type)
      changed.type = { before: existing.type, after: dto.type }
    if (dto.amount !== undefined && dto.amount !== Number(existing.amount))
      changed.amount = { before: existing.amount.toString(), after: dto.amount }
    if (dto.occurredOn !== undefined)
      changed.occurredOn = { before: existing.occurredOn.toISOString(), after: dto.occurredOn }
    if (dto.description !== undefined && dto.description !== existing.description)
      changed.description = { before: existing.description, after: dto.description }
    if (dto.counterparty !== undefined && dto.counterparty !== existing.counterparty)
      changed.counterparty = { before: existing.counterparty, after: dto.counterparty }
    if (dto.categoryId !== undefined && dto.categoryId !== existing.categoryId)
      changed.categoryId = { before: existing.categoryId, after: dto.categoryId }

    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: 'TRANSACTION_UPDATED',
        targetType: 'Transaction',
        targetId: id,
        targetLabel: existing.description ?? `$${existing.amount.toString()}`,
        metadata: changed as Prisma.InputJsonValue,
      },
    })

    return updated
  }

  async delete(id: string, actorId: string) {
    const existing = await this.repo.findById(id)
    if (!existing) throw new ApiHttpError(TRANSACTION_NOT_FOUND)

    await this.repo.softDelete(id)

    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: 'TRANSACTION_DELETED',
        targetType: 'Transaction',
        targetId: id,
        targetLabel: existing.description ?? `$${existing.amount.toString()}`,
      },
    })
  }
}
