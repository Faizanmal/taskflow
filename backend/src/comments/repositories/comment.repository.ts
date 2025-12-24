import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Comment } from '@prisma/client';

/**
 * Comment with relations
 */
export type CommentWithRelations = Comment & {
  author: { id: string; name: string; email: string; avatar: string | null };
  mentions: { user: { id: string; name: string; email: string } }[];
  replies: CommentWithRelations[];
  _count: { replies: number };
};

/**
 * Comment Repository - Data access layer for Comment entity
 */
@Injectable()
export class CommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations = {
    author: {
      select: { id: true, name: true, email: true, avatar: true },
    },
    mentions: {
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    },
    _count: {
      select: { replies: true },
    },
  };

  /**
   * Create a comment
   */
  async create(data: {
    content: string;
    taskId: string;
    authorId: string;
    parentId?: string;
    mentionedUserIds?: string[];
  }): Promise<CommentWithRelations> {
    const result = await this.prisma.comment.create({
      data: {
        content: data.content,
        taskId: data.taskId,
        authorId: data.authorId,
        parentId: data.parentId ?? null,
        ...(data.mentionedUserIds &&
          data.mentionedUserIds.length > 0 && {
            mentions: {
              create: data.mentionedUserIds.map((userId) => ({
                userId,
              })),
            },
          }),
      },
      include: {
        ...this.includeRelations,
        replies: {
          include: this.includeRelations,
          orderBy: { createdAt: 'asc' as const },
        },
      },
    });
    return result as unknown as CommentWithRelations;
  }

  /**
   * Find comment by ID
   */
  async findById(id: string): Promise<CommentWithRelations | null> {
    const result = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        ...this.includeRelations,
        replies: {
          include: this.includeRelations,
          orderBy: { createdAt: 'asc' as const },
        },
      },
    });
    return result as unknown as CommentWithRelations | null;
  }

  /**
   * Find all comments for a task (top-level only, replies are nested)
   */
  async findAllForTask(taskId: string): Promise<CommentWithRelations[]> {
    const result = await this.prisma.comment.findMany({
      where: {
        taskId,
        parentId: null, // Only top-level comments
      },
      include: {
        ...this.includeRelations,
        replies: {
          include: {
            ...this.includeRelations,
            replies: {
              include: this.includeRelations,
              orderBy: { createdAt: 'asc' as const },
            },
          },
          orderBy: { createdAt: 'asc' as const },
        },
      },
      orderBy: { createdAt: 'desc' as const },
    });
    return result as unknown as CommentWithRelations[];
  }

  /**
   * Update a comment
   */
  async update(
    id: string,
    data: { content: string; mentionedUserIds?: string[] },
  ): Promise<CommentWithRelations> {
    // First, delete existing mentions
    await this.prisma.mention.deleteMany({
      where: { commentId: id },
    });

    // Update comment and add new mentions
    const result = await this.prisma.comment.update({
      where: { id },
      data: {
        content: data.content,
        ...(data.mentionedUserIds &&
          data.mentionedUserIds.length > 0 && {
            mentions: {
              create: data.mentionedUserIds.map((userId) => ({
                userId,
              })),
            },
          }),
      },
      include: {
        ...this.includeRelations,
        replies: {
          include: this.includeRelations,
          orderBy: { createdAt: 'asc' as const },
        },
      },
    });
    return result as unknown as CommentWithRelations;
  }

  /**
   * Delete a comment
   */
  async delete(id: string): Promise<Comment> {
    return this.prisma.comment.delete({
      where: { id },
    });
  }

  /**
   * Count comments for a task
   */
  async countForTask(taskId: string): Promise<number> {
    return this.prisma.comment.count({
      where: { taskId },
    });
  }
}
