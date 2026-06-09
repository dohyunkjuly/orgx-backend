import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule, MailModule, StorageModule } from '@lib/modules'
import { AuthModule } from './auth/auth.module'
import { HealthModule } from './health/health.module'
import { NotificationsModule } from './notifications/notifications.module'
import { SocketModule } from './socket/socket.module'
import { UsersModule } from './users/users.module'

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
    NotificationsModule,
    SocketModule,
  ],
})
export class AppModule {}
