import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Notification } from '@prisma/client';

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-floating-promises */

/**
 * Task with relations type for events
 */
interface TaskEventData {
  id: string;
  title: string;
  status: string;
  priority: string;
  assigneeId?: string | null;
  creatorId: string;
  [key: string]: any;
}

/**
 * Events Gateway - WebSocket handler for real-time updates
 */
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/events',
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private readonly userSockets = new Map<string, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  /**
   * Handle new client connection
   */
  handleConnection(client: Socket) {
    try {
      // Extract token from handshake
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      // Verify JWT
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET') as string,
      });

      const userId = payload.sub;

      // Store socket connection
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      // Join user-specific room
      client.join(`user:${userId}`);
      client.data.userId = userId;

      this.logger.log(`Client ${client.id} connected for user ${userId}`);
    } catch (error) {
      this.logger.error(
        `Connection error: ${error instanceof Error ? error.message : String(error)}`,
      );
      client.disconnect();
    }
  }

  /**
   * Handle client disconnect
   */
  handleDisconnect(client: Socket) {
    const userId = client.data?.userId;

    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.delete(client.id);

      if (this.userSockets.get(userId)!.size === 0) {
        this.userSockets.delete(userId);
      }
    }

    this.logger.log(`Client ${client.id} disconnected`);
  }

  /**
   * Handle ping from client (keep-alive)
   */
  @SubscribeMessage('ping')
  handlePing(client: Socket): void {
    client.emit('pong');
  }

  /**
   * Emit task created event to all connected users
   */
  emitTaskCreated(task: TaskEventData): void {
    this.server.emit('task:created', task);
    this.logger.debug(`Emitted task:created for task ${task.id}`);
  }

  /**
   * Emit task updated event to all connected users
   */
  emitTaskUpdated(task: TaskEventData): void {
    this.server.emit('task:updated', task);
    this.logger.debug(`Emitted task:updated for task ${task.id}`);
  }

  /**
   * Emit task deleted event to all connected users
   */
  emitTaskDeleted(taskId: string): void {
    this.server.emit('task:deleted', { id: taskId });
    this.logger.debug(`Emitted task:deleted for task ${taskId}`);
  }

  /**
   * Emit notification to specific user
   */
  emitNotification(userId: string, notification: Notification): void {
    this.server.to(`user:${userId}`).emit('notification', notification);
    this.logger.debug(`Emitted notification to user ${userId}`);
  }

  /**
   * Get online users count
   */
  getOnlineUsersCount(): number {
    return this.userSockets.size;
  }
}
