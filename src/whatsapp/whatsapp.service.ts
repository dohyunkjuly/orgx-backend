import { Injectable, Logger } from '@nestjs/common'
import { ApiHttpError, WHATSAPP_ANALYSIS_NOT_FOUND } from '@lib/core'
import { StorageService } from '@lib/modules'
import type { Prisma } from '@prisma/client'
import { WhatsAppAnalysisRepository } from '../common/repositories/whatsapp-analysis.repository'
import { SentimentService } from './sentiment.service'
import { SpamService } from './spam.service'
import { buildAnalytics } from './whatsapp-analytics'
import { parseWhatsAppExport } from './whatsapp-parser'

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name)

  constructor(
    private readonly repo: WhatsAppAnalysisRepository,
    private readonly storage: StorageService,
    private readonly sentiment: SentimentService,
    private readonly spam: SpamService,
  ) {}

  async analyze(file: Express.Multer.File, uploadedById: string) {
    const raw = file.buffer.toString('utf-8')

    // Keep the raw export in S3 so it can be re-analyzed later.
    const key = `whatsapp/${Date.now()}-${file.originalname}`
    await this.storage.upload({ key, body: file.buffer, contentType: 'text/plain' })

    const messages = parseWhatsAppExport(raw)
    const texts = messages.filter((m) => m.type === 'text').map((m) => m.text)

    this.logger.log(`Parsed ${messages.length} messages, classifying ${texts.length} texts`)
    const [sentiments, spamFlags] = await Promise.all([
      this.sentiment.classify(texts),
      this.spam.classify(texts),
    ])

    const analytics = buildAnalytics(messages, sentiments, spamFlags)

    return this.repo.create({
      uploadedById,
      fileName: file.originalname,
      fileKey: key,
      periodStart: new Date(analytics.summary.periodStart),
      periodEnd: new Date(analytics.summary.periodEnd),
      messageCount: analytics.summary.messageCount,
      analytics: analytics as unknown as Prisma.InputJsonValue,
    })
  }

  findAll() {
    return this.repo.findMany()
  }

  async findById(id: string) {
    const analysis = await this.repo.findById(id)
    if (!analysis) throw new ApiHttpError(WHATSAPP_ANALYSIS_NOT_FOUND)
    return analysis
  }

  /** Presigned URL to download the original .txt export. */
  async getFileUrl(id: string) {
    const analysis = await this.findById(id)
    if (!analysis.fileKey) throw new ApiHttpError(WHATSAPP_ANALYSIS_NOT_FOUND)
    return { url: await this.storage.getUrl(analysis.fileKey) }
  }

  async delete(id: string) {
    const analysis = await this.findById(id)
    if (analysis.fileKey) {
      await this.storage.delete(analysis.fileKey).catch((error) =>
        this.logger.error(`Failed to delete stored export for ${id}`, error),
      )
    }
    await this.repo.delete(id)
  }
}
