import { Injectable } from '@nestjs/common';
import {
  SearchRepository,
  GlobalSearchResult,
} from '../repositories/search.repository';
import { SearchQueryDto } from '../dto/search.dto';

/**
 * Search Service - Business logic for global search functionality
 * Provides search across tasks, workspaces, and users
 */
@Injectable()
export class SearchService {
  constructor(private readonly searchRepository: SearchRepository) {}

  /**
   * Perform global search across all entities
   */
  async globalSearch(
    userId: string,
    query: SearchQueryDto,
  ): Promise<GlobalSearchResult> {
    const { q, types, limit = 10 } = query;

    if (!q || q.trim().length < 2) {
      return { tasks: [], workspaces: [], users: [] };
    }

    const searchTerm = q.trim().toLowerCase();
    const searchTypes = types?.split(',') || ['tasks', 'workspaces', 'users'];

    const results: GlobalSearchResult = {
      tasks: [],
      workspaces: [],
      users: [],
    };

    // Execute searches in parallel for better performance
    const promises: Promise<void>[] = [];

    if (searchTypes.includes('tasks')) {
      promises.push(
        this.searchRepository
          .searchTasks(userId, searchTerm, limit)
          .then((tasks) => {
            results.tasks = tasks;
          }),
      );
    }

    if (searchTypes.includes('workspaces')) {
      promises.push(
        this.searchRepository
          .searchWorkspaces(userId, searchTerm, limit)
          .then((workspaces) => {
            results.workspaces = workspaces;
          }),
      );
    }

    if (searchTypes.includes('users')) {
      promises.push(
        this.searchRepository
          .searchUsers(userId, searchTerm, limit)
          .then((users) => {
            results.users = users;
          }),
      );
    }

    await Promise.all(promises);

    return results;
  }

  /**
   * Search tasks with advanced filters
   */
  async searchTasks(
    userId: string,
    searchTerm: string,
    options?: {
      status?: string;
      priority?: string;
      assigneeId?: string;
      workspaceId?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    return this.searchRepository.searchTasksAdvanced(
      userId,
      searchTerm,
      options,
    );
  }
}
