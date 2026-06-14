import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule, MailModule, StorageModule } from '@lib/modules'
import { AuthModule } from './auth/auth.module'
import { DocCategoriesModule } from './documents/doc-categories/doc-categories.module'
import { DocumentsModule } from './documents/documents.module'
import { HealthModule } from './health/health.module'
import { NotificationsModule } from './notifications/notifications.module'
import { SocketModule } from './socket/socket.module'
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
    DocCategoriesModule,
    DocumentsModule,
    NotificationsModule,
    SocketModule,
  ],
})
export class AppModule { }
