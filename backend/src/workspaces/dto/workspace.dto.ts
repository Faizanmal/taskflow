import {
  IsString,
  IsOptional,
  IsIn,
  IsEmail,
  MinLength,
  MaxLength,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for creating a new workspace
 */
export class CreateWorkspaceDto {
  @IsString()
  @MinLength(1, { message: 'Workspace name is required' })
  @MaxLength(100, { message: 'Workspace name must not exceed 100 characters' })
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

/**
 * DTO for updating a workspace
 */
export class UpdateWorkspaceDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Workspace name cannot be empty' })
  @MaxLength(100, { message: 'Workspace name must not exceed 100 characters' })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string | null;

  @IsOptional()
  @IsString()
  avatar?: string | null;
}

/**
 * DTO for inviting a member to workspace
 */
export class InviteMemberDto {
  @IsEmail({}, { message: 'Valid email is required' })
  email!: string;

  @IsOptional()
  @IsIn(['ADMIN', 'MEMBER', 'VIEWER'], { message: 'Invalid role' })
  role?: string;
}

/**
 * DTO for bulk inviting members
 */
export class BulkInviteMembersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InviteMemberDto)
  invites!: InviteMemberDto[];
}

/**
 * DTO for updating member role
 */
export class UpdateMemberRoleDto {
  @IsIn(['ADMIN', 'MEMBER', 'VIEWER'], { message: 'Invalid role' })
  role!: string;
}

/**
 * DTO for accepting/declining invite
 */
export class RespondToInviteDto {
  @IsString()
  token!: string;

  @IsIn(['ACCEPTED', 'DECLINED'], { message: 'Invalid response' })
  response!: 'ACCEPTED' | 'DECLINED';
}

export * from './workspace.dto';
