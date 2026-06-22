import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class DashboardMeetingDto {
  @ApiProperty({ example: 'clmtg1abcd' })
  id!: string

  @ApiProperty({ example: 'Monthly General Assembly' })
  title!: string

  @ApiProperty()
  startsAt!: Date

  @ApiProperty()
  endsAt!: Date

  @ApiProperty({ example: 'Room A-204' })
  location!: string

  @ApiPropertyOptional({ nullable: true, example: 'https://zoom.us/j/123' })
  meetingLink!: string | null
}
