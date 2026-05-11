import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { MailService } from '@lib/modules'
import {
  ApiHttpError,
  ACCOUNT_SUSPENDED,
  ACCOUNT_PENDING,
  CURRENT_PASSWORD_INCORRECT,
  EMAIL_ALREADY_REGISTERED,
  INVALID_CREDENTIALS,
  INVALID_OR_EXPIRED_TOKEN,
  REFRESH_TOKEN_INVALID,
  USER_NOT_FOUND,
  EMAIL_NOT_VERIFIED,
  ACCOUNT_REJECTED,
} from '@lib/core'
import * as bcrypt from 'bcrypt'
import { randomBytes, createHash } from 'crypto'
import { User } from '@prisma/client'

import { RegisterDto } from './dto/register.dto'
import { passwordResetEmail, verificationEmail } from './email-templates'
import { UsersRepository } from '../common/repositories/users.repository'
import { AuthTokenRepository } from '../common/repositories/auth-token.repository'

const BCRYPT_ROUNDS = 12

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly users: UsersRepository,
    private readonly tokens: AuthTokenRepository,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  // ───────────────────────── helpers ─────────────────────────

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }

  private generateOpaqueToken(bytes = 32): string {
    return randomBytes(bytes).toString('base64url')
  }

  private signAccessToken(user: Pick<User, 'id' | 'email' | 'role'>): string {
    return this.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    })
  }

  // ─────────────────────────── register ───────────────────────────

  async register(dto: RegisterDto) {
    const existing = await this.users.findByEmail(dto.email)
    if (existing) throw new ApiHttpError(EMAIL_ALREADY_REGISTERED)

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS)

    const user = await this.users.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      gender: dto.gender,
      phone: dto.phone,
      qualification: dto.qualification,
      degreeDate: dto.degreeDate ? new Date(dto.degreeDate) : null,
      university: dto.university,
      department: dto.department,
      designation: dto.designation,
    })

    try {
      await this.sendVerificationEmail({ ...user, isEmailVerified: false })
    } catch (err) {
      this.logger.error(`Failed to send verification email to ${user.email}: ${(err as Error).message}`)
    }

    return user
  }

  // ─────────────────────────── login ───────────────────────────

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email)
    if (!user) throw new ApiHttpError(INVALID_CREDENTIALS)

    const ok = await bcrypt.compare(password, user.passwordHash)

    if (!ok) throw new ApiHttpError(INVALID_CREDENTIALS)

    if (!user.isEmailVerified) throw new ApiHttpError(EMAIL_NOT_VERIFIED)

    if (user.status === 'PENDING') throw new ApiHttpError(ACCOUNT_PENDING)
    if (user.status === 'SUSPENDED') throw new ApiHttpError(ACCOUNT_SUSPENDED)
    if (user.status === 'REJECTED') throw new ApiHttpError(ACCOUNT_REJECTED)

    const accessToken = this.signAccessToken(user)
    const { token: refreshToken, expiresAt } = await this.issueRefreshToken(user.id)

    return { accessToken, refreshToken, refreshExpiresAt: expiresAt }
  }

  // ─────────────────────────── refresh ───────────────────────────

  /**
   * Rotates the refresh token: the presented one is consumed (revoked),
   * a new one is issued. If we ever see a revoked token reused, we treat
   * it as a compromise signal and revoke all of the user's refresh tokens.
   */
  async refresh(presentedRefreshToken: string) {
    if (!presentedRefreshToken) throw new ApiHttpError(REFRESH_TOKEN_INVALID)

    const tokenHash = this.hashToken(presentedRefreshToken)
    const record = await this.tokens.findRefreshToken(tokenHash)

    if (!record) throw new ApiHttpError(REFRESH_TOKEN_INVALID)

    if (record.revokedAt) {
      // Re-use of a revoked token - likely stolen. Nuke all sessions.
      this.logger.warn(`Refresh token reuse detected for user ${record.userId}`)
      await this.tokens.revokeAllRefreshTokensForUser(record.userId)
      throw new ApiHttpError(REFRESH_TOKEN_INVALID)
    }

    if (record.expiresAt < new Date()) throw new ApiHttpError(REFRESH_TOKEN_INVALID)
    if (record.user.status === 'SUSPENDED') throw new ApiHttpError(ACCOUNT_SUSPENDED)

    await this.tokens.revokeRefreshToken(record.id)

    const accessToken = this.signAccessToken(record.user)
    const { token: refreshToken, expiresAt } = await this.issueRefreshToken(record.user.id)

    return { accessToken, refreshToken, refreshExpiresAt: expiresAt }
  }

  // ─────────────────────────── logout ───────────────────────────

  async logout(presentedRefreshToken: string | undefined) {
    if (!presentedRefreshToken) return
    const tokenHash = this.hashToken(presentedRefreshToken)
    await this.tokens.revokeRefreshTokenByHash(tokenHash)
  }

  async logoutAllSessions(userId: string) {
    await this.tokens.revokeAllRefreshTokensForUser(userId)
  }

  // ─────────────────────────── me ───────────────────────────

  async getMe(userId: string) {
    const user = await this.users.findByIdSafe(userId)
    if (!user) throw new ApiHttpError(USER_NOT_FOUND)
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
    }
  }

  // ───────────────────── email verification ─────────────────────

  async sendVerificationEmail(user: Pick<User, 'id' | 'email' | 'fullName' | 'isEmailVerified'>) {
    if (user.isEmailVerified) return

    const token = this.generateOpaqueToken()
    const ttlHours = Number(this.config.get<string>('EMAIL_VERIFY_TTL_HOURS') ?? 24)
    const expiresAt = new Date(Date.now() + ttlHours * 3600 * 1000)

    await this.tokens.createEmailVerificationToken(user.id, this.hashToken(token), expiresAt)

    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000'
    const verifyUrl = `${frontendUrl}/register/verify?token=${encodeURIComponent(token)}`

    await this.mail.sendMail({
      to: user.email,
      ...verificationEmail({ fullName: user.fullName, verifyUrl, ttlHours }),
    })
  }

  async resendVerification(email: string) {
    const user = await this.users.findByEmail(email)
    if (!user || user.isEmailVerified) return
    await this.sendVerificationEmail(user)
  }

  async verifyEmail(token: string) {
    const tokenHash = this.hashToken(token)
    const record = await this.tokens.findEmailVerificationToken(tokenHash)

    if (!record || record.consumedAt || record.expiresAt < new Date()) {
      throw new ApiHttpError(INVALID_OR_EXPIRED_TOKEN)
    }

    await this.tokens.consumeEmailVerificationToken(record)
  }

  // ────────────────────── password reset ──────────────────────

  async forgotPassword(email: string) {
    const user = await this.users.findByEmail(email)
    if (!user) return

    const token = this.generateOpaqueToken()
    const ttlMinutes = Number(this.config.get<string>('PASSWORD_RESET_TTL_MINUTES') ?? 60)
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000)

    await this.tokens.createPasswordResetToken(user.id, this.hashToken(token), expiresAt)

    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000'
    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`
    
    this.mail
      .sendMail({
        to: user.email,
        ...passwordResetEmail({ fullName: user.fullName, resetUrl, ttlMinutes }),
      })
      .catch((err) => this.logger.error(`Failed to send reset email to ${user.email}: ${(err as Error).message}`))
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = this.hashToken(token)
    const record = await this.tokens.findPasswordResetToken(tokenHash)

    if (!record || record.consumedAt || record.expiresAt < new Date()) {
      throw new ApiHttpError(INVALID_OR_EXPIRED_TOKEN)
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)
    await this.tokens.consumePasswordResetToken(record, passwordHash)
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.users.findById(userId)
    if (!user) throw new ApiHttpError(USER_NOT_FOUND)

    const ok = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!ok) throw new ApiHttpError(CURRENT_PASSWORD_INCORRECT)

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)
    await this.users.updatePassword(userId, passwordHash)
    await this.logoutAllSessions(userId)
  }

  // ─────────────────────── private utils ───────────────────────

  private async issueRefreshToken(userId: string) {
    const token = this.generateOpaqueToken()
    const ttlDays = Number(this.config.get<string>('JWT_REFRESH_TTL_DAYS') ?? 30)
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 3600 * 1000)

    await this.tokens.createRefreshToken(userId, this.hashToken(token), expiresAt)
    return { token, expiresAt }
  }
}
