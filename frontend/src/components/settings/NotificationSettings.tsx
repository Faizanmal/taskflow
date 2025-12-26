'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  Smartphone,
  Monitor,
  Save,
  Loader2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { NotificationPreferences } from '@/lib/types';
import { notificationsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/radix-select';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailEnabled: true,
  pushEnabled: true,
  inAppEnabled: true,
  taskAssigned: true,
  taskUpdated: true,
  taskCompleted: true,
  taskCommented: true,
  dueDateReminder: true,
  reminderTiming: 24,
  digestEnabled: false,
  digestFrequency: 'DAILY',
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
};

interface NotificationSettingsProps {
  className?: string;
}

export function NotificationSettings({ className }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await notificationsAPI.getPreferences();
      const data = response.data?.data ?? {};
      setPreferences({ ...DEFAULT_PREFERENCES, ...data });
    } catch {
      // Use defaults if API fails
      setPreferences(DEFAULT_PREFERENCES);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    setPreferences((prev: NotificationPreferences) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await notificationsAPI.updatePreferences(preferences);
      setHasChanges(false);
      toast.success('Notification preferences saved');
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const requestPushPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Push notifications not supported in this browser');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      updatePreference('pushEnabled', true);
      toast.success('Push notifications enabled');
    } else {
      toast.error('Push notification permission denied');
    }
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-8', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Notification Preferences</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Control how and when you receive notifications
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="btn-accent"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Notification Channels */}
      <section className="space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Channels
        </h3>

        <div className="grid gap-4">
          <div className="flex items-center justify-between p-4 theme-card rounded-lg">
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-gray-500" />
              <div>
                <Label>In-App Notifications</Label>
                <p className="text-sm text-gray-500">
                  Show notifications within the app
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.inAppEnabled}
              onCheckedChange={(checked) => updatePreference('inAppEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 theme-card rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-gray-500" />
              <div>
                <Label>Push Notifications</Label>
                <p className="text-sm text-gray-500">
                  Browser push notifications
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {preferences.pushEnabled ? (
                <Switch
                  checked={preferences.pushEnabled}
                  onCheckedChange={(checked) => updatePreference('pushEnabled', checked)}
                />
              ) : (
                <Button size="sm" variant="outline" onClick={requestPushPermission}>
                  Enable
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 theme-card rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-500">
                  Receive notifications via email
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.emailEnabled}
              onCheckedChange={(checked) => updatePreference('emailEnabled', checked)}
            />
          </div>
        </div>
      </section>

      {/* Notification Types */}
      <section className="space-y-4">
        <h3 className="font-medium">Notification Types</h3>

        <div className="grid gap-3">
          {[
            {
              key: 'taskAssigned' as const,
              label: 'Task Assigned',
              description: 'When a task is assigned to you',
            },
            {
              key: 'taskUpdated' as const,
              label: 'Task Updated',
              description: 'When a task you are involved in is updated',
            },
            {
              key: 'taskCompleted' as const,
              label: 'Task Completed',
              description: 'When a task is marked as completed',
            },
            {
              key: 'taskCommented' as const,
              label: 'Comments',
              description: 'When someone comments on your tasks',
            },
            {
              key: 'dueDateReminder' as const,
              label: 'Due Date Reminders',
              description: 'Reminders before task due dates',
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div>
                <Label className="font-normal">{item.label}</Label>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
              <Switch
                checked={preferences[item.key]}
                onCheckedChange={(checked) => updatePreference(item.key, checked)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Due Date Reminder Timing */}
      {preferences.dueDateReminder && (
        <section className="space-y-4">
          <h3 className="font-medium">Reminder Timing</h3>
          <div className="flex items-center gap-4">
            <Label>Remind me</Label>
            <Select
              value={String(preferences.reminderTiming)}
              onValueChange={(value) => updatePreference('reminderTiming', parseInt(value))}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour before</SelectItem>
                <SelectItem value="3">3 hours before</SelectItem>
                <SelectItem value="12">12 hours before</SelectItem>
                <SelectItem value="24">1 day before</SelectItem>
                <SelectItem value="48">2 days before</SelectItem>
                <SelectItem value="168">1 week before</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>
      )}

      {/* Email Digest */}
      {preferences.emailEnabled && (
        <section className="space-y-4">
          <h3 className="font-medium">Email Digest</h3>

          <div className="flex items-center justify-between p-4 theme-card rounded-lg">
            <div>
              <Label>Digest Emails</Label>
              <p className="text-sm text-gray-500">
                Receive a summary of activity instead of individual emails
              </p>
            </div>
            <Switch
              checked={preferences.digestEnabled}
              onCheckedChange={(checked) => updatePreference('digestEnabled', checked)}
            />
          </div>

          {preferences.digestEnabled && (
            <div className="flex items-center gap-4 ml-4">
              <Label>Frequency</Label>
              <Select
                value={preferences.digestFrequency}
                onValueChange={(value: 'DAILY' | 'WEEKLY') =>
                  updatePreference('digestFrequency', value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </section>
      )}

      {/* Quiet Hours */}
      <section className="space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          {preferences.quietHoursEnabled ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
          Quiet Hours
        </h3>

        <div className="flex items-center justify-between p-4 theme-card rounded-lg">
          <div>
            <Label>Enable Quiet Hours</Label>
            <p className="text-sm text-gray-500">
              Pause notifications during specified hours
            </p>
          </div>
          <Switch
            checked={preferences.quietHoursEnabled}
            onCheckedChange={(checked) => updatePreference('quietHoursEnabled', checked)}
          />
        </div>

        {preferences.quietHoursEnabled && (
          <div className="flex items-center gap-4 ml-4">
            <div className="flex items-center gap-2">
              <Label>From</Label>
              <input
                type="time"
                value={preferences.quietHoursStart}
                onChange={(e) => updatePreference('quietHoursStart', e.target.value)}
                className="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label>To</Label>
              <input
                type="time"
                value={preferences.quietHoursEnd}
                onChange={(e) => updatePreference('quietHoursEnd', e.target.value)}
                className="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
            </div>
          </div>
        )}
      </section>

      {/* Test Notification */}
      <section className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          onClick={() => {
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Test Notification', {
                body: 'This is a test notification from TaskFlow',
                icon: '/icon.png',
              });
            } else {
              toast.success('Test notification!');
            }
          }}
        >
          <Bell className="h-4 w-4 mr-2" />
          Send Test Notification
        </Button>
      </section>
    </div>
  );
}
