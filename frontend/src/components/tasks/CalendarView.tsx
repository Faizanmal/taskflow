'use client';

import { useState, useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Circle, Plus } from 'lucide-react';
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

interface CalendarViewProps {
  tasks: Task[];
  onSelectDate?: (date: Date) => void;
  onSelectTask?: (task: Task) => void;
  onCreateTask?: (date: Date) => void;
  className?: string;
}

export function CalendarView({
  tasks,
  onSelectDate,
  onSelectTask,
  onCreateTask,
  className,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Group tasks by due date
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    tasks.forEach((task) => {
      if (task.dueDate) {
        const dateKey = format(parseISO(task.dueDate), 'yyyy-MM-dd');
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(task);
      }
    });
    return grouped;
  }, [tasks]);

  const navigatePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const navigateNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const navigateToday = () => setCurrentMonth(new Date());

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onSelectDate?.(date);
  };

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

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={cn('theme-card rounded-lg p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={navigatePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={navigateNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={navigateToday}>
            Today
          </Button>
        </div>
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="h-10 flex items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayTasks = tasksByDate[dateKey] || [];
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);

          return (
            <div
              key={dateKey}
              onClick={() => handleDateClick(day)}
              className={cn(
                'min-h-24 p-1 rounded-lg border border-transparent transition-colors cursor-pointer',
                isCurrentMonth
                  ? 'bg-white dark:bg-gray-800'
                  : 'bg-gray-50 dark:bg-gray-900 opacity-50',
                isSelected && 'ring-2 ring-accent',
                isTodayDate && 'border-accent',
                'hover:bg-gray-50 dark:hover:bg-gray-700'
              )}
              style={{
                ...(isSelected && { '--tw-ring-color': 'var(--accent-color)' } as React.CSSProperties),
                ...(isTodayDate && { borderColor: 'var(--accent-color)' }),
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    'text-sm font-medium flex items-center justify-center h-6 w-6 rounded-full',
                    isTodayDate && 'bg-accent text-white'
                  )}
                  style={
                    isTodayDate ? { backgroundColor: 'var(--accent-color)' } : undefined
                  }
                >
                  {format(day, 'd')}
                </span>
                {onCreateTask && isCurrentMonth && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateTask(day);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-600 rounded p-0.5 transition-opacity"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <TooltipProvider>
                  {dayTasks.slice(0, 3).map((task) => (
                    <Tooltip key={task.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTask?.(task);
                          }}
                          className={cn(
                            'w-full text-left text-xs px-1.5 py-0.5 rounded truncate transition-colors',
                            task.status === 'COMPLETED'
                              ? 'line-through opacity-50'
                              : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                          )}
                        >
                          <span className="flex items-center gap-1">
                            <Circle
                              className={cn('h-2 w-2 flex-shrink-0', getPriorityColor(task.priority))}
                              fill="currentColor"
                            />
                            <span className="truncate">{task.title}</span>
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-xs opacity-75">
                          {task.priority} • {task.status.replace('_', ' ')}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>

                {dayTasks.length > 3 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 block text-center">
                    +{dayTasks.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected date tasks panel */}
      {selectedDate && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">
              Tasks for {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            {onCreateTask && (
              <Button
                size="sm"
                onClick={() => onCreateTask(selectedDate)}
                className="btn-accent"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            )}
          </div>

          {(() => {
            const dateKey = format(selectedDate, 'yyyy-MM-dd');
            const dayTasks = tasksByDate[dateKey] || [];

            if (dayTasks.length === 0) {
              return (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No tasks for this day
                </p>
              );
            }

            return (
              <div className="space-y-2">
                {dayTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => onSelectTask?.(task)}
                    className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Circle
                        className={cn('h-3 w-3 flex-shrink-0', getPriorityColor(task.priority))}
                        fill="currentColor"
                      />
                      <span
                        className={cn(
                          'font-medium',
                          task.status === 'COMPLETED' && 'line-through opacity-50'
                        )}
                      >
                        {task.title}
                      </span>
                      <Badge
                        variant={task.status === 'COMPLETED' ? 'secondary' : 'outline'}
                        className="ml-auto text-xs"
                      >
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

interface MiniCalendarProps {
  selectedDate?: Date;
  onSelectDate: (date: Date) => void;
  highlightedDates?: Date[];
  className?: string;
}

export function MiniCalendar({
  selectedDate,
  onSelectDate,
  highlightedDates = [],
  className,
}: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const highlightedSet = useMemo(() => {
    return new Set(highlightedDates.map((d) => format(d, 'yyyy-MM-dd')));
  }, [highlightedDates]);

  return (
    <div className={cn('p-3 theme-card rounded-lg', className)}>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">{format(currentMonth, 'MMMM yyyy')}</span>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div
            key={i}
            className="h-6 w-6 flex items-center justify-center text-xs text-gray-500"
          >
            {day}
          </div>
        ))}
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);
          const isHighlighted = highlightedSet.has(dateKey);

          return (
            <button
              key={dateKey}
              onClick={() => onSelectDate(day)}
              disabled={!isCurrentMonth}
              className={cn(
                'h-6 w-6 flex items-center justify-center text-xs rounded-full transition-colors relative',
                !isCurrentMonth && 'opacity-30 cursor-not-allowed',
                isCurrentMonth && 'hover:bg-gray-100 dark:hover:bg-gray-700',
                isSelected && 'bg-accent text-white',
                isTodayDate && !isSelected && 'font-bold'
              )}
              style={
                isSelected ? { backgroundColor: 'var(--accent-color)' } : undefined
              }
            >
              {format(day, 'd')}
              {isHighlighted && !isSelected && (
                <span
                  className="absolute bottom-0.5 h-1 w-1 rounded-full bg-accent"
                  style={{ backgroundColor: 'var(--accent-color)' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
