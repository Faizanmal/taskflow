'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
  onClick?: () => void;
}

export default function AnimatedCard({
  children,
  className,
  delay = 0,
  hover = true,
  onClick,
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      {...(hover ? { whileHover: { y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' } } : {})}
      className={cn(
        'bg-white rounded-xl border border-gray-200 p-6 transition-all duration-300',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
