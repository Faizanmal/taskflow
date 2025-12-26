import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

export interface SearchResult {
  tasks: Array<{
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    dueDate: string | null;
    assignee: {
      id: string;
      name: string;
      avatar: string | null;
    } | null;
    workspace: {
      id: string;
      name: string;
      slug: string;
    } | null;
  }>;
  workspaces: Array<{
    id: string;
    name: string;
    description: string | null;
    slug: string;
    avatar: string | null;
    _count: {
      members: number;
      tasks: number;
    };
  }>;
  users: Array<{
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  }>;
}

/**
 * Hook for global search across tasks, workspaces, and users
 */
export function useGlobalSearch(query: string, types?: string[]) {
  return useQuery({
    queryKey: ['search', query, types],
    queryFn: async (): Promise<SearchResult> => {
      if (!query || query.length < 2) {
        return { tasks: [], workspaces: [], users: [] };
      }

      const params = new URLSearchParams({ q: query });
      if (types?.length) {
        params.append('types', types.join(','));
      }

      const response = await api.get(`/search?${params.toString()}`);
      return response.data.data;
    },
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook for searching tasks with advanced filters
 */
export function useTaskSearch(
  query: string,
  options?: {
    status?: string;
    priority?: string;
    assigneeId?: string;
    workspaceId?: string;
    limit?: number;
  }
) {
  return useQuery({
    queryKey: ['search', 'tasks', query, options],
    queryFn: async () => {
      const params = new URLSearchParams({ q: query });
      if (options?.status) params.append('status', options.status);
      if (options?.priority) params.append('priority', options.priority);
      if (options?.assigneeId) params.append('assigneeId', options.assigneeId);
      if (options?.workspaceId) params.append('workspaceId', options.workspaceId);
      if (options?.limit) params.append('limit', String(options.limit));

      const response = await api.get(`/search/tasks?${params.toString()}`);
      return response.data.data.tasks;
    },
    enabled: query.length >= 1,
  });
}

export default useGlobalSearch;
