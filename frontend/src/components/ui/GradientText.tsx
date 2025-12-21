'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  from?: string;
  to?: string;
  animate?: boolean;
}

export default function GradientText({
  children,
  className,
  from = 'from-blue-600',
  to = 'to-purple-600',
  animate = false,
}: GradientTextProps) {
  const text = (
    <span
      className={cn(
        'bg-linear-to-r bg-clip-text text-transparent font-bold',
        from,
        to,
        animate && 'animate-gradient',
        className
      )}
    >
      {children}
    </span>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {text}
      </motion.div>
    );
  }

  return text;
}
