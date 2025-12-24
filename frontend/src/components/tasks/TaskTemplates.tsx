'use client';

import { useState } from 'react';
import {
  FileText,
  Copy,
  Repeat,
  Trash2,
  Edit2,
  Plus,
  Clock,
  Loader2,
} from 'lucide-react';
import { SetRecurringInput } from '@/lib/types';
import {
  useTemplates,
  useCreateTemplate,
  useDeleteTemplate,
  useCreateTaskFromTemplate,
  useSetRecurring,
  useRemoveRecurring,
} from '@/hooks/useTemplates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface TemplatesListProps {
  workspaceId?: string;
  className?: string;
}

export function TemplatesList({ workspaceId, className }: TemplatesListProps) {
  const { data: templates = [], isLoading } = useTemplates(workspaceId);
  const deleteTemplate = useDeleteTemplate();
  const createTaskFromTemplate = useCreateTaskFromTemplate();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCreateFromTemplate = async (templateId: string) => {
    try {
      await createTaskFromTemplate.mutateAsync({
        templateId,
        data: { workspaceId },
      });
      toast.success('Task created from template');
    } catch (error) {
      toast.error('Failed to create task from template');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await deleteTemplate.mutateAsync(id);
      toast.success('Template deleted');
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Task Templates</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="btn-accent">
              <Plus className="h-4 w-4 mr-1" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Template</DialogTitle>
            </DialogHeader>
            <CreateTemplateForm
              workspaceId={workspaceId}
              onSuccess={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No templates yet</p>
          <p className="text-sm">Create a template to reuse task configurations</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <div key={template.id} className="p-4 theme-card rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-accent" style={{ color: 'var(--accent-color)' }} />
                  <h4 className="font-medium">{template.name}</h4>
                </div>
                {template.isPublic && (
                  <Badge variant="secondary" className="text-xs">
                    Shared
                  </Badge>
                )}
              </div>

              {template.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                  {template.description}
                </p>
              )}

              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span>Priority: {template.taskPriority}</span>
                {template.estimatedTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {template.estimatedTime} min
                  </span>
                )}
                <span>{template._count.createdTasks} uses</span>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Button
                  size="sm"
                  onClick={() => handleCreateFromTemplate(template.id)}
                  disabled={createTaskFromTemplate.isPending}
                  className="flex-1 btn-accent"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Use Template
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => handleDelete(template.id)}
                  disabled={deleteTemplate.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface CreateTemplateFormProps {
  workspaceId?: string;
  onSuccess: () => void;
}

function CreateTemplateForm({ workspaceId, onSuccess }: CreateTemplateFormProps) {
  const createTemplate = useCreateTemplate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    taskTitle: '',
    taskDescription: '',
    taskPriority: 'MEDIUM' as const,
    estimatedTime: '',
    isPublic: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createTemplate.mutateAsync({
        name: formData.name,
        description: formData.description || undefined,
        taskTitle: formData.taskTitle,
        taskDescription: formData.taskDescription || undefined,
        taskPriority: formData.taskPriority,
        estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined,
        isPublic: formData.isPublic,
        workspaceId,
      });
      toast.success('Template created');
      onSuccess();
    } catch (error) {
      toast.error('Failed to create template');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Template Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Weekly Report Task"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="What is this template for?"
        />
      </div>

      <div className="space-y-2">
        <Label>Default Task Title</Label>
        <Input
          value={formData.taskTitle}
          onChange={(e) => setFormData((prev) => ({ ...prev, taskTitle: e.target.value }))}
          placeholder="Task title when created"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Default Task Description</Label>
        <Textarea
          value={formData.taskDescription}
          onChange={(e) => setFormData((prev) => ({ ...prev, taskDescription: e.target.value }))}
          placeholder="Default description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={formData.taskPriority}
            onValueChange={(value: any) => setFormData((prev) => ({ ...prev, taskPriority: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Estimated Time (min)</Label>
          <Input
            type="number"
            value={formData.estimatedTime}
            onChange={(e) => setFormData((prev) => ({ ...prev, estimatedTime: e.target.value }))}
            placeholder="e.g., 60"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPublic"
          checked={formData.isPublic}
          onChange={(e) => setFormData((prev) => ({ ...prev, isPublic: e.target.checked }))}
          className="rounded"
        />
        <Label htmlFor="isPublic" className="cursor-pointer">
          Share with workspace members
        </Label>
      </div>

      <Button type="submit" className="w-full btn-accent" disabled={createTemplate.isPending}>
        {createTemplate.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Plus className="h-4 w-4 mr-2" />
        )}
        Create Template
      </Button>
    </form>
  );
}

interface RecurringTaskSettingsProps {
  task: Task;
  className?: string;
}

export function RecurringTaskSettings({ task, className }: RecurringTaskSettingsProps) {
  const setRecurring = useSetRecurring();
  const removeRecurring = useRemoveRecurring();

  const [pattern, setPattern] = useState<SetRecurringInput['pattern']>('DAILY');
  const [interval, setInterval] = useState('1');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    try {
      await setRecurring.mutateAsync({
        taskId: task.id,
        data: {
          pattern,
          interval: parseInt(interval),
          days: pattern === 'WEEKLY' ? (selectedDays as SetRecurringInput['days']) : undefined,
        },
      });
      toast.success('Recurring schedule set');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to set recurring schedule');
    }
  };

  const handleRemove = async () => {
    try {
      await removeRecurring.mutateAsync(task.id);
      toast.success('Recurring schedule removed');
    } catch (error) {
      toast.error('Failed to remove recurring schedule');
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const DAYS = [
    { id: 'SUN', label: 'Su' },
    { id: 'MON', label: 'Mo' },
    { id: 'TUE', label: 'Tu' },
    { id: 'WED', label: 'We' },
    { id: 'THU', label: 'Th' },
    { id: 'FRI', label: 'Fr' },
    { id: 'SAT', label: 'Sa' },
  ];

  if (task.isRecurring && !isEditing) {
    return (
      <div className={cn('p-4 theme-card rounded-lg', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat className="h-5 w-5 text-accent" style={{ color: 'var(--accent-color)' }} />
            <div>
              <p className="font-medium">Recurring Task</p>
              <p className="text-sm text-gray-500">
                {task.recurringPattern?.toLowerCase()}, every {task.recurringInterval || 1}
                {task.recurringPattern === 'WEEKLY' && task.recurringDays && (
                  <> on {JSON.parse(task.recurringDays).join(', ')}</>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-500"
              onClick={handleRemove}
              disabled={removeRecurring.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('p-4 theme-card rounded-lg space-y-4', className)}>
      <div className="flex items-center gap-2">
        <Repeat className="h-5 w-5 text-accent" style={{ color: 'var(--accent-color)' }} />
        <span className="font-medium">Set Recurring Schedule</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Pattern</Label>
          <Select value={pattern} onValueChange={(v: SetRecurringInput['pattern']) => setPattern(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Every</Label>
          <Input
            type="number"
            min="1"
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
          />
        </div>
      </div>

      {pattern === 'WEEKLY' && (
        <div className="space-y-2">
          <Label>Days</Label>
          <div className="flex gap-1">
            {DAYS.map((day) => (
              <button
                key={day.id}
                type="button"
                onClick={() => toggleDay(day.id)}
                className={cn(
                  'h-8 w-8 rounded-full text-xs font-medium transition-colors',
                  selectedDays.includes(day.id)
                    ? 'bg-accent text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                )}
                style={
                  selectedDays.includes(day.id)
                    ? { backgroundColor: 'var(--accent-color)' }
                    : undefined
                }
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={setRecurring.isPending}
          className="flex-1 btn-accent"
        >
          {setRecurring.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save
        </Button>
        {task.isRecurring && (
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
