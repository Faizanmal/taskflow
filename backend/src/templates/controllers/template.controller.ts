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
import { TemplateService } from '../services/template.service';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  CreateTaskFromTemplateDto,
  RecurringTaskSettingsDto,
} from '../dto/template.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

/**
 * Template Controller - Handles template and recurring task endpoints
 */
@Controller('templates')
@UseGuards(JwtAuthGuard)
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  /**
   * POST /templates - Create a template
   */
  @Post()
  async create(
    @Body() dto: CreateTemplateDto,
    @CurrentUser('id') userId: string,
  ) {
    const template = await this.templateService.create(dto, userId);
    return {
      success: true,
      message: 'Template created successfully',
      data: { template },
    };
  }

  /**
   * GET /templates - Get all templates
   */
  @Get()
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('workspaceId') workspaceId?: string,
  ) {
    const templates = await this.templateService.findForUser(
      userId,
      workspaceId,
    );
    return {
      success: true,
      data: { templates },
    };
  }

  /**
   * GET /templates/:id - Get template by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const template = await this.templateService.findOne(id, userId);
    return {
      success: true,
      data: { template },
    };
  }

  /**
   * PATCH /templates/:id - Update template
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
    @CurrentUser('id') userId: string,
  ) {
    const template = await this.templateService.update(id, dto, userId);
    return {
      success: true,
      message: 'Template updated successfully',
      data: { template },
    };
  }

  /**
   * DELETE /templates/:id - Delete template
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.templateService.delete(id, userId);
    return {
      success: true,
      message: 'Template deleted successfully',
    };
  }

  /**
   * POST /templates/:id/create-task - Create task from template
   */
  @Post(':id/create-task')
  async createTaskFromTemplate(
    @Param('id') id: string,
    @Body() dto: CreateTaskFromTemplateDto,
    @CurrentUser('id') userId: string,
  ) {
    const task = await this.templateService.createTaskFromTemplate(
      id,
      dto,
      userId,
    );
    return {
      success: true,
      message: 'Task created from template',
      data: { task },
    };
  }

  /**
   * POST /templates/recurring/:taskId - Set up recurring task
   */
  @Post('recurring/:taskId')
  async setupRecurringTask(
    @Param('taskId') taskId: string,
    @Body() dto: RecurringTaskSettingsDto,
    @CurrentUser('id') userId: string,
  ) {
    const task = await this.templateService.setupRecurringTask(
      taskId,
      dto,
      userId,
    );
    return {
      success: true,
      message: 'Recurring task set up successfully',
      data: { task },
    };
  }

  /**
   * DELETE /templates/recurring/:taskId - Remove recurring settings
   */
  @Delete('recurring/:taskId')
  @HttpCode(HttpStatus.OK)
  async removeRecurrence(
    @Param('taskId') taskId: string,
    @CurrentUser('id') userId: string,
  ) {
    const task = await this.templateService.removeRecurrence(taskId, userId);
    return {
      success: true,
      message: 'Recurring settings removed',
      data: { task },
    };
  }
}
