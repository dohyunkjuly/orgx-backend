import { ApiProperty } from '@nestjs/swagger'

export class DocCategoryResponseDto {
  @ApiProperty({ example: 'clr1a2b3c4d5e6f7g8h9i0j' })
  id!: string

  @ApiProperty({ example: 'Meeting Minutes' })
  name!: string

  @ApiProperty({ example: 'Official minutes from committee meetings', nullable: true })
  description!: string | null

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date
}
