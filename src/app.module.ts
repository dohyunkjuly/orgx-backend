import { Module } from '@nestjs/common'
import { MailModule, PrismaModule } from '@lib/modules'
import { HealthModule } from './health/health.module'

@Module({
  imports: [PrismaModule, MailModule, HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
