import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiWrappedResponse } from '@lib/core'
import { Role } from '@prisma/client'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Roles } from '../common/decorators/roles.decorator'
import type { AuthUser } from '../common/types/user'
import { AnnouncementsService } from './announcements.service'
import { AnnouncementResponseDto } from './dto/announcement-response.dto'
import { CreateAnnouncementDto } from './dto/create-announcement.dto'
import { UpdateAnnouncementDto } from './dto/update-announcement.dto'

@ApiTags('announcements')
@ApiCookieAuth()
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly service: AnnouncementsService) {}

  // ── Any authenticated user (admin + member) ──

  @Get()
  @ApiOperation({ summary: 'List announcements (newest first)' })
  @ApiWrappedResponse(AnnouncementResponseDto, { isArray: true })
  findAll() {
    return this.service.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an announcement by id' })
  @ApiWrappedResponse(AnnouncementResponseDto)
  findById(@Param('id') id: string) {
    return this.service.findById(id)
  }

  // ── Admin only ──

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Create an announcement' })
  @ApiWrappedResponse(AnnouncementResponseDto)
  create(@Body() dto: CreateAnnouncementDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user.id)
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Update an announcement' })
  @ApiWrappedResponse(AnnouncementResponseDto)
  update(@Param('id') id: string, @Body() dto: UpdateAnnouncementDto) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Delete an announcement' })
  delete(@Param('id') id: string) {
    return this.service.delete(id)
  }
}
