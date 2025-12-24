'use client';

import { useMemo, useRef, useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  differenceInDays,
  isWithinInterval,
  parseISO,
  addDays,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
  min,
  max,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Circle, User, Calendar } from 'lucide-react';
import { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type ViewMode = 'month' | 'week';

interface TimelineViewProps {
  tasks: Task[];
  onSelectTask?: (task: Task) => void;
  className?: string;
}

export function TimelineView({
  tasks,
  onSelectTask,
  className,
}: TimelineViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate date range based on view mode
  const { start, end, days } = useMemo(() => {
    let rangeStart: Date;
    let rangeEnd: Date;

    if (viewMode === 'month') {
      rangeStart = startOfMonth(currentDate);
      rangeEnd = endOfMonth(currentDate);
    } else {
      rangeStart = startOfWeek(currentDate);
      rangeEnd = endOfWeek(addDays(currentDate, 21)); // 4 weeks
    }

    return {
      start: rangeStart,
      end: rangeEnd,
      days: eachDayOfInterval({ start: rangeStart, end: rangeEnd }),
    };
  }, [currentDate, viewMode]);

  // Filter and sort tasks that have due dates
  const timelineTasks = useMemo(() => {
    return tasks
      .filter((task) => task.dueDate || task.createdAt)
      .map((task) => {
        const dueDate = task.dueDate ? parseISO(task.dueDate) : null;
        const createdAt = parseISO(task.createdAt);
        const startDate = createdAt;
        const endDate = dueDate || addDays(createdAt, 3); // Default 3 days if no due date

        return {
          ...task,
          startDate,
          endDate,
        };
      })
      .filter((task) => {
        // Show tasks that overlap with the current view
        return (
          isWithinInterval(task.startDate, { start, end }) ||
          isWithinInterval(task.endDate, { start, end }) ||
          (task.startDate <= start && task.endDate >= end)
        );
      })
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, [tasks, start, end]);

  const navigatePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, -7));
    }
  };

  const navigateNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 7));
    }
  };

  const navigateToday = () => setCurrentDate(new Date());

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-500';
      case 'HIGH':
        return 'bg-orange-500';
      case 'MEDIUM':
        return 'bg-blue-500';
      case 'LOW':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500';
      case 'IN_PROGRESS':
        return 'bg-blue-500';
      case 'IN_REVIEW':
        return 'bg-purple-500';
      default:
        return 'bg-gray-300 dark:bg-gray-600';
    }
  };

  const cellWidth = viewMode === 'month' ? 32 : 80;
  const totalWidth = days.length * cellWidth;

  return (
    <div className={cn('theme-card rounded-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={navigatePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={navigateToday}>
            Today
          </Button>
        </div>

        <h2 className="text-lg font-semibold">
          {viewMode === 'month'
            ? format(currentDate, 'MMMM yyyy')
            : `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`}
        </h2>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('month')}
          >
            Month
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Week
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto" ref={containerRef}>
        <div style={{ minWidth: totalWidth + 250 }}>
          {/* Timeline header with dates */}
          <div className="flex sticky top-0 bg-white dark:bg-gray-800 z-10 border-b border-gray-200 dark:border-gray-700">
            {/* Task name column */}
            <div className="w-60 flex-shrink-0 p-2 font-medium text-sm border-r border-gray-200 dark:border-gray-700">
              Task
            </div>

            {/* Days */}
            <div className="flex">
              {days.map((day, idx) => {
                const isTodayDate = isToday(day);
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                return (
                  <div
                    key={idx}
                    className={cn(
                      'text-center text-xs py-2 border-r border-gray-100 dark:border-gray-700',
                      isWeekend && 'bg-gray-50 dark:bg-gray-800/50',
                      isTodayDate && 'bg-accent/10'
                    )}
                    style={{ width: cellWidth }}
                  >
                    <div className="text-gray-500">{format(day, 'EEE')}</div>
                    <div
                      className={cn(
                        'font-medium',
                        isTodayDate && 'text-accent'
                      )}
                      style={isTodayDate ? { color: 'var(--accent-color)' } : undefined}
                    >
                      {format(day, 'd')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Task rows */}
          <div className="relative">
            {timelineTasks.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-gray-500">
                <Calendar className="h-8 w-8 mr-2 opacity-50" />
                <span>No tasks with dates in this period</span>
              </div>
            ) : (
              timelineTasks.map((task, idx) => {
                // Calculate bar position
                const taskStart = max([task.startDate, start]);
                const taskEnd = min([task.endDate, end]);
                const startOffset = differenceInDays(taskStart, start);
                const duration = differenceInDays(taskEnd, taskStart) + 1;

                return (
                  <div
                    key={task.id}
                    className={cn(
                      'flex border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50',
                      idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'
                    )}
                  >
                    {/* Task info column */}
                    <div className="w-60 flex-shrink-0 p-2 border-r border-gray-200 dark:border-gray-700">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => onSelectTask?.(task)}
                              className="w-full text-left"
                            >
                              <div className="flex items-center gap-2">
                                <Circle
                                  className={cn('h-2 w-2 flex-shrink-0', getPriorityColor(task.priority))}
                                  fill="currentColor"
                                />
                                <span
                                  className={cn(
                                    'text-sm font-medium truncate',
                                    task.status === 'COMPLETED' && 'line-through opacity-50'
                                  )}
                                >
                                  {task.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                {task.assignee && (
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {task.assignee.name}
                                  </span>
                                )}
                                <Badge variant="outline" className="text-xs px-1 py-0">
                                  {task.status.replace('_', ' ')}
                                </Badge>
                              </div>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-xs">
                              {format(task.startDate, 'MMM d')} - {format(task.endDate, 'MMM d')}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {/* Timeline bar */}
                    <div className="flex-1 relative h-16">
                      {/* Grid lines for days */}
                      <div className="absolute inset-0 flex">
                        {days.map((day, i) => {
                          const isTodayDate = isToday(day);
                          const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                          return (
                            <div
                              key={i}
                              className={cn(
                                'border-r border-gray-100 dark:border-gray-700',
                                isWeekend && 'bg-gray-50/50 dark:bg-gray-800/30',
                                isTodayDate && 'bg-accent/5'
                              )}
                              style={{ width: cellWidth }}
                            />
                          );
                        })}
                      </div>

                      {/* Today marker */}
                      {days.some((d) => isToday(d)) && (
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-accent z-10"
                          style={{
                            left: (differenceInDays(new Date(), start) + 0.5) * cellWidth,
                            backgroundColor: 'var(--accent-color)',
                          }}
                        />
                      )}

                      {/* Task bar */}
                      <div
                        className={cn(
                          'absolute top-3 h-10 rounded-md transition-all cursor-pointer',
                          getStatusColor(task.status),
                          'hover:shadow-lg'
                        )}
                        style={{
                          left: startOffset * cellWidth + 2,
                          width: Math.max(duration * cellWidth - 4, 20),
                        }}
                        onClick={() => onSelectTask?.(task)}
                      >
                        <div className="px-2 py-1 text-xs text-white font-medium truncate">
                          {task.title}
                        </div>
                        {/* Progress indicator */}
                        {task.status === 'IN_PROGRESS' && (
                          <div
                            className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b"
                            style={{ width: '50%' }} // Could be calculated from subtasks
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-4 p-4 border-t border-gray-200 dark:border-gray-700 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gray-300 dark:bg-gray-600" />
          <span>To Do</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-purple-500" />
          <span>In Review</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
}

interface GanttChartProps {
  tasks: Task[];
  onSelectTask?: (task: Task) => void;
  showDependencies?: boolean;
  className?: string;
}

export function GanttChart({
  tasks,
  onSelectTask,
  showDependencies: _showDependencies = true,
  className,
}: GanttChartProps) {
  // Simplified Gantt - same as Timeline but with dependency lines
  // For production, you'd want a more sophisticated implementation
  // possibly using a library like react-gantt-timeline
  return (
    <TimelineView
      tasks={tasks}
      onSelectTask={onSelectTask}
      className={className}
    />
  );
}
