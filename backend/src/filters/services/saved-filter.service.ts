import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SavedFilterRepository } from '../repositories/saved-filter.repository';
import {
  CreateSavedFilterDto,
  UpdateSavedFilterDto,
} from '../dto/saved-filter.dto';
import { SavedFilter } from '@prisma/client';

/**
 * Saved Filter Service
 */
@Injectable()
export class SavedFilterService {
  constructor(private readonly filterRepository: SavedFilterRepository) {}

  /**
   * Create a saved filter
   */
  async create(
    dto: CreateSavedFilterDto,
    userId: string,
  ): Promise<SavedFilter> {
    // If setting as default, clear other defaults
    if (dto.isDefault) {
      await this.filterRepository.clearDefaultForUser(userId, dto.workspaceId);
    }

    return this.filterRepository.create({
      name: dto.name,
      filters: dto.filters,
      userId,
      ...(dto.description && { description: dto.description }),
      ...(dto.viewType && { viewType: dto.viewType }),
      ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
      ...(dto.isShared !== undefined && { isShared: dto.isShared }),
      ...(dto.workspaceId && { workspaceId: dto.workspaceId }),
    });
  }

  /**
   * Get filters for user
   */
  async findForUser(
    userId: string,
    workspaceId?: string,
  ): Promise<SavedFilter[]> {
    return this.filterRepository.findForUser(userId, workspaceId);
  }

  /**
   * Get filter by ID
   */
  async findOne(id: string, userId: string): Promise<SavedFilter> {
    const filter = await this.filterRepository.findById(id);

    if (!filter) {
      throw new NotFoundException('Filter not found');
    }

    if (filter.userId !== userId && !filter.isShared) {
      throw new ForbiddenException('You do not have access to this filter');
    }

    return filter;
  }

  /**
   * Update a filter
   */
  async update(
    id: string,
    dto: UpdateSavedFilterDto,
    userId: string,
  ): Promise<SavedFilter> {
    const filter = await this.filterRepository.findById(id);

    if (!filter) {
      throw new NotFoundException('Filter not found');
    }

    if (filter.userId !== userId) {
      throw new ForbiddenException('You can only edit your own filters');
    }

    // If setting as default, clear other defaults
    if (dto.isDefault) {
      await this.filterRepository.clearDefaultForUser(
        userId,
        filter.workspaceId || undefined,
      );
    }

    return this.filterRepository.update(id, {
      ...(dto.name && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.filters && { filters: dto.filters }),
      ...(dto.viewType && { viewType: dto.viewType }),
      ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
      ...(dto.isShared !== undefined && { isShared: dto.isShared }),
    });
  }

  /**
   * Delete a filter
   */
  async delete(id: string, userId: string): Promise<void> {
    const filter = await this.filterRepository.findById(id);

    if (!filter) {
      throw new NotFoundException('Filter not found');
    }

    if (filter.userId !== userId) {
      throw new ForbiddenException('You can only delete your own filters');
    }

    await this.filterRepository.delete(id);
  }
}
