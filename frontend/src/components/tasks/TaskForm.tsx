'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Textarea, Select, Modal } from '@/components/ui';
import { Task, CreateTaskInput, UpdateTaskInput } from '@/lib/types';
import { useUsers } from '@/hooks/useUsers';
import { TASK_STATUS, TASK_PRIORITY } from '@/lib/constants';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(2000, 'Description is too long').optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskInput | UpdateTaskInput) => Promise<void>;
  task?: Task | null;
  isLoading?: boolean;
}

export default function TaskForm({
  isOpen,
  onClose,
  onSubmit,
  task,
  isLoading,
}: TaskFormProps) {
  const { data: users = [] } = useUsers();
  const isEditing = !!task;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'TODO',
      priority: task?.priority || 'MEDIUM',
      dueDate: task?.dueDate
        ? new Date(task.dueDate).toISOString().split('T')[0]
        : '',
      assigneeId: task?.assigneeId || '',
    },
  });

  const handleFormSubmit = async (data: TaskFormData) => {
    const updateData: UpdateTaskInput = {
      title: data.title,
      ...(data.description && { description: data.description }),
      ...(data.status && { status: data.status }),
      ...(data.priority && { priority: data.priority }),
      dueDate: data.dueDate || null,
      assigneeId: data.assigneeId || null,
    };
    await onSubmit(updateData);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const statusOptions = Object.entries(TASK_STATUS).map(([key, value]) => ({
    value,
    label: key.replace(/_/g, ' '),
  }));

  const priorityOptions = Object.entries(TASK_PRIORITY).map(([key, value]) => ({
    value,
    label: key,
  }));

  const userOptions = [
    { value: '', label: 'Unassigned' },
    ...users.map((user) => ({ value: user.id, label: user.name })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Task' : 'Create Task'}
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Title"
          placeholder="Enter task title"
          {...register('title')}
          {...(errors.title?.message ? { error: errors.title.message } : {})}
        />

        <Textarea
          label="Description"
          placeholder="Enter task description (optional)"
          rows={3}
          {...register('description')}
          {...(errors.description?.message ? { error: errors.description.message } : {})}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            options={statusOptions}
            {...register('status')}
            {...(errors.status?.message ? { error: errors.status.message } : {})}
          />

          <Select
            label="Priority"
            options={priorityOptions}
            {...register('priority')}
            {...(errors.priority?.message ? { error: errors.priority.message } : {})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Due Date"
            type="date"
            {...register('dueDate')}
            {...(errors.dueDate?.message ? { error: errors.dueDate.message } : {})}
          />

          <Select
            label="Assignee"
            options={userOptions}
            {...register('assigneeId')}
            {...(errors.assigneeId?.message ? { error: errors.assigneeId.message } : {})}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" {...(isLoading !== undefined ? { isLoading } : {})}>
            {isEditing ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
