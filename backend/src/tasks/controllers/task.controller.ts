import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TaskService } from '../services/task.service';
import { CreateTaskDto, UpdateTaskDto, TaskFilterDto } from '../dto/task.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

/**
 * Task Controller - Handles task CRUD endpoints
 */
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  /**
   * POST /tasks - Create a new task
   */
  @Post()
  async create(@Body() dto: CreateTaskDto, @CurrentUser('id') userId: string) {
    const task = await this.taskService.create(dto, userId);
    return {
      success: true,
      message: 'Task created successfully',
      data: { task },
    };
  }

  /**
   * GET /tasks - Get all tasks with filters
   */
  @Get()
  async findAll(
    @CurrentUser('id') userId: string,
    @Query() filters: TaskFilterDto,
  ) {
    const tasks = await this.taskService.findAll(userId, filters);
    return {
      success: true,
      data: { tasks },
    };
  }

  /**
   * GET /tasks/stats - Get dashboard statistics
   */
  @Get('stats')
  async getStats(@CurrentUser('id') userId: string) {
    const stats = await this.taskService.getDashboardStats(userId);
    return {
      success: true,
      data: { stats },
    };
  }

  /**
   * GET /tasks/:id - Get a single task
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const task = await this.taskService.findOne(id, userId);
    return {
      success: true,
      data: { task },
    };
  }

  /**
   * PATCH /tasks/:id - Update a task
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser('id') userId: string,
  ) {
    const task = await this.taskService.update(id, dto, userId);
    return {
      success: true,
      message: 'Task updated successfully',
      data: { task },
    };
  }

  /**
   * DELETE /tasks/:id - Delete a task
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.taskService.delete(id, userId);
    return {
      success: true,
      message: 'Task deleted successfully',
    };
  }
}
