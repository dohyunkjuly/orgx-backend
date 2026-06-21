import { ApiProperty } from '@nestjs/swagger'

export class TransactionAttachmentResponseDto {
  @ApiProperty({ example: 'clr1a2b3c4d5e6f7g8h9i0j' })
  id!: string

  @ApiProperty({ example: 'clr1a2b3c4d5e6f7g8h9i0j' })
  transactionId!: string

  @ApiProperty({ example: 'receipt-2026-07.pdf' })
  fileName!: string

  @ApiProperty({ example: 'application/pdf' })
  mimeType!: string

  @ApiProperty({ example: 248123 })
  sizeBytes!: number

  @ApiProperty()
  createdAt!: Date
}
