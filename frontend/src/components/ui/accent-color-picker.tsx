'use client';

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useAccentColor, ACCENT_COLORS } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface AccentColorPickerProps {
  className?: string;
}

export function AccentColorPicker({ className }: AccentColorPickerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const { accentColor, setAccentColor } = useAccentColor();

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {ACCENT_COLORS.map((color) => (
        <button
          key={color.value}
          onClick={() => setAccentColor(color.value)}
          className={cn(
            'relative h-8 w-8 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2',
            accentColor === color.value && 'ring-2 ring-offset-2'
          )}
          style={{
            backgroundColor: color.value,
            ['--tw-ring-color' as string]: color.value,
          }}
          title={color.name}
        >
          {accentColor === color.value && (
            <Check className="absolute inset-0 m-auto h-4 w-4 text-white" />
          )}
        </button>
      ))}
    </div>
  );
}
