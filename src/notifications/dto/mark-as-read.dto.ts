import { IsString } from 'class-validator'

export class MarkAsReadDto {
  @IsString()
  notificationId!: string
}
