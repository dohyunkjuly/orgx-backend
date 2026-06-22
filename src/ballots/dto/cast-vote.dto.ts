import { ApiProperty } from '@nestjs/swagger'
import { ArrayMinSize, IsArray, IsString } from 'class-validator'

export class CastVoteDto {
  @ApiProperty({
    example: ['clopt1abcd'],
    description:
      'Option id(s) to vote for. Exactly 1 for SINGLE_CHOICE; 1..maxSelections for MULTIPLE_CHOICE.',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  optionIds!: string[]
}
