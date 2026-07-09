import { Controller, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiWrappedResponse } from '@lib/core'
import { Role } from '@prisma/client'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Roles } from '../common/decorators/roles.decorator'
import type { AuthUser } from '../common/types/user'
import { ImportMembersQueryDto } from './dto/import-members-query.dto'
import { MemberImportResultDto } from './dto/import-response.dto'
import { MemberImportService } from './member-import.service'

@ApiTags('member-import')
@ApiCookieAuth()
@Controller('users/import')
@Roles(Role.ADMIN)
export class MemberImportController {
  constructor(private readonly service: MemberImportService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } },
  })
  @ApiOperation({
    summary:
      '[Admin] Clean, dedupe, and validate a member CSV. ' +
      'By default this is a dry-run preview (?commit=false); pass ?commit=true to write valid rows to the users table.',
  })
  @ApiWrappedResponse(MemberImportResultDto)
  import(
    @UploadedFile() file: Express.Multer.File,
    @Query() query: ImportMembersQueryDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.run(file, query.commit ?? false, user.id)
  }
}
