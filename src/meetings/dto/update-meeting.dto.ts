import { ApiPropertyOptional } from '@nestjs/swagger'
import { MeetingStatus } from '@prisma/client'
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator'

export class UpdateMeetingDto {
  @ApiPropertyOptional({ example: 'Monthly General Assembly' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string

  @ApiPropertyOptional({ example: '1. Budget review\n2. Elections' })
  @IsOptional()
  @IsString()
  agenda?: string

  @ApiPropertyOptional({ example: 'Room A-204, Main Building' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  location?: string

  @ApiPropertyOptional({ example: 'https://zoom.us/j/123456789' })
  @IsOptional()
  @IsUrl()
  meetingLink?: string

  @ApiPropertyOptional({ example: '2026-07-01T15:00:00Z' })
  @IsOptional()
  @IsDateString()
  startsAt?: string

  @ApiPropertyOptional({ example: '2026-07-01T16:30:00Z' })
  @IsOptional()
  @IsDateString()
  endsAt?: string

  @ApiPropertyOptional({ enum: MeetingStatus, example: MeetingStatus.COMPLETED })
  @IsOptional()
  @IsEnum(MeetingStatus)
  status?: MeetingStatus
}
