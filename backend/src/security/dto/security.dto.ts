import { IsString, Length, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for enabling 2FA
 */
export class Enable2FADto {
  @ApiProperty({ description: '2FA secret from setup' })
  @IsString()
  secret!: string;

  @ApiProperty({ description: '6-digit verification code' })
  @IsString()
  @Length(6, 6, { message: 'Token must be 6 digits' })
  token!: string;
}

/**
 * DTO for verifying 2FA
 */
export class Verify2FADto {
  @ApiProperty({ description: '6-digit verification code' })
  @IsString()
  @Length(6, 6, { message: 'Token must be 6 digits' })
  token!: string;
}

/**
 * DTO for disabling 2FA
 */
export class Disable2FADto {
  @ApiProperty({ description: '6-digit verification code' })
  @IsString()
  @Length(6, 6, { message: 'Token must be 6 digits' })
  token!: string;
}

/**
 * DTO for deleting account
 */
export class DeleteAccountDto {
  @ApiProperty({ description: 'Current password for verification' })
  @IsString()
  @MinLength(1)
  password!: string;

  @ApiPropertyOptional({ description: 'Confirmation text (type "DELETE")' })
  @IsOptional()
  @IsString()
  confirmation?: string;
}
