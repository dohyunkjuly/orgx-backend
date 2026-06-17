import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { TransactionType } from '@prisma/client'

class TransactionCategoryDto {
  @ApiProperty({ example: 'cm1234abcd' })
  id!: string

  @ApiProperty({ example: 'Membership Dues' })
  name!: string

  @ApiProperty({ enum: TransactionType, example: 'INCOME' })
  type!: TransactionType
}

export class TransactionResponseDto {
  @ApiProperty({ example: 'cm1234abcd' })
  id!: string

  @ApiProperty({ enum: TransactionType, example: 'INCOME' })
  type!: TransactionType

  @ApiProperty({ example: 150.0 })
  amount!: number

  @ApiProperty({ example: '2026-06-01T00:00:00.000Z' })
  occurredOn!: Date

  @ApiPropertyOptional({ example: 'Monthly membership payment' })
  description?: string | null

  @ApiPropertyOptional({ example: 'Jane Doe' })
  counterparty?: string | null

  @ApiProperty()
  category!: TransactionCategoryDto

  @ApiProperty({ example: '2026-06-01T00:00:00.000Z' })
  createdAt!: Date
}
