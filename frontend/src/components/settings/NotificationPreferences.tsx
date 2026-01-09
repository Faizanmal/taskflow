'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/radix-select';
import {
  Bell,
  Mail,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Users,
  Clock,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface NotificationPreferences {
  email: {
    taskAssigned: boolean;
    taskCompleted: boolean;
    taskDueSoon: boolean;
    taskOverdue: boolean;
    mentions: boolean;
    comments: boolean;
    weeklyDigest: boolean;
  };
  push: {
    taskAssigned: boolean;
    taskCompleted: boolean;
    taskDueSoon: boolean;
    taskOverdue: boolean;
    mentions: boolean;
    comments: boolean;
  };
  inApp: {
    taskAssigned: boolean;
    taskCompleted: boolean;
    taskDueSoon: boolean;
    taskOverdue: boolean;
    mentions: boolean;
    comments: boolean;
    workspaceActivity: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const defaultPreferences: NotificationPreferences = {
  email: {
    taskAssigned: true,
    taskCompleted: true,
    taskDueSoon: true,
    taskOverdue: true,
    mentions: true,
    comments: true,
    weeklyDigest: true,
  },
  push: {
    taskAssigned: true,
    taskCompleted: false,
    taskDueSoon: true,
    taskOverdue: true,
    mentions: true,
    comments: false,
  },
  inApp: {
    taskAssigned: true,
    taskCompleted: true,
    taskDueSoon: true,
    taskOverdue: true,
    mentions: true,
    comments: true,
    workspaceActivity: true,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
};

/**
 * Notification Preferences Component
 * Allows users to configure their notification settings
 * WCAG 2.1 AA compliant
 */
export default function NotificationPreferences() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);

  // Fetch current preferences
  const { data, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const response = await api.get('/notifications/preferences');
      return response.data.data;
    },
  });

  useEffect(() => {
    if (data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreferences(data);
    }
  }, [data]);

  // Save preferences mutation
  const savePreferences = useMutation({
    mutationFn: async (prefs: NotificationPreferences) => {
      const response = await api.put('/notifications/preferences', prefs);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast.success(t('notifications.preferencesSaved', 'Preferences saved'));
    },
    onError: () => {
      toast.error(t('common.error', 'An error occurred'));
    },
  });

  const handleToggle = useCallback((
    channel: 'email' | 'push' | 'inApp',
    setting: string,
    value: boolean
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [setting]: value,
      },
    }));
  }, []);

  const handleQuietHoursToggle = useCallback((enabled: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        enabled,
      },
    }));
  }, []);

  const handleQuietHoursChange = useCallback((field: 'start' | 'end', value: string) => {
    setPreferences((prev) => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [field]: value,
      },
    }));
  }, []);

  const handleSave = useCallback(() => {
    savePreferences.mutate(preferences);
  }, [preferences, savePreferences]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" role="status">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-color)]" />
        <span className="sr-only">{t('common.loading', 'Loading...')}</span>
      </div>
    );
  }

  const notificationTypes = [
    { key: 'taskAssigned', icon: Users, label: t('notifications.taskAssigned', 'Task assigned to you') },
    { key: 'taskCompleted', icon: CheckCircle, label: t('notifications.taskCompleted', 'Task completed') },
    { key: 'taskDueSoon', icon: Clock, label: t('notifications.taskDueSoon', 'Task due soon') },
    { key: 'taskOverdue', icon: AlertTriangle, label: t('notifications.taskOverdue', 'Task overdue') },
    { key: 'mentions', icon: MessageSquare, label: t('notifications.mentions', 'Mentions') },
    { key: 'comments', icon: MessageSquare, label: t('notifications.comments', 'New comments') },
  ];

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-[var(--accent-color)]" aria-hidden="true" />
            {t('notifications.emailTitle', 'Email Notifications')}
          </CardTitle>
          <CardDescription>
            {t('notifications.emailDescription', 'Configure which emails you receive')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationTypes.map(({ key, icon: Icon, label }) => (
            <div key={`email-${key}`} className="flex items-center justify-between">
              <Label htmlFor={`email-${key}`} className="flex items-center gap-2 cursor-pointer">
                <Icon className="h-4 w-4 text-[var(--text-tertiary)]" aria-hidden="true" />
                {label}
              </Label>
              <Switch
                id={`email-${key}`}
                checked={preferences.email[key as keyof typeof preferences.email] ?? false}
                onCheckedChange={(checked) => handleToggle('email', key, checked)}
              />
            </div>
          ))}
          <div className="flex items-center justify-between pt-4 border-t">
            <Label htmlFor="email-weeklyDigest" className="flex items-center gap-2 cursor-pointer">
              <Bell className="h-4 w-4 text-[var(--text-tertiary)]" aria-hidden="true" />
              {t('notifications.weeklyDigest', 'Weekly digest')}
            </Label>
            <Switch
              id="email-weeklyDigest"
              checked={preferences.email.weeklyDigest}
              onCheckedChange={(checked) => handleToggle('email', 'weeklyDigest', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[var(--accent-color)]" aria-hidden="true" />
            {t('notifications.pushTitle', 'Push Notifications')}
          </CardTitle>
          <CardDescription>
            {t('notifications.pushDescription', 'Get notified on your device')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationTypes.map(({ key, icon: Icon, label }) => (
            <div key={`push-${key}`} className="flex items-center justify-between">
              <Label htmlFor={`push-${key}`} className="flex items-center gap-2 cursor-pointer">
                <Icon className="h-4 w-4 text-[var(--text-tertiary)]" aria-hidden="true" />
                {label}
              </Label>
              <Switch
                id={`push-${key}`}
                checked={preferences.push[key as keyof typeof preferences.push] ?? false}
                onCheckedChange={(checked) => handleToggle('push', key, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* In-App Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[var(--accent-color)]" aria-hidden="true" />
            {t('notifications.inAppTitle', 'In-App Notifications')}
          </CardTitle>
          <CardDescription>
            {t('notifications.inAppDescription', 'Notifications shown within the app')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationTypes.map(({ key, icon: Icon, label }) => (
            <div key={`inApp-${key}`} className="flex items-center justify-between">
              <Label htmlFor={`inApp-${key}`} className="flex items-center gap-2 cursor-pointer">
                <Icon className="h-4 w-4 text-[var(--text-tertiary)]" aria-hidden="true" />
                {label}
              </Label>
              <Switch
                id={`inApp-${key}`}
                checked={preferences.inApp[key as keyof typeof preferences.inApp] ?? false}
                onCheckedChange={(checked) => handleToggle('inApp', key, checked)}
              />
            </div>
          ))}
          <div className="flex items-center justify-between pt-4 border-t">
            <Label htmlFor="inApp-workspaceActivity" className="flex items-center gap-2 cursor-pointer">
              <Users className="h-4 w-4 text-[var(--text-tertiary)]" aria-hidden="true" />
              {t('notifications.workspaceActivity', 'Workspace activity')}
            </Label>
            <Switch
              id="inApp-workspaceActivity"
              checked={preferences.inApp.workspaceActivity}
              onCheckedChange={(checked) => handleToggle('inApp', 'workspaceActivity', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[var(--accent-color)]" aria-hidden="true" />
            {t('notifications.quietHoursTitle', 'Quiet Hours')}
          </CardTitle>
          <CardDescription>
            {t('notifications.quietHoursDescription', 'Pause notifications during specific hours')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="quiet-hours-enabled" className="cursor-pointer">
              {t('notifications.enableQuietHours', 'Enable quiet hours')}
            </Label>
            <Switch
              id="quiet-hours-enabled"
              checked={preferences.quietHours.enabled}
              onCheckedChange={handleQuietHoursToggle}
            />
          </div>
          
          {preferences.quietHours.enabled && (
            <div className="flex items-center gap-4 pt-2">
              <div className="flex-1">
                <Label htmlFor="quiet-hours-start" className="text-sm text-[var(--text-tertiary)]">
                  {t('notifications.from', 'From')}
                </Label>
                <Select
                  value={preferences.quietHours.start}
                  onValueChange={(value: string) => handleQuietHoursChange('start', value)}
                >
                  <SelectTrigger id="quiet-hours-start" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const time = `${i.toString().padStart(2, '0')}:00`;
                      return (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="quiet-hours-end" className="text-sm text-[var(--text-tertiary)]">
                  {t('notifications.to', 'To')}
                </Label>
                <Select
                  value={preferences.quietHours.end}
                  onValueChange={(value: string) => handleQuietHoursChange('end', value)}
                >
                  <SelectTrigger id="quiet-hours-end" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const time = `${i.toString().padStart(2, '0')}:00`;
                      return (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={savePreferences.isPending}
        >
          {savePreferences.isPending 
            ? t('common.saving', 'Saving...') 
            : t('common.save', 'Save preferences')
          }
        </Button>
      </div>
    </div>
  );
}
