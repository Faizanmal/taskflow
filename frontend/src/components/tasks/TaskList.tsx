'use client';

import { useState } from 'react';
import { Plus, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedButton, TaskCardSkeleton } from '@/components/ui';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import TaskFiltersComponent from './TaskFilters';
import { Task, TaskFilters, CreateTaskInput, UpdateTaskInput } from '@/lib/types';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';

export default function TaskList() {
  const [filters, setFilters] = useState<TaskFilters>({ sortOrder: 'desc' });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { data: tasks, isLoading, error } = useTasks(filters);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const handleCreateTask = async (data: CreateTaskInput) => {
    await createTask.mutateAsync(data);
  };

  const handleUpdateTask = async (data: UpdateTaskInput) => {
    if (!editingTask) return;
    await updateTask.mutateAsync({ id: editingTask.id, data });
    setEditingTask(null);
  };

  const handleFormSubmit = async (data: CreateTaskInput | UpdateTaskInput) => {
    if (editingTask) {
      await handleUpdateTask(data as UpdateTaskInput);
    } else {
      await handleCreateTask(data as CreateTaskInput);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    await deleteTask.mutateAsync(id);
  };

  const handleStatusChange = async (id: string, status: Task['status']) => {
    await updateTask.mutateAsync({ id, data: { status } });
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-gray-500"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <AlertCircle className="w-16 h-16 mb-4 text-red-500" />
        </motion.div>
        <p className="text-xl font-semibold text-gray-900 mb-2">Error loading tasks</p>
        <p className="text-sm text-gray-500">Please try again later</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <TaskFiltersComponent filters={filters} onChange={setFilters} />
        <AnimatedButton
          onClick={() => setIsFormOpen(true)}
          icon={<Plus className="w-5 h-5" />}
        >
          New Task
        </AnimatedButton>
      </motion.div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[...Array(6)].map((_, i) => (
              <TaskCardSkeleton key={i} />
            ))}
          </motion.div>
        ) : tasks && tasks.length > 0 ? (
          <motion.div
            key="tasks"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onEdit={handleEdit}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: 'easeInOut',
              }}
              className="inline-block mb-6"
            >
              <Sparkles className="w-20 h-20 text-blue-500" />
            </motion.div>
            <p className="text-xl font-semibold text-gray-900 mb-3">No tasks found</p>
            <p className="text-gray-500 mb-6">Get started by creating your first task</p>
            <AnimatedButton
              onClick={() => setIsFormOpen(true)}
              size="lg"
              icon={<Plus className="w-5 h-5" />}
            >
              Create Your First Task
            </AnimatedButton>
          </motion.div>
        )}
      </AnimatePresence>

      <TaskForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        task={editingTask}
        isLoading={createTask.isPending || updateTask.isPending}
      />
    </div>
  );
}
