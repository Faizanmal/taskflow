import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MessagingService } from '../services/messaging.service';
import { SendMessageDto } from '../dto/messaging.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

/**
 * Messaging Controller - Handles direct messaging endpoints
 */
@ApiTags('Messaging')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  /**
   * GET /messages/conversations - Get all conversations
   */
  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations' })
  async getConversations(@CurrentUser('id') userId: string) {
    const conversations = await this.messagingService.getConversations(userId);
    return {
      success: true,
      data: { conversations },
    };
  }

  /**
   * GET /messages/:userId - Get messages with a user
   */
  @Get(':userId')
  @ApiOperation({ summary: 'Get messages with a specific user' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'before', required: false })
  async getMessages(
    @CurrentUser('id') userId: string,
    @Param('userId') otherUserId: string,
    @Query('limit') limit?: number,
    @Query('before') before?: string,
  ) {
    const messages = await this.messagingService.getMessages(
      userId,
      otherUserId,
      limit,
      before,
    );
    return {
      success: true,
      data: { messages },
    };
  }

  /**
   * POST /messages - Send a message
   */
  @Post()
  @ApiOperation({ summary: 'Send a direct message' })
  async sendMessage(
    @CurrentUser('id') userId: string,
    @Body() dto: SendMessageDto,
  ) {
    const message = await this.messagingService.sendMessage(userId, dto);
    return {
      success: true,
      message: 'Message sent successfully',
      data: { message },
    };
  }

  /**
   * POST /messages/:userId/read - Mark messages as read
   */
  @Post(':userId/read')
  @ApiOperation({ summary: 'Mark messages from a user as read' })
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @CurrentUser('id') userId: string,
    @Param('userId') senderId: string,
  ) {
    const result = await this.messagingService.markAsRead(userId, senderId);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * GET /messages/unread/count - Get unread message count
   */
  @Get('unread/count')
  @ApiOperation({ summary: 'Get unread message count' })
  async getUnreadCount(@CurrentUser('id') userId: string) {
    const result = await this.messagingService.getUnreadCount(userId);
    return {
      success: true,
      data: result,
    };
  }
}
