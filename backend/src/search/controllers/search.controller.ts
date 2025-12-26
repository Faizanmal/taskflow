import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from '../services/search.service';
import { SearchQueryDto, AdvancedSearchQueryDto } from '../dto/search.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

/**
 * Search Controller - Handles global search endpoints
 * Provides search across tasks, workspaces, and users
 */
@ApiTags('Search')
@Controller('search')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * GET /search - Global search across all entities
   */
  @Get()
  @ApiOperation({ summary: 'Global search across tasks, workspaces, and users' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query (min 2 characters)' })
  @ApiQuery({ name: 'types', required: false, description: 'Comma-separated types: tasks,workspaces,users' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max results per type (default: 10)' })
  async globalSearch(
    @CurrentUser('id') userId: string,
    @Query() query: SearchQueryDto,
  ) {
    const results = await this.searchService.globalSearch(userId, query);
    return {
      success: true,
      data: results,
    };
  }

  /**
   * GET /search/tasks - Search tasks with advanced filters
   */
  @Get('tasks')
  @ApiOperation({ summary: 'Search tasks with advanced filters' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'priority', required: false, description: 'Filter by priority' })
  @ApiQuery({ name: 'assigneeId', required: false, description: 'Filter by assignee' })
  @ApiQuery({ name: 'workspaceId', required: false, description: 'Filter by workspace' })
  async searchTasks(
    @CurrentUser('id') userId: string,
    @Query() query: AdvancedSearchQueryDto,
  ) {
    const filters: {
      status?: string;
      priority?: string;
      assigneeId?: string;
      workspaceId?: string;
      limit?: number;
      offset?: number;
    } = {};

    if (query.status !== undefined) filters.status = query.status;
    if (query.priority !== undefined) filters.priority = query.priority;
    if (query.assigneeId !== undefined) filters.assigneeId = query.assigneeId;
    if (query.workspaceId !== undefined) filters.workspaceId = query.workspaceId;
    if (query.limit !== undefined) filters.limit = query.limit;
    if (query.offset !== undefined) filters.offset = query.offset;

    const tasks = await this.searchService.searchTasks(userId, query.q, filters);
    return {
      success: true,
      data: { tasks },
    };
  }
}
