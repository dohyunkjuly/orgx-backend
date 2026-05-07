import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
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
  providers: [AuthService, JwtAuthGuard, UsersRepository, AuthTokenRepository],
  exports: [JwtAuthGuard, UsersRepository, AuthTokenRepository],
})
export class AuthModule {}
