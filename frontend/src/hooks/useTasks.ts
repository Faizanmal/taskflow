import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import api from '@/lib/api';
import {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
  TaskStats,
  ApiResponse,
} from '@/lib/types';

// Query keys
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  stats: () => [...taskKeys.all, 'stats'] as const,
};

// Fetch all tasks with filters
export function useTasks(filters: TaskFilters = {}) {
  const queryClient = useQueryClient();

  // Listen for real-time updates
  useEffect(() => {
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    };

    window.addEventListener('task-update', handleUpdate);
    return () => window.removeEventListener('task-update', handleUpdate);
  }, [queryClient]);

  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.view) params.append('view', filters.view);

      const response = await api.get<ApiResponse<{ tasks: Task[] }>>(
        `/tasks?${params.toString()}`
      );
      return response.data.data.tasks;
    },
  });
}

// Fetch single task
export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<ApiResponse<{ task: Task }>>(`/tasks/${id}`);
      return response.data.data.task;
    },
    enabled: !!id,
  });
}

// Fetch task stats
export function useTaskStats() {
  return useQuery({
    queryKey: taskKeys.stats(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<{ stats: TaskStats }>>('/tasks/stats');
      return response.data.data.stats;
    },
  });
}

// Create task mutation
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTaskInput) => {
      const response = await api.post<ApiResponse<{ task: Task }>>('/tasks', data);
      return response.data.data.task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

// Update task mutation
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTaskInput }) => {
      const response = await api.patch<ApiResponse<{ task: Task }>>(`/tasks/${id}`, data);
      return response.data.data.task;
    },
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.all });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(taskKeys.lists());

      // Optimistically update
      queryClient.setQueriesData(
        { queryKey: taskKeys.lists() },
        (old: Task[] | undefined) => {
          if (!old) return old;
          return old.map((task) =>
            task.id === id ? { ...task, ...data } : task
          );
        }
      );

      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueriesData(
          { queryKey: taskKeys.lists() },
          context.previousTasks
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

// Delete task mutation
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tasks/${id}`);
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });

      const previousTasks = queryClient.getQueryData(taskKeys.lists());

      // Optimistically remove the task
      queryClient.setQueriesData(
        { queryKey: taskKeys.lists() },
        (old: Task[] | undefined) => {
          if (!old) return old;
          return old.filter((task) => task.id !== id);
        }
      );

      return { previousTasks };
    },
    onError: (_err, _id, context) => {
      if (context?.previousTasks) {
        queryClient.setQueriesData(
          { queryKey: taskKeys.lists() },
          context.previousTasks
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}
