import { ApiProperty } from '@nestjs/swagger'
import { Gender, MemberStatus, Role } from '@prisma/client'

export class UserResponseDto {
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

  @ApiProperty()
  fullName!: string

  @ApiProperty({ enum: Gender })
  gender!: Gender

  @ApiProperty({ required: false, nullable: true })
  phone!: string | null

  @ApiProperty()
  qualification!: string

  @ApiProperty({ required: false, nullable: true })
  degreeDate!: Date | null

  @ApiProperty()
  university!: string

  @ApiProperty()
  department!: string

  @ApiProperty()
  designation!: string

  @ApiProperty()
  joinedAt!: Date

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date
}
