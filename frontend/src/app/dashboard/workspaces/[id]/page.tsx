'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Settings,
  Users,
  KanbanSquare,
  List,
  Calendar,
  GanttChart,
  Plus,
  Loader2,
  Search,
  Filter,
} from 'lucide-react';
import { useWorkspace } from '@/hooks/useWorkspaces';
import { useTasks } from '@/hooks/useTasks';
import { TaskStatus, TaskPriority } from '@/lib/types';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { CalendarView } from '@/components/tasks/CalendarView';
import { TimelineView } from '@/components/tasks/TimelineView';
import { SavedFiltersPanel, QuickFilters } from '@/components/tasks/SavedFiltersPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type ViewMode = 'kanban' | 'list' | 'calendar' | 'timeline';

interface FilterConfig {
  status?: string[];
  priority?: string[];
  assigneeId?: string;
  dueFrom?: string;
  dueTo?: string;
  search?: string;
  workspaceId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export default function WorkspaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;

  const { data: workspace, isLoading: wsLoading } = useWorkspace(workspaceId);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [filters, setFilters] = useState<FilterConfig>({ workspaceId });
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data: tasks = [], isLoading: tasksLoading } = useTasks({
    ...filters,
    status: filters.status as TaskStatus[] | undefined,
    priority: filters.priority as TaskPriority[] | undefined,
    sortBy: filters.sortBy as 'dueDate' | 'createdAt' | 'priority' | 'status' | undefined,
    search: search || undefined,
    workspaceId,
  });

  if (wsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Workspace not found</h1>
        <Link href="/dashboard/workspaces">
          <Button>Back to Workspaces</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/workspaces"
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="flex items-center gap-3">
            {workspace.icon ? (
              <span className="text-3xl">{workspace.icon}</span>
            ) : (
              <div
                className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: workspace.color || 'var(--accent-color)' }}
              >
                {workspace.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{workspace.name}</h1>
              {workspace.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {workspace.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/dashboard/workspaces/${workspaceId}/members`}>
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Members ({workspace._count?.members || 0})
            </Button>
          </Link>
          <Link href={`/dashboard/workspaces/${workspaceId}/settings`}>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
          <Button className="btn-accent">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="pl-10"
          />
        </div>

        {/* Saved Filters */}
        <SavedFiltersPanel
          currentFilters={filters}
          onApplyFilter={(newFilters) => setFilters({ ...newFilters, workspaceId })}
        />

        {/* Toggle Quick Filters */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>

        {/* View Mode */}
        <div className="flex items-center gap-1 ml-auto bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {[
            { id: 'kanban' as const, icon: KanbanSquare, label: 'Kanban' },
            { id: 'list' as const, icon: List, label: 'List' },
            { id: 'calendar' as const, icon: Calendar, label: 'Calendar' },
            { id: 'timeline' as const, icon: GanttChart, label: 'Timeline' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setViewMode(id)}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === id
                  ? 'bg-white dark:bg-gray-700 shadow-sm'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
              title={label}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Quick Filters */}
      {showFilters && (
        <div className="mb-6 p-4 theme-card rounded-lg">
          <QuickFilters
            currentFilters={filters}
            onApplyFilter={(newFilters) => setFilters({ ...newFilters, workspaceId })}
          />
        </div>
      )}

      {/* Stats Bar */}
      <div className="flex items-center gap-6 mb-6 text-sm">
        <div>
          <span className="text-gray-500">Total:</span>{' '}
          <span className="font-medium">{tasks.length} tasks</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700">
            {tasks.filter((t) => t.status === 'TODO').length} To Do
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            {tasks.filter((t) => t.status === 'IN_PROGRESS').length} In Progress
          </Badge>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
            {tasks.filter((t) => t.status === 'IN_REVIEW').length} In Review
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            {tasks.filter((t) => t.status === 'COMPLETED').length} Completed
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      {tasksLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          {viewMode === 'kanban' && (
            <KanbanBoard
              workspaceId={workspaceId}
              onTaskClick={(task) => router.push(`/dashboard/tasks/${task.id}`)}
            />
          )}

          {viewMode === 'list' && (
            <div className="theme-card rounded-lg divide-y divide-gray-100 dark:divide-gray-700">
              {tasks.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  No tasks found
                </div>
              ) : (
                tasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/dashboard/tasks/${task.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div
                      className={cn(
                        'h-3 w-3 rounded-full',
                        task.priority === 'URGENT' && 'bg-red-500',
                        task.priority === 'HIGH' && 'bg-orange-500',
                        task.priority === 'MEDIUM' && 'bg-blue-500',
                        task.priority === 'LOW' && 'bg-gray-400'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className={cn(
                          'font-medium',
                          task.status === 'COMPLETED' && 'line-through opacity-50'
                        )}
                      >
                        {task.title}
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-500 truncate">{task.description}</p>
                      )}
                    </div>
                    <Badge variant="outline">{task.status.replace('_', ' ')}</Badge>
                    {task.assignee && (
                      <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium">
                        {task.assignee.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Link>
                ))
              )}
            </div>
          )}

          {viewMode === 'calendar' && (
            <CalendarView
              tasks={tasks}
              onSelectTask={(task) => router.push(`/dashboard/tasks/${task.id}`)}
              onCreateTask={(date) => {
                // Could open create modal with pre-filled date
                console.log('Create task for', date);
              }}
            />
          )}

          {viewMode === 'timeline' && (
            <TimelineView
              tasks={tasks}
              onSelectTask={(task) => router.push(`/dashboard/tasks/${task.id}`)}
            />
          )}
        </>
      )}
    </div>
  );
}
