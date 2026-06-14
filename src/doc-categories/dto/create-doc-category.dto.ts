import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateDocCategoryDto {
  @ApiProperty({ example: 'Meeting Minutes' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string

  @ApiPropertyOptional({ example: 'Official minutes from committee meetings' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string
}
