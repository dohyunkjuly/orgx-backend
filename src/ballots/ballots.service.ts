import { Injectable } from '@nestjs/common';
import { CreateBallotDto } from './dto/create-ballot.dto';
import { PrismaClient, BallotStatus } from '@prisma/client'; // <-- Added BallotStatus here

const prisma = new PrismaClient();

@Injectable()
export class BallotsService {
  
  async createBallot(dto: CreateBallotDto, userId: string) {
    return prisma.ballot.create({
      data: {
        title: dto.title,
        description: dto.description,
        question: dto.question,
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
        createdBy: {
          connect: { id: userId },
        },
        options: {
          create: dto.options.map((optionString, index) => ({
            label: optionString,
            position: index + 1,
          })),
        },
      },
      include: {
        options: true, 
      },
    });
  }


  // 1. Fetch all currently opened ballots
  async getOpenedBallots() {
    return prisma.ballot.findMany({
      where: {
        status: BallotStatus.OPEN,
      },
      include: {
        options: true, // Let the admin see the options too
      },
      orderBy: {
        endsAt: 'asc', // Show the ones closing soonest at the top
      },
    });
  }

  // 2. Close a specific ballot by its ID
  async closeBallot(ballotId: string) {
    return prisma.ballot.update({
      where: {
        id: ballotId,
      },
      data: {
        status: BallotStatus.CLOSED,
      },
    });
  }
}