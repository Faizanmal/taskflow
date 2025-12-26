import { IsString, IsUUID, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for sending a direct message
 */
export class SendMessageDto {
  @ApiProperty({ description: 'Receiver user ID' })
  @IsUUID('4')
  receiverId!: string;

  @ApiProperty({ description: 'Message content' })
  @IsString()
  @MinLength(1, { message: 'Message cannot be empty' })
  @MaxLength(5000, { message: 'Message too long' })
  content!: string;
}
