'use client';

import { useState } from 'react';
import {
  Filter,
  Star,
  StarOff,
  Trash2,
  Save,
  Loader2,
  ChevronDown,
  X,
} from 'lucide-react';
import { SavedFilter } from '@/lib/types';
import {
  useSavedFilters,
  useCreateSavedFilter,
  useDeleteSavedFilter,
  useSetDefaultFilter,
} from '@/hooks/useSavedFilters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/radix-select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface FilterConfig {
  status?: string[];
  priority?: string[];
  assigneeId?: string;
  dueFrom?: string;
  dueTo?: string;
  search?: string;
  workspaceId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface SavedFiltersPanelProps {
  currentFilters: FilterConfig;
  onApplyFilter: (filters: FilterConfig) => void;
  className?: string;
}

export function SavedFiltersPanel({
  currentFilters,
  onApplyFilter,
  className,
}: SavedFiltersPanelProps) {
  const { data: savedFilters = [], isLoading } = useSavedFilters();
  const createFilter = useCreateSavedFilter();
  const deleteFilter = useDeleteSavedFilter();
  const setDefaultFilter = useSetDefaultFilter();

  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const defaultFilter = savedFilters.find((f) => f.isDefault);
  const hasActiveFilters =
    (currentFilters.status && currentFilters.status.length > 0) ||
    (currentFilters.priority && currentFilters.priority.length > 0) ||
    currentFilters.assigneeId ||
    currentFilters.dueFrom ||
    currentFilters.dueTo ||
    currentFilters.search;

  const handleApplyFilter = (filter: SavedFilter) => {
    const filterConfig = filter.filters as FilterConfig;
    onApplyFilter(filterConfig);
    setIsPopoverOpen(false);
    toast.success(`Applied filter: ${filter.name}`);
  };

  const handleSetDefault = async (filter: SavedFilter) => {
    try {
      await setDefaultFilter.mutateAsync({
        id: filter.id,
        isDefault: !filter.isDefault,
      });
      toast.success(filter.isDefault ? 'Removed default' : 'Set as default');
    } catch (error) {
      toast.error('Failed to update default');
    }
  };

  const handleDeleteFilter = async (id: string) => {
    if (!confirm('Delete this saved filter?')) return;

    try {
      await deleteFilter.mutateAsync(id);
      toast.success('Filter deleted');
    } catch (error) {
      toast.error('Failed to delete filter');
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Saved Filters
            {defaultFilter && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {defaultFilter.name}
              </Badge>
            )}
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Saved Filters</h4>
              <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={!hasActiveFilters}
                    className="text-xs"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save Current
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Filter</DialogTitle>
                  </DialogHeader>
                  <SaveFilterForm
                    filters={currentFilters}
                    onSuccess={() => setIsSaveDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : savedFilters.length === 0 ? (
              <div className="text-center py-4 text-sm text-gray-500">
                <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No saved filters</p>
                <p className="text-xs mt-1">Apply some filters and save them</p>
              </div>
            ) : (
              <div className="space-y-1">
                {savedFilters.map((filter) => (
                  <div
                    key={filter.id}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 group transition-colors"
                  >
                    <button
                      className="flex-1 text-left"
                      onClick={() => handleApplyFilter(filter)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{filter.name}</span>
                        {filter.isDefault && (
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        )}
                      </div>
                      <FilterSummary filters={filter.filters as FilterConfig} />
                    </button>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleSetDefault(filter)}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        title={filter.isDefault ? 'Remove default' : 'Set as default'}
                      >
                        {filter.isDefault ? (
                          <StarOff className="h-3.5 w-3.5" />
                        ) : (
                          <Star className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteFilter(filter.id)}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-red-500"
                        title="Delete filter"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onApplyFilter({})}
          className="text-xs"
        >
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}

interface FilterSummaryProps {
  filters: FilterConfig;
}

function FilterSummary({ filters }: FilterSummaryProps) {
  const parts: string[] = [];

  if (filters.status?.length) {
    parts.push(`${filters.status.length} status`);
  }
  if (filters.priority?.length) {
    parts.push(`${filters.priority.length} priority`);
  }
  if (filters.assigneeId) {
    parts.push('assigned');
  }
  if (filters.dueFrom || filters.dueTo) {
    parts.push('date range');
  }
  if (filters.search) {
    parts.push(`"${filters.search}"`);
  }

  if (parts.length === 0) {
    return <span className="text-xs text-gray-500">No filters</span>;
  }

  return (
    <span className="text-xs text-gray-500 dark:text-gray-400">
      {parts.join(' • ')}
    </span>
  );
}

interface SaveFilterFormProps {
  filters: FilterConfig;
  onSuccess: () => void;
}

function SaveFilterForm({ filters, onSuccess }: SaveFilterFormProps) {
  const createFilter = useCreateSavedFilter();
  const [name, setName] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createFilter.mutateAsync({
        name,
        filters: filters as Record<string, unknown>,
        isDefault,
      });
      toast.success('Filter saved');
      onSuccess();
    } catch (error) {
      toast.error('Failed to save filter');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-sm font-medium mb-2">Current Filter:</p>
        <FilterSummary filters={filters} />
      </div>

      <div className="space-y-2">
        <Label>Filter Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., My Urgent Tasks"
          required
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="isDefault"
          checked={isDefault}
          onCheckedChange={(checked) => setIsDefault(checked === true)}
        />
        <Label htmlFor="isDefault" className="cursor-pointer">
          Set as default filter
        </Label>
      </div>

      <Button
        type="submit"
        className="w-full btn-accent"
        disabled={createFilter.isPending}
      >
        {createFilter.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        Save Filter
      </Button>
    </form>
  );
}

interface QuickFiltersProps {
  currentFilters: FilterConfig;
  onApplyFilter: (filters: FilterConfig) => void;
  className?: string;
}

export function QuickFilters({ currentFilters, onApplyFilter, className }: QuickFiltersProps) {
  const STATUS_OPTIONS = [
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'IN_REVIEW', label: 'In Review' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  const PRIORITY_OPTIONS = [
    { value: 'LOW', label: 'Low', color: 'bg-gray-500' },
    { value: 'MEDIUM', label: 'Medium', color: 'bg-blue-500' },
    { value: 'HIGH', label: 'High', color: 'bg-orange-500' },
    { value: 'URGENT', label: 'Urgent', color: 'bg-red-500' },
  ];

  const toggleStatus = (status: string) => {
    const current = currentFilters.status || [];
    const updated = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    onApplyFilter({ ...currentFilters, status: updated.length > 0 ? updated : undefined });
  };

  const togglePriority = (priority: string) => {
    const current = currentFilters.priority || [];
    const updated = current.includes(priority)
      ? current.filter((p) => p !== priority)
      : [...current, priority];
    onApplyFilter({ ...currentFilters, priority: updated.length > 0 ? updated : undefined });
  };

  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      <div className="space-y-2">
        <Label className="text-xs text-gray-500">Status</Label>
        <div className="flex gap-1">
          {STATUS_OPTIONS.map((option) => {
            const isActive = currentFilters.status?.includes(option.value);
            return (
              <button
                key={option.value}
                onClick={() => toggleStatus(option.value)}
                className={cn(
                  'px-2 py-1 rounded text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                )}
                style={isActive ? { backgroundColor: 'var(--accent-color)' } : undefined}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-gray-500">Priority</Label>
        <div className="flex gap-1">
          {PRIORITY_OPTIONS.map((option) => {
            const isActive = currentFilters.priority?.includes(option.value);
            return (
              <button
                key={option.value}
                onClick={() => togglePriority(option.value)}
                className={cn(
                  'px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1',
                  isActive
                    ? 'bg-accent text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                )}
                style={isActive ? { backgroundColor: 'var(--accent-color)' } : undefined}
              >
                <span className={cn('w-2 h-2 rounded-full', option.color)} />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-gray-500">Sort By</Label>
        <div className="flex gap-2">
          <Select
            value={currentFilters.sortBy || 'createdAt'}
            onValueChange={(value) => onApplyFilter({ ...currentFilters, sortBy: value })}
          >
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Created</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={currentFilters.sortOrder || 'desc'}
            onValueChange={(value: 'asc' | 'desc') =>
              onApplyFilter({ ...currentFilters, sortOrder: value })
            }
          >
            <SelectTrigger className="w-24 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest</SelectItem>
              <SelectItem value="asc">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
