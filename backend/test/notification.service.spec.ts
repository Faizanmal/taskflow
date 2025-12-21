import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from '../src/notifications/services/notification.service';
import { NotificationRepository } from '../src/notifications/repositories/notification.repository';
import { EventsGateway } from '../src/events/events.gateway';

/* eslint-disable @typescript-eslint/unbound-method */

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let notificationRepository: jest.Mocked<NotificationRepository>;
  let eventsGateway: jest.Mocked<EventsGateway>;

  const mockNotification = {
    id: 'notification-123',
    type: 'TASK_ASSIGNED',
    message: 'You have been assigned to task: "Test Task"',
    read: false,
    data: JSON.stringify({ taskId: 'task-123' }),
    createdAt: new Date(),
    userId: 'user-123',
  };

  beforeEach(async () => {
    const mockNotificationRepository = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      findUnreadByUserId: jest.fn(),
      getUnreadCount: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      delete: jest.fn(),
    };

    const mockEventsGateway = {
      emitNotification: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: NotificationRepository,
          useValue: mockNotificationRepository,
        },
        { provide: EventsGateway, useValue: mockEventsGateway },
      ],
    }).compile();

    notificationService = module.get<NotificationService>(NotificationService);
    notificationRepository = module.get(NotificationRepository);
    eventsGateway = module.get(EventsGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTaskAssignedNotification', () => {
    it('should create notification and emit real-time event', async () => {
      // Arrange
      notificationRepository.create.mockResolvedValue(mockNotification);

      // Act
      await notificationService.createTaskAssignedNotification(
        'user-123',
        'task-123',
        'Test Task',
      );

      // Assert
      expect(notificationRepository.create).toHaveBeenCalledWith({
        type: 'TASK_ASSIGNED',
        message: 'You have been assigned to task: "Test Task"',
        userId: 'user-123',
        data: { taskId: 'task-123' },
      });
      expect(eventsGateway.emitNotification).toHaveBeenCalledWith(
        'user-123',
        mockNotification,
      );
    });
  });

  describe('createTaskDeletedNotification', () => {
    it('should create notification for task deletion', async () => {
      // Arrange
      const deletedNotification = {
        ...mockNotification,
        type: 'TASK_DELETED',
        message: 'Task "Test Task" has been deleted',
        data: JSON.stringify({}),
      };
      notificationRepository.create.mockResolvedValue(deletedNotification);

      // Act
      await notificationService.createTaskDeletedNotification(
        'user-123',
        'Test Task',
      );

      // Assert
      expect(notificationRepository.create).toHaveBeenCalledWith({
        type: 'TASK_DELETED',
        message: 'Task "Test Task" has been deleted',
        userId: 'user-123',
        data: {},
      });
      expect(eventsGateway.emitNotification).toHaveBeenCalled();
    });
  });

  describe('getNotifications', () => {
    it('should return all notifications for user', async () => {
      // Arrange
      const notifications = [mockNotification];
      notificationRepository.findByUserId.mockResolvedValue(notifications);

      // Act
      const result = await notificationService.getNotifications('user-123');

      // Assert
      expect(notificationRepository.findByUserId).toHaveBeenCalledWith(
        'user-123',
      );
      expect(result).toEqual(notifications);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread notification count', async () => {
      // Arrange
      notificationRepository.getUnreadCount.mockResolvedValue(5);

      // Act
      const result = await notificationService.getUnreadCount('user-123');

      // Assert
      expect(notificationRepository.getUnreadCount).toHaveBeenCalledWith(
        'user-123',
      );
      expect(result).toBe(5);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      // Arrange
      const readNotification = { ...mockNotification, read: true };
      notificationRepository.markAsRead.mockResolvedValue(readNotification);

      // Act
      const result = await notificationService.markAsRead('notification-123');

      // Assert
      expect(notificationRepository.markAsRead).toHaveBeenCalledWith(
        'notification-123',
      );
      expect(result.read).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read for user', async () => {
      // Arrange
      notificationRepository.markAllAsRead.mockResolvedValue(undefined);

      // Act
      await notificationService.markAllAsRead('user-123');

      // Assert
      expect(notificationRepository.markAllAsRead).toHaveBeenCalledWith(
        'user-123',
      );
    });
  });
});
