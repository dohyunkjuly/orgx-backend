import { Injectable } from '@nestjs/common'
import { ApiHttpError, USER_NOT_FOUND } from '@lib/core'
import type { MemberStatus } from '@prisma/client'
import { UsersRepository } from '../common/repositories/users.repository'
import { ListUsersDto } from './dto/list-users.dto'
import { UpdateProfileDto } from './dto/update-profile.dto'

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  async list(query: ListUsersDto, currentUserId: string) {
    const page = query.page ?? 1
    const limit = query.limit ?? 20
    const { items, total } = await this.repo.list({
      skip: (page - 1) * limit,
      take: limit,
      status: query.status,
      role: query.role,
      search: query.search,
      excludeId: currentUserId,
    })
    return { items, total, page, limit }
  }

  async getById(id: string) {
    const user = await this.repo.findByIdSafe(id)
    if (!user) throw new ApiHttpError(USER_NOT_FOUND)
    return user
  }

  async updateStatus(id: string, status: MemberStatus) {
    const user = await this.repo.findByIdSafe(id)
    if (!user) throw new ApiHttpError(USER_NOT_FOUND)
    return this.repo.updateStatus(id, status)
  }

  updateProfile(id: string, dto: UpdateProfileDto) {
    return this.repo.updateProfile(id, dto)
  }
}
