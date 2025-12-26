import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SubtaskService } from '../services/subtask.service';
import {
  CreateSubtaskDto,
  CreateDependencyDto,
  ReorderTasksDto,
} from '../dto/subtask.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

/**
 * Subtask Controller - Handles subtasks and dependencies
 */
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class SubtaskController {
  constructor(private readonly subtaskService: SubtaskService) {}

  /**
   * POST /tasks/:taskId/subtasks - Create a subtask
   */
  @Post(':taskId/subtasks')
  async createSubtask(
    @Param('taskId') taskId: string,
    @Body() dto: CreateSubtaskDto,
    @CurrentUser('id') userId: string,
  ) {
    const subtask = await this.subtaskService.createSubtask(
      taskId,
      dto,
      userId,
    );
    return {
      success: true,
      message: 'Subtask created successfully',
      data: { subtask },
    };
  }

  /**
   * GET /tasks/:taskId/subtasks - Get subtasks
   */
  @Get(':taskId/subtasks')
  async getSubtasks(@Param('taskId') taskId: string) {
    const subtasks = await this.subtaskService.getSubtasks(taskId);
    const progress = await this.subtaskService.getSubtaskProgress(taskId);
    return {
      success: true,
      data: { subtasks, progress },
    };
  }

  /**
   * POST /tasks/:taskId/dependencies - Add dependency
   */
  @Post(':taskId/dependencies')
  async addDependency(
    @Param('taskId') taskId: string,
    @Body() dto: CreateDependencyDto,
  ) {
    const dependency = await this.subtaskService.addDependency(taskId, dto);
    return {
      success: true,
      message: 'Dependency added successfully',
      data: { dependency },
    };
  }

  /**
   * GET /tasks/:taskId/dependencies - Get dependencies
   */
  @Get(':taskId/dependencies')
  async getDependencies(@Param('taskId') taskId: string) {
    const dependencies = await this.subtaskService.getDependencies(taskId);
    const dependentTasks = await this.subtaskService.getDependentTasks(taskId);
    return {
      success: true,
      data: { dependencies, dependentTasks },
    };
  }

  /**
   * DELETE /tasks/:taskId/dependencies/:depTaskId - Remove dependency
   */
  @Delete(':taskId/dependencies/:depTaskId')
  @HttpCode(HttpStatus.OK)
  async removeDependency(
    @Param('taskId') taskId: string,
    @Param('depTaskId') depTaskId: string,
  ) {
    await this.subtaskService.removeDependency(taskId, depTaskId);
    return {
      success: true,
      message: 'Dependency removed successfully',
    };
  }

  /**
   * GET /tasks/:taskId/can-start - Check if task can start
   */
  @Get(':taskId/can-start')
  async canStart(@Param('taskId') taskId: string) {
    const result = await this.subtaskService.canTaskStart(taskId);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * POST /tasks/reorder - Reorder task (Kanban)
   */
  @Post('reorder')
  async reorderTask(@Body() dto: ReorderTasksDto) {
    const task = await this.subtaskService.reorderTask(dto);
    return {
      success: true,
      message: 'Task reordered successfully',
      data: { task },
    };
  }

  /**
   * GET /tasks/kanban - Get Kanban board
   */
  @Get('kanban')
  async getKanbanBoard(
    @CurrentUser('id') userId: string,
    @Query('workspaceId') workspaceId?: string,
  ) {
    const board = await this.subtaskService.getKanbanBoard(userId, workspaceId);
    return {
      success: true,
      data: { board },
    };
  }
}
