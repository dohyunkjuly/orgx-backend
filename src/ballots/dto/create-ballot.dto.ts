import { IsString, IsNotEmpty, IsDateString, IsArray, ArrayMinSize, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBallotDto {
  @ApiProperty({ example: 'Sprint 2 Priority' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Which feature should we build next?' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiPropertyOptional({ example: 'Vote on the next sprint priority.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2024-05-01T10:00:00Z' })
  @IsDateString()
  startsAt: string;

  @ApiProperty({ example: '2024-05-15T10:00:00Z' })
  @IsDateString()
  endsAt: string;

  @ApiProperty({ example: ['Dark Mode', 'Email Notifications', 'User Profiles'] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(2)
  options: string[];
}