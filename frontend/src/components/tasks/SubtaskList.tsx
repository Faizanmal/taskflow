'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Plus,
  CheckCircle2,
  Circle,
  Link2,
  Unlink,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Task, TaskStatus } from '@/lib/types';
import {
  useSubtasks,
  useSubtaskProgress,
  useCreateSubtask,
  useDependencies,
  useAddDependency,
  useRemoveDependency,
  useCanTaskStart,
} from '@/hooks/useSubtasks';
import { useUpdateTask } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/radix-select';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface SubtaskListProps {
  taskId: string;
  className?: string;
}

export function SubtaskList({ taskId, className }: SubtaskListProps) {
  const { data: subtasks = [], isLoading } = useSubtasks(taskId);
  const { data: progress } = useSubtaskProgress(taskId);
  const createSubtask = useCreateSubtask();
  const updateTask = useUpdateTask();

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    try {
      await createSubtask.mutateAsync({
        taskId,
        data: { title: newSubtaskTitle },
      });
      setNewSubtaskTitle('');
      setIsAdding(false);
      toast.success('Subtask added');
    } catch {
      toast.error('Failed to add subtask');
    }
  };

  const toggleSubtaskStatus = async (subtask: Task) => {
    const newStatus: TaskStatus = subtask.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    try {
      await updateTask.mutateAsync({
        id: subtask.id,
        data: { status: newStatus },
      });
    } catch {
      toast.error('Failed to update subtask');
    }
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress bar */}
      {progress && subtasks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-medium">
              {progress.completed}/{progress.total} ({Math.round(progress.percentage)}%)
            </span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
        </div>
      )}

      {/* Subtasks list */}
      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 group"
          >
            <button
              onClick={() => toggleSubtaskStatus(subtask)}
              className="mt-0.5 flex-shrink-0"
              disabled={updateTask.isPending}
            >
              {subtask.status === 'COMPLETED' ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'text-sm',
                  subtask.status === 'COMPLETED' && 'line-through text-gray-500'
                )}
              >
                {subtask.title}
              </p>
              {subtask.dueDate && (
                <p className="text-xs text-gray-500">
                  Due {formatDistanceToNow(new Date(subtask.dueDate), { addSuffix: true })}
                </p>
              )}
            </div>
            <Badge
              variant={subtask.priority === 'HIGH' || subtask.priority === 'URGENT' ? 'destructive' : 'secondary'}
              className="flex-shrink-0"
            >
              {subtask.priority}
            </Badge>
          </div>
        ))}
      </div>

      {/* Add subtask form */}
      {isAdding ? (
        <form onSubmit={handleAddSubtask} className="flex gap-2">
          <Input
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder="Subtask title"
            autoFocus
            className="flex-1"
          />
          <Button type="submit" disabled={createSubtask.isPending}>
            {createSubtask.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
          </Button>
          <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
            Cancel
          </Button>
        </form>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Subtask
        </Button>
      )}
    </div>
  );
}

interface TaskDependenciesProps {
  taskId: string;
  availableTasks?: Task[];
  className?: string;
}

export function TaskDependencies({ taskId, availableTasks = [], className }: TaskDependenciesProps) {
  const { data: dependencies = [], isLoading: loadingDeps } = useDependencies(taskId);
  const { data: canStartInfo } = useCanTaskStart(taskId);
  const addDependency = useAddDependency();
  const removeDependency = useRemoveDependency();

  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddDependency = async () => {
    if (!selectedTaskId) return;

    try {
      await addDependency.mutateAsync({
        taskId,
        data: { dependencyTaskId: selectedTaskId, type: 'BLOCKS' },
      });
      setSelectedTaskId('');
      setIsAdding(false);
      toast.success('Dependency added');
    } catch (error) {
      toast.error((error as Error)?.message || 'Failed to add dependency');
    }
  };

  const handleRemoveDependency = async (dependencyTaskId: string) => {
    try {
      await removeDependency.mutateAsync({ taskId, dependencyTaskId });
      toast.success('Dependency removed');
    } catch {
      toast.error('Failed to remove dependency');
    }
  };

  // Filter out already linked tasks and the current task
  const availableToAdd = availableTasks.filter(
    (t) => t.id !== taskId && !dependencies.some((d) => d.dependencyTaskId === t.id)
  );

  if (loadingDeps) {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Blocking warning */}
      {canStartInfo && !canStartInfo.canStart && (
        <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Blocked by dependencies</p>
            <p className="text-xs mt-1">
              Complete these tasks first:{' '}
              {canStartInfo.blockingTasks.map((t) => t.title).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Dependencies list */}
      <div className="space-y-2">
        {dependencies.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No dependencies</p>
        ) : (
          dependencies.map((dep) => (
            <div
              key={dep.id}
              className="flex items-center gap-2 p-2 theme-card rounded-lg"
            >
              <Link2 className="h-4 w-4 text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{dep.dependencyTask.title}</p>
                <Badge
                  variant={dep.dependencyTask.status === 'COMPLETED' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {dep.dependencyTask.status}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-600"
                onClick={() => handleRemoveDependency(dep.dependencyTaskId)}
                disabled={removeDependency.isPending}
              >
                <Unlink className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Add dependency */}
      {isAdding ? (
        <div className="flex gap-2">
          <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a task" />
            </SelectTrigger>
            <SelectContent>
              {availableToAdd.map((task) => (
                <SelectItem key={task.id} value={task.id}>
                  {task.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAddDependency} disabled={!selectedTaskId || addDependency.isPending}>
            {addDependency.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
          </Button>
          <Button variant="outline" onClick={() => setIsAdding(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="w-full"
          disabled={availableToAdd.length === 0}
        >
          <Link2 className="h-4 w-4 mr-1" />
          Add Dependency
        </Button>
      )}
    </div>
  );
}
