import { Injectable } from '@nestjs/common';
import { CreateBallotDto } from './dto/create-ballot.dto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class BallotsService {
  
  // 1. We added `userId: string` as the second parameter here
  async createBallot(dto: CreateBallotDto, userId: string) {
    return prisma.ballot.create({
      data: {
        title: dto.title,
        description: dto.description,
        
        question: dto.question,
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),

        createdBy: {
          // 2. We changed `dto.createdBy` to `userId` here
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
}