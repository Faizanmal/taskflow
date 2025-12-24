import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Attachment } from '@prisma/client';

/**
 * Attachment Repository - Data access layer for Attachment entity
 */
@Injectable()
export class AttachmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create an attachment
   */
  async create(data: {
    taskId: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
  }): Promise<Attachment> {
    return this.prisma.attachment.create({
      data,
    });
  }

  /**
   * Find attachment by ID
   */
  async findById(id: string): Promise<Attachment | null> {
    return this.prisma.attachment.findUnique({
      where: { id },
    });
  }

  /**
   * Find all attachments for a task
   */
  async findAllForTask(taskId: string): Promise<Attachment[]> {
    return this.prisma.attachment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Delete an attachment
   */
  async delete(id: string): Promise<Attachment> {
    return this.prisma.attachment.delete({
      where: { id },
    });
  }

  /**
   * Get total size of attachments for a task
   */
  async getTotalSizeForTask(taskId: string): Promise<number> {
    const result = await this.prisma.attachment.aggregate({
      where: { taskId },
      _sum: { size: true },
    });
    return result._sum.size || 0;
  }
}
