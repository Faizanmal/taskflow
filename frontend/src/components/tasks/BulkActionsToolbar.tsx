'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Trash2, CheckCircle, Circle, AlertCircle, Clock } from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '@/lib/types';
import { useBulkUpdateTasks, useBulkDeleteTasks } from '@/hooks/useBulkTasks';
import toast from 'react-hot-toast';

interface BulkActionsToolbarProps {
  tasks: Task[];
  selectedTaskIds: string[];
  onSelectionChange: (taskIds: string[]) => void;
  onClearSelection?: () => void;
}

/**
 * Bulk Actions Toolbar Component
 * Provides multi-select and bulk operations for tasks
 * WCAG 2.1 AA compliant
 */
export default function BulkActionsToolbar({
  tasks,
  selectedTaskIds,
  onSelectionChange,
}: BulkActionsToolbarProps) {
  const { t } = useTranslation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const bulkUpdate = useBulkUpdateTasks();
  const bulkDelete = useBulkDeleteTasks();

  const isAllSelected = tasks.length > 0 && selectedTaskIds.length === tasks.length;
  const isSomeSelected = selectedTaskIds.length > 0 && selectedTaskIds.length < tasks.length;
  const hasSelection = selectedTaskIds.length > 0;

  // Toggle all selection
  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(tasks.map((t) => t.id));
    }
  }, [isAllSelected, tasks, onSelectionChange]);

  // Toggle single task selection
  const toggleTask = useCallback((taskId: string) => {
    if (selectedTaskIds.includes(taskId)) {
      onSelectionChange(selectedTaskIds.filter((id) => id !== taskId));
    } else {
      onSelectionChange([...selectedTaskIds, taskId]);
    }
  }, [selectedTaskIds, onSelectionChange]);

  // Bulk status change
  const handleStatusChange = useCallback(async (status: TaskStatus) => {
    try {
      await bulkUpdate.mutateAsync({
        taskIds: selectedTaskIds,
        status,
      });
      toast.success(t('bulk.statusUpdated', `${selectedTaskIds.length} tasks updated`));
      onSelectionChange([]);
    } catch (error) {
      toast.error(t('common.error', 'An error occurred'));
    }
  }, [selectedTaskIds, bulkUpdate, onSelectionChange, t]);

  // Bulk priority change
  const handlePriorityChange = useCallback(async (priority: TaskPriority) => {
    try {
      await bulkUpdate.mutateAsync({
        taskIds: selectedTaskIds,
        priority,
      });
      toast.success(t('bulk.priorityUpdated', `${selectedTaskIds.length} tasks updated`));
      onSelectionChange([]);
    } catch (error) {
      toast.error(t('common.error', 'An error occurred'));
    }
  }, [selectedTaskIds, bulkUpdate, onSelectionChange, t]);

  // Bulk delete
  const handleBulkDelete = useCallback(async () => {
    try {
      await bulkDelete.mutateAsync({ taskIds: selectedTaskIds });
      toast.success(t('bulk.deleted', `${selectedTaskIds.length} tasks deleted`));
      onSelectionChange([]);
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error(t('common.error', 'An error occurred'));
    }
  }, [selectedTaskIds, bulkDelete, onSelectionChange, t]);

  const statusOptions: { value: TaskStatus; label: string; icon: React.ReactNode }[] = [
    { value: 'TODO', label: t('status.TODO', 'To Do'), icon: <Circle className="h-4 w-4" /> },
    { value: 'IN_PROGRESS', label: t('status.IN_PROGRESS', 'In Progress'), icon: <Clock className="h-4 w-4" /> },
    { value: 'IN_REVIEW', label: t('status.IN_REVIEW', 'In Review'), icon: <AlertCircle className="h-4 w-4" /> },
    { value: 'COMPLETED', label: t('status.COMPLETED', 'Completed'), icon: <CheckCircle className="h-4 w-4" /> },
  ];

  const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
    { value: 'LOW', label: t('priority.LOW', 'Low'), color: 'text-gray-500' },
    { value: 'MEDIUM', label: t('priority.MEDIUM', 'Medium'), color: 'text-blue-500' },
    { value: 'HIGH', label: t('priority.HIGH', 'High'), color: 'text-orange-500' },
    { value: 'URGENT', label: t('priority.URGENT', 'Urgent'), color: 'text-red-500' },
  ];

  return (
    <>
      <div 
        className="flex items-center gap-4 p-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg mb-4"
        role="toolbar"
        aria-label={t('bulk.toolbar', 'Bulk actions toolbar')}
      >
        {/* Select All Checkbox */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="select-all"
            checked={isAllSelected}
            // indeterminate state for partial selection
            data-state={isSomeSelected ? 'indeterminate' : isAllSelected ? 'checked' : 'unchecked'}
            onCheckedChange={handleSelectAll}
            aria-label={isAllSelected 
              ? t('bulk.deselectAll', 'Deselect all') 
              : t('bulk.selectAll', 'Select all')
            }
          />
          <label 
            htmlFor="select-all" 
            className="text-sm text-[var(--text-secondary)] cursor-pointer"
          >
            {isAllSelected 
              ? t('bulk.deselectAll', 'Deselect All')
              : t('bulk.selectAll', 'Select All')
            }
          </label>
        </div>

        {/* Selection Count */}
        {hasSelection && (
          <span className="text-sm font-medium text-[var(--text-primary)]" aria-live="polite">
            {t('bulk.selected', `${selectedTaskIds.length} selected`)}
          </span>
        )}

        {/* Bulk Actions */}
        {hasSelection && (
          <div className="flex items-center gap-2 ml-auto">
            {/* Status Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={bulkUpdate.isPending}>
                  {t('bulk.changeStatus', 'Change Status')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {statusOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    className="flex items-center gap-2"
                  >
                    {option.icon}
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Priority Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={bulkUpdate.isPending}>
                  {t('bulk.changePriority', 'Change Priority')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {priorityOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handlePriorityChange(option.value)}
                    className={`flex items-center gap-2 ${option.color}`}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Delete Button */}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={bulkDelete.isPending}
              aria-label={t('bulk.deleteSelected', 'Delete selected tasks')}
            >
              <Trash2 className="h-4 w-4 mr-1" aria-hidden="true" />
              {t('common.delete', 'Delete')}
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('bulk.confirmDeleteTitle', 'Delete Tasks?')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('bulk.confirmDelete', 
                `Are you sure you want to delete ${selectedTaskIds.length} tasks? This action cannot be undone.`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {bulkDelete.isPending 
                ? t('common.loading', 'Loading...') 
                : t('common.delete', 'Delete')
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Export task selection checkbox for use in task lists
export function TaskSelectionCheckbox({
  taskId,
  isSelected,
  onToggle,
}: {
  taskId: string;
  isSelected: boolean;
  onToggle: (taskId: string) => void;
}) {
  const { t } = useTranslation();
  
  return (
    <Checkbox
      checked={isSelected}
      onCheckedChange={() => onToggle(taskId)}
      aria-label={isSelected 
        ? t('bulk.deselectTask', 'Deselect task') 
        : t('bulk.selectTask', 'Select task')
      }
      className="mr-2"
    />
  );
}
