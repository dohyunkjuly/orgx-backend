import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator'
import { TransactionType } from '@prisma/client'

export class CreateTransactionDto {
  @ApiProperty({ enum: TransactionType, example: 'INCOME' })
  @IsEnum(TransactionType)
  type!: TransactionType

  @ApiProperty({ example: 150.0 })
  @IsNumber()
  @Min(0.01)
  amount!: number

  @ApiProperty({ example: '2026-06-01' })
  @IsDateString()
  occurredOn!: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string

  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  counterparty?: string

  @ApiProperty()
  @IsString()
  categoryId!: string
}
