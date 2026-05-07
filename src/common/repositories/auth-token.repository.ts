// src/common/repositories/auth-token.repository.ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '@lib/modules'
import { UserEmailVerificationToken, UserPasswordResetToken } from '@prisma/client'

@Injectable()
export class AuthTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─────────── refresh tokens ───────────

  createRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
    return this.prisma.userRefreshToken.create({
      data: { userId, tokenHash, expiresAt },
    })
  }

  findRefreshToken(tokenHash: string) {
    return this.prisma.userRefreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    })
  }

  revokeRefreshToken(id: string) {
    return this.prisma.userRefreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    })
  }

  /** Used at logout - update by tokenHash, ignore "not found". */
  async revokeRefreshTokenByHash(tokenHash: string): Promise<void> {
    await this.prisma.userRefreshToken
      .update({
        where: { tokenHash },
        data: { revokedAt: new Date() },
      })
      .catch(() => undefined)
  }

  revokeAllRefreshTokensForUser(userId: string) {
    return this.prisma.userRefreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
  }

  // ─────────── email verification tokens ───────────

  createEmailVerificationToken(userId: string, tokenHash: string, expiresAt: Date) {
    return this.prisma.userEmailVerificationToken.create({
      data: { userId, tokenHash, expiresAt },
    })
  }

  findEmailVerificationToken(tokenHash: string) {
    return this.prisma.userEmailVerificationToken.findUnique({
      where: { tokenHash },
    })
  }

  /** Atomically consume the verify token and mark the user verified. */
  consumeEmailVerificationToken(token: UserEmailVerificationToken) {
    return this.prisma.$transaction([
      this.prisma.userEmailVerificationToken.update({
        where: { id: token.id },
        data: { consumedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: token.userId },
        data: { isEmailVerified: true },
      }),
    ])
  }

  // ─────────── password reset tokens ───────────

  createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date) {
    return this.prisma.userPasswordResetToken.create({
      data: { userId, tokenHash, expiresAt },
    })
  }

  findPasswordResetToken(tokenHash: string) {
    return this.prisma.userPasswordResetToken.findUnique({
      where: { tokenHash },
    })
  }

  /**
   * Atomically: consume the reset token, set the new password,
   * and revoke all of the user's refresh tokens.
   */
  consumePasswordResetToken(token: UserPasswordResetToken, passwordHash: string) {
    return this.prisma.$transaction([
      this.prisma.userPasswordResetToken.update({
        where: { id: token.id },
        data: { consumedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: token.userId },
        data: { passwordHash },
      }),
      this.prisma.userRefreshToken.updateMany({
        where: { userId: token.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ])
  }
}
