import { ApiProperty } from '@nestjs/swagger'
import { MemberStatus, Role } from '@prisma/client'

export class SessionUserDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  email!: string

  @ApiProperty({ enum: Role })
  role!: Role

  @ApiProperty({ enum: MemberStatus })
  status!: MemberStatus

  @ApiProperty()
  isEmailVerified!: boolean

  @ApiProperty()
  twoFactorEnabled!: boolean
}
