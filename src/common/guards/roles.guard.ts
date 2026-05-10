import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Request } from 'express'
import type { Role } from '@prisma/client'
import { ApiHttpError, FORBIDDEN_ROLE } from '@lib/core'
import { ROLES_KEY } from '../decorators/roles.decorator'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'
import type { AuthUser } from '../types/user'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ])
    if (isPublic) return true

    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ])
    if (!required || required.length === 0) return true

    const req = ctx.switchToHttp().getRequest<Request & { user?: AuthUser }>()
    if (!req.user || !required.includes(req.user.role)) {
      throw new ApiHttpError(FORBIDDEN_ROLE)
    }
    return true
  }
}
