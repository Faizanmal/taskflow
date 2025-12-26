'use client';

import { useRouter } from 'next/navigation';
import {
  Building2,
  Check,
  ChevronDown,
  Plus,
  Users,
} from 'lucide-react';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface WorkspaceSelectorProps {
  currentWorkspaceId?: string;
  onWorkspaceChange?: (workspaceId: string | null) => void;
  className?: string;
}

export function WorkspaceSelector({
  currentWorkspaceId,
  onWorkspaceChange,
  className,
}: WorkspaceSelectorProps) {
  const router = useRouter();
  const { data: workspaces = [], isLoading } = useWorkspaces();

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId);

  const handleSelectWorkspace = (workspaceId: string | null) => {
    onWorkspaceChange?.(workspaceId);
    if (workspaceId) {
      router.push(`/dashboard/workspaces/${workspaceId}`);
    } else {
      router.push('/dashboard');
    }
  };

  if (isLoading) {
    return (
      <div className={cn('h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse', className)} />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn('justify-between gap-2 min-w-[200px]', className)}
        >
          <div className="flex items-center gap-2">
            {currentWorkspace ? (
              <>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={currentWorkspace.avatar ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {currentWorkspace.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate max-w-[120px]">{currentWorkspace.name}</span>
              </>
            ) : (
              <>
                <Building2 className="h-4 w-4" />
                <span>All Tasks</span>
              </>
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px]">
        {/* Personal/All Tasks option */}
        <DropdownMenuItem
          onClick={() => handleSelectWorkspace(null)}
          className="flex items-center gap-2"
        >
          <Building2 className="h-4 w-4" />
          <span>All Tasks</span>
          {!currentWorkspaceId && <Check className="h-4 w-4 ml-auto" />}
        </DropdownMenuItem>

        {workspaces.length > 0 && <DropdownMenuSeparator />}

        {/* Workspaces list */}
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => handleSelectWorkspace(workspace.id)}
            className="flex items-center gap-2"
          >
            <Avatar className="h-5 w-5">
              <AvatarImage src={workspace.avatar ?? undefined} />
              <AvatarFallback className="text-xs">
                {workspace.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="truncate flex-1">{workspace.name}</span>
            {workspace._count && (
              <span className="text-xs text-gray-500">
                {workspace._count.members} members
              </span>
            )}
            {currentWorkspaceId === workspace.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* Create new workspace */}
        <DropdownMenuItem
          onClick={() => router.push('/dashboard/workspaces/new')}
          className="flex items-center gap-2 text-accent"
          style={{ color: 'var(--accent-color)' }}
        >
          <Plus className="h-4 w-4" />
          <span>Create Workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface WorkspaceMembersListProps {
  workspaceId: string;
  className?: string;
}

export function WorkspaceMembersList({ workspaceId, className }: WorkspaceMembersListProps) {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => router.push(`/dashboard/workspaces/${workspaceId}/members`)}
      className={className}
    >
      <Users className="h-4 w-4 mr-2" />
      Members
    </Button>
  );
}
