import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

export interface ProductivityStats {
  tasksCreated: number;
  tasksCompleted: number;
  averageCompletionTime: number;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
  timeTracked: number;
  streakDays: number;
}

export interface TeamProductivity {
  userId: string;
  userName: string;
  userAvatar: string | null;
  tasksCompleted: number;
  tasksCreated: number;
  timeTracked: number;
  averageCompletionTime: number;
}

export interface DailyStats {
  date: string;
  tasksCreated: number;
  tasksCompleted: number;
  timeTracked: number;
}

/**
 * Hook for personal productivity statistics
 */
export function usePersonalStats(days: number = 30) {
  return useQuery({
    queryKey: ['analytics', 'personal', days],
    queryFn: async (): Promise<ProductivityStats> => {
      const response = await api.get(`/analytics/personal?days=${days}`);
      return response.data.data.stats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for team productivity statistics
 */
export function useTeamProductivity(workspaceId: string, days: number = 30) {
  return useQuery({
    queryKey: ['analytics', 'team', workspaceId, days],
    queryFn: async (): Promise<TeamProductivity[]> => {
      const response = await api.get(`/analytics/team/${workspaceId}?days=${days}`);
      return response.data.data.productivity;
    },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for daily statistics
 */
export function useDailyStats(days: number = 30) {
  return useQuery({
    queryKey: ['analytics', 'daily', days],
    queryFn: async (): Promise<DailyStats[]> => {
      const response = await api.get(`/analytics/daily?days=${days}`);
      return response.data.data.stats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for tracking usage events
 */
export function useTrackEvent() {
  return useMutation({
    mutationFn: async (data: { eventType: string; metadata?: Record<string, unknown> }) => {
      // Send to analytics endpoint (could be internal or external like Mixpanel)
      console.log('Track event:', data);
      return data;
    },
  });
}

export default usePersonalStats;
