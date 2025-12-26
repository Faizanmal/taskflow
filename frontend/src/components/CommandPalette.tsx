'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  CheckSquare,
  Briefcase,
  User,
  Plus,
  Settings,
  Moon,
  Sun,
  LogOut,
  Search,
  FileText,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { useGlobalSearch } from '@/hooks/useSearch';
import { useDebounce } from '@/hooks/useDebounce';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTask?: () => void;
}

/**
 * Global Command Palette Component
 * Provides quick access to search and actions via Ctrl+K
 * WCAG 2.1 AA compliant with full keyboard navigation
 */
export default function CommandPalette({
  open,
  onOpenChange,
  onCreateTask,
}: CommandPaletteProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 200);
  
  const { data: searchResults, isLoading } = useGlobalSearch(debouncedQuery);

  // Quick actions available in command palette
  const quickActions = useMemo(() => [
    {
      id: 'new-task',
      label: t('tasks.createTask', 'Create Task'),
      icon: Plus,
      shortcut: '⌘N',
      action: () => {
        onCreateTask?.();
        onOpenChange(false);
      },
    },
    {
      id: 'dashboard',
      label: t('navigation.dashboard', 'Dashboard'),
      icon: BarChart3,
      action: () => {
        router.push('/dashboard');
        onOpenChange(false);
      },
    },
    {
      id: 'tasks',
      label: t('navigation.tasks', 'Tasks'),
      icon: CheckSquare,
      action: () => {
        router.push('/dashboard/tasks');
        onOpenChange(false);
      },
    },
    {
      id: 'workspaces',
      label: t('navigation.workspaces', 'Workspaces'),
      icon: Briefcase,
      action: () => {
        router.push('/dashboard/workspaces');
        onOpenChange(false);
      },
    },
    {
      id: 'templates',
      label: t('navigation.templates', 'Templates'),
      icon: FileText,
      action: () => {
        router.push('/dashboard/templates');
        onOpenChange(false);
      },
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      action: () => {
        router.push('/dashboard/tasks?view=calendar');
        onOpenChange(false);
      },
    },
    {
      id: 'settings',
      label: t('common.settings', 'Settings'),
      icon: Settings,
      action: () => {
        router.push('/dashboard/settings');
        onOpenChange(false);
      },
    },
    {
      id: 'toggle-theme',
      label: theme === 'dark' 
        ? t('theme.light', 'Light Mode') 
        : t('theme.dark', 'Dark Mode'),
      icon: theme === 'dark' ? Sun : Moon,
      action: () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
        onOpenChange(false);
      },
    },
  ], [t, theme, setTheme, router, onCreateTask, onOpenChange]);

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  // Clear search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
    }
  }, [open]);

  // Navigate to task
  const handleTaskSelect = useCallback((taskId: string) => {
    router.push(`/dashboard/tasks/${taskId}`);
    onOpenChange(false);
  }, [router, onOpenChange]);

  // Navigate to workspace
  const handleWorkspaceSelect = useCallback((workspaceSlug: string) => {
    router.push(`/dashboard/workspaces/${workspaceSlug}`);
    onOpenChange(false);
  }, [router, onOpenChange]);

  // Navigate to user profile
  const handleUserSelect = useCallback((userId: string) => {
    router.push(`/profile/${userId}`);
    onOpenChange(false);
  }, [router, onOpenChange]);

  const hasSearchResults = searchResults && (
    searchResults.tasks.length > 0 ||
    searchResults.workspaces.length > 0 ||
    searchResults.users.length > 0
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command 
        className="rounded-lg border shadow-md"
        aria-label={t('commandPalette.title', 'Command Palette')}
      >
        <CommandInput
          placeholder={t('commandPalette.placeholder', 'Type a command or search...')}
          value={searchQuery}
          onValueChange={handleSearchChange}
          aria-label={t('common.search', 'Search')}
        />
        <CommandList aria-live="polite" aria-busy={isLoading}>
          <CommandEmpty>
            {isLoading 
              ? t('common.loading', 'Loading...')
              : t('commandPalette.noResults', 'No results found')
            }
          </CommandEmpty>

          {/* Search Results */}
          {hasSearchResults && (
            <>
              {/* Tasks */}
              {searchResults.tasks.length > 0 && (
                <CommandGroup heading={t('commandPalette.tasks', 'Tasks')}>
                  {searchResults.tasks.map((task) => (
                    <CommandItem
                      key={task.id}
                      value={`task-${task.id}`}
                      onSelect={() => handleTaskSelect(task.id)}
                      className="flex items-center gap-2"
                    >
                      <CheckSquare className="h-4 w-4 text-[var(--accent-color)]" aria-hidden="true" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="truncate">{task.title}</span>
                        <span className="text-xs text-[var(--text-tertiary)] truncate">
                          {task.status} • {task.priority}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Workspaces */}
              {searchResults.workspaces.length > 0 && (
                <CommandGroup heading={t('commandPalette.workspaces', 'Workspaces')}>
                  {searchResults.workspaces.map((workspace) => (
                    <CommandItem
                      key={workspace.id}
                      value={`workspace-${workspace.id}`}
                      onSelect={() => handleWorkspaceSelect(workspace.slug)}
                      className="flex items-center gap-2"
                    >
                      <Briefcase className="h-4 w-4 text-purple-500" aria-hidden="true" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="truncate">{workspace.name}</span>
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {workspace._count.members} members • {workspace._count.tasks} tasks
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Users */}
              {searchResults.users.length > 0 && (
                <CommandGroup heading={t('commandPalette.users', 'Users')}>
                  {searchResults.users.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={`user-${user.id}`}
                      onSelect={() => handleUserSelect(user.id)}
                      className="flex items-center gap-2"
                    >
                      <User className="h-4 w-4 text-green-500" aria-hidden="true" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="truncate">{user.name}</span>
                        <span className="text-xs text-[var(--text-tertiary)] truncate">
                          {user.email}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              <CommandSeparator />
            </>
          )}

          {/* Quick Actions */}
          <CommandGroup heading={t('commandPalette.actions', 'Actions')}>
            {quickActions.map((action) => (
              <CommandItem
                key={action.id}
                value={action.id}
                onSelect={action.action}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <action.icon className="h-4 w-4" aria-hidden="true" />
                  <span>{action.label}</span>
                </div>
                {action.shortcut && (
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    {action.shortcut}
                  </kbd>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
