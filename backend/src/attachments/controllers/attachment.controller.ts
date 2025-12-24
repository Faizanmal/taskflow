import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AttachmentService } from '../services/attachment.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

/**
 * Attachment Controller - Handles file upload endpoints
 */
@Controller('tasks/:taskId/attachments')
@UseGuards(JwtAuthGuard)
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  /**
   * POST /tasks/:taskId/attachments - Upload file
   */
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async uploadFile(
    @Param('taskId') taskId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const attachment = await this.attachmentService.uploadFile(taskId, file);
    return {
      success: true,
      message: 'File uploaded successfully',
      data: { attachment },
    };
  }

  /**
   * GET /tasks/:taskId/attachments - Get all attachments
   */
  @Get()
  async getAttachments(@Param('taskId') taskId: string) {
    const attachments = await this.attachmentService.getTaskAttachments(taskId);
    return {
      success: true,
      data: { attachments },
    };
  }

  /**
   * DELETE /tasks/:taskId/attachments/:id - Delete attachment
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteAttachment(@Param('id') id: string) {
    await this.attachmentService.deleteAttachment(id);
    return {
      success: true,
      message: 'Attachment deleted successfully',
    };
  }
}
