'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Edit, CheckSquare, XSquare, Users, Flag } from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '@/lib/types';
import { useBulkUpdateTasks, useBulkDeleteTasks } from '@/hooks/useBulkTasks';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from '@/lib/constants';
import toast from 'react-hot-toast';

interface BulkActionsBarProps {
  selectedTasks: Task[];
  onClearSelection: () => void;
  users?: Array<{ id: string; name: string }>;
}

export function BulkActionsBar({ selectedTasks, onClearSelection, users = [] }: BulkActionsBarProps) {
  const { t } = useTranslation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const bulkUpdate = useBulkUpdateTasks();
  const bulkDelete = useBulkDeleteTasks();

  const selectedCount = selectedTasks.length;
  const taskIds = selectedTasks.map(t => t.id);

  const handleStatusChange = useCallback(async (status: TaskStatus) => {
    try {
      await bulkUpdate.mutateAsync({ taskIds, status });
      toast.success(t('bulk.statusUpdated', `Updated ${selectedCount} tasks`));
      onClearSelection();
    } catch (error) {
      toast.error(t('common.error', 'An error occurred'));
    }
  }, [bulkUpdate, taskIds, selectedCount, onClearSelection, t]);

  const handlePriorityChange = useCallback(async (priority: TaskPriority) => {
    try {
      await bulkUpdate.mutateAsync({ taskIds, priority });
      toast.success(t('bulk.priorityUpdated', `Updated ${selectedCount} tasks`));
      onClearSelection();
    } catch (error) {
      toast.error(t('common.error', 'An error occurred'));
    }
  }, [bulkUpdate, taskIds, selectedCount, onClearSelection, t]);

  const handleAssigneeChange = useCallback(async (assigneeId: string | null) => {
    try {
      await bulkUpdate.mutateAsync({ taskIds, assigneeId });
      toast.success(t('bulk.assigneeUpdated', `Updated ${selectedCount} tasks`));
      onClearSelection();
    } catch (error) {
      toast.error(t('common.error', 'An error occurred'));
    }
  }, [bulkUpdate, taskIds, selectedCount, onClearSelection, t]);

  const handleDelete = useCallback(async () => {
    try {
      await bulkDelete.mutateAsync({ taskIds });
      toast.success(t('bulk.deleted', `Deleted ${selectedCount} tasks`));
      onClearSelection();
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error(t('common.error', 'An error occurred'));
    }
  }, [bulkDelete, taskIds, selectedCount, onClearSelection, t]);

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div 
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 
                   flex items-center gap-2 px-4 py-3 
                   bg-[var(--card-bg)] border border-[var(--border-color)] 
                   rounded-lg shadow-lg"
        role="toolbar"
        aria-label={t('bulk.toolbar', 'Bulk actions toolbar')}
      >
        <span className="text-sm font-medium text-[var(--text-primary)] mr-2">
          {t('bulk.selected', '{{count}} selected', { count: selectedCount })}
        </span>

        {/* Status Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={bulkUpdate.isPending}>
              <CheckSquare className="h-4 w-4 mr-1" aria-hidden="true" />
              {t('bulk.changeStatus', 'Status')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>{t('bulk.changeStatus', 'Change Status')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
              <DropdownMenuItem
                key={value}
                onClick={() => handleStatusChange(value as TaskStatus)}
              >
                {t(`status.${value}`, label)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Priority Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={bulkUpdate.isPending}>
              <Flag className="h-4 w-4 mr-1" aria-hidden="true" />
              {t('bulk.changePriority', 'Priority')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>{t('bulk.changePriority', 'Change Priority')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
              <DropdownMenuItem
                key={value}
                onClick={() => handlePriorityChange(value as TaskPriority)}
              >
                {t(`priority.${value}`, label)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Assignee Dropdown */}
        {users.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={bulkUpdate.isPending}>
                <Users className="h-4 w-4 mr-1" aria-hidden="true" />
                {t('bulk.changeAssignee', 'Assignee')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>{t('bulk.changeAssignee', 'Change Assignee')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleAssigneeChange(null)}>
                {t('bulk.unassign', 'Unassign')}
              </DropdownMenuItem>
              {users.map((user) => (
                <DropdownMenuItem
                  key={user.id}
                  onClick={() => handleAssigneeChange(user.id)}
                >
                  {user.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Delete Button */}
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          disabled={bulkDelete.isPending}
        >
          <Trash2 className="h-4 w-4 mr-1" aria-hidden="true" />
          {t('bulk.deleteSelected', 'Delete')}
        </Button>

        {/* Clear Selection */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
        >
          <XSquare className="h-4 w-4 mr-1" aria-hidden="true" />
          {t('bulk.deselectAll', 'Clear')}
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('bulk.confirmDeleteTitle', 'Delete Tasks')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('bulk.confirmDelete', 'Are you sure you want to delete {{count}} tasks?', { count: selectedCount })}
              <br />
              {t('bulk.deleteWarning', 'This action cannot be undone.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {bulkDelete.isPending 
                ? t('common.loading', 'Loading...') 
                : t('common.delete', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default BulkActionsBar;
