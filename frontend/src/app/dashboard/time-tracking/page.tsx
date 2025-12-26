'use client';

import { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks, addWeeks } from 'date-fns';
import {
  Clock,
  TrendingUp,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Target,
  Flame,
  Award,
} from 'lucide-react';
import {
  useWeeklyReport,
  useProductivityStats,
  useRunningTimer,
  useUserTimeLogs,
} from '@/hooks/useTimeTracking';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ProductivityStats } from '@/lib/types';

export default function TimeTrackingPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = useMemo(() => startOfWeek(currentWeek), [currentWeek]);
  const weekEnd = useMemo(() => endOfWeek(currentWeek), [currentWeek]);
  const weekDays = useMemo(() => eachDayOfInterval({ start: weekStart, end: weekEnd }), [weekStart, weekEnd]);

  const { data: runningTimer } = useRunningTimer();
  const { data: stats, isLoading: statsLoading } = useProductivityStats(
    format(weekStart, 'yyyy-MM-dd'),
    format(weekEnd, 'yyyy-MM-dd')
  );
  const { data: weeklyReport, isLoading: weeklyLoading } = useWeeklyReport(
    format(weekStart, 'yyyy-MM-dd'),
    format(weekEnd, 'yyyy-MM-dd')
  );
  const { data: recentLogs = [], isLoading: logsLoading } = useUserTimeLogs({
    limit: 10,
  });

  const navigatePrevWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const navigateNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const navigateToday = () => setCurrentWeek(new Date());

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  // Calculate daily totals for the chart
  const dailyData = useMemo(() => {
    if (!weeklyReport || weeklyReport.length === 0) return weekDays.map((d) => ({ date: d, minutes: 0 }));

    return weekDays.map((day) => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const dayReport = weeklyReport.find((r) => r.week === dateKey);
      return {
        date: day,
        minutes: dayReport?.totalMinutes || 0,
      };
    });
  }, [weekDays, weeklyReport]);

  const maxMinutes = Math.max(...dailyData.map((d) => d.minutes), 60);
  const weeklyTotal = dailyData.reduce((sum, d) => sum + d.minutes, 0);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Clock className="h-8 w-8" />
            Time Tracking
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track your productivity and manage your time
          </p>
        </div>

        {runningTimer && (
          <div className="flex items-center gap-3 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
            <span className="font-medium">Timer running</span>
            <Badge variant="secondary">{runningTimer.task?.title}</Badge>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <div className="theme-card rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
              <p className="text-2xl font-bold">
                {statsLoading ? '...' : formatDuration(stats?.todayMinutes || 0)}
              </p>
            </div>
            <div
              className="h-12 w-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--accent-color)', opacity: 0.1 }}
            >
              <Clock className="h-6 w-6" style={{ color: 'var(--accent-color)' }} />
            </div>
          </div>
          {stats?.dailyGoal && stats?.todayMinutes && (
            <div className="mt-3">
              <Progress
                value={(stats.todayMinutes / stats.dailyGoal) * 100}
                className="h-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((stats.todayMinutes / stats.dailyGoal) * 100)}% of daily goal
              </p>
            </div>
          )}
        </div>

        <div className="theme-card rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">This Week</p>
              <p className="text-2xl font-bold">
                {weeklyLoading ? '...' : formatDuration(weeklyTotal)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d')}
          </p>
        </div>

        <div className="theme-card rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Streak</p>
              <p className="text-2xl font-bold flex items-center gap-2">
                {stats?.currentStreak || 0}
                <span className="text-base font-normal text-gray-500">days</span>
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Flame className="h-6 w-6 text-orange-500" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Best: {stats?.longestStreak || 0} days
          </p>
        </div>

        <div className="theme-card rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pomodoros</p>
              <p className="text-2xl font-bold">
                {stats?.totalPomodoros || 0}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Target className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            All time completed
          </p>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="theme-card rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Weekly Overview
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={navigatePrevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={navigateToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={navigateNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {weeklyLoading ? (
          <div className="h-48 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="h-48 flex items-end gap-2">
            {dailyData.map((day, idx) => {
              const height = maxMinutes > 0 ? (day.minutes / maxMinutes) * 100 : 0;
              const isToday = format(day.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center">
                    {day.minutes > 0 && (
                      <span className="text-xs text-gray-500 mb-1">
                        {formatDuration(day.minutes)}
                      </span>
                    )}
                    <div
                      className={cn(
                        'w-full rounded-t-lg transition-all',
                        isToday ? 'bg-accent' : 'bg-gray-200 dark:bg-gray-700'
                      )}
                      style={{
                        height: `${Math.max(height, 4)}%`,
                        minHeight: '4px',
                        ...(isToday && { backgroundColor: 'var(--accent-color)' }),
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <div className={cn('text-xs', isToday && 'font-bold')}>
                      {format(day.date, 'EEE')}
                    </div>
                    <div
                      className={cn(
                        'text-xs text-gray-500',
                        isToday && 'font-bold text-accent'
                      )}
                      style={isToday ? { color: 'var(--accent-color)' } : undefined}
                    >
                      {format(day.date, 'd')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity & Tasks */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Time Logs */}
        <div className="theme-card rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>

          {logsLoading ? (
            <div className="py-8 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : recentLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No time logs yet</p>
              <p className="text-sm mt-1">Start tracking time on your tasks</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div
                    className={cn(
                      'h-10 w-10 rounded-lg flex items-center justify-center',
                      log.isPomodoro
                        ? 'bg-purple-100 dark:bg-purple-900/30'
                        : 'bg-blue-100 dark:bg-blue-900/30'
                    )}
                  >
                    {log.isPomodoro ? (
                      <Target className="h-5 w-5 text-purple-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {log.task?.title || 'Unknown Task'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(log.startTime), 'MMM d, h:mm a')}
                      {log.isPomodoro && ' • Pomodoro'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatDuration(log.duration || 0)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Tasks */}
        <div className="theme-card rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Top Tasks This Week</h2>

          {weeklyLoading ? (
            <div className="py-8 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : !stats?.taskBreakdown?.length ? (
            <div className="text-center py-8 text-gray-500">
              <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No tracked tasks this week</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.taskBreakdown.slice(0, 5).map((item: ProductivityStats['taskBreakdown'][0], idx: number) => {
                const percentage = weeklyTotal > 0 ? (item.totalMinutes / weeklyTotal) * 100 : 0;

                return (
                  <div key={item.taskId || idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate flex-1 mr-4">
                        {item.taskTitle || 'Unknown Task'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDuration(item.totalMinutes)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: 'var(--accent-color)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
