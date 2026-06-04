import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Role } from '@prisma/client'

import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Roles } from '../common/decorators/roles.decorator'
import type { AuthUser } from '../common/types/user'
import { ListUsersDto } from './dto/list-users.dto'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { UpdateUserStatusDto } from './dto/update-user-status.dto'
import { UsersService } from './users.service'

@ApiTags('users')
@ApiCookieAuth()
@Controller('users')
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @ApiOperation({ summary: '[Admin] List users with pagination and filters' })
  list(@Query() query: ListUsersDto, @CurrentUser() user: AuthUser) {
    return this.users.list(query, user.id)
  }

  @Get('me')
  @Roles(Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Get full profile of the current user' })
  getMyProfile(@CurrentUser() user: AuthUser) {
    return this.users.getById(user.id)
  }

  @Patch('me')
  @Roles(Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Update own profile (email is read-only)' })
  updateMyProfile(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(user.id, dto)
  }

  @Get(':id')
  @ApiOperation({ summary: '[Admin] Get a user by id' })
  getById(@Param('id') id: string) {
    return this.users.getById(id)
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '[Admin] Update a user\'s status' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    return this.users.updateStatus(id, dto.status)
  }
}
