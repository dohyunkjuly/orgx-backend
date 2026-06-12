import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { BallotsService } from './ballots.service';
import { CreateBallotDto } from './dto/create-ballot.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthUser } from 'src/common/types/user';
import { Role } from '@prisma/client';

@Controller('ballots')
export class BallotsController {
  constructor(private readonly ballotsService: BallotsService) {}

  // 1. Require Admin privileges and add Swagger documentation
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new ballot' })
  @Post()
  async create(
    @Body() createBallotDto: CreateBallotDto,
    // 2. Securely grab the user's data directly from their login token!
    @CurrentUser() user: AuthUser,
  ) {
    // 3. Pass the secure user.id into the service
    return this.ballotsService.createBallot(createBallotDto, user.id);
  }
}