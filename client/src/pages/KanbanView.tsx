import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import KanbanColumn from "@/components/KanbanColumn";
import SearchBar from "@/components/SearchBar";
import CreateTaskDialog from "@/components/CreateTaskDialog";
import CreateSubtaskDialog from "@/components/CreateSubtaskDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Filter, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Task, TaskStatus, TaskPriority, TaskStatusType, Project } from "@shared/schema";
import { taskApi, searchApi, projectApi } from "@/lib/api";

export default function KanbanView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [defaultTaskStatus, setDefaultTaskStatus] = useState<TaskStatusType>(TaskStatus.TODO);
  const [isCreateSubtaskOpen, setIsCreateSubtaskOpen] = useState(false);
  const [selectedTaskForSubtask, setSelectedTaskForSubtask] = useState<Task | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tasks from API
  const {
    data: allTasks = [],
    isLoading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks
  } = useQuery({
    queryKey: ["/api/tasks"],
    queryFn: () => taskApi.getAll(),
  });

  // Fetch projects from API
  const {
    data: projects = [],
    isLoading: projectsLoading
  } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: projectApi.getAll,
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["/api/search/tasks", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      return searchApi.tasks(searchQuery);
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

  const createTaskMutation = useMutation({
    mutationFn: taskApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "任务创建成功" });
      setIsCreateTaskOpen(false);
    },
    onError: (error) => {
      console.error("Task creation error:", error);
      toast({
        title: "创建失败",
        description: error.message || "请检查是否选择了项目",
        variant: "destructive"
      });
    },
  });

  const createSubtaskMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!selectedTaskForSubtask) throw new Error("No task selected");
      const response = await fetch(`/api/tasks/${selectedTaskForSubtask.id}/subtasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create subtask");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subtasks"] });
      toast({ title: "子任务创建成功" });
      setIsCreateSubtaskOpen(false);
      setSelectedTaskForSubtask(null);
    },
    onError: (error) => {
      toast({
        title: "创建失败",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  // Get tasks to display based on search
  const tasks = searchQuery && searchResults ? searchResults : allTasks;

  // Filter tasks based on project selection
  const filteredTasks = selectedProject 
    ? tasks.filter(task => task.projectId === selectedProject)
    : tasks;

  // Group tasks by status
  const todoTasks = filteredTasks.filter(task => task.status === TaskStatus.TODO);
  const inProgressTasks = filteredTasks.filter(task => task.status === TaskStatus.IN_PROGRESS);
  const doneTasks = filteredTasks.filter(task => task.status === TaskStatus.DONE);

  const handleAddTask = (status: TaskStatusType) => {
    setDefaultTaskStatus(status);
    setIsCreateTaskOpen(true);
  };

  const handleEditTask = (task: Task) => {
    // Navigate to task list with the task in edit mode
    // For now, just log and show toast indicating feature location
    console.log("Edit task:", task);
    toast({
      title: "编辑任务",
      description: "请前往「任务列表」页面进行任务编辑操作。",
    });
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    updateTaskStatusMutation.mutate({ taskId, status: newStatus });
  };

  const handleAddSubtask = (taskId: string) => {
    const task = allTasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTaskForSubtask(task);
      setIsCreateSubtaskOpen(true);
    }
  };

  // Get unique project IDs from tasks for filtering
  const projectsWithTasks = projects.filter(project =>
    allTasks.some(task => task.projectId === project.id)
  );

  return (
    <div className="space-y-6" data-testid="page-kanban">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-kanban-title">
            任务看板
          </h1>
          <p className="text-muted-foreground" data-testid="text-kanban-subtitle">
            拖拽任务卡片来更新状态
          </p>
        </div>
        <Button
          onClick={() => handleAddTask(TaskStatus.TODO)}
          disabled={projects.length === 0}
          data-testid="button-add-task"
          title={projects.length === 0 ? "请先创建项目" : ""}
        >
          <Plus className="w-4 h-4 mr-2" />
          新建任务
        </Button>
      </div>

      {/* Filters */}
      <Card data-testid="card-filters">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Filter className="w-4 h-4" />
            筛选和搜索
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchBar
              placeholder="搜索任务..."
              onSearch={setSearchQuery}
              onClear={() => setSearchQuery("")}
              className="flex-1"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">项目:</span>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedProject === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedProject(null)}
                  data-testid="button-filter-all"
                >
                  全部
                </Button>
                {projectsWithTasks.map(project => (
                  <Button
                    key={project.id}
                    variant={selectedProject === project.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedProject(project.id)}
                    data-testid={`button-filter-${project.id}`}
                  >
                    {project.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {(tasksLoading || projectsLoading) && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-muted-foreground">加载数据中...</span>
        </div>
      )}

      {/* Error State */}
      {tasksError && (
        <Card className="border-destructive" data-testid="card-error">
          <CardContent className="flex flex-col items-center py-8">
            <div className="text-destructive mb-4">
              <h3 className="text-lg font-semibold">任务数据加载失败</h3>
              <p className="text-sm text-muted-foreground">
                {(tasksError as Error).message}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => refetchTasks()}
              data-testid="button-retry-tasks"
            >
              重试加载任务
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Summary */}
      {!tasksLoading && !projectsLoading && (
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span className="text-muted-foreground" data-testid="text-todo-count">
              待办: {todoTasks.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-muted-foreground" data-testid="text-in-progress-count">
              进行中: {inProgressTasks.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-muted-foreground" data-testid="text-done-count">
              已完成: {doneTasks.length}
            </span>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      {!tasksLoading && !projectsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[600px]" data-testid="kanban-board">
          <KanbanColumn
            title="待办"
            status={TaskStatus.TODO}
            tasks={todoTasks}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onStatusChange={handleStatusChange}
            onAddSubtask={handleAddSubtask}
          />
          <KanbanColumn
            title="进行中"
            status={TaskStatus.IN_PROGRESS}
            tasks={inProgressTasks}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onStatusChange={handleStatusChange}
            onAddSubtask={handleAddSubtask}
          />
          <KanbanColumn
            title="已完成"
            status={TaskStatus.DONE}
            tasks={doneTasks}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onStatusChange={handleStatusChange}
            onAddSubtask={handleAddSubtask}
          />
        </div>
      )}

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
        onSubmit={async (data) => {
          // Set the default status based on which column's "Add Task" was clicked
          const taskData = {
            ...data,
            status: defaultTaskStatus
          };
          await createTaskMutation.mutateAsync(taskData);
        }}
        projects={projects}
        defaultProjectId={selectedProject || undefined}
      />

      {/* Create Subtask Dialog */}
      <CreateSubtaskDialog
        open={isCreateSubtaskOpen}
        onOpenChange={setIsCreateSubtaskOpen}
        onSubmit={async (data) => {
          await createSubtaskMutation.mutateAsync(data);
        }}
        taskTitle={selectedTaskForSubtask?.title}
      />
    </div>
  );
}