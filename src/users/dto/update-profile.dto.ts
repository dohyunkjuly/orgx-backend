import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { Gender } from '@prisma/client'

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  fullName?: string

  @ApiPropertyOptional({ enum: Gender, example: Gender.FEMALE })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender

  @ApiPropertyOptional({ example: '+49 30 1234567' })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  phone?: string

  @ApiPropertyOptional({ example: 'PhD, Computer Science' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  qualification?: string

  @ApiPropertyOptional({ example: 'Technical University of Berlin' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  university?: string

  @ApiPropertyOptional({ example: 'Computer Science' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  department?: string

  @ApiPropertyOptional({ example: 'Senior Researcher' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  designation?: string
}
