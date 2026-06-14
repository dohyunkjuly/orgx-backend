import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class UploadDocumentDto {
  @ApiProperty({ example: 'Annual Report 2024' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string

  @ApiProperty({ example: 'clr1a2b3c4d5e6f7g8h9i0j' })
  @IsString()
  categoryId!: string

  @ApiPropertyOptional({ example: 'Financial report for the fiscal year 2024' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string

  @ApiPropertyOptional({ example: 'minutes,2024,finance' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  tags?: string
}
