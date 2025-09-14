import { useState } from "react";
import KanbanColumn from "@/components/KanbanColumn";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Filter, MoreHorizontal } from "lucide-react";
import { Task, TaskStatus, TaskPriority, TaskStatusType } from "@shared/schema";

// todo: remove mock data when integrating with backend
const mockTasks: Task[] = [
  {
    id: "task-1",
    projectId: "proj-1",
    title: "设计用户界面原型",
    description: "创建应用的基础UI设计，包含响应式布局和深色模式支持",
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
    dueDate: new Date("2025-01-25"),
    estimatedHours: 8,
    actualHours: null,
    tags: ["设计", "UI/UX"],
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-10"),
  },
  {
    id: "task-2",
    projectId: "proj-1",
    title: "实现拖拽功能",
    description: "为看板添加拖拽排序功能",
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    dueDate: new Date("2025-01-30"),
    estimatedHours: 6,
    actualHours: null,
    tags: ["前端", "交互"],
    createdAt: new Date("2025-01-12"),
    updatedAt: new Date("2025-01-18"),
  },
  {
    id: "task-3",
    projectId: "proj-1",
    title: "数据库设计",
    description: "设计项目和任务的数据模型",
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    dueDate: new Date("2025-01-20"),
    estimatedHours: 4,
    actualHours: 3,
    tags: ["后端", "数据库"],
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-15"),
  },
  {
    id: "task-4",
    projectId: "proj-2",
    title: "API接口开发",
    description: "开发RESTful API接口",
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    dueDate: new Date("2025-02-01"),
    estimatedHours: 12,
    actualHours: null,
    tags: ["后端", "API"],
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-01-19"),
  },
  {
    id: "task-5",
    projectId: "proj-2",
    title: "用户认证",
    description: "实现用户登录和权限管理",
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: new Date("2025-02-10"),
    estimatedHours: 8,
    actualHours: null,
    tags: ["后端", "安全"],
    createdAt: new Date("2025-01-16"),
    updatedAt: new Date("2025-01-16"),
  },
  {
    id: "task-6",
    projectId: "proj-1",
    title: "单元测试",
    description: "编写核心功能的单元测试",
    status: TaskStatus.DONE,
    priority: TaskPriority.LOW,
    dueDate: new Date("2025-01-18"),
    estimatedHours: 5,
    actualHours: 4,
    tags: ["测试", "质量"],
    createdAt: new Date("2025-01-05"),
    updatedAt: new Date("2025-01-17"),
  },
];

export default function KanbanView() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Filter tasks based on search and project
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchQuery === "" || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesProject = selectedProject === null || task.projectId === selectedProject;
    
    return matchesSearch && matchesProject;
  });

  // Group tasks by status
  const todoTasks = filteredTasks.filter(task => task.status === TaskStatus.TODO);
  const inProgressTasks = filteredTasks.filter(task => task.status === TaskStatus.IN_PROGRESS);
  const doneTasks = filteredTasks.filter(task => task.status === TaskStatus.DONE);

  const handleAddTask = (status: TaskStatusType) => {
    console.log(`Add new task with status: ${status}`);
  };

  const handleEditTask = (task: Task) => {
    console.log("Edit task:", task);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    console.log("Delete task:", taskId);
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus as TaskStatusType, updatedAt: new Date() }
        : task
    ));
    console.log(`Task ${taskId} status changed to ${newStatus}`);
  };

  const projects = Array.from(new Set(tasks.map(task => task.projectId)));

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
        <Button onClick={() => handleAddTask(TaskStatus.TODO)} data-testid="button-add-task">
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
              <div className="flex gap-2">
                <Button
                  variant={selectedProject === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedProject(null)}
                  data-testid="button-filter-all"
                >
                  全部
                </Button>
                {projects.map(projectId => (
                  <Button
                    key={projectId}
                    variant={selectedProject === projectId ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedProject(projectId)}
                    data-testid={`button-filter-${projectId}`}
                  >
                    {projectId}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
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

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[600px]" data-testid="kanban-board">
        <KanbanColumn
          title="待办"
          status={TaskStatus.TODO}
          tasks={todoTasks}
          onAddTask={handleAddTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onStatusChange={handleStatusChange}
        />
        <KanbanColumn
          title="进行中"
          status={TaskStatus.IN_PROGRESS}
          tasks={inProgressTasks}
          onAddTask={handleAddTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onStatusChange={handleStatusChange}
        />
        <KanbanColumn
          title="已完成"
          status={TaskStatus.DONE}
          tasks={doneTasks}
          onAddTask={handleAddTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
}