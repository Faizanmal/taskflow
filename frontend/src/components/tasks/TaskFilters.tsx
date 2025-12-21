'use client';

import { TaskFilters, TaskStatus, TaskPriority } from '@/lib/types';
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from '@/lib/constants';

interface TaskFiltersProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
}

export default function TaskFiltersComponent({ filters, onChange }: TaskFiltersProps) {
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    ...Object.entries(TASK_STATUS_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    ...Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'dueDate', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'status', label: 'Status' },
  ];

  const viewOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'assigned', label: 'Assigned to Me' },
    { value: 'created', label: 'Created by Me' },
    { value: 'overdue', label: 'Overdue' },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={filters.view || 'all'}
        onChange={(e) => onChange({ ...filters, view: e.target.value as 'all' | 'assigned' | 'created' | 'overdue' })}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {viewOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        value={filters.status || ''}
        onChange={(e) =>
          onChange({
            ...filters,
            ...(e.target.value ? { status: e.target.value as TaskStatus } : {}),
          })
        }
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        value={filters.priority || ''}
        onChange={(e) =>
          onChange({
            ...filters,
            ...(e.target.value ? { priority: e.target.value as TaskPriority } : {}),
          })
        }
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {priorityOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        value={filters.sortBy || 'createdAt'}
        onChange={(e) =>
          onChange({ ...filters, sortBy: e.target.value as 'dueDate' | 'createdAt' | 'priority' | 'status' })
        }
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            Sort by: {opt.label}
          </option>
        ))}
      </select>

      <button
        onClick={() =>
          onChange({
            ...filters,
            sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
          })
        }
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {filters.sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
      </button>
    </div>
  );
}
