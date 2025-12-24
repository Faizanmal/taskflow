// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  theme?: 'light' | 'dark' | 'system';
  accentColor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserBasic {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
}

// Workspace types
export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
  user: UserBasic;
}

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  avatar: string | null;
  icon: string | null;
  color: string | null;
  ownerId: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  members: WorkspaceMember[];
  invites?: WorkspaceInvite[];
  _count?: {
    tasks: number;
    members: number;
  };
}

export interface WorkspaceInvite {
  id: string;
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
  token: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
  workspace?: Workspace;
}

export interface CreateWorkspaceInput {
  name: string;
  description?: string;
  avatar?: string;
  icon?: string;
  color?: string;
}

export interface UpdateWorkspaceInput {
  name?: string;
  description?: string;
  avatar?: string;
  icon?: string;
  color?: string;
}

export interface InviteMemberInput {
  email: string;
  role: WorkspaceRole;
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
  position: number;
  estimatedTime: number | null;
  isRecurring: boolean;
  recurringPattern: string | null;
  recurringInterval: number | null;
  recurringDays: string | null;
  lastRecurrence: string | null;
  parentTaskId: string | null;
  workspaceId: string | null;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  creator: UserBasic;
  assigneeId: string | null;
  assignee: UserBasic | null;
  workspace?: Workspace | null;
  subtasks?: Task[];
  _count?: {
    subtasks: number;
    comments: number;
    attachments: number;
    timeLogs: number;
  };
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
  parentTaskId?: string;
  workspaceId?: string;
  estimatedTime?: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  assigneeId?: string | null;
  estimatedTime?: number | null;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  sortBy?: 'dueDate' | 'createdAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
  view?: 'all' | 'assigned' | 'created' | 'overdue';
  workspaceId?: string;
  search?: string;
}

export interface TaskStats {
  totalAssigned: number;
  totalCreated: number;
  overdue: number;
  completed: number;
  inProgress: number;
}

// Subtask & Dependency types
export type DependencyType = 'BLOCKS' | 'BLOCKED_BY' | 'RELATED';

export interface TaskDependency {
  id: string;
  dependentTaskId: string;
  dependencyTaskId: string;
  type: DependencyType;
  createdAt: string;
  dependentTask: Task;
  dependencyTask: Task;
}

export interface CreateDependencyInput {
  dependencyTaskId: string;
  type?: DependencyType;
}

export interface SubtaskProgress {
  total: number;
  completed: number;
  percentage: number;
}

// Comment types
export interface CommentMention {
  id: string;
  userId: string;
  commentId: string;
  createdAt: string;
  user: UserBasic;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  author: UserBasic;
  mentions: CommentMention[];
  replies: Comment[];
  _count: {
    replies: number;
  };
}

export interface CreateCommentInput {
  content: string;
  parentId?: string;
  mentionedUserIds?: string[];
}

export interface UpdateCommentInput {
  content: string;
  mentionedUserIds?: string[];
}

// Time Tracking types
export interface TimeLog {
  id: string;
  taskId: string;
  userId: string;
  description: string | null;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  isRunning: boolean;
  isPomodoro?: boolean;
  createdAt: string;
  updatedAt: string;
  task: Task;
  user: UserBasic;
}

export interface StartTimerInput {
  description?: string;
}

export interface LogTimeManualInput {
  description?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
}

export interface UpdateTimeLogInput {
  description?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
}

export interface DailyReport {
  date: string;
  totalMinutes: number;
}

export interface WeeklyReport {
  week: string;
  totalMinutes: number;
  dailyBreakdown?: Record<string, number>;
  taskBreakdown?: {
    taskId: string;
    taskTitle: string;
    totalMinutes: number;
  }[];
}

export interface ProductivityStats {
  totalTimeSpent: number;
  tasksWorkedOn: number;
  averageTimePerTask: number;
  mostProductiveDay: string | null;
  todayMinutes?: number;
  dailyGoal?: number;
  currentStreak?: number;
  longestStreak?: number;
  totalPomodoros?: number;
  taskBreakdown: {
    taskId: string;
    taskTitle: string;
    totalMinutes: number;
  }[];
}

// Attachment types
export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  taskId: string;
  uploaderId: string;
  createdAt: string;
  uploader: UserBasic;
}

// Template types
export interface SubtaskTemplate {
  title: string;
  description?: string;
  priority?: TaskPriority;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description: string | null;
  taskTitle: string;
  taskDescription: string | null;
  taskPriority: TaskPriority;
  estimatedTime: number | null;
  subtaskTemplates: string | null;
  isPublic: boolean;
  creatorId: string;
  workspaceId: string | null;
  createdAt: string;
  updatedAt: string;
  creator: UserBasic;
  workspace?: Workspace;
  _count: {
    createdTasks: number;
  };
}

export interface CreateTemplateInput {
  name: string;
  description?: string;
  taskTitle: string;
  taskDescription?: string;
  taskPriority?: TaskPriority;
  estimatedTime?: number;
  isPublic?: boolean;
  workspaceId?: string;
  subtasks?: SubtaskTemplate[];
}

export interface CreateTaskFromTemplateInput {
  assigneeId?: string;
  dueDate?: string;
  workspaceId?: string;
}

export interface SetRecurringInput {
  pattern: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval?: number;
  days?: ('SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT')[];
}

// Saved Filter types
export type ViewType = 'LIST' | 'KANBAN' | 'CALENDAR' | 'GANTT';

export interface SavedFilter {
  id: string;
  name: string;
  description: string | null;
  filters: string;
  viewType: ViewType;
  isDefault: boolean;
  isShared: boolean;
  userId: string;
  workspaceId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavedFilterInput {
  name: string;
  description?: string;
  filters: string;
  viewType?: ViewType;
  isDefault?: boolean;
  isShared?: boolean;
  workspaceId?: string;
}

export interface UpdateSavedFilterInput {
  name?: string;
  description?: string;
  filters?: string;
  viewType?: ViewType;
  isDefault?: boolean;
  isShared?: boolean;
}

// Notification types
export type NotificationType = 
  | 'TASK_ASSIGNED' 
  | 'TASK_UPDATED' 
  | 'TASK_COMPLETED' 
  | 'TASK_DELETED'
  | 'COMMENT_ADDED'
  | 'COMMENT_MENTION'
  | 'WORKSPACE_INVITE'
  | 'WORKSPACE_JOINED';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  data: Record<string, unknown> | null;
  createdAt: string;
  userId: string;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  type: NotificationType;
  email: boolean;
  push: boolean;
  inApp: boolean;
}

// Notification settings aggregated type
export interface NotificationPreferences {
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  taskAssigned: boolean;
  taskUpdated: boolean;
  taskCompleted: boolean;
  taskCommented: boolean;
  dueDateReminder: boolean;
  reminderTiming: number;
  digestEnabled: boolean;
  digestFrequency: 'DAILY' | 'WEEKLY';
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
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

export interface UpdateProfileInput {
  name?: string;
  avatar?: string;
  theme?: 'light' | 'dark' | 'system';
  accentColor?: string;
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

// Workspace Analytics
export interface WorkspaceAnalytics {
  taskStats: {
    total: number;
    byStatus: Record<TaskStatus, number>;
    byPriority: Record<TaskPriority, number>;
    completedThisWeek: number;
    overdueCount: number;
  };
  memberStats: {
    total: number;
    byRole: Record<WorkspaceRole, number>;
  };
  timeStats: {
    totalTimeLogged: number;
    averageTimePerTask: number;
  };
}
