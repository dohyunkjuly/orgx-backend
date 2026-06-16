import { ApiProperty } from '@nestjs/swagger'

export class WhatsAppAnalysisSummaryDto {
  @ApiProperty({ example: 'clr1a2b3c4d5e6f7g8h9i0j' })
  id!: string

  @ApiProperty({ example: 'clr1a2b3c4d5e6f7g8h9i0j' })
  uploadedById!: string

  @ApiProperty({ example: 'Software Engineering Group A.txt' })
  fileName!: string

  @ApiProperty({ example: '2025-12-17T20:30:42.000Z' })
  periodStart!: Date

  @ApiProperty({ example: '2026-06-13T10:26:46.000Z' })
  periodEnd!: Date

  @ApiProperty({ example: 42 })
  messageCount!: number

  @ApiProperty()
  uploadedAt!: Date
}
