import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiWrappedResponse } from '@lib/core'
import { Role } from '@prisma/client'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import type { AuthUser } from '../../common/types/user'
import { TransactionsService } from './transactions.service'
import { CreateTransactionDto } from './dto/create-transaction.dto'
import { ListTransactionsDto } from './dto/list-transactions.dto'
import { TransactionResponseDto } from './dto/transaction-response.dto'
import { UpdateTransactionDto } from './dto/update-transaction.dto'

@ApiTags('transactions')
@ApiCookieAuth()
@Controller('transactions')
@Roles(Role.ADMIN)
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: '[Admin] Record a transaction' })
  @ApiWrappedResponse(TransactionResponseDto)
  create(@Body() dto: CreateTransactionDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user.id)
  }

  @Get()
  @Roles(Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'List transactions' })
  @ApiWrappedResponse(TransactionResponseDto, { isArray: true })
  findAll(@Query() dto: ListTransactionsDto) {
    return this.service.findAll(dto)
  }

  @Patch(':id')
  @ApiOperation({ summary: '[Admin] Update a transaction' })
  @ApiWrappedResponse(TransactionResponseDto)
  update(@Param('id') id: string, @Body() dto: UpdateTransactionDto, @CurrentUser() user: AuthUser) {
    return this.service.update(id, dto, user.id)
  }

  @Delete(':id')
  @ApiOperation({ summary: '[Admin] Delete a transaction' })
  delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.delete(id, user.id)
  }
}
