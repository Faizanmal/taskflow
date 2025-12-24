import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsArray,
} from 'class-validator';

/**
 * DTO for creating a comment
 */
export class CreateCommentDto {
  @IsString()
  @MinLength(1, { message: 'Comment content is required' })
  @MaxLength(5000, { message: 'Comment must not exceed 5000 characters' })
  content!: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentionedUserIds?: string[];
}

/**
 * DTO for updating a comment
 */
export class UpdateCommentDto {
  @IsString()
  @MinLength(1, { message: 'Comment content is required' })
  @MaxLength(5000, { message: 'Comment must not exceed 5000 characters' })
  content!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentionedUserIds?: string[];
}
