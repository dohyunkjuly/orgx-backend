import { ApiProperty } from '@nestjs/swagger'

class AnnouncementAuthorDto {
  @ApiProperty({ example: 'cluser1abcd' })
  id!: string

  @ApiProperty({ example: 'Jane Doe' })
  fullName!: string
}

export class AnnouncementResponseDto {
  @ApiProperty({ example: 'clann1abcd' })
  id!: string

  @ApiProperty({ example: 'Office closed on Friday' })
  title!: string

  @ApiProperty({ example: 'The office will be closed this Friday for maintenance.' })
  body!: string

  @ApiProperty({ example: 'cluser1abcd' })
  createdById!: string

  @ApiProperty({ type: AnnouncementAuthorDto })
  createdBy!: AnnouncementAuthorDto

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date
}
