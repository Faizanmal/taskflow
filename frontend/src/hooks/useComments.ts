import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsAPI } from '@/lib/api';
import { Comment, CreateCommentInput, UpdateCommentInput } from '@/lib/types';

// Query keys
export const commentKeys = {
  all: ['comments'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  list: (taskId: string) => [...commentKeys.lists(), taskId] as const,
};

// Fetch comments for a task
export function useComments(taskId: string) {
  return useQuery({
    queryKey: commentKeys.list(taskId),
    queryFn: async () => {
      const response = await commentsAPI.list(taskId);
      return response.data.data.comments as Comment[];
    },
    enabled: !!taskId,
  });
}

// Create comment mutation
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: CreateCommentInput }) => {
      const response = await commentsAPI.create(taskId, data);
      return response.data.data.comment as Comment;
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(taskId) });
    },
  });
}

// Update comment mutation
export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      taskId,
      data,
    }: {
      id: string;
      taskId: string;
      data: UpdateCommentInput;
    }) => {
      const response = await commentsAPI.update(id, data);
      return { comment: response.data.data.comment as Comment, taskId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(result.taskId) });
    },
  });
}

// Delete comment mutation
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, taskId }: { id: string; taskId: string }) => {
      await commentsAPI.delete(id);
      return { id, taskId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(result.taskId) });
    },
  });
}
