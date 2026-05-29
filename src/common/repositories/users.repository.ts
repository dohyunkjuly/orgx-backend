import { Injectable } from '@nestjs/common'
import { PrismaService } from '@lib/modules'
import { MemberStatus, Prisma, Role, User } from '@prisma/client'

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Includes passwordHash - use only for auth (login, changePassword). */
  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } })
  }

  /** Includes passwordHash - use only for auth flows that need it. */
  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } })
  }

  /** Safe variant: omits passwordHash. Use for /me and any response. */
  findByIdSafe(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      omit: { passwordHash: true },
    })
  }

  async list(args: {
    skip: number
    take: number
    status?: MemberStatus
    role?: Role
    search?: string
    excludeId?: string
  }) {
    const where: Prisma.UserWhereInput = {
      ...(args.excludeId && { id: { not: args.excludeId } }),
      ...(args.status && { status: args.status }),
      ...(args.role && { role: args.role }),
      ...(args.search && {
        OR: [
          { email: { contains: args.search } },
          { fullName: { contains: args.search } },
        ],
      }),
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: args.skip,
        take: args.take,
        omit: { passwordHash: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ])

    return { items, total }
  }

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data,
      omit: { passwordHash: true },
    })
  }

  updatePassword(id: string, passwordHash: string) {
    return this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    })
  }

  updateStatus(id: string, status: MemberStatus) {
    return this.prisma.user.update({
      where: { id },
      data: { status },
      omit: { passwordHash: true },
    })
  }

  updateProfile(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
      omit: { passwordHash: true },
    })
  }

  markEmailVerified(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isEmailVerified: true },
    })
  }
}
