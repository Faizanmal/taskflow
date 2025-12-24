import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspacesAPI } from '@/lib/api';
import {
  Workspace,
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  InviteMemberInput,
  WorkspaceAnalytics,
  WorkspaceRole,
} from '@/lib/types';

// Query keys
export const workspaceKeys = {
  all: ['workspaces'] as const,
  lists: () => [...workspaceKeys.all, 'list'] as const,
  list: () => [...workspaceKeys.lists()] as const,
  details: () => [...workspaceKeys.all, 'detail'] as const,
  detail: (id: string) => [...workspaceKeys.details(), id] as const,
  analytics: (id: string) => [...workspaceKeys.all, 'analytics', id] as const,
};

// Fetch all workspaces for current user
export function useWorkspaces() {
  return useQuery({
    queryKey: workspaceKeys.list(),
    queryFn: async () => {
      const response = await workspacesAPI.list();
      return response.data.data.workspaces as Workspace[];
    },
  });
}

// Fetch single workspace
export function useWorkspace(id: string) {
  return useQuery({
    queryKey: workspaceKeys.detail(id),
    queryFn: async () => {
      const response = await workspacesAPI.get(id);
      return response.data.data.workspace as Workspace;
    },
    enabled: !!id,
  });
}

// Fetch workspace analytics
export function useWorkspaceAnalytics(id: string) {
  return useQuery({
    queryKey: workspaceKeys.analytics(id),
    queryFn: async () => {
      const response = await workspacesAPI.getAnalytics(id);
      return response.data.data as WorkspaceAnalytics;
    },
    enabled: !!id,
  });
}

// Create workspace mutation
export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWorkspaceInput) => {
      const response = await workspacesAPI.create(data);
      return response.data.data.workspace as Workspace;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}

// Update workspace mutation
export function useUpdateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateWorkspaceInput }) => {
      const response = await workspacesAPI.update(id, data);
      return response.data.data.workspace as Workspace;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(id) });
    },
  });
}

// Delete workspace mutation
export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await workspacesAPI.delete(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}

// Invite member mutation
export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workspaceId, data }: { workspaceId: string; data: InviteMemberInput }) => {
      const response = await workspacesAPI.inviteMember(workspaceId, data);
      return response.data.data;
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(workspaceId) });
    },
  });
}

// Accept invite mutation
export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const response = await workspacesAPI.acceptInvite(token);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}

// Get invite details
export function useInviteDetails(token: string) {
  return useQuery({
    queryKey: ['workspace-invite', token],
    queryFn: async () => {
      const response = await workspacesAPI.getInvite(token);
      return response.data.data;
    },
    enabled: !!token,
  });
}

// Update member role mutation
export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workspaceId,
      memberId,
      role,
    }: {
      workspaceId: string;
      memberId: string;
      role: WorkspaceRole;
    }) => {
      const response = await workspacesAPI.updateMemberRole(workspaceId, memberId, role);
      return response.data.data;
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(workspaceId) });
    },
  });
}

// Remove member mutation
export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workspaceId, memberId }: { workspaceId: string; memberId: string }) => {
      await workspacesAPI.removeMember(workspaceId, memberId);
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(workspaceId) });
    },
  });
}

// Leave workspace mutation
export function useLeaveWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workspaceId: string) => {
      await workspacesAPI.leave(workspaceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}
