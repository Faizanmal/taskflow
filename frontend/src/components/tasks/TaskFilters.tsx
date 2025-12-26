'use client';

import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { TaskFilters, TaskStatus, TaskPriority } from '@/lib/types';
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from '@/lib/constants';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '@/hooks/useDebounce';

interface TaskFiltersProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
}

export default function TaskFiltersComponent({ filters, onChange }: TaskFiltersProps) {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState(filters.search || '');
  
  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(searchValue, 300);
  
  // Update filters when debounced search changes
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    // Debounce will trigger the actual filter change
  }, []);

  // Effect to update filters when debounced value changes
  if (debouncedSearch !== filters.search) {
    onChange({ ...filters, search: debouncedSearch || undefined });
  }

  const statusOptions = [
    { value: '', label: t('filters.allStatuses', 'All Statuses') },
    ...Object.entries(TASK_STATUS_LABELS).map(([value, label]) => ({
      value,
      label: t(`status.${value}`, label),
    })),
  ];

  const priorityOptions = [
    { value: '', label: t('filters.allPriorities', 'All Priorities') },
    ...Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => ({
      value,
      label: t(`priority.${value}`, label),
    })),
  ];

  const sortOptions = [
    { value: 'createdAt', label: t('filters.dateCreated', 'Date Created') },
    { value: 'dueDate', label: t('filters.dueDate', 'Due Date') },
    { value: 'priority', label: t('filters.priority', 'Priority') },
    { value: 'status', label: t('filters.status', 'Status') },
  ];

  const viewOptions = [
    { value: 'all', label: t('filters.allTasks', 'All Tasks') },
    { value: 'assigned', label: t('filters.assignedToMe', 'Assigned to Me') },
    { value: 'created', label: t('filters.createdByMe', 'Created by Me') },
    { value: 'overdue', label: t('filters.overdue', 'Overdue') },
  ];

  return (
    <div className="flex flex-wrap gap-3 items-center" role="search" aria-label={t('filters.taskFilters', 'Task filters')}>
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" 
          aria-hidden="true" 
        />
        <input
          type="search"
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={t('filters.searchPlaceholder', 'Search tasks...')}
          className="w-full pl-10 pr-10 py-2 border border-[var(--border-color)] rounded-lg text-sm 
                     bg-[var(--input-bg)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)]
                     focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent
                     transition-colors duration-200"
          aria-label={t('filters.searchTasks', 'Search tasks')}
        />
        {searchValue && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-tertiary)] 
                       hover:text-[var(--text-primary)] transition-colors"
            aria-label={t('filters.clearSearch', 'Clear search')}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <select
        value={filters.view || 'all'}
        onChange={(e) => onChange({ ...filters, view: e.target.value as 'all' | 'assigned' | 'created' | 'overdue' })}
        className="px-3 py-2 border border-[var(--border-color)] rounded-lg text-sm 
                   bg-[var(--input-bg)] text-[var(--text-primary)]
                   focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
        aria-label={t('filters.selectView', 'Select view')}
      >
        {viewOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        value={filters.status?.[0] || ''}
        onChange={(e) =>
          onChange({
            ...filters,
            ...(e.target.value ? { status: [e.target.value as TaskStatus] } : { status: undefined }),
          })
        }
        className="px-3 py-2 border border-[var(--border-color)] rounded-lg text-sm 
                   bg-[var(--input-bg)] text-[var(--text-primary)]
                   focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
        aria-label={t('filters.selectStatus', 'Select status')}
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        value={filters.priority?.[0] || ''}
        onChange={(e) =>
          onChange({
            ...filters,
            ...(e.target.value ? { priority: [e.target.value as TaskPriority] } : { priority: undefined }),
          })
        }
        className="px-3 py-2 border border-[var(--border-color)] rounded-lg text-sm 
                   bg-[var(--input-bg)] text-[var(--text-primary)]
                   focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
        aria-label={t('filters.selectPriority', 'Select priority')}
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
        className="px-3 py-2 border border-[var(--border-color)] rounded-lg text-sm 
                   bg-[var(--input-bg)] text-[var(--text-primary)]
                   focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
        aria-label={t('filters.selectSort', 'Select sort order')}
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {t('filters.sortBy', 'Sort by')}: {opt.label}
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
        className="px-3 py-2 border border-[var(--border-color)] rounded-lg text-sm 
                   bg-[var(--input-bg)] text-[var(--text-primary)]
                   hover:bg-[var(--bg-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]
                   transition-colors duration-200"
        aria-label={filters.sortOrder === 'asc' 
          ? t('filters.sortDescending', 'Sort descending') 
          : t('filters.sortAscending', 'Sort ascending')}
      >
        {filters.sortOrder === 'asc' ? '↑ ' + t('filters.asc', 'Asc') : '↓ ' + t('filters.desc', 'Desc')}
      </button>
    </div>
  );
}
