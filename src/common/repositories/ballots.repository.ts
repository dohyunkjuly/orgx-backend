import { Injectable } from '@nestjs/common'
import { PrismaService } from '@lib/modules'
import { BallotStatus, type BallotType, type Prisma } from '@prisma/client'

@Injectable()
export class BallotsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    title: string
    description?: string
    question: string
    type: BallotType
    maxSelections?: number
    startsAt: Date
    endsAt: Date
    createdById: string
    options: string[]
  }) {
    return this.prisma.ballot.create({
      data: {
        title: data.title,
        description: data.description,
        question: data.question,
        type: data.type,
        maxSelections: data.maxSelections,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        createdById: data.createdById,
        options: {
          create: data.options.map((label, index) => ({ label, position: index + 1 })),
        },
      },
      include: { options: { orderBy: { position: 'asc' } } },
    })
  }

  findMany(filters: { status?: BallotStatus; statusIn?: BallotStatus[] }) {
    const where: Prisma.BallotWhereInput = {}
    if (filters.status) where.status = filters.status
    else if (filters.statusIn) where.status = { in: filters.statusIn }

    return this.prisma.ballot.findMany({
      where,
      include: { options: { orderBy: { position: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  findById(id: string) {
    return this.prisma.ballot.findUnique({
      where: { id },
      include: { options: { orderBy: { position: 'asc' } } },
    })
  }

  update(
    id: string,
    data: {
      title?: string
      description?: string
      question?: string
      type?: BallotType
      maxSelections?: number | null
      startsAt?: Date
      endsAt?: Date
      options?: string[]
    },
  ) {
    return this.prisma.ballot.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        question: data.question,
        type: data.type,
        maxSelections: data.maxSelections,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        // Replace options wholesale when provided (drafts only).
        ...(data.options && {
          options: {
            deleteMany: {},
            create: data.options.map((label, index) => ({ label, position: index + 1 })),
          },
        }),
      },
      include: { options: { orderBy: { position: 'asc' } } },
    })
  }

  updateStatus(id: string, status: BallotStatus) {
    return this.prisma.ballot.update({
      where: { id },
      data: { status },
      include: { options: { orderBy: { position: 'asc' } } },
    })
  }

  delete(id: string) {
    return this.prisma.ballot.delete({ where: { id } })
  }

  countByStatus(status: BallotStatus) {
    return this.prisma.ballot.count({ where: { status } })
  }

  /** Of the given ballots, which the voter has already voted in. */
  async findVotedBallotIds(voterId: string, ballotIds: string[]): Promise<string[]> {
    if (ballotIds.length === 0) return []
    const parts = await this.prisma.ballotParticipation.findMany({
      where: { voterId, ballotId: { in: ballotIds } },
      select: { ballotId: true },
    })
    return parts.map((p) => p.ballotId)
  }

  hasVoted(ballotId: string, voterId: string) {
    return this.prisma.ballotParticipation.findUnique({
      where: { ballotId_voterId: { ballotId, voterId } },
    })
  }

  /**
   * Records a vote while preserving confidentiality: the voter's identity goes
   * into ballot_participations and the choices go into votes — with NO link
   * between them. Both happen atomically.
   */
  castVote(ballotId: string, voterId: string, optionIds: string[]) {
    return this.prisma.$transaction([
      this.prisma.ballotParticipation.create({ data: { ballotId, voterId } }),
      this.prisma.vote.createMany({
        data: optionIds.map((optionId) => ({ ballotId, optionId })),
      }),
    ])
  }

  /** Aggregate tally — vote counts per option. Never exposes who voted. */
  async getResults(ballotId: string) {
    const [votes, totalParticipants] = await this.prisma.$transaction([
      this.prisma.vote.findMany({ where: { ballotId }, select: { optionId: true } }),
      this.prisma.ballotParticipation.count({ where: { ballotId } }),
    ])

    const counts = new Map<string, number>()
    for (const v of votes) counts.set(v.optionId, (counts.get(v.optionId) ?? 0) + 1)
    return { counts, totalParticipants }
  }
}
