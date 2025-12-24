import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attachmentsAPI } from '@/lib/api';
import { Attachment } from '@/lib/types';

// Query keys
export const attachmentKeys = {
  all: ['attachments'] as const,
  lists: () => [...attachmentKeys.all, 'list'] as const,
  list: (taskId: string) => [...attachmentKeys.lists(), taskId] as const,
};

// Get attachments for a task
export function useAttachments(taskId: string) {
  return useQuery({
    queryKey: attachmentKeys.list(taskId),
    queryFn: async () => {
      const response = await attachmentsAPI.list(taskId);
      return response.data.data.attachments as Attachment[];
    },
    enabled: !!taskId,
  });
}

// Upload attachment mutation
export function useUploadAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, file }: { taskId: string; file: File }) => {
      const response = await attachmentsAPI.upload(taskId, file);
      return response.data.data.attachment as Attachment;
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.list(taskId) });
    },
  });
}

// Delete attachment mutation
export function useDeleteAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, taskId }: { id: string; taskId: string }) => {
      await attachmentsAPI.delete(id);
      return { id, taskId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.list(result.taskId) });
    },
  });
}

// Download attachment
export function useDownloadAttachment() {
  return useMutation({
    mutationFn: async ({ id, filename }: { id: string; filename: string }) => {
      const response = await attachmentsAPI.download(id);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}
