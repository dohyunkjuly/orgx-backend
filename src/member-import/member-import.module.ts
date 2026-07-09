import { Module } from '@nestjs/common'

import { AuthModule } from '../auth/auth.module'
import { AuditLogRepository } from '../common/repositories/audit-log.repository'
import { UsersRepository } from '../common/repositories/users.repository'
import { MemberImportController } from './member-import.controller'
import { MemberImportService } from './member-import.service'

@Module({
  imports: [AuthModule],
  controllers: [MemberImportController],
  providers: [MemberImportService, AuditLogRepository, UsersRepository],
})
export class MemberImportModule {}
