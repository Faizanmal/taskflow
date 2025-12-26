'use client';

import { useCallback, useRef, CSSProperties } from 'react';
import { FixedSizeList } from 'react-window';
import { Task } from '@/lib/types';
import TaskCard from './TaskCard';

interface ListRowProps {
  index: number;
  style: CSSProperties;
}

interface VirtualizedTaskListProps {
  tasks: Task[];
  height?: number;
  itemHeight?: number;
  onTaskClick?: (task: Task) => void;
  selectedTaskIds?: string[];
  onTaskSelect?: (taskId: string) => void;
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
}: VirtualizedTaskListProps) {
  const listRef = useRef<List>(null);

  // Row renderer for virtualized list
  const Row = useCallback(
    ({ index, style }: ListRowProps) => {
      const task = tasks[index];
      if (!task) return null;
      
      const isSelected = selectedTaskIds.includes(task.id);

      return (
        <div style={style} className="px-2">
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
            />
          </div>
        </div>
      );
    },
    [tasks, selectedTaskIds, onTaskClick, onTaskSelect]
  );

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
            listRef.current.scrollToItem(focusedIndex + 1, 'smart');
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (focusedIndex > 0) {
            listRef.current.scrollToItem(focusedIndex - 1, 'smart');
          }
          break;
        case 'Home':
          e.preventDefault();
          listRef.current.scrollToItem(0);
          break;
        case 'End':
          e.preventDefault();
          listRef.current.scrollToItem(tasks.length - 1);
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
      <FixedSizeList
        ref={listRef}
        height={height}
        itemCount={tasks.length}
        itemSize={itemHeight}
        width="100%"
        className="scrollbar-thin scrollbar-thumb-[var(--text-tertiary)] scrollbar-track-transparent"
      >
        {Row}
      </FixedSizeList>
    </div>
  );
}
