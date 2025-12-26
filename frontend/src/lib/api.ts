import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Polyfill for location in SSR to prevent ReferenceError in dependencies
if (typeof window === 'undefined' && typeof global !== 'undefined' && typeof (global as unknown as { location?: unknown }).location === 'undefined') {
  try {
    (global as unknown as { location: Location }).location = {
      href: '',
      origin: '',
      pathname: '',
      search: '',
      hash: '',
      host: '',
      hostname: '',
      port: '',
      protocol: '',
      assign: () => {},
      replace: () => {},
      reload: () => {},
      toString: () => '',
      ancestorOrigins: [] as unknown as DOMStringList,
    } as Location;
  } catch {
    // Ignore errors if location cannot be defined
  }
}

// Create axios instance
const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
const baseURL = (envApiUrl && envApiUrl.length > 0) ? envApiUrl : 'http://localhost:3001/api';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Token is stored in cookie, but we also check localStorage for SSR
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      const token = window.localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Flag to ensure response interceptor is only set up once
let responseInterceptorInitialized = false;

// Setup response interceptor - call this from client-side code only
export function setupResponseInterceptor() {
  if (responseInterceptorInitialized || typeof window === 'undefined') {
    return;
  }
  
  responseInterceptorInitialized = true;
  
  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
          window.localStorage.removeItem('accessToken');
        }
        // Only redirect if not already on auth pages
        if (typeof window !== 'undefined' && window.location) {
          if (!window.location.pathname.startsWith('/auth')) {
            window.location.href = '/auth/login';
          }
        }
      }
      return Promise.reject(error);
    }
  );
}

// API modules
export const meetingsAPI = {
  list: (params?: Record<string, unknown>) => api.get('/meetings', { params }),
  get: (id: string) => api.get(`/meetings/${id}`),
  getStats: () => api.get('/meetings/stats'),
  getAnalytics: (days: number) => api.get('/meetings/analytics', { params: { days } }),
  create: (data: Partial<Meeting> | FormData) => api.post('/meetings', data),
  update: (id: string, data: Partial<Meeting>) => api.put(`/meetings/${id}`, data),
  delete: (id: string) => api.delete(`/meetings/${id}`),
  share: (id: string) => api.post(`/meetings/${id}/share`),
  toggleFavorite: (id: string) => api.post(`/meetings/${id}/toggle-favorite`),
  getFavorites: () => api.get('/meetings/favorites'),
};

export const actionItemsAPI = {
  list: (params?: Record<string, unknown>) => api.get('/action-items', { params }),
  get: (id: string) => api.get(`/action-items/${id}`),
  create: (data: Partial<ActionItem>) => api.post('/action-items', data),
  update: (id: string, data: Partial<ActionItem>) => api.put(`/action-items/${id}`, data),
  delete: (id: string) => api.delete(`/action-items/${id}`),
  complete: (id: string) => api.post(`/action-items/${id}/complete`),
};

export const notesAPI = {
  list: (meetingId: string) => api.get('/notes', { params: { meetingId } }),
  create: (data: Record<string, unknown>) => api.post('/notes', data),
  delete: (id: string) => api.delete(`/notes/${id}`),
};

export const tagsAPI = {
  list: () => api.get('/tags'),
  create: (data: { name: string; color?: string }) => api.post('/tags', data),
  update: (id: string, data: { name?: string; color?: string }) => api.put(`/tags/${id}`, data),
  delete: (id: string) => api.delete(`/tags/${id}`),
};

export const activitiesAPI = {
  list: (limit: number) => api.get('/activities', { params: { limit } }),
  get: (id: string) => api.get(`/activities/${id}`),
};

export const integrationsAPI = {
  list: () => api.get('/integrations'),
  get: (id: string) => api.get(`/integrations/${id}`),
  create: (data: Partial<NotificationIntegration>) => api.post('/integrations', data),
  update: (id: string, data: Partial<NotificationIntegration>) => api.put(`/integrations/${id}`, data),
  delete: (id: string) => api.delete(`/integrations/${id}`),
  test: (id: string, testMessage: string) => api.post(`/integrations/${id}/test`, { testMessage }),
};

export const notificationLogsAPI = {
  list: () => api.get('/notification-logs'),
};

export const calendarAPI = {
  listConnections: () => api.get('/calendar/connections'),
  getConnection: (id: string) => api.get(`/calendar/connections/${id}`),
  createConnection: (data: Partial<CalendarConnection>) => api.post('/calendar/connections', data),
  updateConnection: (id: string, data: Partial<CalendarConnection>) => api.put(`/calendar/connections/${id}`, data),
  deleteConnection: (id: string) => api.delete(`/calendar/connections/${id}`),
  syncConnection: (id: string) => api.post(`/calendar/connections/${id}/sync`),
  listEvents: () => api.get('/calendar/events'),
  listSyncLogs: () => api.get('/calendar/sync-logs'),
};

// ===== NEW TASKFLOW APIs =====

// Workspaces API
export const workspacesAPI = {
  list: () => api.get('/workspaces'),
  get: (id: string) => api.get(`/workspaces/${id}`),
  create: <T extends object>(data: T) => api.post('/workspaces', data),
  update: <T extends object>(id: string, data: T) => api.put(`/workspaces/${id}`, data),
  delete: (id: string) => api.delete(`/workspaces/${id}`),
  getAnalytics: (id: string) => api.get(`/workspaces/${id}/analytics`),
  inviteMember: (id: string, data: { email: string; role: string }) => api.post(`/workspaces/${id}/invite`, data),
  acceptInvite: (token: string) => api.post(`/workspaces/invites/${token}/accept`),
  getInvite: (token: string) => api.get(`/workspaces/invites/${token}`),
  updateMemberRole: (workspaceId: string, memberId: string, role: string) => 
    api.patch(`/workspaces/${workspaceId}/members/${memberId}`, { role }),
  removeMember: (workspaceId: string, memberId: string) => 
    api.delete(`/workspaces/${workspaceId}/members/${memberId}`),
  leave: (id: string) => api.post(`/workspaces/${id}/leave`),
};

// Comments API
export const commentsAPI = {
  list: (taskId: string) => api.get(`/tasks/${taskId}/comments`),
  create: (taskId: string, data: { content: string; parentId?: string; mentionedUserIds?: string[] }) => 
    api.post(`/tasks/${taskId}/comments`, data),
  update: (id: string, data: { content: string; mentionedUserIds?: string[] }) => 
    api.patch(`/comments/${id}`, data),
  delete: (id: string) => api.delete(`/comments/${id}`),
};

// Subtasks API
export const subtasksAPI = {
  list: (taskId: string) => api.get(`/tasks/${taskId}/subtasks`),
  create: (taskId: string, data: Record<string, unknown>) => api.post(`/tasks/${taskId}/subtasks`, data),
  getProgress: (taskId: string) => api.get(`/tasks/${taskId}/subtasks/progress`),
  // Dependencies
  getDependencies: (taskId: string) => api.get(`/tasks/${taskId}/dependencies`),
  addDependency: (taskId: string, data: { dependencyTaskId: string; type?: string }) => 
    api.post(`/tasks/${taskId}/dependencies`, data),
  removeDependency: (taskId: string, dependencyTaskId: string) => 
    api.delete(`/tasks/${taskId}/dependencies/${dependencyTaskId}`),
  getDependentTasks: (taskId: string) => api.get(`/tasks/${taskId}/dependent-tasks`),
  canStart: (taskId: string) => api.get(`/tasks/${taskId}/can-start`),
  // Kanban reordering
  reorderKanban: (workspaceId: string, data: { taskId: string; newStatus: string; newPosition: number }) => 
    api.patch(`/workspaces/${workspaceId}/tasks/reorder`, data),
  getKanbanBoard: (workspaceId: string) => api.get(`/workspaces/${workspaceId}/tasks/kanban`),
};

// Time Tracking API
export const timeTrackingAPI = {
  startTimer: (taskId: string, data?: { description?: string }) => 
    api.post(`/tasks/${taskId}/time/start`, data || {}),
  stopTimer: () => api.post('/time-tracking/stop'),
  getRunningTimer: () => api.get('/time-tracking/running'),
  logManual: (taskId: string, data: { description?: string; startTime: string; endTime?: string; duration?: number }) => 
    api.post(`/tasks/${taskId}/time`, data),
  updateLog: <T extends object>(id: string, data: T) => api.patch(`/time-tracking/${id}`, data),
  deleteLog: (id: string) => api.delete(`/time-tracking/${id}`),
  getTaskLogs: (taskId: string) => api.get(`/tasks/${taskId}/time`),
  getTaskTotalTime: (taskId: string) => api.get(`/tasks/${taskId}/time/total`),
  getUserLogs: (filters?: Record<string, unknown>) => api.get('/time-tracking/my-logs', { params: filters }),
  getDailyReport: (startDate: string, endDate: string) => 
    api.get('/time-tracking/reports/daily', { params: { startDate, endDate } }),
  getWeeklyReport: (startDate: string, endDate: string) => 
    api.get('/time-tracking/reports/weekly', { params: { startDate, endDate } }),
  getProductivityStats: (startDate: string, endDate: string) => 
    api.get('/time-tracking/stats', { params: { startDate, endDate } }),
  getPomodoroSettings: () => api.get('/time-tracking/pomodoro/settings'),
  updatePomodoroSettings: <T extends object>(data: T) => 
    api.patch('/time-tracking/pomodoro/settings', data),
};

// Attachments API
export const attachmentsAPI = {
  list: (taskId: string) => api.get(`/tasks/${taskId}/attachments`),
  upload: (taskId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/tasks/${taskId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id: string) => api.delete(`/attachments/${id}`),
  download: (id: string) => api.get(`/attachments/${id}`, { responseType: 'blob' }),
};

// Templates API
export const templatesAPI = {
  list: (workspaceId?: string) => api.get('/templates', { params: workspaceId ? { workspaceId } : undefined }),
  get: (id: string) => api.get(`/templates/${id}`),
  create: <T extends object>(data: T) => api.post('/templates', data),
  update: <T extends object>(id: string, data: T) => api.patch(`/templates/${id}`, data),
  delete: (id: string) => api.delete(`/templates/${id}`),
  createTaskFromTemplate: <T extends object>(id: string, data: T) => 
    api.post(`/templates/${id}/create-task`, data),
  // Recurring tasks
  setRecurring: (taskId: string, data: { pattern: string; interval?: number; days?: string[] }) => 
    api.post(`/tasks/${taskId}/recurring`, data),
  removeRecurring: (taskId: string) => api.delete(`/tasks/${taskId}/recurring`),
};

// Saved Filters API
export const filtersAPI = {
  list: (workspaceId?: string) => api.get('/filters', { params: workspaceId ? { workspaceId } : undefined }),
  get: (id: string) => api.get(`/filters/${id}`),
  create: <T extends object>(data: T) => api.post('/filters', data),
  update: <T extends object>(id: string, data: T) => api.patch(`/filters/${id}`, data),
  delete: (id: string) => api.delete(`/filters/${id}`),
  setDefault: (id: string) => api.post(`/filters/${id}/set-default`),
};

// Notifications API (extended)
export const notificationsAPI = {
  list: () => api.get('/notifications'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: <T extends object>(data: T) => api.patch('/notifications/preferences', data),
};

// User/Profile API (extended for theme)
export const profileAPI = {
  get: () => api.get('/auth/profile'),
  update: (data: { name?: string; avatar?: string; theme?: string; accentColor?: string }) => 
    api.patch('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) => 
    api.post('/auth/change-password', data),
};

// Types
export interface Meeting {
  id: string;
  title: string;
  // Add other fields as needed
}

export interface ActionItem {
  id: string;
  description: string;
  // Add other fields
}

export type Tag = {
  id: string;
  name: string;
  color?: string;
};

export interface MeetingTemplate {
  id: string;
  name: string;
  // Add other fields
}

export interface NotificationIntegration {
  id: string;
  type: string;
  // Add other fields
}

export interface CalendarConnection {
  id: string;
  provider: string;
  // Add other fields
}

export interface Workspace {
  id: string;
  name: string;
  // Add other fields
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  role: string;
  // Add other fields
}

export default api;
