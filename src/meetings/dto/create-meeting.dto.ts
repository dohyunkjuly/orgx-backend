import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator'

export class CreateMeetingDto {
  @ApiProperty({ example: 'Monthly General Assembly' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string

  @ApiPropertyOptional({ example: '1. Budget review\n2. Elections\n3. AOB' })
  @IsOptional()
  @IsString()
  agenda?: string

  @ApiProperty({ example: 'Room A-204, Main Building' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  location!: string

  @ApiPropertyOptional({ example: 'https://zoom.us/j/123456789' })
  @IsOptional()
  @IsUrl()
  meetingLink?: string

  @ApiProperty({ example: '2026-07-01T15:00:00Z' })
  @IsDateString()
  startsAt!: string

  @ApiProperty({ example: '2026-07-01T16:30:00Z' })
  @IsDateString()
  endsAt!: string
}
