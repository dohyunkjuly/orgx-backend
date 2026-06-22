import { Controller, Get } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiWrappedResponse } from '@lib/core'
import { Role } from '@prisma/client'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Roles } from '../common/decorators/roles.decorator'
import type { AuthUser } from '../common/types/user'
import { DashboardService } from './dashboard.service'
import { AdminDashboardDto } from './dto/admin-dashboard.dto'
import { MemberDashboardDto } from './dto/member-dashboard.dto'

@ApiTags('dashboard')
@ApiCookieAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('admin')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Admin dashboard overview' })
  @ApiWrappedResponse(AdminDashboardDto)
  getAdmin() {
    return this.service.getAdmin()
  }

  @Get('member')
  @ApiOperation({ summary: 'Member dashboard overview' })
  @ApiWrappedResponse(MemberDashboardDto)
  getMember(@CurrentUser() user: AuthUser) {
    return this.service.getMember(user)
  }
}
