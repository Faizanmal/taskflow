'use client';

import { useCallback, forwardRef, memo } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Task } from '@/lib/types';
import TaskCard from './TaskCard';

interface VirtualTaskListProps {
  tasks: Task[];
  selectedTasks?: string[];
  onSelectTask?: (taskId: string, selected: boolean) => void;
  onTaskClick?: (task: Task) => void;
  onTaskUpdate?: (taskId: string, data: Partial<Task>) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskEdit: (task: Task) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

/**
 * Virtual Task List
 * Uses react-virtuoso for efficient rendering of large task lists
 * Only renders visible items, improving performance significantly
 */
export const VirtualTaskList = memo(forwardRef<VirtuosoHandle, VirtualTaskListProps>(
  function VirtualTaskList(
    {
      tasks,
      selectedTasks = [],
      onSelectTask,
      onTaskClick,
      onTaskUpdate,
      onTaskDelete,
      onTaskEdit,
      isLoading,
      emptyMessage = 'No tasks found',
    },
    ref
  ) {
    // Render individual task item
     
    const itemContent = useCallback(
      (index: number, task: Task) => (
        <div className="py-2 px-1">
          <TaskCard
            task={task}
            isSelected={selectedTasks.includes(task.id)}
            onSelect={onSelectTask ? (selected) => onSelectTask(task.id, selected) : undefined}
            onClick={() => onTaskClick?.(task)}
            onStatusChange={(status) => onTaskUpdate?.(task.id, { status: status as Task['status'] })}
            onDelete={() => onTaskDelete?.(task.id)}
            onEdit={onTaskEdit}
          />
        </div>
      ),
      [selectedTasks, onSelectTask, onTaskClick, onTaskUpdate, onTaskDelete, onTaskEdit]
    );

    // Empty state
    if (!isLoading && tasks.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-[var(--text-tertiary)]">
          {emptyMessage}
        </div>
      );
    }

    // Loading state with skeletons
    if (isLoading) {
      return (
        <div className="space-y-4 p-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-[var(--bg-tertiary)] rounded-lg animate-pulse"
            />
          ))}
        </div>
      );
    }

    return (
      <Virtuoso
        ref={ref}
        data={tasks}
        itemContent={itemContent}
        style={{ height: '100%' }}
        overscan={5}
        increaseViewportBy={{ top: 200, bottom: 200 }}
        components={{
          Footer: () => (
            <div className="py-4 text-center text-sm text-[var(--text-tertiary)]">
              {tasks.length} tasks
            </div>
          ),
        }}
      />
    );
  }
));

export default VirtualTaskList;
