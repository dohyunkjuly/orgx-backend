import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger'

import { CurrentUser } from '../common/decorators/current-user.decorator'
import type { AuthUser } from '../common/types/user'
import { ListNotificationsDto } from './dto/list-notifications.dto'
import { TestNotificationDto } from './dto/test-notification.dto'
import { NotificationsService } from './notifications.service'

@ApiTags('notifications')
@ApiCookieAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: "List the current user's notifications (paginated)" })
  list(@CurrentUser() user: AuthUser, @Query() query: ListNotificationsDto) {
    return this.notifications.list(user.id, query)
  }

  @Get('unread-count')
  @ApiOperation({ summary: "Count the current user's unread notifications" })
  unreadCount(@CurrentUser() user: AuthUser) {
    return this.notifications.unreadCount(user.id)
  }

  @Post('test')
  @ApiOperation({ summary: '[Dev] Send a test notification to yourself (also pushes over WebSocket)' })
  sendTest(@CurrentUser() user: AuthUser, @Body() dto: TestNotificationDto) {
    return this.notifications.sendTest(user.id, dto)
  }
}
