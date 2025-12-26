'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Square, Timer, RotateCcw } from 'lucide-react';
import { useRunningTimer, useStartTimer, useStopTimer } from '@/hooks/useTimeTracking';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface TimeTrackerProps {
  taskId: string;
  className?: string;
}

export function TimeTracker({ taskId, className }: TimeTrackerProps) {
  const { data: runningTimer, isLoading } = useRunningTimer();
  const startTimer = useStartTimer();
  const stopTimer = useStopTimer();

  const [elapsedTime, setElapsedTime] = useState(0);

  const isRunning = runningTimer?.taskId === taskId;

  // Update elapsed time every second when timer is running
  useEffect(() => {
    if (!isRunning || !runningTimer) return;

    const updateElapsed = () => {
      const start = new Date(runningTimer.startTime).getTime();
      const now = Date.now();
      setElapsedTime(Math.floor((now - start) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [isRunning, runningTimer]);

  const handleStart = async () => {
    try {
      await startTimer.mutateAsync({ taskId });
      toast.success('Timer started');
    } catch {
      toast.error('Failed to start timer');
    }
  };

  const handleStop = async () => {
    try {
      await stopTimer.mutateAsync();
      setElapsedTime(0);
      toast.success('Timer stopped and time logged');
    } catch {
      toast.error('Failed to stop timer');
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {isRunning ? (
        <>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-mono text-sm font-medium">{formatTime(elapsedTime)}</span>
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleStop}
            disabled={stopTimer.isPending}
          >
            <Square className="h-4 w-4 mr-1" />
            Stop
          </Button>
        </>
      ) : (
        <Button
          size="sm"
          onClick={handleStart}
          disabled={startTimer.isPending || !!(runningTimer && runningTimer.taskId && runningTimer.taskId !== taskId)}
          className="btn-accent"
        >
          <Play className="h-4 w-4 mr-1" />
          {startTimer.isPending ? 'Starting...' : 'Start Timer'}
        </Button>
      )}

      {runningTimer && runningTimer.taskId !== taskId && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Timer running on another task
        </span>
      )}
    </div>
  );
}

interface PomodoroTimerProps {
  onComplete?: (duration: number) => void;
  className?: string;
}

export function PomodoroTimer({ onComplete, className }: PomodoroTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default
  const [isBreak, setIsBreak] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // Timer settings
  const workDuration = 25 * 60; // 25 minutes
  const shortBreakDuration = 5 * 60; // 5 minutes
  const longBreakDuration = 15 * 60; // 15 minutes

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer completed
          if (!isBreak) {
            // Work session completed
            const newSessionCount = sessionsCompleted + 1;
            setSessionsCompleted(newSessionCount);
            onComplete?.(workDuration / 60);
            
            // Play notification sound
            playNotificationSound();
            
            // Start break
            setIsBreak(true);
            return newSessionCount % 4 === 0 ? longBreakDuration : shortBreakDuration;
          } else {
            // Break completed
            setIsBreak(false);
            playNotificationSound();
            return workDuration;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isBreak, sessionsCompleted, onComplete, longBreakDuration, shortBreakDuration, workDuration]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workDuration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = isBreak
    ? ((isBreak && sessionsCompleted % 4 === 0 ? longBreakDuration : shortBreakDuration) - timeLeft) /
      (sessionsCompleted % 4 === 0 ? longBreakDuration : shortBreakDuration)
    : (workDuration - timeLeft) / workDuration;

  return (
    <div className={cn('flex flex-col items-center gap-4 p-6 theme-card rounded-xl', className)}>
      <div className="flex items-center gap-2">
        <Timer className="h-5 w-5 text-accent" />
        <span className="font-medium">{isBreak ? 'Break Time' : 'Focus Time'}</span>
      </div>

      {/* Circular progress indicator */}
      <div className="relative h-32 w-32">
        <svg className="h-full w-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="58"
            strokeWidth="8"
            className="fill-none stroke-gray-200 dark:stroke-gray-700"
          />
          <circle
            cx="64"
            cy="64"
            r="58"
            strokeWidth="8"
            strokeDasharray={364}
            strokeDashoffset={364 * (1 - progress)}
            className={cn(
              'fill-none transition-all duration-1000',
              isBreak ? 'stroke-green-500' : 'stroke-accent'
            )}
            style={{ stroke: isBreak ? undefined : 'var(--accent-color)' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-mono font-bold">{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {isRunning ? (
          <Button onClick={handlePause} variant="outline" size="lg">
            <Pause className="h-5 w-5" />
          </Button>
        ) : (
          <Button onClick={handleStart} className="btn-accent" size="lg">
            <Play className="h-5 w-5" />
          </Button>
        )}
        <Button onClick={handleReset} variant="outline" size="lg">
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>

      {/* Session counter */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              'h-3 w-3 rounded-full',
              i <= (sessionsCompleted % 4 || (sessionsCompleted > 0 ? 4 : 0))
                ? 'bg-accent'
                : 'bg-gray-200 dark:bg-gray-700'
            )}
            style={
              i <= (sessionsCompleted % 4 || (sessionsCompleted > 0 ? 4 : 0))
                ? { backgroundColor: 'var(--accent-color)' }
                : undefined
            }
          />
        ))}
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
          {sessionsCompleted} sessions
        </span>
      </div>
    </div>
  );
}

// Helper function to play notification sound
function playNotificationSound() {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification('Pomodoro Timer', {
        body: 'Time is up!',
        icon: '/favicon.ico',
      });
    }
  }

  // Also play audio if available
  try {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(() => {
      // Ignore errors if audio can't play
    });
  } catch {
    // Audio not available
  }
}
