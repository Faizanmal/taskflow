import { IsString, IsOptional, MaxLength } from 'class-validator';

/**
 * DTO for file upload response
 */
export class UploadFileDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
