import { ApiPropertyOptional } from '@nestjs/swagger'
import { MeetingStatus } from '@prisma/client'
import { IsDateString, IsEnum, IsOptional } from 'class-validator'

export class ListMeetingsDto {
  @ApiPropertyOptional({
    example: '2026-07-01T00:00:00Z',
    description: 'Start of the calendar range (inclusive). Filters by meeting start time.',
  })
  @IsOptional()
  @IsDateString()
  from?: string

  @ApiPropertyOptional({
    example: '2026-07-31T23:59:59Z',
    description: 'End of the calendar range (inclusive).',
  })
  @IsOptional()
  @IsDateString()
  to?: string

  @ApiPropertyOptional({ enum: MeetingStatus })
  @IsOptional()
  @IsEnum(MeetingStatus)
  status?: MeetingStatus
}
