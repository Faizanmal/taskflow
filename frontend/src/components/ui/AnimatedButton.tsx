'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
}

export default function AnimatedButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
  icon,
}: AnimatedButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500 shadow-lg shadow-blue-500/30',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-linear-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500 shadow-lg shadow-red-500/30',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      {children}
    </motion.button>
  );
}
