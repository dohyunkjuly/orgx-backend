import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength } from 'class-validator'

export class SaveMinutesDto {
  @ApiProperty({
    example: '<h2>Decisions</h2><p>Budget approved...</p>',
    description: 'Rich-text minutes content (HTML or Markdown from the editor).',
  })
  @IsString()
  @MinLength(1)
  content!: string
}
