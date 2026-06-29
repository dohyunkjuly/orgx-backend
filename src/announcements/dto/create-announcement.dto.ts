import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'

export class CreateAnnouncementDto {
  @ApiProperty({ example: 'Office closed on Friday' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string

  @ApiProperty({ example: 'The office will be closed this Friday for maintenance.' })
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  body!: string
}
