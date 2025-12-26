import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SavedFilterService } from '../services/saved-filter.service';
import {
  CreateSavedFilterDto,
  UpdateSavedFilterDto,
} from '../dto/saved-filter.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

/**
 * Saved Filter Controller
 */
@Controller('filters')
@UseGuards(JwtAuthGuard)
export class SavedFilterController {
  constructor(private readonly filterService: SavedFilterService) {}

  /**
   * POST /filters - Create a saved filter
   */
  @Post()
  async create(
    @Body() dto: CreateSavedFilterDto,
    @CurrentUser('id') userId: string,
  ) {
    const filter = await this.filterService.create(dto, userId);
    return {
      success: true,
      message: 'Filter saved successfully',
      data: { filter },
    };
  }

  /**
   * GET /filters - Get saved filters
   */
  @Get()
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('workspaceId') workspaceId?: string,
  ) {
    const filters = await this.filterService.findForUser(userId, workspaceId);
    return {
      success: true,
      data: { filters },
    };
  }

  /**
   * GET /filters/:id - Get filter by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const filter = await this.filterService.findOne(id, userId);
    return {
      success: true,
      data: { filter },
    };
  }

  /**
   * PATCH /filters/:id - Update filter
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSavedFilterDto,
    @CurrentUser('id') userId: string,
  ) {
    const filter = await this.filterService.update(id, dto, userId);
    return {
      success: true,
      message: 'Filter updated successfully',
      data: { filter },
    };
  }

  /**
   * DELETE /filters/:id - Delete filter
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.filterService.delete(id, userId);
    return {
      success: true,
      message: 'Filter deleted successfully',
    };
  }
}
