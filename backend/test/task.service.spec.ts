import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TaskService } from '../src/tasks/services/task.service';
import { TaskRepository } from '../src/tasks/repositories/task.repository';
import { NotificationService } from '../src/notifications/services/notification.service';
import { EventsGateway } from '../src/events/events.gateway';

/* eslint-disable @typescript-eslint/unbound-method */

describe('TaskService', () => {
  let taskService: TaskService;
  let taskRepository: jest.Mocked<TaskRepository>;
  let notificationService: jest.Mocked<NotificationService>;
  let eventsGateway: jest.Mocked<EventsGateway>;

  const mockUser = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    avatar: null,
  };

  const mockTask = {
    id: 'task-123',
    title: 'Test Task',
    description: 'Test description',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: new Date(),
    startDate: null,
    position: 0,
    estimatedTime: null,
    isRecurring: false,
    recurringPattern: null,
    recurringInterval: null,
    recurringDays: null,
    recurringEndDate: null,
    lastRecurrence: null,
    parentRecurringId: null,
    workspaceId: null,
    parentTaskId: null,
    templateId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    creatorId: 'user-123',
    creator: mockUser,
    assigneeId: null,
    assignee: null,
  };

  beforeEach(async () => {
    const mockTaskRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getDashboardStats: jest.fn(),
    };

    const mockNotificationService = {
      createTaskAssignedNotification: jest.fn(),
      createTaskDeletedNotification: jest.fn(),
    };

    const mockEventsGateway = {
      emitTaskCreated: jest.fn(),
      emitTaskUpdated: jest.fn(),
      emitTaskDeleted: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: TaskRepository, useValue: mockTaskRepository },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: EventsGateway, useValue: mockEventsGateway },
      ],
    }).compile();

    taskService = module.get<TaskService>(TaskService);
    taskRepository = module.get(TaskRepository);
    notificationService = module.get(NotificationService);
    eventsGateway = module.get(EventsGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createTaskDto = {
      title: 'New Task',
      description: 'Task description',
      priority: 'HIGH',
    };

    it('should create a task successfully', async () => {
      // Arrange
      taskRepository.create.mockResolvedValue(mockTask);

      // Act
      const result = await taskService.create(createTaskDto, 'user-123');

      // Assert
      expect(taskRepository.create).toHaveBeenCalledWith({
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: undefined,
        priority: createTaskDto.priority,
        dueDate: undefined,
        creatorId: 'user-123',
        assigneeId: undefined,
      });
      expect(eventsGateway.emitTaskCreated).toHaveBeenCalledWith(mockTask);
      expect(result).toEqual(mockTask);
    });

    it('should create notification when task is assigned to another user', async () => {
      // Arrange
      const taskWithAssignee = {
        ...mockTask,
        assigneeId: 'user-456',
        assignee: { ...mockUser, id: 'user-456' },
      };
      taskRepository.create.mockResolvedValue(taskWithAssignee);

      // Act
      await taskService.create(
        { ...createTaskDto, assigneeId: 'user-456' },
        'user-123',
      );

      // Assert
      expect(
        notificationService.createTaskAssignedNotification,
      ).toHaveBeenCalledWith('user-456', mockTask.id, mockTask.title);
    });

    it('should not create notification when task is self-assigned', async () => {
      // Arrange
      const taskWithAssignee = {
        ...mockTask,
        assigneeId: 'user-123',
        assignee: mockUser,
      };
      taskRepository.create.mockResolvedValue(taskWithAssignee);

      // Act
      await taskService.create(
        { ...createTaskDto, assigneeId: 'user-123' },
        'user-123',
      );

      // Assert
      expect(
        notificationService.createTaskAssignedNotification,
      ).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return task if user has access', async () => {
      // Arrange
      taskRepository.findById.mockResolvedValue(mockTask);

      // Act
      const result = await taskService.findOne('task-123', 'user-123');

      // Assert
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      // Arrange
      taskRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        taskService.findOne('non-existent', 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user has no access', async () => {
      // Arrange
      taskRepository.findById.mockResolvedValue(mockTask);

      // Act & Assert
      await expect(
        taskService.findOne('task-123', 'other-user'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    const updateDto = {
      title: 'Updated Title',
      status: 'IN_PROGRESS',
    };

    it('should update task successfully', async () => {
      // Arrange
      const updatedTask = { ...mockTask, ...updateDto };
      taskRepository.findById.mockResolvedValue(mockTask);
      taskRepository.update.mockResolvedValue(updatedTask);

      // Act
      const result = await taskService.update(
        'task-123',
        updateDto,
        'user-123',
      );

      // Assert
      expect(taskRepository.update).toHaveBeenCalled();
      expect(eventsGateway.emitTaskUpdated).toHaveBeenCalledWith(updatedTask);
      expect(result).toEqual(updatedTask);
    });

    it('should throw ForbiddenException if not creator', async () => {
      // Arrange
      taskRepository.findById.mockResolvedValue(mockTask);

      // Act & Assert
      await expect(
        taskService.update('task-123', updateDto, 'other-user'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should delete task successfully', async () => {
      // Arrange
      taskRepository.findById.mockResolvedValue(mockTask);
      taskRepository.delete.mockResolvedValue(mockTask);

      // Act
      await taskService.delete('task-123', 'user-123');

      // Assert
      expect(taskRepository.delete).toHaveBeenCalledWith('task-123');
      expect(eventsGateway.emitTaskDeleted).toHaveBeenCalledWith('task-123');
    });

    it('should notify assignee when task is deleted', async () => {
      // Arrange
      const taskWithAssignee = {
        ...mockTask,
        assigneeId: 'user-456',
        assignee: { ...mockUser, id: 'user-456' },
      };
      taskRepository.findById.mockResolvedValue(taskWithAssignee);
      taskRepository.delete.mockResolvedValue(taskWithAssignee);

      // Act
      await taskService.delete('task-123', 'user-123');

      // Assert
      expect(
        notificationService.createTaskDeletedNotification,
      ).toHaveBeenCalledWith('user-456', mockTask.title);
    });

    it('should throw ForbiddenException if not creator', async () => {
      // Arrange
      taskRepository.findById.mockResolvedValue(mockTask);

      // Act & Assert
      await expect(
        taskService.delete('task-123', 'other-user'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
