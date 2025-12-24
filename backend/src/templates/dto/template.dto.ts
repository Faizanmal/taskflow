import {
  IsString,
  IsOptional,
  IsIn,
  IsBoolean,
  IsNumber,
  IsArray,
  Min,
  MinLength,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Subtask template for templates
 */
export class SubtaskTemplateDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}

/**
 * DTO for creating a task template
 */
export class CreateTemplateDto {
  @IsString()
  @MinLength(1, { message: 'Template name is required' })
  @MaxLength(100, { message: 'Template name must not exceed 100 characters' })
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsString()
  @MinLength(1, { message: 'Task title is required' })
  @MaxLength(200)
  taskTitle!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  taskDescription?: string;

  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  taskPriority?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  estimatedTime?: number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  workspaceId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubtaskTemplateDto)
  subtasks?: SubtaskTemplateDto[];
}

/**
 * DTO for updating a template
 */
export class UpdateTemplateDto {
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
  @MinLength(1)
  @MaxLength(200)
  taskTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  taskDescription?: string | null;

  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  taskPriority?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  estimatedTime?: number | null;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubtaskTemplateDto)
  subtasks?: SubtaskTemplateDto[];
}

/**
 * DTO for creating task from template
 */
export class CreateTaskFromTemplateDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  @IsString()
  workspaceId?: string;
}

/**
 * DTO for recurring task settings
 */
export class RecurringTaskSettingsDto {
  @IsIn(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM'])
  pattern!: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  interval?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  days?: string[]; // For weekly: ["MON", "WED", "FRI"]

  @IsOptional()
  @IsString()
  endDate?: string;
}
