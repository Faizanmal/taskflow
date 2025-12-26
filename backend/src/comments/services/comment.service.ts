import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  CommentRepository,
  CommentWithRelations,
} from '../repositories/comment.repository';
import { CreateCommentDto, UpdateCommentDto } from '../dto/comment.dto';
import { EventsGateway } from '../../events/events.gateway';
import { NotificationService } from '../../notifications/services/notification.service';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Comment Service - Business logic for comments
 */
@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly eventsGateway: EventsGateway,
    private readonly notificationService: NotificationService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Create a comment
   */
  async create(
    taskId: string,
    dto: CreateCommentDto,
    authorId: string,
  ): Promise<CommentWithRelations> {
    // Verify task exists
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, title: true, creatorId: true, assigneeId: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Verify parent comment exists if replying
    if (dto.parentId) {
      const parentComment = await this.commentRepository.findById(dto.parentId);
      if (!parentComment || parentComment.taskId !== taskId) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    const comment = await this.commentRepository.create({
      content: dto.content,
      taskId,
      authorId,
      ...(dto.parentId && { parentId: dto.parentId }),
      ...(dto.mentionedUserIds && { mentionedUserIds: dto.mentionedUserIds }),
    });

    // Emit real-time update
    this.eventsGateway.emitCommentCreated(taskId, comment);

    // Create notifications for mentioned users
    if (dto.mentionedUserIds && dto.mentionedUserIds.length > 0) {
      for (const userId of dto.mentionedUserIds) {
        if (userId !== authorId) {
          await this.notificationService.create({
            userId,
            type: 'COMMENT_MENTION',
            message: `You were mentioned in a comment on "${task.title}"`,
            data: {
              taskId: task.id,
              taskTitle: task.title,
              commentId: comment.id,
            },
          });
        }
      }
    }

    // Notify task creator/assignee about new comment (if not the author)
    const usersToNotify = new Set<string>();
    if (task.creatorId !== authorId) {
      usersToNotify.add(task.creatorId);
    }
    if (task.assigneeId && task.assigneeId !== authorId) {
      usersToNotify.add(task.assigneeId);
    }

    for (const userId of usersToNotify) {
      if (!dto.mentionedUserIds?.includes(userId)) {
        await this.notificationService.create({
          userId,
          type: 'NEW_COMMENT',
          message: `New comment on "${task.title}"`,
          data: {
            taskId: task.id,
            taskTitle: task.title,
            commentId: comment.id,
          },
        });
      }
    }

    return comment;
  }

  /**
   * Get all comments for a task
   */
  async findAllForTask(taskId: string): Promise<CommentWithRelations[]> {
    // Verify task exists
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.commentRepository.findAllForTask(taskId);
  }

  /**
   * Update a comment
   */
  async update(
    id: string,
    dto: UpdateCommentDto,
    userId: string,
  ): Promise<CommentWithRelations> {
    const comment = await this.commentRepository.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    const updatedComment = await this.commentRepository.update(id, {
      content: dto.content,
      ...(dto.mentionedUserIds && { mentionedUserIds: dto.mentionedUserIds }),
    });

    // Emit real-time update
    this.eventsGateway.emitCommentUpdated(comment.taskId, updatedComment);

    // Notify newly mentioned users
    if (dto.mentionedUserIds && dto.mentionedUserIds.length > 0) {
      const previousMentions = comment.mentions.map((m) => m.user.id);
      const newMentions = dto.mentionedUserIds.filter(
        (id) => !previousMentions.includes(id) && id !== userId,
      );

      const task = await this.prisma.task.findUnique({
        where: { id: comment.taskId },
        select: { id: true, title: true },
      });

      for (const mentionedUserId of newMentions) {
        await this.notificationService.create({
          userId: mentionedUserId,
          type: 'COMMENT_MENTION',
          message: `You were mentioned in a comment on "${task?.title}"`,
          data: {
            taskId: task?.id,
            taskTitle: task?.title,
            commentId: updatedComment.id,
          },
        });
      }
    }

    return updatedComment;
  }

  /**
   * Delete a comment
   */
  async delete(id: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    const taskId = comment.taskId;
    await this.commentRepository.delete(id);

    // Emit real-time update
    this.eventsGateway.emitCommentDeleted(taskId, id);
  }

  /**
   * Get comment count for task
   */
  async getCommentCount(taskId: string): Promise<number> {
    return this.commentRepository.countForTask(taskId);
  }
}
