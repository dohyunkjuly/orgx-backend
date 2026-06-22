import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule, MailModule, StorageModule } from '@lib/modules'
import { AuthModule } from './auth/auth.module'
import { DocCategoriesModule } from './doc-categories/doc-categories.module'
import { DocumentsModule } from './documents/documents.module'
import { HealthModule } from './health/health.module'
import { NotificationsModule } from './notifications/notifications.module'
import { SocketModule } from './socket/socket.module'
import { UsersModule } from './users/users.module'
import { BallotsModule } from './ballots/ballots.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module'
import { TransactionCategoriesModule } from './transaction-categories/transaction-categories.module'
import { TransactionsModule } from './transactions/transactions.module'
import { MeetingsModule } from './meetings/meetings.module'
import { MeetingMinutesModule } from './meeting-minutes/meeting-minutes.module'
import { DashboardModule } from './dashboard/dashboard.module'

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
    WhatsAppModule,
    TransactionCategoriesModule,
    TransactionsModule,
    MeetingsModule,
    MeetingMinutesModule,
    DashboardModule,
  ],
})
export class AppModule { }
