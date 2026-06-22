import { Injectable, Logger } from '@nestjs/common'
import {
  ApiHttpError,
  BALLOT_ALREADY_VOTED,
  BALLOT_INVALID_SELECTION,
  BALLOT_INVALID_STATE,
  BALLOT_INVALID_TIME_RANGE,
  BALLOT_NOT_FOUND,
  BALLOT_NOT_OPEN,
} from '@lib/core'
import { BallotStatus, BallotType, NotificationType } from '@prisma/client'
import { BallotsRepository } from '../common/repositories/ballots.repository'
import { NotificationsService } from '../notifications/notifications.service'
import type { AuthUser } from '../common/types/user'
import type { CreateBallotDto } from './dto/create-ballot.dto'
import type { UpdateBallotDto } from './dto/update-ballot.dto'

@Injectable()
export class BallotsService {
  private readonly logger = new Logger(BallotsService.name)

  constructor(
    private readonly repo: BallotsRepository,
    private readonly notifications: NotificationsService,
  ) {}

  async create(dto: CreateBallotDto, userId: string) {
    this.assertTimeRange(dto.startsAt, dto.endsAt)
    return this.repo.create({
      title: dto.title,
      description: dto.description,
      question: dto.question,
      type: dto.type ?? BallotType.SINGLE_CHOICE,
      maxSelections: dto.maxSelections,
      startsAt: new Date(dto.startsAt),
      endsAt: new Date(dto.endsAt),
      createdById: userId,
      options: dto.options,
    })
  }

  /** Admins see all ballots; members only see OPEN and CLOSED (never DRAFT). */
  findAll(user: AuthUser, status?: BallotStatus) {
    if (user.role === 'ADMIN') {
      return this.repo.findMany({ status })
    }
    if (status === BallotStatus.DRAFT) return []
    return this.repo.findMany(
      status ? { status } : { statusIn: [BallotStatus.OPEN, BallotStatus.CLOSED] },
    )
  }

  async findById(id: string, user: AuthUser) {
    const ballot = await this.repo.findById(id)
    if (!ballot) throw new ApiHttpError(BALLOT_NOT_FOUND)
    // Members can't see drafts.
    if (ballot.status === BallotStatus.DRAFT && user.role !== 'ADMIN') {
      throw new ApiHttpError(BALLOT_NOT_FOUND)
    }
    return ballot
  }

  async update(id: string, dto: UpdateBallotDto) {
    const ballot = await this.getOr404(id)
    if (ballot.status !== BallotStatus.DRAFT) throw new ApiHttpError(BALLOT_INVALID_STATE)

    const startsAt = dto.startsAt ?? ballot.startsAt.toISOString()
    const endsAt = dto.endsAt ?? ballot.endsAt.toISOString()
    if (dto.startsAt || dto.endsAt) this.assertTimeRange(startsAt, endsAt)

    return this.repo.update(id, {
      title: dto.title,
      description: dto.description,
      question: dto.question,
      type: dto.type,
      maxSelections: dto.maxSelections,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
      options: dto.options,
    })
  }

  /** DRAFT → OPEN. */
  async open(id: string) {
    const ballot = await this.getOr404(id)
    if (ballot.status !== BallotStatus.DRAFT) throw new ApiHttpError(BALLOT_INVALID_STATE)
    const opened = await this.repo.updateStatus(id, BallotStatus.OPEN)

    this.broadcast(NotificationType.BALLOT_OPENED, `ballot:opened:${id}`, {
      title: 'New ballot open for voting',
      body: `"${opened.title}" is now open. Cast your vote before it closes.`,
    })

    return opened
  }

  /** OPEN → CLOSED. */
  async close(id: string) {
    const ballot = await this.getOr404(id)
    if (ballot.status !== BallotStatus.OPEN) throw new ApiHttpError(BALLOT_INVALID_STATE)
    const closed = await this.repo.updateStatus(id, BallotStatus.CLOSED)

    this.broadcast(NotificationType.BALLOT_CLOSED, `ballot:closed:${id}`, {
      title: 'Ballot closed',
      body: `Voting for "${closed.title}" has ended. Results are available.`,
    })

    return closed
  }

  async delete(id: string) {
    await this.getOr404(id)
    await this.repo.delete(id)
  }

  /** Whether the current user has already voted (for UI state). */
  async hasVoted(id: string, user: AuthUser) {
    await this.findById(id, user)
    return { voted: Boolean(await this.repo.hasVoted(id, user.id)) }
  }

  async vote(id: string, optionIds: string[], user: AuthUser) {
    const ballot = await this.getOr404(id)

    // Must be open and within the voting window.
    const now = new Date()
    if (ballot.status !== BallotStatus.OPEN || now < ballot.startsAt || now > ballot.endsAt) {
      throw new ApiHttpError(BALLOT_NOT_OPEN)
    }

    // One vote per member.
    if (await this.repo.hasVoted(id, user.id)) throw new ApiHttpError(BALLOT_ALREADY_VOTED)

    // De-dupe and validate the selection.
    const selected = [...new Set(optionIds)]
    const validIds = new Set(ballot.options.map((o) => o.id))
    if (selected.length === 0 || selected.some((oid) => !validIds.has(oid))) {
      throw new ApiHttpError(BALLOT_INVALID_SELECTION)
    }

    if (ballot.type === BallotType.SINGLE_CHOICE) {
      if (selected.length !== 1) throw new ApiHttpError(BALLOT_INVALID_SELECTION)
    } else {
      const max = ballot.maxSelections ?? ballot.options.length
      if (selected.length > max) throw new ApiHttpError(BALLOT_INVALID_SELECTION)
    }

    await this.repo.castVote(id, user.id, selected)
    return { ok: true }
  }

  async results(id: string, user: AuthUser) {
    const ballot = await this.findById(id, user)
    const { counts, totalParticipants } = await this.repo.getResults(id)
    return {
      ballotId: ballot.id,
      totalParticipants,
      results: ballot.options.map((o) => ({
        optionId: o.id,
        label: o.label,
        votes: counts.get(o.id) ?? 0,
      })),
    }
  }

  // ── helpers ──

  private async getOr404(id: string) {
    const ballot = await this.repo.findById(id)
    if (!ballot) throw new ApiHttpError(BALLOT_NOT_FOUND)
    return ballot
  }

  private assertTimeRange(startsAt: string, endsAt: string) {
    if (new Date(endsAt) <= new Date(startsAt)) throw new ApiHttpError(BALLOT_INVALID_TIME_RANGE)
  }

  /** Fire-and-forget broadcast to all members; a failure must not fail the request. */
  private broadcast(
    type: NotificationType,
    eventId: string,
    content: { title: string; body: string },
  ) {
    void this.notifications
      .notifyAll({ type, eventId, ...content })
      .catch((error) => this.logger.error(`Failed to broadcast ${eventId}`, error))
  }
}
