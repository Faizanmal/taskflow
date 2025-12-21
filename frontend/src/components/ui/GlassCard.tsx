'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  blur?: 'sm' | 'md' | 'lg';
}

export default function GlassCard({
  children,
  className,
  blur = 'md',
}: GlassCardProps) {
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'bg-white/70 border border-white/20 rounded-2xl p-6 shadow-xl',
        blurClasses[blur],
        className
      )}
    >
      {children}
    </motion.div>
  );
}
