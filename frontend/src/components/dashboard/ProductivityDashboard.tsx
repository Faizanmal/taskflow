'use client';

import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  Circle,
  Clock,
  TrendingUp,
  Zap,
  Users,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePersonalStats, useDailyStats, useTeamProductivity } from '@/hooks/useAnalytics';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface ProductivityDashboardProps {
  workspaceId?: string;
}

const STATUS_COLORS = {
  TODO: '#6b7280',
  IN_PROGRESS: '#3b82f6',
  IN_REVIEW: '#f59e0b',
  COMPLETED: '#22c55e',
};

const PRIORITY_COLORS = {
  LOW: '#6b7280',
  MEDIUM: '#3b82f6',
  HIGH: '#f59e0b',
  URGENT: '#ef4444',
};

export function ProductivityDashboard({ workspaceId }: ProductivityDashboardProps) {
  const { t } = useTranslation();
  const { data: personalStats, isLoading: statsLoading } = usePersonalStats(30);
  const { data: dailyStats, isLoading: dailyLoading } = useDailyStats(30);
  const { data: teamProductivity } = useTeamProductivity(workspaceId || '', 30);

  // Transform data for charts
  const statusData = personalStats?.tasksByStatus
    ? Object.entries(personalStats.tasksByStatus).map(([name, value]) => ({
        name: t(`status.${name}`, name),
        value,
        color: STATUS_COLORS[name as keyof typeof STATUS_COLORS] || '#6b7280',
      }))
    : [];

  const priorityData = personalStats?.tasksByPriority
    ? Object.entries(personalStats.tasksByPriority).map(([name, value]) => ({
        name: t(`priority.${name}`, name),
        value,
        color: PRIORITY_COLORS[name as keyof typeof PRIORITY_COLORS] || '#6b7280',
      }))
    : [];

  // Format time for display
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (statsLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 bg-[var(--bg-tertiary)] rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.tasksCreated', 'Tasks Created')}
            </CardTitle>
            <Circle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personalStats?.tasksCreated || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('analytics.last30Days', 'Last 30 days')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.tasksCompleted', 'Tasks Completed')}
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personalStats?.tasksCompleted || 0}</div>
            <p className="text-xs text-muted-foreground">
              {personalStats?.tasksCreated
                ? `${Math.round((personalStats.tasksCompleted / personalStats.tasksCreated) * 100)}% completion rate`
                : t('analytics.noData', 'No data')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.timeTracked', 'Time Tracked')}
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(personalStats?.timeTracked || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('analytics.last30Days', 'Last 30 days')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.streak', 'Current Streak')}
            </CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personalStats?.streakDays || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('analytics.consecutiveDays', 'Consecutive days')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Activity Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('analytics.activityOverview', 'Activity Overview')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyStats || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis
                    dataKey="date"
                    stroke="var(--text-tertiary)"
                    fontSize={12}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="tasksCompleted"
                    name={t('analytics.completed', 'Completed')}
                    stackId="1"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="tasksCreated"
                    name={t('analytics.created', 'Created')}
                    stackId="2"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Task Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.tasksByStatus', 'Tasks by Status')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1 text-xs">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Productivity */}
      {teamProductivity && teamProductivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('analytics.teamProductivity', 'Team Productivity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamProductivity.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis type="number" stroke="var(--text-tertiary)" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="userName"
                    stroke="var(--text-tertiary)"
                    fontSize={12}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar
                    dataKey="tasksCompleted"
                    name={t('analytics.completed', 'Completed')}
                    fill="#22c55e"
                    radius={[0, 4, 4, 0]}
                  />
                  <Bar
                    dataKey="tasksCreated"
                    name={t('analytics.created', 'Created')}
                    fill="#3b82f6"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProductivityDashboard;
