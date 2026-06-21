import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiWrappedResponse } from '@lib/core'
import { Role } from '@prisma/client'
import { Roles } from '../common/decorators/roles.decorator'
import { TransactionCategoriesService } from './transaction-categories.service'
import { CreateTransactionCategoryDto } from './dto/create-transaction-category.dto'
import { ListTransactionCategoriesDto } from './dto/list-transaction-categories.dto'
import { TransactionCategoryResponseDto } from './dto/transaction-category-response.dto'

@ApiTags('transaction-categories')
@ApiCookieAuth()
@Controller('transaction-categories')
@Roles(Role.ADMIN)
export class TransactionCategoriesController {
  constructor(private readonly service: TransactionCategoriesService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'List all transaction categories' })
  @ApiWrappedResponse(TransactionCategoryResponseDto, { isArray: true })
  findAll(@Query() query: ListTransactionCategoriesDto) {
    return this.service.findAll(query)
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Get a transaction category by id' })
  @ApiWrappedResponse(TransactionCategoryResponseDto)
  findById(@Param('id') id: string) {
    return this.service.findById(id)
  }

  @Post()
  @ApiOperation({ summary: '[Admin] Create a transaction category' })
  @ApiWrappedResponse(TransactionCategoryResponseDto)
  create(@Body() dto: CreateTransactionCategoryDto) {
    return this.service.create(dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: '[Admin] Delete a transaction category' })
  delete(@Param('id') id: string) {
    return this.service.delete(id)
  }
}
