import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsDateString,
  Matches,
} from 'class-validator'
import { Gender } from '@prisma/client'

export class RegisterDto {
  @ApiProperty({ example: 'jane.doe@example.com' })
  @IsEmail()
  @MaxLength(191)
  email!: string

  @ApiProperty({
    example: 'StrongP@ssw0rd!',
    description: 'Min 8 chars, must contain upper, lower, number',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(72) // bcrypt limit
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password must contain at least one upper case, lower case, and digit',
  })
  password!: string

  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  fullName!: string

  @ApiProperty({ enum: Gender, example: Gender.FEMALE })
  @IsEnum(Gender)
  gender!: Gender

  @ApiPropertyOptional({ example: '+49 30 1234567' })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  phone?: string

  @ApiProperty({ example: 'PhD, Computer Science' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  qualification!: string

  @ApiPropertyOptional({ example: '2018-06-30T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  degreeDate?: string

  @ApiProperty({ example: 'Technical University of Berlin' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  university!: string

  @ApiProperty({ example: 'Computer Science' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  department!: string

  @ApiProperty({ example: 'Senior Researcher' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  designation!: string
}
