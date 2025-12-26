import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Task, TaskStatus, TaskPriority } from '@/lib/types';
import { taskKeys } from './useTasks';

export interface BulkUpdateData {
  taskIds: string[];
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
}

export interface BulkDeleteData {
  taskIds: string[];
}

export interface ReorderData {
  taskId: string;
  newStatus?: TaskStatus;
  newPosition: number;
}

/**
 * Hook for bulk updating multiple tasks
 */
export function useBulkUpdateTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkUpdateData) => {
      const response = await api.post('/tasks/bulk/update', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

/**
 * Hook for bulk deleting multiple tasks
 */
export function useBulkDeleteTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkDeleteData) => {
      const response = await api.post('/tasks/bulk/delete', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

/**
 * Hook for reordering tasks (drag & drop)
 */
export function useReorderTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReorderData) => {
      const response = await api.post('/tasks/bulk/reorder', data);
      return response.data.data.task as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

/**
 * Hook for exporting tasks
 */
export function useExportTasks() {
  return useMutation({
    mutationFn: async (options?: { format?: 'csv' | 'json'; workspaceId?: string; status?: string }) => {
      const params = new URLSearchParams();
      if (options?.format) params.append('format', options.format);
      if (options?.workspaceId) params.append('workspaceId', options.workspaceId);
      if (options?.status) params.append('status', options.status);

      const response = await api.get(`/tasks/bulk/export?${params.toString()}`);
      return response.data.data;
    },
  });
}

/**
 * Hook for importing tasks
 */
export function useImportTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { tasks: Array<{ title: string; description?: string; status?: string; priority?: string; dueDate?: string }>; workspaceId?: string }) => {
      const response = await api.post('/tasks/bulk/import', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}
