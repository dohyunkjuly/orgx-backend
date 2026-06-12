import { Module } from '@nestjs/common'

import { AuthModule } from '../auth/auth.module'
import { AuditLogRepository } from '../common/repositories/audit-log.repository'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [UsersService, AuditLogRepository],
})
export class UsersModule {}
