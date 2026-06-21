import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { TransactionType } from '@prisma/client'

export class ListTransactionsDto {
  @ApiPropertyOptional({ enum: TransactionType })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string

  @ApiPropertyOptional({ default: 1, minimum: 1, example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100, example: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20
}
