import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertTriangle, FolderOpen } from "lucide-react";
import { Project, Task } from "@shared/schema";

interface DashboardStatsProps {
  projects: Project[];
  tasks: Task[];
}

export default function DashboardStats({ projects, tasks }: DashboardStatsProps) {
  // Calculate statistics
  const activeProjects = projects.filter(p => p.status === "active").length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "done").length;
  const inProgressTasks = tasks.filter(t => t.status === "in_progress").length;
  const overdueTasks = tasks.filter(t => 
    t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done"
  ).length;

  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const stats = [
    {
      title: "活跃项目",
      value: activeProjects,
      icon: FolderOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      testId: "stat-active-projects"
    },
    {
      title: "已完成任务", 
      value: completedTasks,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      testId: "stat-completed-tasks"
    },
    {
      title: "进行中任务",
      value: inProgressTasks, 
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      testId: "stat-in-progress-tasks"
    },
    {
      title: "逾期任务",
      value: overdueTasks,
      icon: AlertTriangle, 
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      testId: "stat-overdue-tasks"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} data-testid={stat.testId}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className="text-2xl font-bold text-foreground"
                data-testid={`value-${stat.testId}`}
              >
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overall Progress */}
      <Card data-testid="card-overall-progress">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            总体进度
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">任务完成率</span>
              <span 
                className="text-foreground font-medium"
                data-testid="text-completion-rate"
              >
                {completionRate.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={completionRate} 
              className="h-3"
              data-testid="progress-overall"
            />
          </div>
          
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span 
                className="text-muted-foreground"
                data-testid="text-completed-count"
              >
                已完成: {completedTasks}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span 
                className="text-muted-foreground"
                data-testid="text-in-progress-count"
              >
                进行中: {inProgressTasks}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span 
                className="text-muted-foreground"
                data-testid="text-remaining-count"
              >
                剩余: {totalTasks - completedTasks - inProgressTasks}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}