import { ApiProperty } from '@nestjs/swagger'

export class RejectedRowDto {
  @ApiProperty({ example: 7, description: 'Row number in the source CSV (1-indexed, header excluded)' })
  row!: number

  @ApiProperty({ example: { email: 'not-an-email', fullName: 'John' } })
  data!: Record<string, string>

  @ApiProperty({ example: 'Invalid email format' })
  reason!: string
}

export class ImportedMemberDto {
  @ApiProperty({ example: 'clr1a2b3c4d5e6f7g8h9i0j' })
  id!: string

  @ApiProperty({ example: 'jane.doe@example.com' })
  email!: string

  @ApiProperty({ example: 'Jane Doe' })
  fullName!: string
}

export class MemberImportResultDto {
  @ApiProperty({ example: true, description: 'False for a dry-run preview, true once rows are written to the DB' })
  committed!: boolean

  @ApiProperty({ example: 42, description: 'Rows read from the source file (excluding the header)' })
  totalRows!: number

  @ApiProperty({ example: 36, description: 'Rows that passed validation and dedup' })
  validRows!: number

  @ApiProperty({ example: 4, description: 'Duplicate rows merged/discarded, keeping the most recently updated' })
  duplicatesRemoved!: number

  @ApiProperty({ example: 6, description: 'Rows rejected for missing mandatory fields or failed validation' })
  rejectedCount!: number

  @ApiProperty({ type: [RejectedRowDto] })
  rejected!: RejectedRowDto[]

  @ApiProperty({
    type: [ImportedMemberDto],
    description: 'Only populated when committed is true',
  })
  imported!: ImportedMemberDto[]

  @ApiProperty({
    example: 0,
    description: 'Rows skipped because the email already exists in the production users table (commit only)',
  })
  skippedExisting!: number
}
