import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class TestNotificationDto {
  @ApiPropertyOptional({ example: 'Test notification' })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  title?: string

  @ApiPropertyOptional({ example: 'This is a test notification.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  body?: string
}
