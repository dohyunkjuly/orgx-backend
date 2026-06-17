import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiWrappedResponse } from '@lib/core'
import { Role } from '@prisma/client'
import { Roles } from '../common/decorators/roles.decorator'
import { MeetingMinutesService } from './meeting-minutes.service'
import { MeetingMinutesResponseDto } from './dto/minutes-response.dto'
import { SaveMinutesDto } from './dto/save-minutes.dto'

@ApiTags('meeting-minutes')
@ApiCookieAuth()
@Controller('meetings/:meetingId/minutes')
export class MeetingMinutesController {
  constructor(private readonly service: MeetingMinutesService) {}

  @Get()
  @ApiOperation({ summary: 'Get a meeting’s minutes' })
  @ApiWrappedResponse(MeetingMinutesResponseDto)
  get(@Param('meetingId') meetingId: string) {
    return this.service.get(meetingId)
  }

  @Put()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Create or update a meeting’s minutes' })
  @ApiWrappedResponse(MeetingMinutesResponseDto)
  save(@Param('meetingId') meetingId: string, @Body() dto: SaveMinutesDto) {
    return this.service.save(meetingId, dto.content)
  }

  @Delete()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Delete a meeting’s minutes' })
  delete(@Param('meetingId') meetingId: string) {
    return this.service.delete(meetingId)
  }
}
