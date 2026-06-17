import { ApiProperty } from '@nestjs/swagger'

export class MeetingMinutesResponseDto {
  @ApiProperty({ example: 'clr1a2b3c4d5e6f7g8h9i0j' })
  id!: string

  @ApiProperty({ example: 'clr1a2b3c4d5e6f7g8h9i0j' })
  meetingId!: string

  @ApiProperty({ example: '<h2>Decisions</h2><p>Budget approved...</p>' })
  content!: string

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date
}
