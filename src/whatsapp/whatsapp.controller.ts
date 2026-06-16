import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiWrappedResponse } from '@lib/core'
import { Role } from '@prisma/client'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Roles } from '../common/decorators/roles.decorator'
import type { AuthUser } from '../common/types/user'
import { WhatsAppService } from './whatsapp.service'
import { WhatsAppAnalysisResponseDto } from './dto/analysis-response.dto'
import { WhatsAppAnalysisSummaryDto } from './dto/analysis-summary.dto'

@ApiTags('whatsapp')
@ApiCookieAuth()
@Controller('whatsapp')
@Roles(Role.ADMIN)
export class WhatsAppController {
  constructor(private readonly service: WhatsAppService) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiOperation({ summary: '[Admin] Upload a WhatsApp .txt export and analyze it' })
  @ApiWrappedResponse(WhatsAppAnalysisResponseDto)
  analyze(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: AuthUser) {
    return this.service.analyze(file, user.id)
  }

  @Get()
  @ApiOperation({ summary: '[Admin] List WhatsApp analyses (summaries)' })
  @ApiWrappedResponse(WhatsAppAnalysisSummaryDto, { isArray: true })
  findAll() {
    return this.service.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: '[Admin] Get a WhatsApp analysis with full analytics' })
  @ApiWrappedResponse(WhatsAppAnalysisResponseDto)
  findById(@Param('id') id: string) {
    return this.service.findById(id)
  }

  @Get(':id/file')
  @ApiOperation({ summary: '[Admin] Get a presigned URL to download the original export' })
  getFile(@Param('id') id: string) {
    return this.service.getFileUrl(id)
  }

  @Delete(':id')
  @ApiOperation({ summary: '[Admin] Delete a WhatsApp analysis' })
  delete(@Param('id') id: string) {
    return this.service.delete(id)
  }
}
