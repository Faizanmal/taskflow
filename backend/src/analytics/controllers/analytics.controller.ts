import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AnalyticsService } from '../services/analytics.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

/**
 * Analytics Controller - Productivity and usage analytics endpoints
 */
@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * GET /analytics/personal - Get personal productivity stats
   */
  @Get('personal')
  @ApiOperation({ summary: 'Get personal productivity statistics' })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of days (default: 30)',
  })
  async getPersonalStats(
    @CurrentUser('id') userId: string,
    @Query('days') days?: number,
  ) {
    const stats = await this.analyticsService.getPersonalStats(
      userId,
      days || 30,
    );
    return {
      success: true,
      data: { stats },
    };
  }

  /**
   * GET /analytics/team/:workspaceId - Get team productivity stats
   */
  @Get('team/:workspaceId')
  @ApiOperation({ summary: 'Get team productivity for a workspace' })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of days (default: 30)',
  })
  async getTeamProductivity(
    @CurrentUser('id') userId: string,
    @Param('workspaceId') workspaceId: string,
    @Query('days') days?: number,
  ) {
    const productivity = await this.analyticsService.getTeamProductivity(
      userId,
      workspaceId,
      days || 30,
    );
    return {
      success: true,
      data: { productivity },
    };
  }

  /**
   * GET /analytics/daily - Get daily statistics
   */
  @Get('daily')
  @ApiOperation({ summary: 'Get daily statistics over time' })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of days (default: 30)',
  })
  async getDailyStats(
    @CurrentUser('id') userId: string,
    @Query('days') days?: number,
  ) {
    const stats = await this.analyticsService.getDailyStats(userId, days || 30);
    return {
      success: true,
      data: { stats },
    };
  }
}
