import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiWrappedResponse } from '@lib/core'
import { Role } from '@prisma/client'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Roles } from '../common/decorators/roles.decorator'
import type { AuthUser } from '../common/types/user'
import { MeetingsService } from './meetings.service'
import { CreateMeetingDto } from './dto/create-meeting.dto'
import { ListMeetingsDto } from './dto/list-meetings.dto'
import { MeetingResponseDto } from './dto/meeting-response.dto'
import { UpdateMeetingDto } from './dto/update-meeting.dto'

@ApiTags('meetings')
@ApiCookieAuth()
@Controller('meetings')
export class MeetingsController {
  constructor(private readonly service: MeetingsService) {}

  // ── Any authenticated user (admin + member) ──

  @Get()
  @ApiOperation({ summary: 'List meetings in a date range (calendar)' })
  @ApiWrappedResponse(MeetingResponseDto, { isArray: true })
  findAll(@Query() filters: ListMeetingsDto) {
    return this.service.findAll(filters)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a meeting by id' })
  @ApiWrappedResponse(MeetingResponseDto)
  findById(@Param('id') id: string) {
    return this.service.findById(id)
  }

  // ── Admin only ──

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Create a meeting' })
  @ApiWrappedResponse(MeetingResponseDto)
  create(@Body() dto: CreateMeetingDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user.id)
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Update a meeting' })
  @ApiWrappedResponse(MeetingResponseDto)
  update(@Param('id') id: string, @Body() dto: UpdateMeetingDto) {
    return this.service.update(id, dto)
  }

  @Patch(':id/cancel')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Cancel a meeting' })
  @ApiWrappedResponse(MeetingResponseDto)
  cancel(@Param('id') id: string) {
    return this.service.cancel(id)
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Delete a meeting' })
  delete(@Param('id') id: string) {
    return this.service.delete(id)
  }
}
