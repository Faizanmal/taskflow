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
import { TimeTrackingService } from '../services/time-tracking.service';
import {
  CreateTimeLogDto,
  UpdateTimeLogDto,
  StartTimerDto,
  TimeReportFilterDto,
} from '../dto/time-log.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

/**
 * Time Tracking Controller
 */
@Controller('time-tracking')
@UseGuards(JwtAuthGuard)
export class TimeTrackingController {
  constructor(private readonly timeTrackingService: TimeTrackingService) {}

  /**
   * POST /time-tracking/tasks/:taskId/start - Start timer
   */
  @Post('tasks/:taskId/start')
  async startTimer(
    @Param('taskId') taskId: string,
    @Body() dto: StartTimerDto,
    @CurrentUser('id') userId: string,
  ) {
    const timeLog = await this.timeTrackingService.startTimer(
      taskId,
      dto,
      userId,
    );
    return {
      success: true,
      message: 'Timer started',
      data: { timeLog },
    };
  }

  /**
   * POST /time-tracking/stop - Stop running timer
   */
  @Post('stop')
  async stopTimer(@CurrentUser('id') userId: string) {
    const timeLog = await this.timeTrackingService.stopTimer(userId);
    return {
      success: true,
      message: 'Timer stopped',
      data: { timeLog },
    };
  }

  /**
   * GET /time-tracking/running - Get running timer
   */
  @Get('running')
  async getRunningTimer(@CurrentUser('id') userId: string) {
    const timeLog = await this.timeTrackingService.getRunningTimer(userId);
    return {
      success: true,
      data: { timeLog },
    };
  }

  /**
   * POST /time-tracking/tasks/:taskId/log - Create manual time log
   */
  @Post('tasks/:taskId/log')
  async createManualLog(
    @Param('taskId') taskId: string,
    @Body() dto: CreateTimeLogDto,
    @CurrentUser('id') userId: string,
  ) {
    const timeLog = await this.timeTrackingService.createManualLog(
      taskId,
      dto,
      userId,
    );
    return {
      success: true,
      message: 'Time log created',
      data: { timeLog },
    };
  }

  /**
   * GET /time-tracking/tasks/:taskId - Get time logs for task
   */
  @Get('tasks/:taskId')
  async getTaskTimeLogs(@Param('taskId') taskId: string) {
    const timeLogs = await this.timeTrackingService.getTaskTimeLogs(taskId);
    const totalTime = await this.timeTrackingService.getTaskTotalTime(taskId);
    return {
      success: true,
      data: { timeLogs, totalTime },
    };
  }

  /**
   * GET /time-tracking/my-logs - Get user's time logs
   */
  @Get('my-logs')
  async getMyTimeLogs(
    @CurrentUser('id') userId: string,
    @Query() filters: TimeReportFilterDto,
  ) {
    const timeLogs = await this.timeTrackingService.getUserTimeLogs(
      userId,
      filters,
    );
    return {
      success: true,
      data: { timeLogs },
    };
  }

  /**
   * GET /time-tracking/reports/daily - Get daily report
   */
  @Get('reports/daily')
  async getDailyReport(
    @CurrentUser('id') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const report = await this.timeTrackingService.getDailyReport(
      userId,
      startDate,
      endDate,
    );
    return {
      success: true,
      data: { report },
    };
  }

  /**
   * GET /time-tracking/reports/weekly - Get weekly report
   */
  @Get('reports/weekly')
  async getWeeklyReport(
    @CurrentUser('id') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const report = await this.timeTrackingService.getWeeklyReport(
      userId,
      startDate,
      endDate,
    );
    return {
      success: true,
      data: { report },
    };
  }

  /**
   * GET /time-tracking/reports/productivity - Get productivity stats
   */
  @Get('reports/productivity')
  async getProductivityStats(
    @CurrentUser('id') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const stats = await this.timeTrackingService.getProductivityStats(
      userId,
      startDate,
      endDate,
    );
    return {
      success: true,
      data: { stats },
    };
  }

  /**
   * PATCH /time-tracking/:id - Update time log
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTimeLogDto,
    @CurrentUser('id') userId: string,
  ) {
    const timeLog = await this.timeTrackingService.update(id, dto, userId);
    return {
      success: true,
      message: 'Time log updated',
      data: { timeLog },
    };
  }

  /**
   * DELETE /time-tracking/:id - Delete time log
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.timeTrackingService.delete(id, userId);
    return {
      success: true,
      message: 'Time log deleted',
    };
  }
}
