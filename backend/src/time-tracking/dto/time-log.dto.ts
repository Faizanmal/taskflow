import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsNumber,
  Min,
} from 'class-validator';

/**
 * DTO for creating a time log
 */
export class CreateTimeLogDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startTime!: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  duration?: number; // Duration in minutes

  @IsOptional()
  @IsBoolean()
  isRunning?: boolean;
}

/**
 * DTO for updating a time log
 */
export class UpdateTimeLogDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  duration?: number;

  @IsOptional()
  @IsBoolean()
  isRunning?: boolean;
}

/**
 * DTO for starting a timer
 */
export class StartTimerDto {
  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * DTO for time report filters
 */
export class TimeReportFilterDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  taskId?: string;

  @IsOptional()
  @IsString()
  workspaceId?: string;
}
