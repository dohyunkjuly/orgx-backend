import { ApiProperty } from '@nestjs/swagger'
import { TransactionType } from '@prisma/client'

export class TransactionCategoryResponseDto {
  @ApiProperty({ example: 'cm1234abcd' })
  id!: string

  @ApiProperty({ example: 'Membership Dues' })
  name!: string

  @ApiProperty({ enum: TransactionType, example: 'INCOME' })
  type!: TransactionType

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  createdAt!: Date
}
