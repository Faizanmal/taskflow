import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommentService } from '../services/comment.service';
import { CreateCommentDto, UpdateCommentDto } from '../dto/comment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

/**
 * Comment Controller - Handles comment endpoints
 */
@Controller('tasks/:taskId/comments')
@UseGuards(JwtAuthGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  /**
   * POST /tasks/:taskId/comments - Create a comment
   */
  @Post()
  async create(
    @Param('taskId') taskId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser('id') userId: string,
  ) {
    const comment = await this.commentService.create(taskId, dto, userId);
    return {
      success: true,
      message: 'Comment created successfully',
      data: { comment },
    };
  }

  /**
   * GET /tasks/:taskId/comments - Get all comments for a task
   */
  @Get()
  async findAll(@Param('taskId') taskId: string) {
    const comments = await this.commentService.findAllForTask(taskId);
    return {
      success: true,
      data: { comments },
    };
  }

  /**
   * GET /tasks/:taskId/comments/count - Get comment count for task
   */
  @Get('count')
  async getCount(@Param('taskId') taskId: string) {
    const count = await this.commentService.getCommentCount(taskId);
    return {
      success: true,
      data: { count },
    };
  }

  /**
   * PATCH /tasks/:taskId/comments/:id - Update a comment
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
    @CurrentUser('id') userId: string,
  ) {
    const comment = await this.commentService.update(id, dto, userId);
    return {
      success: true,
      message: 'Comment updated successfully',
      data: { comment },
    };
  }

  /**
   * DELETE /tasks/:taskId/comments/:id - Delete a comment
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.commentService.delete(id, userId);
    return {
      success: true,
      message: 'Comment deleted successfully',
    };
  }
}
