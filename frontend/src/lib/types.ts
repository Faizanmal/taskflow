// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserBasic {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
}

// Task types
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  creator: UserBasic;
  assigneeId: string | null;
  assignee: UserBasic | null;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  assigneeId?: string | null;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  sortBy?: 'dueDate' | 'createdAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
  view?: 'all' | 'assigned' | 'created' | 'overdue';
}

export interface TaskStats {
  totalAssigned: number;
  totalCreated: number;
  overdue: number;
  completed: number;
  inProgress: number;
}

// Notification types
export type NotificationType = 'TASK_ASSIGNED' | 'TASK_UPDATED' | 'TASK_COMPLETED' | 'TASK_DELETED';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  data: Record<string, unknown> | null;
  createdAt: string;
  userId: string;
}

// Auth types
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  errors?: string[];
}
