'use client';

import { useState } from 'react';
import { Plus, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useCreateTask } from '@/hooks/useTasks';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useUsers } from '@/hooks/useUsers';
import { TaskStatus, TaskPriority } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/radix-select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface CreateTaskDialogProps {
  defaultWorkspaceId?: string;
  defaultDueDate?: Date;
  trigger?: React.ReactNode;
  onSuccess?: (taskId: string) => void;
}

export function CreateTaskDialog({
  defaultWorkspaceId,
  defaultDueDate,
  trigger,
  onSuccess,
}: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const createTask = useCreateTask();
  const { data: workspaces = [] } = useWorkspaces();
  const { data: users = [] } = useUsers();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    dueDate: defaultDueDate,
    workspaceId: defaultWorkspaceId || '',
    assigneeId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    try {
      const task = await createTask.mutateAsync({
        title: formData.title,
        description: formData.description || undefined,
        priority: formData.priority as TaskPriority,
        status: formData.status as TaskStatus,
        dueDate: formData.dueDate ? formData.dueDate.toISOString() : undefined,
        workspaceId: formData.workspaceId || undefined,
        assigneeId: formData.assigneeId || undefined,
      });

      toast.success('Task created successfully');
      setFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'TODO',
        dueDate: undefined,
        workspaceId: defaultWorkspaceId || '',
        assigneeId: '',
      });
      setOpen(false);
      onSuccess?.(task.id);
    } catch {
      toast.error('Failed to create task');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="btn-accent">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              placeholder="Add more details..."
              rows={3}
            />
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(v) => setFormData((p) => ({ ...p, priority: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-gray-400" />
                      Low
                    </span>
                  </SelectItem>
                  <SelectItem value="MEDIUM">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      Medium
                    </span>
                  </SelectItem>
                  <SelectItem value="HIGH">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-orange-500" />
                      High
                    </span>
                  </SelectItem>
                  <SelectItem value="URGENT">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      Urgent
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData((p) => ({ ...p, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="IN_REVIEW">In Review</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !formData.dueDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dueDate ? (
                    format(formData.dueDate, 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.dueDate}
                  onSelect={(date) => setFormData((p) => ({ ...p, dueDate: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Workspace */}
          {workspaces.length > 0 && (
            <div className="space-y-2">
              <Label>Workspace</Label>
              <Select
                value={formData.workspaceId}
                onValueChange={(v) => setFormData((p) => ({ ...p, workspaceId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select workspace (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No workspace</SelectItem>
                  {workspaces.map((ws) => (
                    <SelectItem key={ws.id} value={ws.id}>
                      <span className="flex items-center gap-2">
                        {ws.icon && <span>{ws.icon}</span>}
                        {ws.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Assignee */}
          {users.length > 0 && (
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select
                value={formData.assigneeId}
                onValueChange={(v) => setFormData((p) => ({ ...p, assigneeId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assign to (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className="w-full btn-accent"
            disabled={createTask.isPending}
          >
            {createTask.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Create Task
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
