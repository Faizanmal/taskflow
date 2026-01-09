import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from '../src/analytics/services/analytics.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  const mockPrismaService = {
    task: {
      count: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    timeLog: {
      aggregate: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPersonalStats', () => {
    it('should return personal productivity statistics', async () => {
      const userId = 'user-1';
      const days = 30;

      mockPrismaService.task.count
        .mockResolvedValueOnce(10) // tasks created
        .mockResolvedValueOnce(8); // tasks completed

      mockPrismaService.timeLog.aggregate.mockResolvedValue({
        _sum: { duration: 3600 },
      });

      mockPrismaService.task.groupBy.mockResolvedValue([
        { status: 'TODO', _count: 2 },
        { status: 'COMPLETED', _count: 8 },
      ]);

      const result = await service.getPersonalStats(userId, days);

      expect(result).toHaveProperty('tasksCreated');
      expect(result).toHaveProperty('tasksCompleted');
      expect(result).toHaveProperty('timeTracked');
    });
  });

  describe('getDailyStats', () => {
    it('should return daily statistics', async () => {
      const userId = 'user-1';
      const days = 7;

      mockPrismaService.task.findMany.mockResolvedValue([
        { id: 'task-1', createdAt: new Date(), completedAt: new Date() },
      ]);

      const result = await service.getDailyStats(userId, days);

      expect(Array.isArray(result)).toBe(true);
    });
  });
});
