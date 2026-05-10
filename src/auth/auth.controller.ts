import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import type { Request, Response } from 'express'
import { ConfigService } from '@nestjs/config'
import { ApiWrappedResponse, parseDurationToMs } from '@lib/core'

import { AuthService } from './auth.service'
import { ChangePasswordDto } from './dto/change-password.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { ResendVerificationDto } from './dto/resend-verification.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { UserResponseDto } from './dto/user-response.dto'
import { VerifyEmailDto } from './dto/verify-email.dto'
import type { AuthUser } from '../common/types/user'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Public } from '../common/decorators/public.decorator'
import {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  accessCookieOptions,
  clearAccessCookieOptions,
  clearRefreshCookieOptions,
  refreshCookieOptions,
} from './cookie.config'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  // ───────── public endpoints ─────────

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user; sends verification email' })
  @ApiWrappedResponse(UserResponseDto)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Log in; sets accessToken & refreshToken httpOnly cookies' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto.email, dto.password)
    this.setAuthCookies(res, result.accessToken, result.refreshToken)
    return { ok: true }
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Rotate access & refresh tokens using refreshToken cookie' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const presented = req.cookies?.[REFRESH_COOKIE_NAME]
    const result = await this.authService.refresh(presented)
    this.setAuthCookies(res, result.accessToken, result.refreshToken)
    return { ok: true }
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Revoke current refresh token & clear cookies' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const presented = req.cookies?.[REFRESH_COOKIE_NAME]
    await this.authService.logout(presented)
    res.clearCookie(ACCESS_COOKIE_NAME, clearAccessCookieOptions())
    res.clearCookie(REFRESH_COOKIE_NAME, clearRefreshCookieOptions())
    return { ok: true }
  }

  @Public()
  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email using token from email link' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.authService.verifyEmail(dto.token)
    return { ok: true }
  }

  @Public()
  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend email verification link' })
  async resendVerification(@Body() dto: ResendVerificationDto) {
    await this.authService.resendVerification(dto.email)
    return { ok: true }
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Send password reset email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email)
    return { ok: true }
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using token from email link' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.newPassword)
    return { ok: true }
  }

  // ───────── protected endpoints ─────────

  @Get('me')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get currently authenticated user' })
  @ApiWrappedResponse(UserResponseDto)
  async getMe(@CurrentUser() user: AuthUser) {
    return this.authService.getMe(user.id)
  }

  @Post('change-password')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Change password (authenticated); revokes all sessions' })
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.changePassword(user.id, dto.currentPassword, dto.newPassword)
    res.clearCookie(ACCESS_COOKIE_NAME, clearAccessCookieOptions())
    res.clearCookie(REFRESH_COOKIE_NAME, clearRefreshCookieOptions())
    return { ok: true }
  }

  // ───────── helpers ─────────

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const accessTtlMs = parseDurationToMs(this.config.get<string>('JWT_ACCESS_TTL') ?? '15m')
    const refreshTtlDays = Number(this.config.get<string>('JWT_REFRESH_TTL_DAYS') ?? 30)
    const refreshTtlMs = refreshTtlDays * 86_400_000

    res.cookie(ACCESS_COOKIE_NAME, accessToken, accessCookieOptions(accessTtlMs))
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions(refreshTtlMs))
  }
}
