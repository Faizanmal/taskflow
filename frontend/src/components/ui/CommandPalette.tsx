'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  Search,
  FileText,
  Folder,
  User,
  Plus,
  Settings,
  LogOut,
  Moon,
  Sun,
  Keyboard,
} from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { useGlobalSearch } from '@/hooks/useSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { useTheme } from 'next-themes';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTask?: () => void;
}

export function CommandPalette({ open, onOpenChange, onCreateTask }: CommandPaletteProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 200);

  const { data: searchResults, isLoading } = useGlobalSearch(debouncedQuery);

  // Quick actions
  const quickActions = useMemo(() => [
    {
      id: 'create-task',
      label: t('tasks.createTask', 'Create Task'),
      icon: Plus,
      shortcut: '⌘N',
      action: () => {
        onOpenChange(false);
        onCreateTask?.();
      },
    },
    {
      id: 'toggle-theme',
      label: theme === 'dark' 
        ? t('theme.light', 'Switch to Light Mode') 
        : t('theme.dark', 'Switch to Dark Mode'),
      icon: theme === 'dark' ? Sun : Moon,
      action: () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
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
      id: 'shortcuts',
      label: 'Keyboard Shortcuts',
      icon: Keyboard,
      shortcut: '?',
      action: () => {
        // Show keyboard shortcuts modal
        onOpenChange(false);
      },
    },
  ], [t, theme, setTheme, router, onOpenChange, onCreateTask]);

  // Handle keyboard navigation and selection
  const handleSelect = useCallback((value: string) => {
    // Parse the value to determine action
    const [type, id] = value.split(':');
    
    switch (type) {
      case 'task':
        router.push(`/dashboard/tasks?taskId=${id}`);
        break;
      case 'workspace':
        router.push(`/dashboard/workspaces/${id}`);
        break;
      case 'user':
        router.push(`/dashboard/workspaces?userId=${id}`);
        break;
      case 'action':
        const action = quickActions.find(a => a.id === id);
        action?.action();
        return; // Don't close, action handles it
      default:
        break;
    }
    
    onOpenChange(false);
  }, [router, onOpenChange, quickActions]);

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder={t('commandPalette.placeholder', 'Type a command or search...')}
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {isLoading 
            ? t('common.loading', 'Loading...') 
            : t('commandPalette.noResults', 'No results found')}
        </CommandEmpty>

        {/* Quick Actions - always visible */}
        {!query && (
          <CommandGroup heading={t('commandPalette.actions', 'Actions')}>
            {quickActions.map((action) => (
              <CommandItem
                key={action.id}
                value={`action:${action.id}`}
                onSelect={() => action.action()}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <action.icon className="h-4 w-4" aria-hidden="true" />
                  <span>{action.label}</span>
                </div>
                {action.shortcut && (
                  <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    {action.shortcut}
                  </kbd>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Search Results */}
        {searchResults && (
          <>
            {/* Tasks */}
            {searchResults.tasks.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading={t('commandPalette.tasks', 'Tasks')}>
                  {searchResults.tasks.map((task) => (
                    <CommandItem
                      key={task.id}
                      value={`task:${task.id}`}
                      onSelect={handleSelect}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4 text-[var(--accent-color)]" aria-hidden="true" />
                      <div className="flex flex-col">
                        <span>{task.title}</span>
                        {task.workspace && (
                          <span className="text-xs text-[var(--text-tertiary)]">
                            {task.workspace.name}
                          </span>
                        )}
                      </div>
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                        task.status === 'COMPLETED' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : task.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {task.status}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {/* Workspaces */}
            {searchResults.workspaces.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading={t('commandPalette.workspaces', 'Workspaces')}>
                  {searchResults.workspaces.map((workspace) => (
                    <CommandItem
                      key={workspace.id}
                      value={`workspace:${workspace.id}`}
                      onSelect={handleSelect}
                      className="flex items-center gap-2"
                    >
                      <Folder className="h-4 w-4 text-orange-500" aria-hidden="true" />
                      <div className="flex flex-col">
                        <span>{workspace.name}</span>
                        {workspace.description && (
                          <span className="text-xs text-[var(--text-tertiary)] line-clamp-1">
                            {workspace.description}
                          </span>
                        )}
                      </div>
                      <span className="ml-auto text-xs text-[var(--text-tertiary)]">
                        {workspace._count.members} members
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {/* Users */}
            {searchResults.users.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading={t('commandPalette.users', 'Users')}>
                  {searchResults.users.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={`user:${user.id}`}
                      onSelect={handleSelect}
                      className="flex items-center gap-2"
                    >
                      <User className="h-4 w-4 text-purple-500" aria-hidden="true" />
                      <div className="flex flex-col">
                        <span>{user.name}</span>
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {user.email}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

export default CommandPalette;
