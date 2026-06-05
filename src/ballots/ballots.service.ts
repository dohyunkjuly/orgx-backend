import { Injectable } from '@nestjs/common';
import { CreateBallotDto } from './dto/create-ballot.dto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class BallotsService {
  
  async createBallot(dto: CreateBallotDto) {
    return prisma.ballot.create({
      data: {
        title: dto.title,
        description: dto.description,
        
        // NEW: Mapping the 4 missing fields
        question: dto.question,
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),

        // Change this one line:
        createdBy: {
          connect: { id: dto.createdBy },
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