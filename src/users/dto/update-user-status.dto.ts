import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'
import { MemberStatus } from '@prisma/client'

export class UpdateUserStatusDto {
  @ApiProperty({ enum: MemberStatus, example: MemberStatus.ACTIVE })
  @IsEnum(MemberStatus)
  status!: MemberStatus
}
