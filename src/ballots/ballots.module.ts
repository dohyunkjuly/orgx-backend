import { Module } from '@nestjs/common';
import { BallotsController } from './ballots.controller';
import { BallotsService } from './ballots.service';

@Module({
  controllers: [BallotsController],
  providers: [BallotsService]
})
export class BallotsModule {}
