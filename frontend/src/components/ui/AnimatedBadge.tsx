'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedBadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  pulse?: boolean;
  className?: string;
}

export default function AnimatedBadge({
  children,
  variant = 'default',
  pulse = false,
  className,
}: AnimatedBadgeProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border',
        variantClasses[variant],
        pulse && 'animate-pulse',
        className
      )}
    >
      {children}
    </motion.span>
  );
}
