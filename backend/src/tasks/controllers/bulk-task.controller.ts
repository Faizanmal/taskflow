import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { BulkTaskService } from '../services/bulk-task.service';
import {
  BulkUpdateTasksDto,
  BulkDeleteTasksDto,
  ReorderTasksDto,
  ExportTasksDto,
  ImportTasksDto,
} from '../dto/bulk-task.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

/**
 * Bulk Task Controller - Handles bulk task operations
 */
@ApiTags('Tasks - Bulk Operations')
@Controller('tasks/bulk')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BulkTaskController {
  constructor(private readonly bulkTaskService: BulkTaskService) {}

  /**
   * POST /tasks/bulk/update - Bulk update tasks
   */
  @Post('update')
  @ApiOperation({ summary: 'Bulk update multiple tasks' })
  @HttpCode(HttpStatus.OK)
  async bulkUpdate(
    @CurrentUser('id') userId: string,
    @Body() dto: BulkUpdateTasksDto,
  ) {
    const result = await this.bulkTaskService.bulkUpdate(userId, dto);
    return {
      success: true,
      message: `${result.updatedCount} tasks updated successfully`,
      data: result,
    };
  }

  /**
   * POST /tasks/bulk/delete - Bulk delete tasks
   */
  @Post('delete')
  @ApiOperation({ summary: 'Bulk delete multiple tasks' })
  @HttpCode(HttpStatus.OK)
  async bulkDelete(
    @CurrentUser('id') userId: string,
    @Body() dto: BulkDeleteTasksDto,
  ) {
    const result = await this.bulkTaskService.bulkDelete(userId, dto);
    return {
      success: true,
      message: `${result.deletedCount} tasks deleted successfully`,
      data: result,
    };
  }

  /**
   * POST /tasks/bulk/reorder - Reorder task (drag & drop)
   */
  @Post('reorder')
  @ApiOperation({ summary: 'Reorder task position (drag & drop)' })
  @HttpCode(HttpStatus.OK)
  async reorderTask(
    @CurrentUser('id') userId: string,
    @Body() dto: ReorderTasksDto,
  ) {
    const task = await this.bulkTaskService.reorderTask(userId, dto);
    return {
      success: true,
      message: 'Task reordered successfully',
      data: { task },
    };
  }

  /**
   * GET /tasks/bulk/export - Export tasks
   */
  @Get('export')
  @ApiOperation({ summary: 'Export tasks to CSV or JSON' })
  @ApiQuery({ name: 'format', required: false, enum: ['csv', 'json'] })
  @ApiQuery({ name: 'workspaceId', required: false })
  @ApiQuery({ name: 'status', required: false })
  async exportTasks(
    @CurrentUser('id') userId: string,
    @Query() dto: ExportTasksDto,
  ) {
    const result = await this.bulkTaskService.exportTasks(userId, dto);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * POST /tasks/bulk/import - Import tasks
   */
  @Post('import')
  @ApiOperation({ summary: 'Import tasks from JSON data' })
  async importTasks(
    @CurrentUser('id') userId: string,
    @Body() dto: ImportTasksDto,
  ) {
    const result = await this.bulkTaskService.importTasks(userId, dto);
    return {
      success: true,
      message: `${result.importedCount} tasks imported successfully`,
      data: result,
    };
  }
}
