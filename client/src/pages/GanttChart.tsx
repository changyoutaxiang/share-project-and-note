import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ganttApi, projectApi } from "../lib/api";
import { Project, Task, Milestone } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { CalendarDays, Clock, Flag, Users, ChevronLeft, ChevronRight } from "lucide-react";

// Import custom Gantt chart component
import { GanttChart as CustomGanttChart } from "@/components/gantt/GanttChart";
import type { Task as GanttTask } from "@/components/gantt/types";

// 甘特图视图模式
const VIEW_MODES = [
  { value: "Day", label: "日视图" },
  { value: "Week", label: "周视图" },
  { value: "Month", label: "月视图" },
  { value: "Quarter Day", label: "季度日" },
  { value: "Half Day", label: "半日" },
] as const;

export default function GanttChart() {
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [viewMode, setViewMode] = useState<string>("Week");
  const queryClient = useQueryClient();

  // 获取项目列表
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: projectApi.getAll,
  });

  // 获取甘特图数据
  const { data: ganttData, isLoading } = useQuery({
    queryKey: ["gantt", selectedProject],
    queryFn: () => ganttApi.getProjectData(selectedProject),
    enabled: !!selectedProject,
  });

  // 更新任务进度
  const updateProgressMutation = useMutation({
    mutationFn: ({ taskId, progress }: { taskId: string; progress: number }) =>
      ganttApi.updateTaskProgress(taskId, progress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gantt", selectedProject] });
    },
  });

  // 转换任务数据为自定义甘特图格式
  const ganttTasks: GanttTask[] = ganttData?.tasks.map(task => {
    const startDate = task.startDate ? new Date(task.startDate) : new Date();
    const endDate = task.endDate ? new Date(task.endDate) : new Date();

    // 确保日期有效
    const validStartDate = isNaN(startDate.getTime()) ? new Date() : startDate;
    const validEndDate = isNaN(endDate.getTime()) ? new Date(validStartDate.getTime() + 24 * 60 * 60 * 1000) : endDate;

    // 获取状态颜色
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'done': return '#10b981';
        case 'in_progress': return '#f59e0b';
        case 'todo': return '#6b7280';
        default: return '#4f46e5';
      }
    };

    return {
      id: task.id,
      name: task.title,
      startDate: validStartDate,
      endDate: validEndDate,
      progress: task.progress || 0,
      dependencies: task.dependencies || [],
      assignee: task.tags?.join(', '),
      color: getStatusColor(task.status)
    };
  }) || [];

  // 处理任务点击
  const handleTaskClick = (task: GanttTask) => {
    console.log("Task clicked:", task);
  };

  // 更新视图模式
  const handleViewModeChange = (mode: string) => {
    setViewMode(mode);
  };

  // 如果没有选择项目，显示项目选择界面
  if (!selectedProject) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">甘特图</h1>
            <p className="text-muted-foreground">
              选择一个项目来查看甘特图视图
            </p>
          </div>

          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>选择项目</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map((project) => (
                  <Button
                    key={project.id}
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    onClick={() => setSelectedProject(project.id)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{project.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {project.description}
                      </div>
                      {project.dueDate && (
                        <div className="text-xs text-muted-foreground mt-1 flex items-center">
                          <CalendarDays className="h-3 w-3 mr-1" />
                          截止: {new Date(project.dueDate).toLocaleDateString("zh-CN")}
                        </div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentProject = projects.find(p => p.id === selectedProject);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedProject("")}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            返回项目选择
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{currentProject?.name}</h1>
            <p className="text-muted-foreground">{currentProject?.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Select value={viewMode} onValueChange={handleViewModeChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VIEW_MODES.map((mode) => (
                <SelectItem key={mode.value} value={mode.value}>
                  {mode.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 项目概览卡片 */}
      {ganttData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">总任务数</p>
                  <p className="text-2xl font-bold">{ganttData.tasks.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">已完成</p>
                  <p className="text-2xl font-bold">
                    {ganttData.tasks.filter(t => t.status === "done").length}
                  </p>
                </div>
                <Flag className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">进行中</p>
                  <p className="text-2xl font-bold">
                    {ganttData.tasks.filter(t => t.status === "in_progress").length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">里程碑</p>
                  <p className="text-2xl font-bold">{ganttData.milestones.length}</p>
                </div>
                <Flag className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 甘特图容器 */}
      <Card>
        <CardHeader>
          <CardTitle>项目时间线</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">加载中...</div>
            </div>
          ) : ganttData?.tasks.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">该项目暂无任务</div>
            </div>
          ) : (
            <CustomGanttChart
              tasks={ganttTasks}
              onTaskClick={handleTaskClick}
              data-id="project-gantt"
            />
          )}
        </CardContent>
      </Card>

      {/* 里程碑列表 */}
      {ganttData?.milestones && ganttData.milestones.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>项目里程碑</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ganttData?.milestones?.map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: milestone.color }}
                    />
                    <div>
                      <h4 className="font-medium">{milestone.name}</h4>
                      {milestone.description && (
                        <p className="text-sm text-muted-foreground">
                          {milestone.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={milestone.completed ? "default" : "secondary"}>
                      {milestone.completed ? "已完成" : "未完成"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(milestone.date).toLocaleDateString("zh-CN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}