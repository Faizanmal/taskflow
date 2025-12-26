'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface DateRangeFilterProps {
  startDate?: Date;
  endDate?: Date;
  onDateChange: (start?: Date, end?: Date) => void;
}

/**
 * Date Range Filter Component
 * Allows users to filter by date range
 * WCAG 2.1 AA compliant
 */
export default function DateRangeFilter({
  startDate,
  endDate,
  onDateChange,
}: DateRangeFilterProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const dateRange: DateRange | undefined = startDate || endDate
    ? { from: startDate, to: endDate }
    : undefined;

  const handleSelect = useCallback((range: DateRange | undefined) => {
    onDateChange(range?.from, range?.to);
    if (range?.to) {
      setOpen(false);
    }
  }, [onDateChange]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDateChange(undefined, undefined);
  }, [onDateChange]);

  const formatDateRange = () => {
    if (!startDate && !endDate) {
      return t('filters.selectDateRange', 'Select date range');
    }
    if (startDate && endDate) {
      return `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
    }
    if (startDate) {
      return `${format(startDate, 'MMM d, yyyy')} - ...`;
    }
    return t('filters.selectDateRange', 'Select date range');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
          aria-label={t('filters.dateRangeLabel', 'Filter by date range')}
        >
          <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
          <span className="flex-1 truncate">{formatDateRange()}</span>
          {(startDate || endDate) && (
            <button
              onClick={handleClear}
              className="ml-2 p-1 hover:bg-[var(--bg-tertiary)] rounded"
              aria-label={t('common.clear', 'Clear')}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              {t('filters.dateRange', 'Date Range')}
            </Label>
            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDateChange(undefined, undefined)}
              >
                {t('common.clear', 'Clear')}
              </Button>
            )}
          </div>
          
          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                const weekAgo = new Date();
                weekAgo.setDate(today.getDate() - 7);
                onDateChange(weekAgo, today);
                setOpen(false);
              }}
            >
              {t('filters.lastWeek', 'Last 7 days')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                const monthAgo = new Date();
                monthAgo.setMonth(today.getMonth() - 1);
                onDateChange(monthAgo, today);
                setOpen(false);
              }}
            >
              {t('filters.lastMonth', 'Last 30 days')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                onDateChange(startOfMonth, today);
                setOpen(false);
              }}
            >
              {t('filters.thisMonth', 'This month')}
            </Button>
          </div>

          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleSelect}
            numberOfMonths={2}
            disabled={{ after: new Date() }}
            className="rounded-md border"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
