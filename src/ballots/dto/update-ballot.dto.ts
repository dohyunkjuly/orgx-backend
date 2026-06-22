import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { BallotType } from '@prisma/client'

// Only allowed while the ballot is still a DRAFT.
export class UpdateBallotDto {
  @ApiPropertyOptional({ example: 'Sprint 2 Priority' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string

  @ApiPropertyOptional({ example: 'Which feature should we build next?' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  question?: string

  @ApiPropertyOptional({ example: 'Vote on the next sprint priority.' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ enum: BallotType })
  @IsOptional()
  @IsEnum(BallotType)
  type?: BallotType

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxSelections?: number

  @ApiPropertyOptional({ example: '2024-05-01T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  startsAt?: string

  @ApiPropertyOptional({ example: '2024-05-15T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  endsAt?: string

  @ApiPropertyOptional({ example: ['Dark Mode', 'Email Notifications'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(2)
  options?: string[]
}
