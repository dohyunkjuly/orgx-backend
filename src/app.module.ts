import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule, MailModule } from '@lib/modules'
import { AuthModule } from './auth/auth.module'
import { HealthModule } from './health/health.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    PrismaModule,
    MailModule,
    AuthModule,
    HealthModule,
    UsersModule,
  ],
})
export class AppModule {}
