'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Users,
  FolderKanban,
  Settings,
  Search,
  Loader2,
  MoreVertical,
  Trash2,
  LogOut,
} from 'lucide-react';
import { useWorkspaces, useDeleteWorkspace, useLeaveWorkspace } from '@/hooks/useWorkspaces';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function WorkspacesPage() {
  const { user } = useAuth();
  const { data: workspaces = [], isLoading } = useWorkspaces();
  const deleteWorkspace = useDeleteWorkspace();
  const leaveWorkspace = useLeaveWorkspace();
  const [search, setSearch] = useState('');

  const filteredWorkspaces = workspaces.filter((ws) =>
    ws.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteWorkspace.mutateAsync(id);
      toast.success('Workspace deleted');
    } catch (error) {
      toast.error('Failed to delete workspace');
    }
  };

  const handleLeave = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to leave "${name}"?`)) {
      return;
    }

    try {
      await leaveWorkspace.mutateAsync(id);
      toast.success('Left workspace');
    } catch (error) {
      toast.error('Failed to leave workspace');
    }
  };

  const isOwner = (ownerId: string) => user?.id === ownerId;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <FolderKanban className="h-8 w-8" />
            Workspaces
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Organize your projects and collaborate with teams
          </p>
        </div>
        <Link href="/dashboard/workspaces/new">
          <Button className="btn-accent">
            <Plus className="h-4 w-4 mr-2" />
            New Workspace
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search workspaces..."
          className="pl-10"
        />
      </div>

      {filteredWorkspaces.length === 0 ? (
        <div className="text-center py-12 theme-card rounded-lg">
          <FolderKanban className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-medium mb-2">No workspaces found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {search
              ? 'Try a different search term'
              : 'Create your first workspace to get started'}
          </p>
          {!search && (
            <Link href="/dashboard/workspaces/new">
              <Button className="btn-accent">
                <Plus className="h-4 w-4 mr-2" />
                Create Workspace
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredWorkspaces.map((workspace) => (
            <div
              key={workspace.id}
              className="theme-card rounded-lg p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-start justify-between">
                <Link href={`/dashboard/workspaces/${workspace.id}`} className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {workspace.icon ? (
                      <span className="text-3xl">{workspace.icon}</span>
                    ) : (
                      <div
                        className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: workspace.color || 'var(--accent-color)' }}
                      >
                        {workspace.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">{workspace.name}</h3>
                      {isOwner(workspace.ownerId) && (
                        <Badge variant="secondary" className="text-xs">
                          Owner
                        </Badge>
                      )}
                    </div>
                  </div>

                  {workspace.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                      {workspace.description}
                    </p>
                  )}
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/workspaces/${workspace.id}/settings`}>
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    {isOwner(workspace.ownerId) ? (
                      <DropdownMenuItem
                        className="text-red-500"
                        onClick={() => handleDelete(workspace.id, workspace.name)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        className="text-red-500"
                        onClick={() => handleLeave(workspace.id, workspace.name)}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Leave
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="h-4 w-4" />
                  <span>{workspace._count.members} members</span>
                </div>
                <div className="text-sm text-gray-500">
                  {workspace._count.tasks} tasks
                </div>
              </div>

              {/* Member avatars */}
              {workspace.members && workspace.members.length > 0 && (
                <div className="flex -space-x-2 mt-4">
                  {workspace.members.slice(0, 5).map((member) => (
                    <div
                      key={member.user.id}
                      className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium"
                      title={member.user.name}
                    >
                      {member.user.avatar ? (
                        <img
                          src={member.user.avatar}
                          alt={member.user.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        member.user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                  ))}
                  {workspace.members.length > 5 && (
                    <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium">
                      +{workspace.members.length - 5}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
