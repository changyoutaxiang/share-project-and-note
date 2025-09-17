import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Clock,
  Target,
  Activity,
  Zap,
  CheckCircle
} from "lucide-react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";

// API functions
const analyticsApi = {
  getOverview: (): Promise<any> =>
    fetch("/api/analytics/overview").then(res => res.json()),

  getRiskAnalysis: (): Promise<any> =>
    fetch("/api/analytics/risk").then(res => res.json()),

  getResourceUtilization: (): Promise<any> =>
    fetch("/api/analytics/resource").then(res => res.json()),

  getEfficiencyStats: (): Promise<any> =>
    fetch("/api/analytics/efficiency").then(res => res.json()),

  getAgileMetrics: (): Promise<any> =>
    fetch("/api/analytics/agile").then(res => res.json()),
};

// Overview Cards Component
function OverviewCards() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: analyticsApi.getOverview,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "项目总数",
      value: overview?.totalProjects || 0,
      description: `${overview?.activeProjects || 0} 个进行中`,
      icon: BarChart3,
      color: "text-blue-600"
    },
    {
      title: "任务完成率",
      value: `${overview?.completionRate || 0}%`,
      description: `${overview?.completedTasks || 0}/${overview?.totalTasks || 0} 已完成`,
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "平均周期",
      value: `${overview?.avgCycleTime || 0}h`,
      description: "任务平均用时",
      icon: Clock,
      color: "text-orange-600"
    },
    {
      title: "进行中任务",
      value: overview?.inProgressTasks || 0,
      description: `${overview?.todoTasks || 0} 个待开始`,
      icon: Activity,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Risk Management Dashboard Component
function RiskDashboard() {
  const { data: riskData, isLoading } = useQuery({
    queryKey: ["analytics", "risk"],
    queryFn: analyticsApi.getRiskAnalysis,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const chartConfig = {
    riskScore: {
      label: "风险评分",
      color: "hsl(var(--chart-1))",
    }
  };

  return (
    <div className="space-y-6">
      {/* Risk Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
              高风险
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {riskData?.riskSummary?.high || 0}
            </div>
            <p className="text-xs text-muted-foreground">需要立即关注</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
              中风险
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {riskData?.riskSummary?.medium || 0}
            </div>
            <p className="text-xs text-muted-foreground">需要监控</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              低风险
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {riskData?.riskSummary?.low || 0}
            </div>
            <p className="text-xs text-muted-foreground">状态良好</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>风险矩阵</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ScatterChart data={riskData?.riskMatrix || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="impact"
                  domain={[0, 6]}
                  name="影响程度"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.toString()}
                />
                <YAxis
                  dataKey="probability"
                  domain={[0, 6]}
                  name="发生概率"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.toString()}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{data.title}</p>
                          <p className="text-sm text-muted-foreground">
                            影响程度: {data.impact} | 概率: {data.probability}
                          </p>
                          <p className="text-sm">
                            风险评分: <span className="font-medium text-red-600">{data.riskScore}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter
                  dataKey="riskScore"
                  fill="#3B82F6"
                />
              </ScatterChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>风险分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart
                data={[
                  { name: "低风险", count: riskData?.riskSummary?.low || 0, fill: "#10b981" },
                  { name: "中风险", count: riskData?.riskSummary?.medium || 0, fill: "#f59e0b" },
                  { name: "高风险", count: riskData?.riskSummary?.high || 0, fill: "#ef4444" },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm">任务数量: {payload[0].value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle>即将到期的任务</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {riskData?.upcomingDeadlines?.length > 0 ? (
              riskData.upcomingDeadlines.map((task: any) => (
                <div key={task.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      截止日期: {new Date(task.dueDate).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={task.riskScore >= 15 ? "destructive" : task.riskScore >= 8 ? "secondary" : "default"}>
                      风险: {task.riskScore}
                    </Badge>
                    <Badge variant="outline">{task.priority}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">暂无即将到期的任务</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Resource Utilization Dashboard Component
function ResourceDashboard() {
  const { data: resourceData, isLoading } = useQuery({
    queryKey: ["analytics", "resource"],
    queryFn: analyticsApi.getResourceUtilization,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const chartConfig = {
    activity: { label: "活跃度", color: "hsl(var(--chart-1))" },
    inProgress: { label: "进行中", color: "hsl(var(--chart-2))" },
    todo: { label: "待办", color: "hsl(var(--chart-3))" },
    estimatedHours: { label: "预估工时", color: "hsl(var(--chart-4))" },
    actualHours: { label: "实际工时", color: "hsl(var(--chart-5))" }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <Activity className="h-4 w-4 mr-2 text-blue-500" />
              平均并行任务
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {resourceData?.avgParallelTasks || 0}
            </div>
            <p className="text-xs text-muted-foreground">同时进行的任务数量</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <Clock className="h-4 w-4 mr-2 text-green-500" />
              高峰工作时间
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {resourceData?.peakWorkingHour || '09:00'}
            </div>
            <p className="text-xs text-muted-foreground">任务创建最集中时段</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <Target className="h-4 w-4 mr-2 text-purple-500" />
              最活跃标签
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {resourceData?.mostActiveTag || '无'}
            </div>
            <p className="text-xs text-muted-foreground">使用最频繁的标签</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parallel Task Trend */}
        <Card>
          <CardHeader>
            <CardTitle>并行任务趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <AreaChart data={resourceData?.taskTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{label}</p>
                          {payload.map((item, index) => (
                            <p key={index} className="text-sm" style={{ color: item.color }}>
                              {item.name}: {item.value}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="inProgress"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="todo"
                  stackId="1"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Task Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>任务类型分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={resourceData?.tags || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(resourceData?.tags || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{payload[0].payload.name}</p>
                          <p className="text-sm">任务数量: {payload[0].value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Project Workload */}
        <Card>
          <CardHeader>
            <CardTitle>项目工作量分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={resourceData?.projects || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm">预估工时: {payload[0]?.payload?.estimatedHours || 0}h</p>
                          <p className="text-sm">实际工时: {payload[0]?.payload?.actualHours || 0}h</p>
                          <p className="text-sm">进度: {payload[0]?.payload?.progress || 0}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="estimatedHours" fill="#8884d8" />
                <Bar dataKey="actualHours" fill="#82ca9d" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Working Hours Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>工作时间分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={resourceData?.hours || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">时间: {label}</p>
                          <p className="text-sm">任务创建: {payload[0]?.value || 0}</p>
                          <p className="text-sm">任务完成: {payload[1]?.value || 0}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="taskCount" stroke="#8884d8" />
                <Line type="monotone" dataKey="productivity" stroke="#82ca9d" />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Efficiency Dashboard Component
function EfficiencyDashboard() {
  const { data: efficiencyData, isLoading } = useQuery({
    queryKey: ["analytics", "efficiency"],
    queryFn: analyticsApi.getEfficiencyStats,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const chartConfig = {
    velocity: { label: "速度", color: "hsl(var(--chart-1))" },
    completed: { label: "已完成", color: "hsl(var(--chart-2))" },
    efficiency: { label: "效率", color: "hsl(var(--chart-3))" },
    estimated: { label: "预估时间", color: "hsl(var(--chart-4))" },
    actual: { label: "实际时间", color: "hsl(var(--chart-5))" }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <Zap className="h-4 w-4 mr-2 text-blue-500" />
              本周速度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {efficiencyData?.velocity || 0}
            </div>
            <p className="text-xs text-muted-foreground">完成任务数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              首次完成率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {efficiencyData?.firstTimeRightRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">无需返工的任务比例</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <Clock className="h-4 w-4 mr-2 text-orange-500" />
              平均预估时间
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {efficiencyData?.avgEstimatedHours || 0}h
            </div>
            <p className="text-xs text-muted-foreground">任务预估工时</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-purple-500" />
              平均实际时间
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {efficiencyData?.avgActualHours || 0}h
            </div>
            <p className="text-xs text-muted-foreground">任务实际工时</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Velocity Trend */}
        <Card>
          <CardHeader>
            <CardTitle>速度趋势（最近4周）</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={efficiencyData?.velocityTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm text-blue-600">
                            完成任务: {payload[0]?.value || 0}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6" }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Cycle Time Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>周期时间分析</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={efficiencyData?.cycleTimeData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm">预估: {payload[0]?.payload?.estimated || 0}h</p>
                          <p className="text-sm">实际: {payload[0]?.payload?.actual || 0}h</p>
                          <p className="text-sm text-green-600">
                            效率: {payload[0]?.payload?.efficiency || 0}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="estimated" fill="#f59e0b" name="预估时间" />
                <Bar dataKey="actual" fill="#10b981" name="实际时间" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Efficiency Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>效率分布图</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <AreaChart
                data={efficiencyData?.cycleTimeData?.map((item: any, index: number) => ({
                  name: `任务${index + 1}`,
                  efficiency: parseFloat(item.efficiency),
                  estimated: item.estimated,
                  actual: item.actual
                })) || []}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm">效率: {payload[0]?.value || 0}%</p>
                          <p className="text-sm">预估: {payload[0]?.payload?.estimated || 0}h</p>
                          <p className="text-sm">实际: {payload[0]?.payload?.actual || 0}h</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Time Estimation Accuracy */}
        <Card>
          <CardHeader>
            <CardTitle>时间预估准确性</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart
                data={efficiencyData?.cycleTimeData?.map((item: any, index: number) => ({
                  task: index + 1,
                  estimatedVsActual: item.actual > 0 ? (item.estimated / item.actual * 100).toFixed(1) : 0,
                  baseline: 100
                })) || []}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="task" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">任务 {label}</p>
                          <p className="text-sm">预估准确度: {payload[0]?.value || 0}%</p>
                          <p className="text-xs text-muted-foreground">
                            100% = 完全准确，&gt;100% = 预估偏高，&lt;100% = 预估偏低
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="baseline" stroke="#e5e7eb" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="estimatedVsActual" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AgileDashboard() {
  const { data: agileData, isLoading } = useQuery({
    queryKey: ["analytics", "agile"],
    queryFn: analyticsApi.getAgileMetrics,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const chartConfig = {
    TODO: { label: "待办", color: "#fbbf24" },
    进行中: { label: "进行中", color: "#3b82f6" },
    已完成: { label: "已完成", color: "#10b981" },
    completed: { label: "完成", color: "#10b981" },
    leadTime: { label: "前置时间", color: "#8b5cf6" },
    cycleTime: { label: "周期时间", color: "#ef4444" }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <Clock className="h-4 w-4 mr-2 text-purple-500" />
              平均前置时间
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {agileData?.avgLeadTime || 0} 天
            </div>
            <p className="text-xs text-muted-foreground">从需求到交付</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <Zap className="h-4 w-4 mr-2 text-orange-500" />
              平均周期时间
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {agileData?.avgCycleTime || 0} 小时
            </div>
            <p className="text-xs text-muted-foreground">实际开发时间</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <Activity className="h-4 w-4 mr-2 text-green-500" />
              WIP 限制状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {agileData?.wipLimits?.['进行中'] || 0}
            </div>
            <p className="text-xs text-muted-foreground">当前在制品数量</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cumulative Flow Diagram */}
        <Card>
          <CardHeader>
            <CardTitle>累积流图（CFD）</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <AreaChart data={agileData?.cumulativeFlow || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{label}</p>
                          {payload.reverse().map((item, index) => (
                            <p key={index} className="text-sm" style={{ color: item.color }}>
                              {item.name}: {item.value}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="TODO"
                  stackId="1"
                  stroke="#fbbf24"
                  fill="#fbbf24"
                  fillOpacity={0.8}
                />
                <Area
                  type="monotone"
                  dataKey="进行中"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.8}
                />
                <Area
                  type="monotone"
                  dataKey="已完成"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.8}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Throughput Chart */}
        <Card>
          <CardHeader>
            <CardTitle>吞吐量图表</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={agileData?.throughput || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm text-green-600">
                            完成任务: {payload[0]?.value || 0}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="completed" fill="#10b981" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* WIP Limits Monitoring */}
        <Card>
          <CardHeader>
            <CardTitle>WIP 限制监控</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart
                data={[
                  { status: 'TODO', count: agileData?.wipLimits?.TODO || 0, limit: 10 },
                  { status: '进行中', count: agileData?.wipLimits?.['进行中'] || 0, limit: 5 },
                  { status: '已完成', count: agileData?.wipLimits?.['已完成'] || 0, limit: 999 }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm">当前数量: {payload[0]?.value || 0}</p>
                          <p className="text-sm">建议上限: {payload[0]?.payload?.limit || 0}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Lead Time vs Cycle Time */}
        <Card>
          <CardHeader>
            <CardTitle>前置时间 vs 周期时间</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={agileData?.leadCycleData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="days" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="hours" orientation="right" tick={{ fontSize: 12 }} />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm text-purple-600">
                            前置时间: {payload[0]?.value || 0} 天
                          </p>
                          <p className="text-sm text-red-600">
                            周期时间: {payload[1]?.value || 0} 小时
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="leadTime"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  yAxisId="days"
                />
                <Line
                  type="monotone"
                  dataKey="cycleTime"
                  stroke="#ef4444"
                  strokeWidth={2}
                  yAxisId="hours"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("30d");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">数据分析</h1>
          <p className="text-muted-foreground">项目和任务的详细分析和洞察</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">最近 7 天</SelectItem>
            <SelectItem value="30d">最近 30 天</SelectItem>
            <SelectItem value="90d">最近 90 天</SelectItem>
            <SelectItem value="all">全部时间</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <OverviewCards />

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="risk" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="risk">风险管理</TabsTrigger>
          <TabsTrigger value="resource">资源利用</TabsTrigger>
          <TabsTrigger value="efficiency">效率质量</TabsTrigger>
          <TabsTrigger value="agile">敏捷指标</TabsTrigger>
        </TabsList>

        <TabsContent value="risk">
          <RiskDashboard />
        </TabsContent>

        <TabsContent value="resource">
          <ResourceDashboard />
        </TabsContent>

        <TabsContent value="efficiency">
          <EfficiencyDashboard />
        </TabsContent>

        <TabsContent value="agile">
          <AgileDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}