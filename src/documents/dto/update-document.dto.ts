import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class UpdateDocumentDto {
  @ApiProperty({ example: 'clr1a2b3c4d5e6f7g8h9i0j' })
  @IsString()
  categoryId!: string
}
