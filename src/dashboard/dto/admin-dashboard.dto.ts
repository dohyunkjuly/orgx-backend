import { ApiProperty } from '@nestjs/swagger'
import { DashboardMeetingDto } from './dashboard-meeting.dto'

class MemberCountsDto {
  @ApiProperty({ example: 120 })
  total!: number

  @ApiProperty({ example: 100 })
  active!: number

  @ApiProperty({ example: 8, description: 'Members awaiting approval (actionable)' })
  pending!: number

  @ApiProperty({ example: 2 })
  suspended!: number
}

class OpenBallotDto {
  @ApiProperty({ example: 'clbal1abcd' })
  id!: string

  @ApiProperty({ example: 'Sprint 2 Priority' })
  title!: string

  @ApiProperty({ example: 'Which feature should we build next?' })
  question!: string

  @ApiProperty()
  endsAt!: Date
}

class BallotCountsDto {
  @ApiProperty({ example: 3 })
  open!: number

  @ApiProperty({ example: 1 })
  draft!: number

  @ApiProperty({ type: [OpenBallotDto], description: 'Top 5 open ballots, soonest-closing first' })
  items!: OpenBallotDto[]
}

class FinanceSummaryDto {
  @ApiProperty({ example: 15000 })
  totalIncome!: number

  @ApiProperty({ example: 9000 })
  totalExpense!: number

  @ApiProperty({ example: 6000 })
  netBalance!: number
}

class DocumentCountsDto {
  @ApiProperty({ example: 42 })
  total!: number
}

export class AdminDashboardDto {
  @ApiProperty({ example: 'ADMIN' })
  role!: 'ADMIN'

  @ApiProperty({ type: MemberCountsDto })
  members!: MemberCountsDto

  @ApiProperty({ type: [DashboardMeetingDto], description: 'Next 5 scheduled meetings' })
  upcomingMeetings!: DashboardMeetingDto[]

  @ApiProperty({ type: BallotCountsDto })
  ballots!: BallotCountsDto

  @ApiProperty({ type: FinanceSummaryDto, description: 'All-time totals' })
  finance!: FinanceSummaryDto

  @ApiProperty({ type: DocumentCountsDto })
  documents!: DocumentCountsDto
}
