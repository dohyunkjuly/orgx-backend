import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsBoolean, IsOptional } from 'class-validator'

export class ImportMembersQueryDto {
  @ApiPropertyOptional({
    example: false,
    default: false,
    description:
      'If false (default), only validates and previews the import without writing to the database. ' +
      'If true, valid rows are written to the production users table.',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  commit?: boolean
}
