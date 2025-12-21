import {
  IsString,
  IsOptional,
  IsDateString,
  IsUUID,
  MinLength,
  MaxLength,
  IsIn,
} from 'class-validator';

/**
 * DTO for creating a new task
 */
export class CreateTaskDto {
  @IsString()
  @MinLength(1, { message: 'Title is required' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  description?: string;

  @IsOptional()
  @IsIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'], {
    message: 'Invalid task status',
  })
  status?: string;

  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], {
    message: 'Invalid task priority',
  })
  priority?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format' })
  dueDate?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Invalid assignee ID' })
  assigneeId?: string;
}

/**
 * DTO for updating a task
 */
export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Title cannot be empty' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  description?: string | null;

  @IsOptional()
  @IsIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'], {
    message: 'Invalid task status',
  })
  status?: string;

  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], {
    message: 'Invalid task priority',
  })
  priority?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format' })
  dueDate?: string | null;

  @IsOptional()
  @IsUUID('4', { message: 'Invalid assignee ID' })
  assigneeId?: string | null;
}

/**
 * DTO for filtering tasks
 */
export class TaskFilterDto {
  @IsOptional()
  @IsIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'], {
    message: 'Invalid status filter',
  })
  status?: string;

  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], {
    message: 'Invalid priority filter',
  })
  priority?: string;

  @IsOptional()
  @IsString()
  sortBy?: 'dueDate' | 'createdAt' | 'priority' | 'status';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsString()
  view?: 'all' | 'assigned' | 'created' | 'overdue';
}
