'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface IconButtonProps {
  icon: ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
  disabled?: boolean;
  className?: string;
}

export default function IconButton({
  icon,
  onClick,
  variant = 'default',
  size = 'md',
  tooltip,
  disabled = false,
  className,
}: IconButtonProps) {
  const variantClasses = {
    default: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
    primary: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
    danger: 'text-red-600 hover:text-red-700 hover:bg-red-50',
    success: 'text-green-600 hover:text-green-700 hover:bg-green-50',
  };

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={cn(
        'rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {icon}
    </motion.button>
  );
}
