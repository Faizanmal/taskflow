'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskStatus, TaskPriority } from '@/lib/types';
import { useKanbanBoard, useReorderKanban } from '@/hooks/useSubtasks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'TODO', label: 'To Do', color: 'bg-gray-100 dark:bg-gray-800' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'IN_REVIEW', label: 'In Review', color: 'bg-yellow-50 dark:bg-yellow-900/20' },
  { id: 'COMPLETED', label: 'Completed', color: 'bg-green-50 dark:bg-green-900/20' },
];

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  LOW: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  URGENT: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

interface KanbanBoardProps {
  workspaceId: string;
  onTaskClick?: (task: Task) => void;
  className?: string;
}

export function KanbanBoard({ workspaceId, onTaskClick, className }: KanbanBoardProps) {
  const { data: board, isLoading } = useKanbanBoard(workspaceId);
  const reorderKanban = useReorderKanban();

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = findTaskById(active.id as string);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Determine target column
    let targetColumn: TaskStatus;
    let targetIndex: number;

    // Check if dropped on a column
    const column = COLUMNS.find((c) => c.id === overId);
    if (column) {
      targetColumn = column.id;
      targetIndex = board?.[targetColumn]?.length ?? 0;
    } else {
      // Dropped on a task
      const overTask = findTaskById(overId);
      if (!overTask) return;
      targetColumn = overTask.status;
      targetIndex = board?.[targetColumn]?.findIndex((t) => t.id === overId) ?? 0;
    }

    const activeTask = findTaskById(activeId);
    if (!activeTask) return;

    // If same position, do nothing
    if (activeTask.status === targetColumn && activeTask.position === targetIndex) {
      return;
    }

    try {
      await reorderKanban.mutateAsync({
        workspaceId,
        taskId: activeId,
        newStatus: targetColumn,
        newPosition: targetIndex,
      });
    } catch (error) {
      toast.error((error as Error)?.message || 'Failed to move task');
    }
  };

  const findTaskById = (id: string): Task | undefined => {
    if (!board) return undefined;
    for (const status of Object.keys(board)) {
      const task = board[status]?.find((t) => t.id === id);
      if (task) return task;
    }
    return undefined;
  };

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-4 gap-4', className)}>
        {COLUMNS.map((col) => (
          <div key={col.id} className="space-y-3">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={cn('grid grid-cols-4 gap-4 min-h-[600px]', className)}>
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={board?.[column.id] ?? []}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}

interface KanbanColumnProps {
  column: { id: TaskStatus; label: string; color: string };
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

function KanbanColumn({ column, tasks, onTaskClick }: KanbanColumnProps) {
  return (
    <div className={cn('rounded-lg p-3', column.color)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sm">{column.label}</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
        id={column.id}
      >
        <div className="space-y-2 min-h-[200px]">
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick?.(task)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

interface SortableTaskCardProps {
  task: Task;
  onClick?: () => void;
}

function SortableTaskCard({ task, onClick }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} isDragging={isDragging} onClick={onClick} />
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onClick?: () => void;
}

function TaskCard({ task, isDragging, onClick }: TaskCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer',
        'hover:shadow-md transition-shadow',
        isDragging && 'opacity-50 shadow-lg rotate-2'
      )}
    >
      <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>

      {task.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-3">
        <Badge className={cn('text-xs', PRIORITY_COLORS[task.priority])}>
          {task.priority}
        </Badge>

        {task.assignee && (
          <Avatar className="h-6 w-6">
            <AvatarImage src={task.assignee.avatar ?? undefined} />
            <AvatarFallback className="text-xs">
              {task.assignee.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      {task.dueDate && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
        </p>
      )}

      {/* Task metadata */}
      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
        {task._count?.subtasks !== undefined && task._count.subtasks > 0 && (
          <span>📋 {task._count.subtasks}</span>
        )}
        {task._count?.comments !== undefined && task._count.comments > 0 && (
          <span>💬 {task._count.comments}</span>
        )}
        {task._count?.attachments !== undefined && task._count.attachments > 0 && (
          <span>📎 {task._count.attachments}</span>
        )}
      </div>
    </div>
  );
}
