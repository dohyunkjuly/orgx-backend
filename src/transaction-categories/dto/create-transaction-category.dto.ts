import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator'
import { TransactionType } from '@prisma/client'

export class CreateTransactionCategoryDto {
  @ApiProperty({ example: 'Membership Dues' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string

  @ApiProperty({ enum: TransactionType, example: 'INCOME' })
  @IsEnum(TransactionType)
  type!: TransactionType
}
