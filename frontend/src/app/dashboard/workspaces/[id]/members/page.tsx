'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  UserPlus,
  Mail,
  Crown,
  Shield,
  User,
  MoreVertical,
  Trash2,
  Loader2,
  Copy,
  Check,
  Clock,
} from 'lucide-react';
import {
  useWorkspace,
  useInviteMember,
  useUpdateMemberRole,
  useRemoveMember,
} from '@/hooks/useWorkspaces';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/radix-select';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

const ROLE_INFO: Record<Role, { label: string; icon: typeof Crown; color: string; description: string }> = {
  OWNER: { label: 'Owner', icon: Crown, color: 'text-yellow-500', description: 'Full control' },
  ADMIN: { label: 'Admin', icon: Shield, color: 'text-purple-500', description: 'Can manage members' },
  MEMBER: { label: 'Member', icon: User, color: 'text-blue-500', description: 'Can create and edit tasks' },
  VIEWER: { label: 'Viewer', icon: User, color: 'text-gray-500', description: 'Read-only access' },
};

export default function WorkspaceMembersPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const { user } = useAuth();

  const { data: workspace, isLoading } = useWorkspace(workspaceId);
  const inviteMember = useInviteMember();
  const updateRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('MEMBER');

  const currentUserMember = workspace?.members?.find((m) => m.user.id === user?.id);
  const canManageMembers = currentUserMember?.role === 'OWNER' || currentUserMember?.role === 'ADMIN';

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      await inviteMember.mutateAsync({
        workspaceId,
        data: { email: inviteEmail, role: inviteRole },
      });
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setIsInviteOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invitation');
    }
  };

  const handleUpdateRole = async (userId: string, newRole: Role) => {
    try {
      await updateRole.mutateAsync({
        workspaceId,
        userId,
        role: newRole,
      });
      toast.success('Role updated');
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleRemoveMember = async (userId: string, name: string) => {
    if (!confirm(`Remove ${name} from this workspace?`)) return;

    try {
      await removeMember.mutateAsync({ workspaceId, userId });
      toast.success(`${name} has been removed`);
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Workspace not found</h1>
        <Link href="/dashboard/workspaces">
          <Button>Back to Workspaces</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/dashboard/workspaces/${workspaceId}`}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Team Members
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage members of {workspace.name}
          </p>
        </div>

        {canManageMembers && (
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button className="btn-accent">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={inviteRole}
                    onValueChange={(v: Role) => setInviteRole(v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(['ADMIN', 'MEMBER', 'VIEWER'] as Role[]).map((role) => {
                        const info = ROLE_INFO[role];
                        return (
                          <SelectItem key={role} value={role}>
                            <div className="flex items-center gap-2">
                              <info.icon className={cn('h-4 w-4', info.color)} />
                              <span>{info.label}</span>
                              <span className="text-xs text-gray-500">
                                - {info.description}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full btn-accent"
                  disabled={inviteMember.isPending}
                >
                  {inviteMember.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  Send Invitation
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Members List */}
      <div className="theme-card rounded-lg divide-y divide-gray-100 dark:divide-gray-700">
        {workspace.members?.map((member) => {
          const roleInfo = ROLE_INFO[member.role as Role];
          const RoleIcon = roleInfo.icon;
          const isCurrentUser = member.user.id === user?.id;
          const isOwner = member.role === 'OWNER';

          return (
            <div
              key={member.user.id}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              {/* Avatar */}
              <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg font-medium">
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

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{member.user.name}</span>
                  {isCurrentUser && (
                    <Badge variant="secondary" className="text-xs">
                      You
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-500">{member.user.email}</div>
              </div>

              {/* Role Badge */}
              <div className="flex items-center gap-2">
                <RoleIcon className={cn('h-4 w-4', roleInfo.color)} />
                <span className="text-sm font-medium">{roleInfo.label}</span>
              </div>

              {/* Actions */}
              {canManageMembers && !isCurrentUser && !isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {(['ADMIN', 'MEMBER', 'VIEWER'] as Role[]).map((role) => {
                      if (role === member.role) return null;
                      const info = ROLE_INFO[role];
                      return (
                        <DropdownMenuItem
                          key={role}
                          onClick={() => handleUpdateRole(member.user.id, role)}
                        >
                          <info.icon className={cn('h-4 w-4 mr-2', info.color)} />
                          Make {info.label}
                        </DropdownMenuItem>
                      );
                    })}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-500"
                      onClick={() => handleRemoveMember(member.user.id, member.user.name)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        })}
      </div>

      {/* Pending Invitations */}
      {workspace.invites && workspace.invites.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Invitations
          </h2>
          <div className="theme-card rounded-lg divide-y divide-gray-100 dark:divide-gray-700">
            {workspace.invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center gap-4 p-4"
              >
                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{invite.email}</div>
                  <div className="text-sm text-gray-500">
                    Invited as {ROLE_INFO[invite.role as Role]?.label || invite.role}
                  </div>
                </div>
                <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                  Pending
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role Legend */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="font-medium mb-3">Role Permissions</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {Object.entries(ROLE_INFO).map(([role, info]) => {
            const Icon = info.icon;
            return (
              <div key={role} className="flex items-center gap-2">
                <Icon className={cn('h-4 w-4', info.color)} />
                <span className="font-medium">{info.label}:</span>
                <span className="text-sm text-gray-500">{info.description}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
