import { Module } from '@nestjs/common'
import { StorageModule } from '@lib/modules'
import { WhatsAppAnalysisRepository } from '../common/repositories/whatsapp-analysis.repository'
import { SentimentService } from './sentiment.service'
import { SpamService } from './spam.service'
import { WhatsAppController } from './whatsapp.controller'
import { WhatsAppService } from './whatsapp.service'

@Module({
  imports: [StorageModule],
  controllers: [WhatsAppController],
  providers: [WhatsAppService, SentimentService, SpamService, WhatsAppAnalysisRepository],
})
export class WhatsAppModule {}
