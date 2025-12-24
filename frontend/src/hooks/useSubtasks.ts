import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subtasksAPI } from '@/lib/api';
import { Task, TaskDependency, SubtaskProgress, CreateDependencyInput } from '@/lib/types';

// Query keys
export const subtaskKeys = {
  all: ['subtasks'] as const,
  lists: () => [...subtaskKeys.all, 'list'] as const,
  list: (taskId: string) => [...subtaskKeys.lists(), taskId] as const,
  progress: (taskId: string) => [...subtaskKeys.all, 'progress', taskId] as const,
  dependencies: (taskId: string) => [...subtaskKeys.all, 'dependencies', taskId] as const,
  dependentTasks: (taskId: string) => [...subtaskKeys.all, 'dependentTasks', taskId] as const,
  canStart: (taskId: string) => [...subtaskKeys.all, 'canStart', taskId] as const,
  kanban: (workspaceId: string) => [...subtaskKeys.all, 'kanban', workspaceId] as const,
};

// Get subtasks for a task
export function useSubtasks(taskId: string) {
  return useQuery({
    queryKey: subtaskKeys.list(taskId),
    queryFn: async () => {
      const response = await subtasksAPI.list(taskId);
      return response.data.data.subtasks as Task[];
    },
    enabled: !!taskId,
  });
}

// Get subtask progress
export function useSubtaskProgress(taskId: string) {
  return useQuery({
    queryKey: subtaskKeys.progress(taskId),
    queryFn: async () => {
      const response = await subtasksAPI.getProgress(taskId);
      return response.data.data as SubtaskProgress;
    },
    enabled: !!taskId,
  });
}

// Get dependencies for a task
export function useDependencies(taskId: string) {
  return useQuery({
    queryKey: subtaskKeys.dependencies(taskId),
    queryFn: async () => {
      const response = await subtasksAPI.getDependencies(taskId);
      return response.data.data.dependencies as TaskDependency[];
    },
    enabled: !!taskId,
  });
}

// Get tasks that depend on this task
export function useDependentTasks(taskId: string) {
  return useQuery({
    queryKey: subtaskKeys.dependentTasks(taskId),
    queryFn: async () => {
      const response = await subtasksAPI.getDependentTasks(taskId);
      return response.data.data.dependentTasks as TaskDependency[];
    },
    enabled: !!taskId,
  });
}

// Check if task can start (all blocking dependencies completed)
export function useCanTaskStart(taskId: string) {
  return useQuery({
    queryKey: subtaskKeys.canStart(taskId),
    queryFn: async () => {
      const response = await subtasksAPI.canStart(taskId);
      return response.data.data as { canStart: boolean; blockingTasks: Task[] };
    },
    enabled: !!taskId,
  });
}

// Get Kanban board for workspace
export function useKanbanBoard(workspaceId: string) {
  return useQuery({
    queryKey: subtaskKeys.kanban(workspaceId),
    queryFn: async () => {
      const response = await subtasksAPI.getKanbanBoard(workspaceId);
      return response.data.data.board as Record<string, Task[]>;
    },
    enabled: !!workspaceId,
  });
}

// Create subtask mutation
export function useCreateSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: Record<string, unknown> }) => {
      const response = await subtasksAPI.create(taskId, data);
      return response.data.data.subtask as Task;
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: subtaskKeys.list(taskId) });
      queryClient.invalidateQueries({ queryKey: subtaskKeys.progress(taskId) });
    },
  });
}

// Add dependency mutation
export function useAddDependency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: CreateDependencyInput }) => {
      const response = await subtasksAPI.addDependency(taskId, data);
      return response.data.data.dependency as TaskDependency;
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: subtaskKeys.dependencies(taskId) });
      queryClient.invalidateQueries({ queryKey: subtaskKeys.canStart(taskId) });
    },
  });
}

// Remove dependency mutation
export function useRemoveDependency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, dependencyTaskId }: { taskId: string; dependencyTaskId: string }) => {
      await subtasksAPI.removeDependency(taskId, dependencyTaskId);
      return { taskId, dependencyTaskId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: subtaskKeys.dependencies(result.taskId) });
      queryClient.invalidateQueries({ queryKey: subtaskKeys.canStart(result.taskId) });
    },
  });
}

// Reorder Kanban mutation
export function useReorderKanban() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workspaceId,
      taskId,
      newStatus,
      newPosition,
    }: {
      workspaceId: string;
      taskId: string;
      newStatus: string;
      newPosition: number;
    }) => {
      const response = await subtasksAPI.reorderKanban(workspaceId, { taskId, newStatus, newPosition });
      return response.data.data.task as Task;
    },
    onMutate: async ({ workspaceId, taskId, newStatus, newPosition }) => {
      // Optimistic update for smoother drag-drop
      await queryClient.cancelQueries({ queryKey: subtaskKeys.kanban(workspaceId) });

      const previousBoard = queryClient.getQueryData(subtaskKeys.kanban(workspaceId));

      queryClient.setQueryData(
        subtaskKeys.kanban(workspaceId),
        (old: Record<string, Task[]> | undefined) => {
          if (!old) return old;

          const newBoard = { ...old };
          
          // Find and remove the task from its current column
          for (const status in newBoard) {
            const column = newBoard[status];
            if (!column) continue;
            const index = column.findIndex((t) => t.id === taskId);
            if (index !== -1) {
              const [task] = column.splice(index, 1);
              // Add to new column at new position
              if (!newBoard[newStatus]) {
                newBoard[newStatus] = [];
              }
              const targetColumn = newBoard[newStatus];
              if (targetColumn && task) {
                targetColumn.splice(newPosition, 0, { ...task, status: newStatus as Task['status'] });
              }
              break;
            }
          }

          return newBoard;
        }
      );

      return { previousBoard };
    },
    onError: (_, { workspaceId }, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(subtaskKeys.kanban(workspaceId), context.previousBoard);
      }
    },
    onSettled: (_, __, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: subtaskKeys.kanban(workspaceId) });
    },
  });
}
