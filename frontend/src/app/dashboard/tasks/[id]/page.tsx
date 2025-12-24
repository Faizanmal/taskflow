'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Loader2,
  MoreVertical,
  ExternalLink,
  Copy,
  Calendar,
  User,
  Circle,
} from 'lucide-react';
import { useTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { TaskComments } from '@/components/tasks/TaskComments';
import { TimeTracker, PomodoroTimer } from '@/components/tasks/TimeTracker';
import { TaskAttachments } from '@/components/tasks/TaskAttachments';
import { SubtaskList, TaskDependencies } from '@/components/tasks/SubtaskList';
import { RecurringTaskSettings } from '@/components/tasks/TaskTemplates';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/radix-select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To Do', color: 'bg-gray-100 text-gray-800' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'IN_REVIEW', label: 'In Review', color: 'bg-purple-100 text-purple-800' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-green-100 text-green-800' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low', color: 'bg-gray-400' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-blue-500' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-500' },
  { value: 'URGENT', label: 'Urgent', color: 'bg-red-500' },
];

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const { data: task, isLoading } = useTask(taskId);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    dueDate: '',
  });

  const handleEdit = () => {
    if (task) {
      const dueDateStr = task.dueDate ? String(task.dueDate).split('T')[0] : '';
      setEditData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: dueDateStr || '',
      });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    try {
      const updateData: Record<string, unknown> = {
        title: editData.title,
        status: editData.status as string,
        priority: editData.priority as string,
      };
      if (editData.description) {
        updateData.description = editData.description;
      }
      if (editData.dueDate) {
        updateData.dueDate = new Date(editData.dueDate).toISOString();
      }
      await updateTask.mutateAsync({
        id: taskId,
        data: updateData as any,
      });
      setIsEditing(false);
      toast.success('Task updated');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateTask.mutateAsync({
        id: taskId,
        data: { status: newStatus as any },
      });
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await deleteTask.mutateAsync(taskId);
      toast.success('Task deleted');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Task not found</h1>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const priorityInfo = PRIORITY_OPTIONS.find((p) => p.value === task.priority);

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={editData.title}
              onChange={(e) => setEditData((prev) => ({ ...prev, title: e.target.value }))}
              className="text-2xl font-bold"
              autoFocus
            />
          ) : (
            <h1
              className={cn(
                'text-2xl font-bold truncate',
                task.status === 'COMPLETED' && 'line-through opacity-60'
              )}
            >
              {task.title}
            </h1>
          )}
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span>Created {formatDistanceToNow(new Date(task.createdAt))} ago</span>
            {task.workspace && (
              <>
                <span>•</span>
                <Link
                  href={`/dashboard/workspaces/${task.workspace.id}`}
                  className="hover:underline"
                >
                  {task.workspace.name}
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} disabled={updateTask.isPending} className="btn-accent">
                {updateTask.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleEdit}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={copyLink}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/tasks/${taskId}`} target="_blank">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-500"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <section className="theme-card rounded-lg p-6">
            <h2 className="font-semibold mb-4">Description</h2>
            {isEditing ? (
              <Textarea
                value={editData.description}
                onChange={(e) => setEditData((prev) => ({ ...prev, description: e.target.value }))}
                rows={6}
                placeholder="Add a description..."
              />
            ) : (
              <div className="prose dark:prose-invert max-w-none">
                {task.description || (
                  <p className="text-gray-400 italic">No description provided</p>
                )}
              </div>
            )}
          </section>

          {/* Tabs for Features */}
          <Tabs defaultValue="subtasks" className="theme-card rounded-lg p-6">
            <TabsList className="mb-4">
              <TabsTrigger value="subtasks">Subtasks</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
              <TabsTrigger value="time">Time Tracking</TabsTrigger>
            </TabsList>

            <TabsContent value="subtasks" className="space-y-6">
              <SubtaskList taskId={taskId} />
              <TaskDependencies taskId={taskId} />
            </TabsContent>

            <TabsContent value="comments">
              <TaskComments taskId={taskId} />
            </TabsContent>

            <TabsContent value="attachments">
              <TaskAttachments taskId={taskId} />
            </TabsContent>

            <TabsContent value="time" className="space-y-6">
              <TimeTracker taskId={taskId} taskTitle={task.title} />
              <PomodoroTimer taskId={taskId} taskTitle={task.title} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Priority */}
          <section className="theme-card rounded-lg p-6 space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              {isEditing ? (
                <Select
                  value={editData.status}
                  onValueChange={(v) => setEditData((prev) => ({ ...prev, status: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => handleStatusChange(s.value)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                        task.status === s.value
                          ? s.color
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              {isEditing ? (
                <Select
                  value={editData.priority}
                  onValueChange={(v) => setEditData((prev) => ({ ...prev, priority: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        <div className="flex items-center gap-2">
                          <div className={cn('h-2 w-2 rounded-full', p.color)} />
                          {p.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2">
                  <div className={cn('h-3 w-3 rounded-full', priorityInfo?.color)} />
                  <span className="font-medium">{priorityInfo?.label}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={editData.dueDate}
                  onChange={(e) => setEditData((prev) => ({ ...prev, dueDate: e.target.value }))}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {task.dueDate ? (
                    <span>{format(new Date(task.dueDate), 'PPP')}</span>
                  ) : (
                    <span className="text-gray-400">No due date</span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Assignee</Label>
              <div className="flex items-center gap-2">
                {task.assignee ? (
                  <>
                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      {task.assignee.avatar ? (
                        <img
                          src={task.assignee.avatar}
                          alt={task.assignee.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        task.assignee.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span>{task.assignee.name}</span>
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400">Unassigned</span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Creator</Label>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  {task.creator?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <span>{task.creator?.name || 'Unknown'}</span>
              </div>
            </div>
          </section>

          {/* Recurring Settings */}
          <RecurringTaskSettings task={task} />

          {/* Activity */}
          <section className="theme-card rounded-lg p-6">
            <h3 className="font-semibold mb-4">Activity</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Circle className="h-3 w-3 text-green-600" />
                </div>
                <div>
                  <p>Task created</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(task.createdAt), 'PPp')}
                  </p>
                </div>
              </div>
              {task.updatedAt !== task.createdAt && (
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Edit2 className="h-3 w-3 text-blue-600" />
                  </div>
                  <div>
                    <p>Last updated</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(task.updatedAt), 'PPp')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
