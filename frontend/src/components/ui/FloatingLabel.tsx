'use client';

import { motion } from 'framer-motion';
import { InputHTMLAttributes, useState } from 'react';
import { cn } from '@/lib/utils';

interface FloatingLabelInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function FloatingLabelInput({
  label,
  error,
  className,
  ...props
}: FloatingLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const isFloating = isFocused || hasValue || props.value;

  return (
    <div className="relative">
      <input
        {...props}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          setHasValue(!!e.target.value);
          props.onBlur?.(e);
        }}
        className={cn(
          'peer w-full px-4 pt-6 pb-2 text-base border rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          error ? 'border-red-500' : 'border-gray-300',
          className
        )}
      />
      <motion.label
        initial={false}
        animate={{
          top: isFloating ? '0.5rem' : '1rem',
          fontSize: isFloating ? '0.75rem' : '1rem',
          color: error ? '#ef4444' : isFocused ? '#3b82f6' : '#6b7280',
        }}
        transition={{ duration: 0.2 }}
        className="absolute left-4 pointer-events-none font-medium"
      >
        {label}
      </motion.label>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
