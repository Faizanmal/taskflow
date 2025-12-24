import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AttachmentRepository } from '../repositories/attachment.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { Attachment } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/x-rar-compressed',
];

/**
 * Attachment Service - Business logic for file attachments
 */
@Injectable()
export class AttachmentService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor(
    private readonly attachmentRepository: AttachmentRepository,
    private readonly prisma: PrismaService,
  ) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Upload a file attachment
   */
  async uploadFile(
    taskId: string,
    file: Express.Multer.File,
  ): Promise<Attachment> {
    // Verify task exists
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('File type not allowed');
    }

    // Generate unique filename
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(this.uploadDir, filename);

    // Save file
    fs.writeFileSync(filepath, file.buffer);

    // Create database record
    const url = `/uploads/${filename}`;
    const attachment = await this.attachmentRepository.create({
      taskId,
      filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url,
    });

    return attachment;
  }

  /**
   * Get all attachments for a task
   */
  async getTaskAttachments(taskId: string): Promise<Attachment[]> {
    return this.attachmentRepository.findAllForTask(taskId);
  }

  /**
   * Delete an attachment
   */
  async deleteAttachment(id: string): Promise<void> {
    const attachment = await this.attachmentRepository.findById(id);

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    // Delete file from filesystem
    const filepath = path.join(this.uploadDir, attachment.filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    // Delete database record
    await this.attachmentRepository.delete(id);
  }

  /**
   * Get attachment by ID
   */
  async getAttachment(id: string): Promise<Attachment> {
    const attachment = await this.attachmentRepository.findById(id);

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    return attachment;
  }
}
