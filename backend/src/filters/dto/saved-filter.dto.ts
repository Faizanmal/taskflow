import {
  IsString,
  IsOptional,
  IsBoolean,
  IsIn,
  MinLength,
  MaxLength,
} from 'class-validator';

/**
 * DTO for creating a saved filter
 */
export class CreateSavedFilterDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsString()
  filters!: string; // JSON string with filter criteria

  @IsOptional()
  @IsIn(['LIST', 'KANBAN', 'CALENDAR', 'GANTT'])
  viewType?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isShared?: boolean;

  @IsOptional()
  @IsString()
  workspaceId?: string;
}

/**
 * DTO for updating a saved filter
 */
export class UpdateSavedFilterDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string | null;

  @IsOptional()
  @IsString()
  filters?: string;

  @IsOptional()
  @IsIn(['LIST', 'KANBAN', 'CALENDAR', 'GANTT'])
  viewType?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isShared?: boolean;
}
