import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timeTrackingAPI } from '@/lib/api';
import {
  TimeLog,
  StartTimerInput,
  LogTimeManualInput,
  UpdateTimeLogInput,
  DailyReport,
  WeeklyReport,
  ProductivityStats,
} from '@/lib/types';

// Query keys
export const timeTrackingKeys = {
  all: ['timeTracking'] as const,
  running: () => [...timeTrackingKeys.all, 'running'] as const,
  taskLogs: (taskId: string) => [...timeTrackingKeys.all, 'task', taskId] as const,
  taskTotal: (taskId: string) => [...timeTrackingKeys.all, 'task', taskId, 'total'] as const,
  userLogs: (filters?: Record<string, unknown>) => [...timeTrackingKeys.all, 'user', filters] as const,
  dailyReport: (start: string, end: string) => [...timeTrackingKeys.all, 'daily', start, end] as const,
  weeklyReport: (start: string, end: string) => [...timeTrackingKeys.all, 'weekly', start, end] as const,
  stats: (start: string, end: string) => [...timeTrackingKeys.all, 'stats', start, end] as const,
  pomodoro: () => [...timeTrackingKeys.all, 'pomodoro'] as const,
};

// Get running timer
export function useRunningTimer() {
  return useQuery({
    queryKey: timeTrackingKeys.running(),
    queryFn: async () => {
      try {
        const response = await timeTrackingAPI.getRunningTimer();
        return response.data.data.timer as TimeLog | null;
      } catch {
        return null;
      }
    },
    refetchInterval: 60000, // Refetch every minute
  });
}

// Get time logs for a task
export function useTaskTimeLogs(taskId: string) {
  return useQuery({
    queryKey: timeTrackingKeys.taskLogs(taskId),
    queryFn: async () => {
      const response = await timeTrackingAPI.getTaskLogs(taskId);
      return response.data.data.timeLogs as TimeLog[];
    },
    enabled: !!taskId,
  });
}

// Get total time for a task
export function useTaskTotalTime(taskId: string) {
  return useQuery({
    queryKey: timeTrackingKeys.taskTotal(taskId),
    queryFn: async () => {
      const response = await timeTrackingAPI.getTaskTotalTime(taskId);
      return response.data.data.totalMinutes as number;
    },
    enabled: !!taskId,
  });
}

// Get user's time logs
export function useUserTimeLogs(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: timeTrackingKeys.userLogs(filters),
    queryFn: async () => {
      const response = await timeTrackingAPI.getUserLogs(filters);
      return response.data.data.timeLogs as TimeLog[];
    },
  });
}

// Get daily report
export function useDailyReport(startDate: string, endDate: string) {
  return useQuery({
    queryKey: timeTrackingKeys.dailyReport(startDate, endDate),
    queryFn: async () => {
      const response = await timeTrackingAPI.getDailyReport(startDate, endDate);
      return response.data.data.report as DailyReport[];
    },
    enabled: !!startDate && !!endDate,
  });
}

// Get weekly report
export function useWeeklyReport(startDate: string, endDate: string) {
  return useQuery({
    queryKey: timeTrackingKeys.weeklyReport(startDate, endDate),
    queryFn: async () => {
      const response = await timeTrackingAPI.getWeeklyReport(startDate, endDate);
      return response.data.data.report as WeeklyReport[];
    },
    enabled: !!startDate && !!endDate,
  });
}

// Get productivity stats
export function useProductivityStats(startDate: string, endDate: string) {
  return useQuery({
    queryKey: timeTrackingKeys.stats(startDate, endDate),
    queryFn: async () => {
      const response = await timeTrackingAPI.getProductivityStats(startDate, endDate);
      return response.data.data as ProductivityStats;
    },
    enabled: !!startDate && !!endDate,
  });
}

// Get pomodoro settings
export function usePomodoroSettings() {
  return useQuery({
    queryKey: timeTrackingKeys.pomodoro(),
    queryFn: async () => {
      const response = await timeTrackingAPI.getPomodoroSettings();
      return response.data.data;
    },
  });
}

// Start timer mutation
export function useStartTimer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data?: StartTimerInput }) => {
      const response = await timeTrackingAPI.startTimer(taskId, data);
      return response.data.data.timeLog as TimeLog;
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: timeTrackingKeys.running() });
      queryClient.invalidateQueries({ queryKey: timeTrackingKeys.taskLogs(taskId) });
    },
  });
}

// Stop timer mutation
export function useStopTimer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await timeTrackingAPI.stopTimer();
      return response.data.data.timeLog as TimeLog;
    },
    onSuccess: (timeLog) => {
      queryClient.invalidateQueries({ queryKey: timeTrackingKeys.running() });
      queryClient.invalidateQueries({ queryKey: timeTrackingKeys.taskLogs(timeLog.taskId) });
      queryClient.invalidateQueries({ queryKey: timeTrackingKeys.userLogs() });
    },
  });
}

// Log time manually
export function useLogTimeManual() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: LogTimeManualInput }) => {
      const response = await timeTrackingAPI.logManual(taskId, data);
      return response.data.data.timeLog as TimeLog;
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: timeTrackingKeys.taskLogs(taskId) });
      queryClient.invalidateQueries({ queryKey: timeTrackingKeys.userLogs() });
    },
  });
}

// Update time log
export function useUpdateTimeLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTimeLogInput }) => {
      const response = await timeTrackingAPI.updateLog(id, data);
      return response.data.data.timeLog as TimeLog;
    },
    onSuccess: (timeLog) => {
      queryClient.invalidateQueries({ queryKey: timeTrackingKeys.taskLogs(timeLog.taskId) });
      queryClient.invalidateQueries({ queryKey: timeTrackingKeys.userLogs() });
    },
  });
}

// Delete time log
export function useDeleteTimeLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, taskId }: { id: string; taskId: string }) => {
      await timeTrackingAPI.deleteLog(id);
      return { id, taskId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: timeTrackingKeys.taskLogs(result.taskId) });
      queryClient.invalidateQueries({ queryKey: timeTrackingKeys.userLogs() });
    },
  });
}

// Update pomodoro settings
export function useUpdatePomodoroSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await timeTrackingAPI.updatePomodoroSettings(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timeTrackingKeys.pomodoro() });
    },
  });
}
