import { IsString, IsOptional, MinLength, IsNumber, IsIn, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for global search query
 */
export class SearchQueryDto {
  @ApiProperty({ description: 'Search query (min 2 characters)', minLength: 2 })
  @IsString()
  @MinLength(2, { message: 'Search query must be at least 2 characters' })
  q!: string;

  @ApiPropertyOptional({ description: 'Comma-separated types to search: tasks,workspaces,users' })
  @IsOptional()
  @IsString()
  types?: string;

  @ApiPropertyOptional({ description: 'Maximum results per type (default: 10)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}

/**
 * DTO for advanced task search with filters
 */
export class AdvancedSearchQueryDto {
  @ApiProperty({ description: 'Search query' })
  @IsString()
  @MinLength(1)
  q!: string;

  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @IsIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'])
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by priority' })
  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string;

  @ApiPropertyOptional({ description: 'Filter by assignee ID' })
  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @ApiPropertyOptional({ description: 'Filter by workspace ID' })
  @IsOptional()
  @IsUUID()
  workspaceId?: string;

  @ApiPropertyOptional({ description: 'Maximum number of results' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ description: 'Offset for pagination' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  offset?: number;
}
