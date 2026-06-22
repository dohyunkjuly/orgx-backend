import { ApiProperty } from '@nestjs/swagger'

class BallotOptionResultDto {
  @ApiProperty({ example: 'clopt1abcd' })
  optionId!: string

  @ApiProperty({ example: 'Dark Mode' })
  label!: string

  @ApiProperty({ example: 12 })
  votes!: number
}

export class BallotResultsDto {
  @ApiProperty({ example: 'clbal1abcd' })
  ballotId!: string

  @ApiProperty({ example: 20, description: 'Number of voters who participated' })
  totalParticipants!: number

  @ApiProperty({ type: [BallotOptionResultDto] })
  results!: BallotOptionResultDto[]
}
