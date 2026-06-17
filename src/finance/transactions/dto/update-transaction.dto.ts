import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator'
import { TransactionType } from '@prisma/client'

export class UpdateTransactionDto {
  @ApiPropertyOptional({ enum: TransactionType, example: 'INCOME' })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType

  @ApiPropertyOptional({ example: 150.0 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number

  @ApiPropertyOptional({ example: '2026-06-01' })
  @IsOptional()
  @IsDateString()
  occurredOn?: string

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string
}
