import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templatesAPI } from '@/lib/api';
import {
  TaskTemplate,
  CreateTemplateInput,
  CreateTaskFromTemplateInput,
  SetRecurringInput,
  Task,
} from '@/lib/types';

// Query keys
export const templateKeys = {
  all: ['templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (workspaceId?: string) => [...templateKeys.lists(), workspaceId] as const,
  details: () => [...templateKeys.all, 'detail'] as const,
  detail: (id: string) => [...templateKeys.details(), id] as const,
};

// Get all templates
export function useTemplates(workspaceId?: string) {
  return useQuery({
    queryKey: templateKeys.list(workspaceId),
    queryFn: async () => {
      const response = await templatesAPI.list(workspaceId);
      return response.data.data.templates as TaskTemplate[];
    },
  });
}

// Get single template
export function useTemplate(id: string) {
  return useQuery({
    queryKey: templateKeys.detail(id),
    queryFn: async () => {
      const response = await templatesAPI.get(id);
      return response.data.data.template as TaskTemplate;
    },
    enabled: !!id,
  });
}

// Create template mutation
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTemplateInput) => {
      const response = await templatesAPI.create(data);
      return response.data.data.template as TaskTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all });
    },
  });
}

// Update template mutation
export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateTemplateInput> }) => {
      const response = await templatesAPI.update(id, data as Record<string, unknown>);
      return response.data.data.template as TaskTemplate;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all });
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(id) });
    },
  });
}

// Delete template mutation
export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await templatesAPI.delete(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all });
    },
  });
}

// Create task from template mutation
export function useCreateTaskFromTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ templateId, data }: { templateId: string; data: CreateTaskFromTemplateInput }) => {
      const response = await templatesAPI.createTaskFromTemplate(templateId, data);
      return response.data.data.task as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Set recurring task mutation
export function useSetRecurring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: SetRecurringInput }) => {
      const response = await templatesAPI.setRecurring(taskId, data);
      return response.data.data.task as Task;
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'detail', taskId] });
    },
  });
}

// Remove recurring task mutation
export function useRemoveRecurring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await templatesAPI.removeRecurring(taskId);
      return response.data.data.task as Task;
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'detail', task.id] });
    },
  });
}
