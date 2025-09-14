import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardStats from "@/components/DashboardStats";
import ProjectCard from "@/components/ProjectCard";
import TaskCard from "@/components/TaskCard";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Project, Task, TaskStatus, TaskPriority } from "@shared/schema";
import { projectApi, taskApi, searchApi } from "@/lib/api";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch projects and tasks from API
  const { 
    data: projects = [], 
    isLoading: projectsLoading, 
    error: projectsError,
    refetch: refetchProjects 
  } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: projectApi.getAll,
  });

  const { 
    data: tasks = [], 
    isLoading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks 
  } = useQuery({
    queryKey: ["/api/tasks"],
    queryFn: () => taskApi.getAll(),
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["/api/search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return { projects: [], tasks: [] };
      const [searchedProjects, searchedTasks] = await Promise.all([
        searchApi.projects(searchQuery),
        searchApi.tasks(searchQuery),
      ]);
      return { projects: searchedProjects, tasks: searchedTasks };
    },
    enabled: searchQuery.length > 0,
  });

  // Mutations for task operations
  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      taskApi.updateStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "任务状态已更新" });
    },
    onError: (error) => {
      toast({ 
        title: "更新失败", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: taskApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "任务已删除" });
    },
    onError: (error) => {
      toast({ 
        title: "删除失败", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: projectApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "项目已删除" });
    },
    onError: (error) => {
      toast({ 
        title: "删除失败", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  // Filter data based on search
  const filteredProjects = searchQuery 
    ? (searchResults?.projects || [])
    : projects;

  const filteredTasks = searchQuery 
    ? (searchResults?.tasks || [])
    : tasks;

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const upcomingTasks = [...tasks]
    .filter(task => task.dueDate && new Date(task.dueDate) > new Date() && task.status !== TaskStatus.DONE)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 3);

  const handleCreateProject = () => {
    console.log("Create new project");
    // todo: implement project creation modal
  };

  const handleCreateTask = () => {
    console.log("Create new task");
    // todo: implement task creation modal
  };

  const handleEditTask = (task: Task) => {
    console.log("Edit task:", task);
    // todo: implement task editing modal
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  };

  const handleTaskStatusChange = (taskId: string, status: string) => {
    updateTaskStatusMutation.mutate({ taskId, status });
  };

  const handleEditProject = (project: Project) => {
    console.log("Edit project:", project);
    // todo: implement project editing modal
  };

  const handleDeleteProject = (projectId: string) => {
    deleteProjectMutation.mutate(projectId);
  };

  const handleOpenProject = (projectId: string) => {
    console.log("Open project:", projectId);
    // todo: navigate to project detail page
  };

  return (
    <div className="space-y-6" data-testid="page-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-dashboard-title">
            项目管理仪表板
          </h1>
          <p className="text-muted-foreground" data-testid="text-dashboard-subtitle">
            管理您的项目和任务，跟踪进度
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateProject} data-testid="button-create-project">
            <Plus className="w-4 h-4 mr-2" />
            新建项目
          </Button>
          <Button variant="outline" onClick={handleCreateTask} data-testid="button-create-task">
            <Plus className="w-4 h-4 mr-2" />
            新建任务
          </Button>
        </div>
      </div>

      {/* Search */}
      <SearchBar
        placeholder="搜索项目和任务..."
        onSearch={setSearchQuery}
        onClear={() => setSearchQuery("")}
        className="max-w-md"
      />

      {/* Loading State */}
      {(projectsLoading || tasksLoading) && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-muted-foreground">加载中...</span>
        </div>
      )}

      {/* Error State */}
      {(projectsError || tasksError) && (
        <Card className="border-destructive" data-testid="card-error">
          <CardContent className="flex flex-col items-center py-8">
            <div className="text-destructive mb-4">
              <h3 className="text-lg font-semibold">数据加载失败</h3>
              <p className="text-sm text-muted-foreground">
                {projectsError && "项目数据: " + (projectsError as Error).message}
                {projectsError && tasksError && " | "}
                {tasksError && "任务数据: " + (tasksError as Error).message}
              </p>
            </div>
            <div className="flex gap-2">
              {projectsError && (
                <Button 
                  variant="outline" 
                  onClick={() => refetchProjects()}
                  data-testid="button-retry-projects"
                >
                  重试加载项目
                </Button>
              )}
              {tasksError && (
                <Button 
                  variant="outline" 
                  onClick={() => refetchTasks()}
                  data-testid="button-retry-tasks"
                >
                  重试加载任务
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      {!projectsLoading && !tasksLoading && (
        <DashboardStats projects={projects} tasks={tasks} />
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card data-testid="card-recent-projects">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium">
              最近项目
            </CardTitle>
            <Button variant="ghost" size="sm" data-testid="button-view-all-projects">
              查看全部
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredProjects.length > 0 ? (
              filteredProjects.slice(0, 2).map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  tasks={tasks.filter(t => t.projectId === project.id)}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                  onOpen={handleOpenProject}
                />
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4" data-testid="text-no-projects">
                {searchQuery ? "未找到匹配的项目" : "暂无项目"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card data-testid="card-recent-tasks">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium">
              最近任务
            </CardTitle>
            <Button variant="ghost" size="sm" data-testid="button-view-all-tasks">
              查看全部
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredTasks.length > 0 ? (
              recentTasks.slice(0, 3).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleTaskStatusChange}
                />
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4" data-testid="text-no-tasks">
                {searchQuery ? "未找到匹配的任务" : "暂无任务"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Tasks */}
      {upcomingTasks.length > 0 && (
        <Card data-testid="card-upcoming-tasks">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              即将到期的任务
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-3 space-y-2">
                  <h4 className="font-medium text-sm" data-testid={`text-upcoming-task-${task.id}`}>
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span data-testid={`text-upcoming-due-${task.id}`}>
                      {task.dueDate && new Intl.DateTimeFormat('zh-CN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(new Date(task.dueDate))}
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