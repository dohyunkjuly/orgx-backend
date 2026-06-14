import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Role } from '@prisma/client'
import { Roles } from '../common/decorators/roles.decorator'
import { DocCategoriesService } from './doc-categories.service'
import { CreateDocCategoryDto } from './dto/create-doc-category.dto'
import { UpdateDocCategoryDto } from './dto/update-doc-category.dto'

@ApiTags('doc-categories')
@ApiCookieAuth()
@Controller('doc-categories')
@Roles(Role.ADMIN)
export class DocCategoriesController {
  constructor(private readonly service: DocCategoriesService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'List all document categories' })
  findAll() {
    return this.service.findAll()
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Get a document category by id' })
  findById(@Param('id') id: string) {
    return this.service.findById(id)
  }

  @Post()
  @ApiOperation({ summary: '[Admin] Create a document category' })
  create(@Body() dto: CreateDocCategoryDto) {
    return this.service.create(dto)
  }

  @Patch(':id')
  @ApiOperation({ summary: '[Admin] Update a document category' })
  update(@Param('id') id: string, @Body() dto: UpdateDocCategoryDto) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: '[Admin] Delete a document category' })
  delete(@Param('id') id: string) {
    return this.service.delete(id)
  }
}
