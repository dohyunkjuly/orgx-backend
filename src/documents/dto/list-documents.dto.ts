import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class ListDocumentsDto {
  @ApiPropertyOptional({ description: 'Filter by category id' })
  @IsOptional()
  @IsString()
  categoryId?: string

  @ApiPropertyOptional({ description: 'Match against title or tags' })
  @IsOptional()
  @IsString()
  search?: string
}
