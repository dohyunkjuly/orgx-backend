import { Body, Controller, Get, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Role } from '@prisma/client'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Roles } from '../common/decorators/roles.decorator'
import type { AuthUser } from '../common/types/user'
import { DocumentsService } from './documents.service'
import { ListDocumentsDto } from './dto/list-documents.dto'
import { UploadDocumentDto } from './dto/upload-document.dto'

@ApiTags('documents')
@ApiCookieAuth()
@Controller('documents')
@Roles(Role.ADMIN)
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '[Admin] Upload a document' })
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.upload(dto, file, user.id)
  }

  @Get()
  @Roles(Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'List documents' })
  findAll(@Query() filters: ListDocumentsDto) {
    return this.service.findAll(filters)
  }
}
