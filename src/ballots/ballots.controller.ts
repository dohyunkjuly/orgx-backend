import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiWrappedResponse } from '@lib/core'
import { BallotStatus, Role } from '@prisma/client'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Roles } from '../common/decorators/roles.decorator'
import type { AuthUser } from '../common/types/user'
import { BallotsService } from './ballots.service'
import { BallotResponseDto } from './dto/ballot-response.dto'
import { BallotResultsDto } from './dto/ballot-results.dto'
import { CastVoteDto } from './dto/cast-vote.dto'
import { CreateBallotDto } from './dto/create-ballot.dto'
import { UpdateBallotDto } from './dto/update-ballot.dto'

@ApiTags('ballots')
@ApiCookieAuth()
@Controller('ballots')
export class BallotsController {
  constructor(private readonly service: BallotsService) {}

  // ── Any authenticated user (admin + member) ──

  @Get()
  @ApiOperation({ summary: 'List ballots (members see OPEN/CLOSED only)' })
  @ApiWrappedResponse(BallotResponseDto, { isArray: true })
  findAll(@CurrentUser() user: AuthUser, @Query('status') status?: BallotStatus) {
    return this.service.findAll(user, status)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a ballot by id' })
  @ApiWrappedResponse(BallotResponseDto)
  findById(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.findById(id, user)
  }

  @Get(':id/me')
  @ApiOperation({ summary: 'Whether the current user has voted in this ballot' })
  hasVoted(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.hasVoted(id, user)
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'Get aggregate results (vote counts per option)' })
  @ApiWrappedResponse(BallotResultsDto)
  results(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.results(id, user)
  }

  @Post(':id/vote')
  @ApiOperation({ summary: 'Cast a vote (one per member; ballot must be OPEN)' })
  vote(@Param('id') id: string, @Body() dto: CastVoteDto, @CurrentUser() user: AuthUser) {
    return this.service.vote(id, dto.optionIds, user)
  }

  // ── Admin only ──

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Create a ballot (DRAFT)' })
  @ApiWrappedResponse(BallotResponseDto)
  create(@Body() dto: CreateBallotDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user.id)
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Update a ballot (DRAFT only)' })
  @ApiWrappedResponse(BallotResponseDto)
  update(@Param('id') id: string, @Body() dto: UpdateBallotDto) {
    return this.service.update(id, dto)
  }

  @Post(':id/open')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Open a ballot for voting (DRAFT → OPEN)' })
  @ApiWrappedResponse(BallotResponseDto)
  open(@Param('id') id: string) {
    return this.service.open(id)
  }

  @Post(':id/close')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Close a ballot (OPEN → CLOSED)' })
  @ApiWrappedResponse(BallotResponseDto)
  close(@Param('id') id: string) {
    return this.service.close(id)
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Delete a ballot' })
  delete(@Param('id') id: string) {
    return this.service.delete(id)
  }
}
