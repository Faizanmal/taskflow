import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { filtersAPI } from '@/lib/api';
import { SavedFilter, CreateSavedFilterInput, UpdateSavedFilterInput } from '@/lib/types';

// Query keys
export const filterKeys = {
  all: ['savedFilters'] as const,
  lists: () => [...filterKeys.all, 'list'] as const,
  list: (workspaceId?: string) => [...filterKeys.lists(), workspaceId] as const,
  details: () => [...filterKeys.all, 'detail'] as const,
  detail: (id: string) => [...filterKeys.details(), id] as const,
};

// Get all saved filters
export function useSavedFilters(workspaceId?: string) {
  return useQuery({
    queryKey: filterKeys.list(workspaceId),
    queryFn: async () => {
      const response = await filtersAPI.list(workspaceId);
      return response.data.data.filters as SavedFilter[];
    },
  });
}

// Get single saved filter
export function useSavedFilter(id: string) {
  return useQuery({
    queryKey: filterKeys.detail(id),
    queryFn: async () => {
      const response = await filtersAPI.get(id);
      return response.data.data.filter as SavedFilter;
    },
    enabled: !!id,
  });
}

// Create saved filter mutation
export function useCreateSavedFilter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSavedFilterInput) => {
      const response = await filtersAPI.create(data);
      return response.data.data.filter as SavedFilter;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: filterKeys.all });
    },
  });
}

// Update saved filter mutation
export function useUpdateSavedFilter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSavedFilterInput }) => {
      const response = await filtersAPI.update(id, data as Record<string, unknown>);
      return response.data.data.filter as SavedFilter;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: filterKeys.all });
      queryClient.invalidateQueries({ queryKey: filterKeys.detail(id) });
    },
  });
}

// Delete saved filter mutation
export function useDeleteSavedFilter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await filtersAPI.delete(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: filterKeys.all });
    },
  });
}

// Set filter as default mutation
export function useSetDefaultFilter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await filtersAPI.setDefault(id);
      return response.data.data.filter as SavedFilter;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: filterKeys.all });
    },
  });
}
