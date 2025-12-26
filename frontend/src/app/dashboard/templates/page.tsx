'use client';

import { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Copy,
  Trash2,
  Loader2,
  Clock,
  Flag,
  MoreVertical,
  Users,
  Lock,
} from 'lucide-react';
import {
  useTemplates,
  useCreateTemplate,
  useDeleteTemplate,
  useCreateTaskFromTemplate,
} from '@/hooks/useTemplates';
import { useWorkspaces } from '@/hooks/useWorkspaces';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/radix-select';
import { cn } from '@/lib/utils';
import { TaskPriority } from '@/lib/types';
import toast from 'react-hot-toast';

const PRIORITY_COLORS = {
  LOW: 'bg-gray-400',
  MEDIUM: 'bg-blue-500',
  HIGH: 'bg-orange-500',
  URGENT: 'bg-red-500',
};

export default function TemplatesPage() {
  const [search, setSearch] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | undefined>();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: templates = [], isLoading } = useTemplates(selectedWorkspace);
  const { data: workspaces = [] } = useWorkspaces();
  const deleteTemplate = useDeleteTemplate();
  const createTaskFromTemplate = useCreateTaskFromTemplate();

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.taskTitle.toLowerCase().includes(search.toLowerCase())
  );

  const handleUseTemplate = async (templateId: string) => {
    try {
      await createTaskFromTemplate.mutateAsync({
        templateId,
        data: { workspaceId: selectedWorkspace },
      });
      toast.success('Task created from template');
    } catch {
      toast.error('Failed to create task');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete template "${name}"?`)) return;

    try {
      await deleteTemplate.mutateAsync(id);
      toast.success('Template deleted');
    } catch {
      toast.error('Failed to delete template');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <FileText className="h-8 w-8" />
            Task Templates
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Create reusable templates for common tasks
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="btn-accent">
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Template</DialogTitle>
            </DialogHeader>
            <CreateTemplateForm
              workspaces={workspaces}
              onSuccess={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="pl-10"
          />
        </div>

        <Select value={selectedWorkspace || ''} onValueChange={(v) => setSelectedWorkspace(v || undefined)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All workspaces" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All workspaces</SelectItem>
            {workspaces.map((ws) => (
              <SelectItem key={ws.id} value={ws.id}>
                {ws.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12 theme-card rounded-lg">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-medium mb-2">No templates found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {search
              ? 'Try a different search term'
              : 'Create your first template to save time on repetitive tasks'}
          </p>
          {!search && (
            <Button className="btn-accent" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="theme-card rounded-lg p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{template.name}</h3>
                    {template.isPublic ? (
                      <span title="Shared"><Users className="h-4 w-4 text-gray-400" /></span>
                    ) : (
                      <span title="Private"><Lock className="h-4 w-4 text-gray-400" /></span>
                    )}
                  </div>
                  {template.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {template.description}
                    </p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleUseTemplate(template.id)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Use Template
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-500"
                      onClick={() => handleDelete(template.id, template.name)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Task Preview */}
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full',
                      PRIORITY_COLORS[template.taskPriority as keyof typeof PRIORITY_COLORS]
                    )}
                  />
                  <span className="font-medium text-sm">{template.taskTitle}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Flag className="h-3 w-3" />
                    {template.taskPriority}
                  </span>
                  {template.estimatedTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {template.estimatedTime} min
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Used {template._count.createdTasks} times
                </span>
                <Button
                  size="sm"
                  onClick={() => handleUseTemplate(template.id)}
                  disabled={createTaskFromTemplate.isPending}
                  className="btn-accent"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Use
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
  workspaces: { id: string; name: string }[];
  onSuccess: () => void;
}

function CreateTemplateForm({ workspaces, onSuccess }: CreateTemplateFormProps) {
  const createTemplate = useCreateTemplate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    taskTitle: '',
    taskDescription: '',
    taskPriority: 'MEDIUM',
    estimatedTime: '',
    isPublic: false,
    workspaceId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.taskTitle) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      await createTemplate.mutateAsync({
        name: formData.name,
        description: formData.description || undefined,
        taskTitle: formData.taskTitle,
        taskDescription: formData.taskDescription || undefined,
        taskPriority: formData.taskPriority as TaskPriority,
        estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined,
        isPublic: formData.isPublic,
        workspaceId: formData.workspaceId || undefined,
      });
      toast.success('Template created');
      onSuccess();
    } catch {
      toast.error('Failed to create template');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Template Name *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
          placeholder="e.g., Weekly Report"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Template Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
          placeholder="What is this template for?"
        />
      </div>

      <div className="space-y-2">
        <Label>Default Task Title *</Label>
        <Input
          value={formData.taskTitle}
          onChange={(e) => setFormData((p) => ({ ...p, taskTitle: e.target.value }))}
          placeholder="Task title when created"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Default Task Description</Label>
        <Textarea
          value={formData.taskDescription}
          onChange={(e) => setFormData((p) => ({ ...p, taskDescription: e.target.value }))}
          placeholder="Default description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={formData.taskPriority}
            onValueChange={(v) => setFormData((p) => ({ ...p, taskPriority: v }))}
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
            onChange={(e) => setFormData((p) => ({ ...p, estimatedTime: e.target.value }))}
            placeholder="60"
          />
        </div>
      </div>

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
                {ws.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPublic"
          checked={formData.isPublic}
          onChange={(e) => setFormData((p) => ({ ...p, isPublic: e.target.checked }))}
          className="rounded"
        />
        <Label htmlFor="isPublic" className="cursor-pointer">
          Share with workspace members
        </Label>
      </div>

      <Button
        type="submit"
        className="w-full btn-accent"
        disabled={createTemplate.isPending}
      >
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
