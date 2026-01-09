import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from '../src/search/services/search.service';
import { SearchRepository } from '../src/search/repositories/search.repository';
import { PrismaService } from '../src/prisma/prisma.service';

describe('SearchService', () => {
  let service: SearchService;

  const mockPrismaService = {
    task: {
      findMany: jest.fn(),
    },
    workspace: {
      findMany: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
  };

  const mockSearchRepository = {
    searchTasks: jest.fn(),
    searchWorkspaces: jest.fn(),
    searchUsers: jest.fn(),
    searchTasksAdvanced: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: SearchRepository,
          useValue: mockSearchRepository,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('globalSearch', () => {
    it('should search across all entities', async () => {
      const userId = 'user-1';
      const query = { q: 'test' };

      mockSearchRepository.searchTasks.mockResolvedValue([
        { id: 'task-1', title: 'Test Task' },
      ]);
      mockSearchRepository.searchWorkspaces.mockResolvedValue([
        { id: 'workspace-1', name: 'Test Workspace' },
      ]);
      mockSearchRepository.searchUsers.mockResolvedValue([
        { id: 'user-2', name: 'Test User' },
      ]);

      const result = await service.globalSearch(userId, query);

      expect(mockSearchRepository.searchTasks).toHaveBeenCalledWith(
        userId,
        'test',
        10,
      );
      expect(mockSearchRepository.searchWorkspaces).toHaveBeenCalledWith(
        userId,
        'test',
        10,
      );
      expect(mockSearchRepository.searchUsers).toHaveBeenCalledWith(
        userId,
        'test',
        10,
      );
      expect(result).toEqual({
        tasks: [{ id: 'task-1', title: 'Test Task' }],
        workspaces: [{ id: 'workspace-1', name: 'Test Workspace' }],
        users: [{ id: 'user-2', name: 'Test User' }],
      });
    });

    it('should return empty arrays when no results found', async () => {
      mockSearchRepository.searchTasks.mockResolvedValue([]);
      mockSearchRepository.searchWorkspaces.mockResolvedValue([]);
      mockSearchRepository.searchUsers.mockResolvedValue([]);

      const result = await service.globalSearch('user-1', { q: 'nonexistent' });

      expect(result).toEqual({
        tasks: [],
        workspaces: [],
        users: [],
      });
    });

    it('should respect the limit parameter', async () => {
      mockSearchRepository.searchTasks.mockResolvedValue([]);
      mockSearchRepository.searchWorkspaces.mockResolvedValue([]);
      mockSearchRepository.searchUsers.mockResolvedValue([]);

      await service.globalSearch('user-1', { q: 'test', limit: 5 });

      expect(mockSearchRepository.searchTasks).toHaveBeenCalledWith(
        'user-1',
        'test',
        5,
      );
    });
  });

  describe('searchTasks', () => {
    it('should search tasks with filters', async () => {
      const userId = 'user-1';
      const filters = {
        query: 'test',
        status: 'IN_PROGRESS' as const,
        priority: 'HIGH' as const,
      };

      mockSearchRepository.searchTasksAdvanced.mockResolvedValue([
        { id: 'task-1', title: 'Test Task' },
      ]);

      const result = await service.searchTasks(userId, 'test', filters);

      expect(mockSearchRepository.searchTasksAdvanced).toHaveBeenCalledWith(
        userId,
        'test',
        filters,
      );
      expect(result).toHaveLength(1);
    });
  });
});
