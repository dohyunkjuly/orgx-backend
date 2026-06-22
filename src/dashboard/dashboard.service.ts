import { Injectable } from '@nestjs/common'
import { BallotStatus, MeetingStatus } from '@prisma/client'
import { BallotsRepository } from '../common/repositories/ballots.repository'
import { DocumentsRepository } from '../common/repositories/documents.repository'
import { MeetingsRepository } from '../common/repositories/meetings.repository'
import { NotificationRepository } from '../common/repositories/notification.repository'
import { TransactionsRepository } from '../common/repositories/transactions.repository'
import { UsersRepository } from '../common/repositories/users.repository'
import type { AuthUser } from '../common/types/user'

const UPCOMING_MEETINGS = 5
const RECENT_DOCUMENTS = 5
const OPEN_BALLOTS = 5

@Injectable()
export class DashboardService {
  constructor(
    private readonly users: UsersRepository,
    private readonly meetings: MeetingsRepository,
    private readonly ballots: BallotsRepository,
    private readonly transactions: TransactionsRepository,
    private readonly notifications: NotificationRepository,
    private readonly documents: DocumentsRepository,
  ) {}

  async getAdmin() {
    const [members, upcomingMeetings, openBallots, draftBallots, txns, documentsCount] =
      await Promise.all([
        this.users.countsByStatus(),
        this.upcomingMeetings(),
        this.ballots.findMany({ status: BallotStatus.OPEN }),
        this.ballots.countByStatus(BallotStatus.DRAFT),
        this.transactions.getSummary(),
        this.documents.count(),
      ])

    let totalIncome = 0
    let totalExpense = 0
    for (const tx of txns) {
      const amount = Number(tx.amount)
      if (tx.type === 'INCOME') totalIncome += amount
      else totalExpense += amount
    }

    // Top 5 open ballots, soonest-closing first.
    const topOpenBallots = [...openBallots]
      .sort((a, b) => a.endsAt.getTime() - b.endsAt.getTime())
      .slice(0, OPEN_BALLOTS)
      .map((b) => ({ id: b.id, title: b.title, question: b.question, endsAt: b.endsAt }))

    return {
      role: 'ADMIN' as const,
      members, // { total, active, pending, suspended } — `pending` = approvals to action
      upcomingMeetings,
      ballots: { open: openBallots.length, draft: draftBallots, items: topOpenBallots },
      finance: { totalIncome, totalExpense, netBalance: totalIncome - totalExpense },
      documents: { total: documentsCount },
    }
  }

  async getMember(user: AuthUser) {
    const [upcomingMeetings, openBallotsToVote, unreadNotifications, recentDocuments] =
      await Promise.all([
        this.upcomingMeetings(),
        this.openBallotsToVote(user.id),
        this.notifications.countUnread(user.id),
        this.documents.findRecent(RECENT_DOCUMENTS),
      ])

    return {
      role: 'MEMBER' as const,
      upcomingMeetings,
      openBallotsToVote, // ballots that are OPEN and the member hasn't voted in yet
      unreadNotifications,
      recentDocuments,
    }
  }

  private async upcomingMeetings() {
    const meetings = await this.meetings.findMany({
      from: new Date(),
      status: MeetingStatus.SCHEDULED,
    })
    return meetings.slice(0, UPCOMING_MEETINGS).map((m) => ({
      id: m.id,
      title: m.title,
      startsAt: m.startsAt,
      endsAt: m.endsAt,
      location: m.location,
      meetingLink: m.meetingLink,
    }))
  }

  private async openBallotsToVote(userId: string) {
    const open = await this.ballots.findMany({ status: BallotStatus.OPEN })
    const votedIds = new Set(await this.ballots.findVotedBallotIds(userId, open.map((b) => b.id)))
    return open
      .filter((b) => !votedIds.has(b.id))
      .map((b) => ({ id: b.id, title: b.title, question: b.question, endsAt: b.endsAt }))
  }
}
