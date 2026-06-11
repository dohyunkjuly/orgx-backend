import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiHttpError, USER_NOT_FOUND } from '@lib/core'
import { MailService } from '@lib/modules'
import { MemberStatus, Role } from '@prisma/client'
import { AuditLogRepository } from '../common/repositories/audit-log.repository'
import { UsersRepository } from '../common/repositories/users.repository'
import { ListUsersDto } from './dto/list-users.dto'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { accountApprovedEmail, accountRejectedEmail } from './email-templates'

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  constructor(
    private readonly repo: UsersRepository,
    private readonly audit: AuditLogRepository,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

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

  async updateStatus(id: string, status: MemberStatus, actorId: string) {
    const user = await this.repo.findByIdSafe(id)
    if (!user) throw new ApiHttpError(USER_NOT_FOUND)

    const updated = await this.repo.updateStatus(id, status)

    await this.audit.create({
      actorId,
      action: 'USER_STATUS_CHANGED',
      targetType: 'User',
      targetId: user.id,
      targetLabel: user.fullName,
      metadata: { fromStatus: user.status, toStatus: status },
    })

    if (status !== user.status) {
      if (status === MemberStatus.ACTIVE) this.notifyApproved(updated)
      else if (status === MemberStatus.REJECTED) this.notifyRejected(updated)
    }

    return updated
  }

  async updateRole(id: string, role: Role, actorId: string) {
    const user = await this.repo.findByIdSafe(id)
    if (!user) throw new ApiHttpError(USER_NOT_FOUND)

    const updated = await this.repo.updateRole(id, role)

    await this.audit.create({
      actorId,
      action: 'USER_ROLE_CHANGED',
      targetType: 'User',
      targetId: user.id,
      targetLabel: user.fullName,
      metadata: { fromRole: user.role, toRole: role },
    })

    return updated
  }

  private notifyApproved(user: { email: string; fullName: string }) {
    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000'
    this.mail
      .sendMail({
        to: user.email,
        ...accountApprovedEmail({ fullName: user.fullName, loginUrl: `${frontendUrl}` }),
      })
      .catch((err) =>
        this.logger.error(`Failed to send approval email to ${user.email}: ${(err as Error).message}`),
      )
  }

  private notifyRejected(user: { email: string; fullName: string }) {
    this.mail
      .sendMail({
        to: user.email,
        ...accountRejectedEmail({ fullName: user.fullName }),
      })
      .catch((err) =>
        this.logger.error(`Failed to send rejection email to ${user.email}: ${(err as Error).message}`),
      )
  }

  updateProfile(id: string, dto: UpdateProfileDto) {
    return this.repo.updateProfile(id, dto)
  }
}
