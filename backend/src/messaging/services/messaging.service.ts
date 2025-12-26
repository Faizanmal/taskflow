import { Injectable } from '@nestjs/common';
import { MessagingRepository, DirectMessage, Conversation } from '../repositories/messaging.repository';
import { EventsGateway } from '../../events/events.gateway';
import { SendMessageDto } from '../dto/messaging.dto';

/**
 * Messaging Service - Business logic for direct messaging
 */
@Injectable()
export class MessagingService {
  constructor(
    private readonly messagingRepository: MessagingRepository,
    private readonly eventsGateway: EventsGateway,
  ) {}

  /**
   * Get all conversations for a user
   */
  async getConversations(userId: string): Promise<Conversation[]> {
    return this.messagingRepository.getConversations(userId);
  }

  /**
   * Get messages in a conversation
   */
  async getMessages(
    userId: string,
    otherUserId: string,
    limit?: number,
    before?: string,
  ): Promise<DirectMessage[]> {
    return this.messagingRepository.getMessages(userId, otherUserId, limit, before);
  }

  /**
   * Send a direct message
   */
  async sendMessage(
    senderId: string,
    dto: SendMessageDto,
  ): Promise<DirectMessage> {
    const message = await this.messagingRepository.sendMessage(
      senderId,
      dto.receiverId,
      dto.content,
    );

    // Emit real-time event to receiver
    this.eventsGateway.server.to(`user:${dto.receiverId}`).emit('new-message', {
      message,
    });

    return message;
  }

  /**
   * Mark messages from a user as read
   */
  async markAsRead(userId: string, senderId: string): Promise<{ markedCount: number }> {
    const count = await this.messagingRepository.markAsRead(userId, senderId);
    return { markedCount: count };
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.messagingRepository.getUnreadCount(userId);
    return { count };
  }
}
