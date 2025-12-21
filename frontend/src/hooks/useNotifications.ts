import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Notification, ApiResponse } from '@/lib/types';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

// Fetch all notifications
export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<{ notifications: Notification[] }>>(
        '/notifications'
      );
      return response.data.data.notifications;
    },
  });
}

// Fetch unread count
export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<{ count: number }>>(
        '/notifications/unread-count'
      );
      return response.data.data.count;
    },
  });
}

// Mark notification as read
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}/read`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

// Mark all as read
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.patch('/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
