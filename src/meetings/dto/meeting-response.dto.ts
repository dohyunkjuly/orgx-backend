import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { MeetingStatus } from '@prisma/client'

export class MeetingResponseDto {
  @ApiProperty({ example: 'clr1a2b3c4d5e6f7g8h9i0j' })
  id!: string

  @ApiProperty({ example: 'Monthly General Assembly' })
  title!: string

  @ApiPropertyOptional({ example: '1. Budget review\n2. Elections', nullable: true })
  agenda!: string | null

  @ApiProperty({ example: 'Room A-204, Main Building' })
  location!: string

  @ApiPropertyOptional({ example: 'https://zoom.us/j/123456789', nullable: true })
  meetingLink!: string | null

  @ApiProperty({ example: '2026-07-01T15:00:00Z' })
  startsAt!: Date

  @ApiProperty({ example: '2026-07-01T16:30:00Z' })
  endsAt!: Date

  @ApiProperty({ enum: MeetingStatus, example: MeetingStatus.SCHEDULED })
  status!: MeetingStatus

  @ApiProperty({ example: 'clr1a2b3c4d5e6f7g8h9i0j' })
  createdById!: string

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date
}
