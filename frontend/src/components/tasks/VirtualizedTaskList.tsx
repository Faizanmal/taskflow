'use client';

import { useCallback, useRef } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Task } from '@/lib/types';
import TaskCard from './TaskCard';

interface ListRefType extends VirtuosoHandle {}

interface VirtualizedTaskListProps {
  tasks: Task[];
  height?: number;
  itemHeight?: number;
  onTaskClick?: (task: Task) => void;
  selectedTaskIds?: string[];
  onTaskSelect?: (taskId: string) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (id: string) => void;
  onTaskStatusChange: (id: string, status: Task['status']) => void;
}

/**
 * Virtualized Task List Component
 * Uses react-window for efficient rendering of large lists
 * Only renders visible items for optimal performance
 */
export default function VirtualizedTaskList({
  tasks,
  height = 600,
  itemHeight = 100,
  onTaskClick,
  selectedTaskIds = [],
  onTaskSelect,
  onTaskEdit,
  onTaskDelete,
  onTaskStatusChange,
}: VirtualizedTaskListProps) {
  const listRef = useRef<VirtuosoHandle>(null);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!listRef.current) return;

      const focusedIndex = parseInt(
        document.activeElement?.getAttribute('data-index') || '0'
      );

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (focusedIndex < tasks.length - 1) {
            listRef.current?.scrollToIndex(focusedIndex + 1);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (focusedIndex > 0) {
            listRef.current?.scrollToIndex(focusedIndex - 1);
          }
          break;
        case 'Home':
          e.preventDefault();
          listRef.current?.scrollToIndex(0);
          break;
        case 'End':
          e.preventDefault();
          listRef.current?.scrollToIndex(tasks.length - 1);
          break;
      }
    },
    [tasks.length]
  );

  if (tasks.length === 0) {
    return (
      <div 
        className="flex items-center justify-center h-64 text-[var(--text-tertiary)]"
        role="status"
      >
        No tasks found
      </div>
    );
  }

  return (
    <div
      role="listbox"
      aria-label="Task list"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="focus:outline-none"
    >
      <Virtuoso
        ref={listRef}
        data={tasks}
        itemContent={(index) => {
          const task = tasks[index];
          if (!task) return null;
          const isSelected = selectedTaskIds.includes(task.id);
          return (
            <div className="px-2">
              <div
                className={`
                  transition-all duration-200
                  ${isSelected ? 'ring-2 ring-[var(--accent-color)] ring-offset-2' : ''}
                `}
              >
                <TaskCard
                  task={task}
                  onClick={() => onTaskClick?.(task)}
                  isSelected={isSelected}
                  onSelect={() => onTaskSelect?.(task.id)}
                  onEdit={onTaskEdit}
                  onDelete={onTaskDelete}
                  onStatusChange={onTaskStatusChange}
                />
              </div>
            </div>
          );
        }}
        height={height}
        style={{ width: '100%' }}
        className="scrollbar-thin scrollbar-thumb-[var(--text-tertiary)] scrollbar-track-transparent"
      />
    </div>
  );
}
