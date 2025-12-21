'use client';

import { format, isPast, isToday } from 'date-fns';
import { Calendar, User, MoreVertical, Trash2, Edit, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/lib/types';
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
} from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
  index?: number;
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  index = 0,
}: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { user } = useAuth();
  const isCreator = user?.id === task.creatorId;

  const isOverdue =
    task.dueDate &&
    isPast(new Date(task.dueDate)) &&
    task.status !== 'COMPLETED' &&
    !isToday(new Date(task.dueDate));

  const statusColorMap: Record<Task['status'], string> = {
    TODO: 'border-l-gray-400 bg-linear-to-r from-gray-50/50 to-white',
    IN_PROGRESS: 'border-l-blue-500 bg-linear-to-r from-blue-50/50 to-white',
    IN_REVIEW: 'border-l-purple-500 bg-linear-to-r from-purple-50/50 to-white',
    COMPLETED: 'border-l-green-500 bg-linear-to-r from-green-50/50 to-white',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
      className={cn(
        'bg-white rounded-xl border-l-4 border border-gray-200 p-5 transition-all duration-300 cursor-pointer group',
        statusColorMap[task.status]
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 line-clamp-1 text-lg group-hover:text-blue-600 transition-colors">
            {task.title}
          </h3>
        </div>
        {isCreator && (
          <div className="relative ml-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </motion.button>
            <AnimatePresence>
              {showMenu && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-2xl border border-gray-200 z-20 overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        onEdit(task);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Task
                    </button>
                    <button
                      onClick={() => {
                        onDelete(task.id);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Task
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm ${
            TASK_STATUS_COLORS[task.status]
          }`}
        >
          {TASK_STATUS_LABELS[task.status]}
        </motion.span>
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15 }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm ${
            TASK_PRIORITY_COLORS[task.priority]
          }`}
        >
          {TASK_PRIORITY_LABELS[task.priority]}
        </motion.span>
        {isOverdue && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="px-3 py-1.5 text-xs font-semibold rounded-full bg-red-100 text-red-700 flex items-center gap-1 shadow-sm animate-pulse"
          >
            <AlertCircle className="w-3 h-3" />
            Overdue
          </motion.span>
        )}
      </div>

      <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-4">
        <div className="flex items-center gap-4">
          {task.dueDate && (
            <div
              className={cn(
                'flex items-center gap-2 px-2 py-1 rounded-lg transition-colors',
                isOverdue ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-50'
              )}
            >
              <Calendar className="w-4 h-4" />
              <span className="font-medium">{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
            </div>
          )}
          {task.assignee && (
            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
              <User className="w-4 h-4" />
              <span className="truncate max-w-24 font-medium">{task.assignee.name}</span>
            </div>
          )}
        </div>

        {isCreator && (
          <motion.select
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value as Task['status'])}
            className="text-xs font-medium border-2 border-gray-200 rounded-lg px-3 py-1.5 bg-white hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="COMPLETED">Completed</option>
          </motion.select>
        )}
      </div>
    </motion.div>
  );
}
