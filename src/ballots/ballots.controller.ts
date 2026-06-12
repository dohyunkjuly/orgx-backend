import { Controller, Post, Body, Get, Patch, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { BallotsService } from './ballots.service';
import { CreateBallotDto } from './dto/create-ballot.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthUser } from 'src/common/types/user';

@Controller('ballots')
export class BallotsController {
  constructor(private readonly ballotsService: BallotsService) {}

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new ballot' })
  @Post()
  async create(
    @Body() createBallotDto: CreateBallotDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ballotsService.createBallot(createBallotDto, user.id);
  }


  // 1. Endpoint to SEE the open ballots
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all currently opened ballots' })
  @Get('opened')
  async getOpened() {
    return this.ballotsService.getOpenedBallots();
  }

  // 2. Endpoint to CLOSE a specific ballot
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Close a specific ballot' })
  @Patch(':id/close')
  async close(@Param('id') id: string) {
    return this.ballotsService.closeBallot(id);
  }
}