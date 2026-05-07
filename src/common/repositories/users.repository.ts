import { Injectable } from '@nestjs/common'
import { PrismaService } from '@lib/modules'
import { Prisma, User } from '@prisma/client'

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

  markEmailVerified(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isEmailVerified: true },
    })
  }
}
