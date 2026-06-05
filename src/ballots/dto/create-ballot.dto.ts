import { IsString, IsNotEmpty, IsOptional, IsArray, ArrayMinSize, IsDateString } from 'class-validator';

export class CreateBallotDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  // NEW: The actual question being asked
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsOptional()
  description?: string;

  // NEW: When voting opens
  @IsDateString()
  @IsNotEmpty()
  startsAt: string;

  // NEW: When voting closes
  @IsDateString()
  @IsNotEmpty()
  endsAt: string;

  // NEW: The ID of the admin making the ballot (we will fake this for now)
  @IsString()
  @IsNotEmpty()
  createdBy: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(2, { message: 'A ballot must have at least 2 voting options.' })
  options: string[];
}