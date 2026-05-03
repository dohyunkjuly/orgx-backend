import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super();
    // Make BigInt JSON-serializable (Prisma returns BigInt for some numeric types)
    (BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
      return this.toString();
    };
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma connected');
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Prisma disconnected');
    } catch (e) {
      this.logger.warn(`Prisma disconnect error: ${(e as Error).message}`);
    }
  }
}