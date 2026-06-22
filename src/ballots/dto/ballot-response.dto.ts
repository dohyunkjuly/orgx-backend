import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { BallotStatus, BallotType } from '@prisma/client'

class BallotOptionDto {
  @ApiProperty({ example: 'clopt1abcd' })
  id!: string

  @ApiProperty({ example: 'Dark Mode' })
  label!: string

  @ApiProperty({ example: 1 })
  position!: number
}

export class BallotResponseDto {
  @ApiProperty({ example: 'clbal1abcd' })
  id!: string

  @ApiProperty({ example: 'Sprint 2 Priority' })
  title!: string

  @ApiPropertyOptional({ nullable: true })
  description!: string | null

  @ApiProperty({ example: 'Which feature should we build next?' })
  question!: string

  @ApiProperty({ enum: BallotType })
  type!: BallotType

  @ApiPropertyOptional({ nullable: true, example: 2 })
  maxSelections!: number | null

  @ApiProperty({ enum: BallotStatus })
  status!: BallotStatus

  @ApiProperty()
  startsAt!: Date

  @ApiProperty()
  endsAt!: Date

  @ApiProperty({ type: [BallotOptionDto] })
  options!: BallotOptionDto[]

  @ApiProperty()
  createdAt!: Date
}
