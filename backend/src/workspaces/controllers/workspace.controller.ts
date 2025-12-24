import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WorkspaceService } from '../services/workspace.service';
import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  InviteMemberDto,
  UpdateMemberRoleDto,
  RespondToInviteDto,
} from '../dto/workspace.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

/**
 * Workspace Controller - Handles workspace CRUD endpoints
 */
@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  /**
   * POST /workspaces - Create a new workspace
   */
  @Post()
  async create(
    @Body() dto: CreateWorkspaceDto,
    @CurrentUser('id') userId: string,
  ) {
    const workspace = await this.workspaceService.create(dto, userId);
    return {
      success: true,
      message: 'Workspace created successfully',
      data: { workspace },
    };
  }

  /**
   * GET /workspaces - Get all workspaces for user
   */
  @Get()
  async findAll(@CurrentUser('id') userId: string) {
    const workspaces = await this.workspaceService.findAllForUser(userId);
    return {
      success: true,
      data: { workspaces },
    };
  }

  /**
   * GET /workspaces/invites - Get pending invites for current user
   */
  @Get('invites')
  async getMyInvites(@CurrentUser('email') email: string) {
    const invites = await this.workspaceService.getMyInvites(email);
    return {
      success: true,
      data: { invites },
    };
  }

  /**
   * POST /workspaces/invites/respond - Respond to invite
   */
  @Post('invites/respond')
  async respondToInvite(
    @Body() dto: RespondToInviteDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('email') email: string,
  ) {
    await this.workspaceService.respondToInvite(
      dto.token,
      dto.response,
      userId,
      email,
    );
    return {
      success: true,
      message: `Invite ${dto.response.toLowerCase()} successfully`,
    };
  }

  /**
   * GET /workspaces/:id - Get workspace by ID
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    const workspace = await this.workspaceService.findOne(id, userId);
    return {
      success: true,
      data: { workspace },
    };
  }

  /**
   * GET /workspaces/slug/:slug - Get workspace by slug
   */
  @Get('slug/:slug')
  async findBySlug(
    @Param('slug') slug: string,
    @CurrentUser('id') userId: string,
  ) {
    const workspace = await this.workspaceService.findBySlug(slug, userId);
    return {
      success: true,
      data: { workspace },
    };
  }

  /**
   * PATCH /workspaces/:id - Update workspace
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkspaceDto,
    @CurrentUser('id') userId: string,
  ) {
    const workspace = await this.workspaceService.update(id, dto, userId);
    return {
      success: true,
      message: 'Workspace updated successfully',
      data: { workspace },
    };
  }

  /**
   * DELETE /workspaces/:id - Delete workspace
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.workspaceService.delete(id, userId);
    return {
      success: true,
      message: 'Workspace deleted successfully',
    };
  }

  /**
   * POST /workspaces/:id/invite - Invite member to workspace
   */
  @Post(':id/invite')
  async inviteMember(
    @Param('id') id: string,
    @Body() dto: InviteMemberDto,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.workspaceService.inviteMember(id, dto, userId);
    return {
      success: true,
      message: 'Invite sent successfully',
      data: result,
    };
  }

  /**
   * GET /workspaces/:id/invites - Get pending invites for workspace
   */
  @Get(':id/invites')
  async getPendingInvites(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    const invites = await this.workspaceService.getPendingInvites(id, userId);
    return {
      success: true,
      data: { invites },
    };
  }

  /**
   * PATCH /workspaces/:id/members/:memberId - Update member role
   */
  @Patch(':id/members/:memberId')
  async updateMemberRole(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberRoleDto,
    @CurrentUser('id') userId: string,
  ) {
    const member = await this.workspaceService.updateMemberRole(
      id,
      memberId,
      dto,
      userId,
    );
    return {
      success: true,
      message: 'Member role updated successfully',
      data: { member },
    };
  }

  /**
   * DELETE /workspaces/:id/members/:memberId - Remove member from workspace
   */
  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.OK)
  async removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.workspaceService.removeMember(id, memberId, userId);
    return {
      success: true,
      message: 'Member removed successfully',
    };
  }

  /**
   * POST /workspaces/:id/leave - Leave workspace
   */
  @Post(':id/leave')
  @HttpCode(HttpStatus.OK)
  async leave(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.workspaceService.leave(id, userId);
    return {
      success: true,
      message: 'Left workspace successfully',
    };
  }

  /**
   * GET /workspaces/:id/analytics - Get workspace analytics
   */
  @Get(':id/analytics')
  async getAnalytics(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    const analytics = await this.workspaceService.getAnalytics(id, userId);
    return {
      success: true,
      data: { analytics },
    };
  }
}
