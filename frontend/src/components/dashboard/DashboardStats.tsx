'use client';

import { CheckCircle, AlertTriangle, ListTodo, Loader2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTaskStats } from '@/hooks/useTasks';
import { Skeleton } from '@/components/ui';

export default function DashboardStats() {
  const { data: stats, isLoading } = useTaskStats();

  const statCards = [
    {
      label: 'Assigned to Me',
      value: stats?.totalAssigned ?? 0,
      icon: ListTodo,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      label: 'In Progress',
      value: stats?.inProgress ?? 0,
      icon: Loader2,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      gradient: 'from-yellow-500 to-yellow-600',
    },
    {
      label: 'Completed',
      value: stats?.completed ?? 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      gradient: 'from-green-500 to-green-600',
    },
    {
      label: 'Overdue',
      value: stats?.overdue ?? 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      gradient: 'from-red-500 to-red-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
          >
            <Skeleton className="h-5 w-28 mb-4" />
            <Skeleton className="h-10 w-20" />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
        >
          {/* Gradient background on hover */}
          <div className={`absolute inset-0 bg-linear-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
          
          <div className="flex items-start justify-between relative z-10">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">
                {stat.label}
              </p>
              <motion.p
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                className="text-4xl font-bold text-gray-900"
              >
                {stat.value}
              </motion.p>
              
              {/* Trending indicator */}
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-600 font-medium">+12% from last week</span>
              </div>
            </div>
            
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className={`p-4 rounded-2xl ${stat.bgColor} shadow-inner`}
            >
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </motion.div>
          </div>

          {/* Decorative corner accent */}
          <div className={`absolute -bottom-2 -right-2 w-24 h-24 bg-linear-to-br ${stat.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-300`} />
        </motion.div>
      ))}
    </div>
  );
}
