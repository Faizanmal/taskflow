import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from './constants';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
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
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Only add response interceptor on client
if (typeof window !== 'undefined' && typeof window.location !== 'undefined') {
  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        // Only redirect if not already on auth pages
        if (!window.location.pathname.startsWith('/auth')) {
          window.location.href = '/auth/login';
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

export const templatesAPI = {
  list: () => api.get('/templates'),
  get: (id: string) => api.get(`/templates/${id}`),
  create: (data: Partial<MeetingTemplate>) => api.post('/templates', data),
  update: (id: string, data: Partial<MeetingTemplate>) => api.put(`/templates/${id}`, data),
  delete: (id: string) => api.delete(`/templates/${id}`),
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

export const workspacesAPI = {
  list: () => api.get('/workspaces'),
  get: (id: string) => api.get(`/workspaces/${id}`),
  create: (data: Record<string, unknown>) => api.post('/workspaces', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/workspaces/${id}`, data),
  delete: (id: string) => api.delete(`/workspaces/${id}`),
  listMembers: () => api.get('/workspaces/members'),
  updateMember: (id: string, data: Record<string, unknown>) => api.put(`/workspaces/members/${id}`, data),
  removeMember: (id: string) => api.delete(`/workspaces/members/${id}`),
  listInvitations: () => api.get('/workspaces/invitations'),
  createInvitation: (data: Record<string, unknown>) => api.post('/workspaces/invitations', data),
  acceptInvitation: (id: string) => api.post(`/workspaces/invitations/${id}/accept`),
  declineInvitation: (id: string) => api.post(`/workspaces/invitations/${id}/decline`),
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
