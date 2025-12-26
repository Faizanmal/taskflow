import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SavedFilter, Prisma } from '@prisma/client';

/**
 * Saved Filter Repository
 */
@Injectable()
export class SavedFilterRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a saved filter
   */
  async create(data: {
    name: string;
    description?: string;
    filters: string;
    viewType?: string;
    isDefault?: boolean;
    isShared?: boolean;
    userId?: string;
    workspaceId?: string;
  }): Promise<SavedFilter> {
    return this.prisma.savedFilter.create({
      data: {
        name: data.name,
        description: data.description || null,
        filters: data.filters,
        viewType: data.viewType || 'LIST',
        isDefault: data.isDefault ?? false,
        isShared: data.isShared ?? false,
        userId: data.userId || null,
        workspaceId: data.workspaceId || null,
      },
    });
  }

  /**
   * Find filter by ID
   */
  async findById(id: string): Promise<SavedFilter | null> {
    return this.prisma.savedFilter.findUnique({
      where: { id },
    });
  }

  /**
   * Find filters for user
   */
  async findForUser(
    userId: string,
    workspaceId?: string,
  ): Promise<SavedFilter[]> {
    if (workspaceId) {
      return this.prisma.savedFilter.findMany({
        where: {
          OR: [
            { workspaceId, isShared: true },
            { userId, workspaceId },
          ],
        },
        orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      });
    }

    return this.prisma.savedFilter.findMany({
      where: {
        userId,
        workspaceId: null,
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  /**
   * Update a filter
   */
  async update(
    id: string,
    data: Prisma.SavedFilterUpdateInput,
  ): Promise<SavedFilter> {
    return this.prisma.savedFilter.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a filter
   */
  async delete(id: string): Promise<SavedFilter> {
    return this.prisma.savedFilter.delete({
      where: { id },
    });
  }

  /**
   * Clear default for user
   */
  async clearDefaultForUser(
    userId: string,
    workspaceId?: string,
  ): Promise<void> {
    await this.prisma.savedFilter.updateMany({
      where: {
        userId,
        workspaceId: workspaceId || null,
        isDefault: true,
      },
      data: { isDefault: false },
    });
  }
}
