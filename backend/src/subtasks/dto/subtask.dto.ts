import {
  IsString,
  IsOptional,
  IsIn,
  MinLength,
  MaxLength,
  IsDateString,
} from 'class-validator';

/**
 * DTO for creating a subtask
 */
export class CreateSubtaskDto {
  @IsString()
  @MinLength(1, { message: 'Title is required' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  assigneeId?: string;
}

/**
 * DTO for creating a dependency
 */
export class CreateDependencyDto {
  @IsString()
  dependencyTaskId!: string; // Task that must be completed first

  @IsOptional()
  @IsIn(['FINISH_TO_START', 'START_TO_START', 'FINISH_TO_FINISH', 'START_TO_FINISH'])
  type?: string;
}

/**
 * DTO for reordering tasks (Kanban)
 */
export class ReorderTasksDto {
  @IsString()
  taskId!: string;

  @IsString()
  newStatus!: string;

  @IsOptional()
  position?: number;
}
