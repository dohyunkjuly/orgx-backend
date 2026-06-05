import { Controller, Post, Body } from '@nestjs/common';
import { BallotsService } from './ballots.service';
import { CreateBallotDto } from './dto/create-ballot.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('ballots')
export class BallotsController {
  constructor(private readonly ballotsService: BallotsService) {}

  // This listens for a POST request to http://localhost:3000/ballots
  @Public()
  @Post()
  async create(@Body() createBallotDto: CreateBallotDto) {
    return this.ballotsService.createBallot(createBallotDto);
  }
}