import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule, MailModule, StorageModule } from '@lib/modules'
import { AuthModule } from './auth/auth.module'
import { HealthModule } from './health/health.module'
import { UsersModule } from './users/users.module'
import { BallotsModule } from './ballots/ballots.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    PrismaModule,
    MailModule,
    StorageModule,
    AuthModule,
    HealthModule,
    UsersModule,
    BallotsModule,
  ],
})
export class AppModule {}
