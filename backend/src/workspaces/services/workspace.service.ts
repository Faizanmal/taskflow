import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  WorkspaceRepository,
  WorkspaceWithMembers,
} from '../repositories/workspace.repository';
import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  InviteMemberDto,
  UpdateMemberRoleDto,
} from '../dto/workspace.dto';
import { EventsGateway } from '../../events/events.gateway';
import { NotificationService } from '../../notifications/services/notification.service';

/**
 * Workspace Service - Business logic for workspace management
 */
@Injectable()
export class WorkspaceService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly eventsGateway: EventsGateway,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Generate a unique slug from workspace name
   */
  private generateSlug(name: string): string {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `${baseSlug}-${uuidv4().slice(0, 8)}`;
  }

  /**
   * Create a new workspace
   */
  async create(
    dto: CreateWorkspaceDto,
    creatorId: string,
  ): Promise<WorkspaceWithMembers> {
    const slug = this.generateSlug(dto.name);

    const workspace = await this.workspaceRepository.create({
      name: dto.name,
      slug,
      creatorId,
      ...(dto.description && { description: dto.description }),
      ...(dto.avatar && { avatar: dto.avatar }),
    });

    return workspace;
  }

  /**
   * Get all workspaces for user
   */
  async findAllForUser(userId: string): Promise<WorkspaceWithMembers[]> {
    return this.workspaceRepository.findAllForUser(userId);
  }

  /**
   * Get workspace by ID
   */
  async findOne(id: string, userId: string): Promise<WorkspaceWithMembers> {
    const workspace = await this.workspaceRepository.findById(id);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    // Check if user is a member
    const isMember = await this.workspaceRepository.isMember(id, userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    return workspace;
  }

  /**
   * Get workspace by slug
   */
  async findBySlug(slug: string, userId: string): Promise<WorkspaceWithMembers> {
    const workspace = await this.workspaceRepository.findBySlug(slug);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const isMember = await this.workspaceRepository.isMember(
      workspace.id,
      userId,
    );
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    return workspace;
  }

  /**
   * Update workspace
   */
  async update(
    id: string,
    dto: UpdateWorkspaceDto,
    userId: string,
  ): Promise<WorkspaceWithMembers> {
    const role = await this.workspaceRepository.getMemberRole(id, userId);

    if (!role) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    if (role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can update workspace settings');
    }

    const workspace = await this.workspaceRepository.update(id, {
      ...(dto.name && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.avatar !== undefined && { avatar: dto.avatar }),
    });

    // Emit real-time update
    this.eventsGateway.emitWorkspaceUpdated(workspace);

    return workspace;
  }

  /**
   * Delete workspace
   */
  async delete(id: string, userId: string): Promise<void> {
    const role = await this.workspaceRepository.getMemberRole(id, userId);

    if (!role) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    if (role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can delete the workspace');
    }

    await this.workspaceRepository.delete(id);
  }

  /**
   * Invite member to workspace
   */
  async inviteMember(
    workspaceId: string,
    dto: InviteMemberDto,
    inviterId: string,
  ): Promise<{ token: string; expiresAt: Date }> {
    const role = await this.workspaceRepository.getMemberRole(
      workspaceId,
      inviterId,
    );

    if (!role) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    if (role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can invite members');
    }

    // Check if already a member by email
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const existingMember = workspace.members.find(
      (m) => m.user.email === dto.email,
    );
    if (existingMember) {
      throw new ConflictException('User is already a member of this workspace');
    }

    // Generate invite token
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    await this.workspaceRepository.createInvite({
      workspaceId,
      email: dto.email,
      role: dto.role || 'MEMBER',
      token,
      invitedById: inviterId,
      expiresAt,
    });

    // TODO: Send email notification

    return { token, expiresAt };
  }

  /**
   * Get pending invites for workspace
   */
  async getPendingInvites(workspaceId: string, userId: string) {
    const role = await this.workspaceRepository.getMemberRole(
      workspaceId,
      userId,
    );

    if (!role || role === 'VIEWER') {
      throw new ForbiddenException(
        'You do not have permission to view invites',
      );
    }

    return this.workspaceRepository.findPendingInvites(workspaceId);
  }

  /**
   * Get invites for current user
   */
  async getMyInvites(email: string) {
    return this.workspaceRepository.findInvitesForEmail(email);
  }

  /**
   * Respond to invite
   */
  async respondToInvite(
    token: string,
    response: 'ACCEPTED' | 'DECLINED',
    userId: string,
    userEmail: string,
  ) {
    const invite = await this.workspaceRepository.findInviteByToken(token);

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.status !== 'PENDING') {
      throw new BadRequestException('This invite has already been processed');
    }

    if (invite.expiresAt < new Date()) {
      await this.workspaceRepository.updateInviteStatus(invite.id, 'EXPIRED');
      throw new BadRequestException('This invite has expired');
    }

    if (invite.email !== userEmail) {
      throw new ForbiddenException('This invite is for a different email');
    }

    if (response === 'ACCEPTED') {
      // Add user to workspace
      await this.workspaceRepository.addMember(
        invite.workspaceId,
        userId,
        invite.role,
      );

      // Notify workspace admins
      const workspace = await this.workspaceRepository.findById(
        invite.workspaceId,
      );
      if (workspace) {
        const admins = workspace.members.filter((m) => m.role === 'ADMIN');
        for (const admin of admins) {
          await this.notificationService.create({
            userId: admin.userId,
            type: 'WORKSPACE_MEMBER_JOINED',
            message: `A new member joined ${workspace.name}`,
            data: JSON.stringify({
              workspaceId: workspace.id,
              workspaceName: workspace.name,
            }),
          });
        }
      }
    }

    await this.workspaceRepository.updateInviteStatus(
      invite.id,
      response,
      response === 'ACCEPTED' ? userId : undefined,
    );

    return { success: true };
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    workspaceId: string,
    memberId: string,
    dto: UpdateMemberRoleDto,
    userId: string,
  ) {
    const role = await this.workspaceRepository.getMemberRole(
      workspaceId,
      userId,
    );

    if (!role) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    if (role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can change member roles');
    }

    // Prevent demoting the last admin
    if (dto.role !== 'ADMIN') {
      const workspace = await this.workspaceRepository.findById(workspaceId);
      const admins = workspace?.members.filter((m) => m.role === 'ADMIN') ?? [];
      const firstAdmin = admins[0];
      if (admins.length === 1 && firstAdmin && firstAdmin.userId === memberId) {
        throw new BadRequestException(
          'Cannot demote the last admin. Promote another admin first.',
        );
      }
    }

    return this.workspaceRepository.updateMemberRole(
      workspaceId,
      memberId,
      dto.role,
    );
  }

  /**
   * Remove member from workspace
   */
  async removeMember(workspaceId: string, memberId: string, userId: string) {
    const role = await this.workspaceRepository.getMemberRole(
      workspaceId,
      userId,
    );

    if (!role) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    // Users can remove themselves
    if (memberId !== userId && role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can remove other members');
    }

    // Prevent removing the last admin
    const workspace = await this.workspaceRepository.findById(workspaceId);
    const admins = workspace?.members.filter((m) => m.role === 'ADMIN') ?? [];
    const firstAdmin = admins[0];
    if (admins.length === 1 && firstAdmin && firstAdmin.userId === memberId) {
      throw new BadRequestException(
        'Cannot remove the last admin. Promote another admin first or delete the workspace.',
      );
    }

    await this.workspaceRepository.removeMember(workspaceId, memberId);

    return { success: true };
  }

  /**
   * Get workspace analytics
   */
  async getAnalytics(workspaceId: string, userId: string) {
    const role = await this.workspaceRepository.getMemberRole(
      workspaceId,
      userId,
    );

    if (!role) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    return this.workspaceRepository.getAnalytics(workspaceId);
  }

  /**
   * Leave workspace
   */
  async leave(workspaceId: string, userId: string) {
    return this.removeMember(workspaceId, userId, userId);
  }
}
