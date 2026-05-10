import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { parseDurationToMs } from '@lib/core'
import { UsersRepository } from '../common/repositories/users.repository'
import { AuthTokenRepository } from '../common/repositories/auth-token.repository'

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: {
        expiresIn: Math.floor(parseDurationToMs(process.env.JWT_ACCESS_TTL ?? '15m') / 1000),
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersRepository,
    AuthTokenRepository,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [UsersRepository, AuthTokenRepository],
})
export class AuthModule {}
