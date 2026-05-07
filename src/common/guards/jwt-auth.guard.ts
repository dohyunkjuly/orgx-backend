import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { Request } from 'express'
import type { JwtPayload } from '../types/jwt-payload'
import { UsersRepository } from '../repositories/users.repository'

const ACCESS_COOKIE_NAME = 'accessToken'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly users: UsersRepository,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>()
    const token = this.extractToken(req)
    if (!token) throw new UnauthorizedException()

    let payload: JwtPayload
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(token)
    } catch {
      throw new UnauthorizedException()
    }

    const user = await this.users.findByIdSafe(payload.sub)
    if (!user) throw new UnauthorizedException()
    if (user.status === 'SUSPENDED')
      throw new UnauthorizedException()

      // attach to request so @CurrentUser() can read it
    ;(req as Request & { user: typeof user }).user = user
    return true
  }

  private extractToken(req: Request): string | null {
    const cookie = req.cookies?.[ACCESS_COOKIE_NAME]
    if (cookie) return cookie

    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7)

    return null
  }
}
