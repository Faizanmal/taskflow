import {
  IsArray,
  IsOptional,
  IsIn,
  IsUUID,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for bulk task operations
 */
export class BulkUpdateTasksDto {
  @ApiProperty({ description: 'Array of task IDs to update', type: [String] })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one task ID is required' })
  @IsUUID('4', { each: true })
  taskIds!: string[];

  @ApiPropertyOptional({ description: 'New status for all tasks' })
  @IsOptional()
  @IsIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'])
  status?: string;

  @ApiPropertyOptional({ description: 'New priority for all tasks' })
  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string;

  @ApiPropertyOptional({ description: 'New assignee ID for all tasks' })
  @IsOptional()
  @IsUUID('4')
  assigneeId?: string | null;
}

/**
 * DTO for bulk delete tasks
 */
export class BulkDeleteTasksDto {
  @ApiProperty({ description: 'Array of task IDs to delete', type: [String] })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one task ID is required' })
  @IsUUID('4', { each: true })
  taskIds!: string[];
}

/**
 * DTO for reordering tasks (drag & drop)
 */
export class ReorderTasksDto {
  @ApiProperty({ description: 'Task ID being moved' })
  @IsUUID('4')
  taskId!: string;

  @ApiPropertyOptional({ description: 'New status column (for kanban)' })
  @IsOptional()
  @IsIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'])
  newStatus?: string;

  @ApiProperty({ description: 'New position in the list' })
  newPosition!: number;
}

/**
 * DTO for task export
 */
export class ExportTasksDto {
  @ApiPropertyOptional({ description: 'Export format' })
  @IsOptional()
  @IsIn(['csv', 'json'])
  format?: 'csv' | 'json';

  @ApiPropertyOptional({ description: 'Workspace ID to filter by' })
  @IsOptional()
  @IsUUID('4')
  workspaceId?: string;

  @ApiPropertyOptional({ description: 'Status filter' })
  @IsOptional()
  @IsIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'])
  status?: string;
}

/**
 * DTO for task import
 */
export class ImportTasksDto {
  @ApiProperty({ description: 'Array of tasks to import' })
  @IsArray()
  tasks!: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
  }[];

  @ApiPropertyOptional({ description: 'Workspace ID to import into' })
  @IsOptional()
  @IsUUID('4')
  workspaceId?: string;
}
