import { ApiProperty } from '@nestjs/swagger'

class DocumentCategoryRefDto {
  @ApiProperty({ example: 'clr1a2b3c4d5e6f7g8h9i0j' })
  id!: string

  @ApiProperty({ example: 'Meeting Minutes' })
  name!: string
}

export class DocumentResponseDto {
  @ApiProperty({ example: 'clr1a2b3c4d5e6f7g8h9i0j' })
  id!: string

  @ApiProperty({ example: 'Annual Report 2024' })
  title!: string

  @ApiProperty({ example: 'Financial report for the fiscal year 2024', nullable: true })
  description!: string | null

  @ApiProperty({ example: 'minutes,2024,finance', nullable: true })
  tags!: string | null

  @ApiProperty({ example: 'report.pdf' })
  fileName!: string

  @ApiProperty({ example: 'application/pdf' })
  mimeType!: string

  @ApiProperty({ example: 248123 })
  sizeBytes!: number

  @ApiProperty({ example: 'clr1a2b3c4d5e6f7g8h9i0j' })
  categoryId!: string

  @ApiProperty({ example: 'clr1a2b3c4d5e6f7g8h9i0j' })
  uploadedById!: string

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  @ApiProperty({ type: DocumentCategoryRefDto, required: false })
  category?: DocumentCategoryRefDto

  @ApiProperty({
    description: 'Presigned download URL, valid ~1h. Present on list responses.',
    required: false,
  })
  downloadUrl?: string
}
