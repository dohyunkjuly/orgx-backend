import { ApiProperty } from '@nestjs/swagger'
import { DashboardMeetingDto } from './dashboard-meeting.dto'

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

class RecentDocumentDto {
  @ApiProperty({ example: 'cldoc1abcd' })
  id!: string

  @ApiProperty({ example: 'Annual Report 2026' })
  title!: string

  @ApiProperty()
  createdAt!: Date
}

export class MemberDashboardDto {
  @ApiProperty({ example: 'MEMBER' })
  role!: 'MEMBER'

  @ApiProperty({ type: [DashboardMeetingDto], description: 'Next 5 scheduled meetings' })
  upcomingMeetings!: DashboardMeetingDto[]

  @ApiProperty({ type: [OpenBallotDto], description: 'Open ballots not yet voted in' })
  openBallotsToVote!: OpenBallotDto[]

  @ApiProperty({ example: 3 })
  unreadNotifications!: number

  @ApiProperty({ type: [RecentDocumentDto], description: 'Latest 5 documents' })
  recentDocuments!: RecentDocumentDto[]
}
