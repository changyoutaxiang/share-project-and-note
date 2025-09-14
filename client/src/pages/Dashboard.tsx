import { useState } from "react";
import DashboardStats from "@/components/DashboardStats";
import ProjectCard from "@/components/ProjectCard";
import TaskCard from "@/components/TaskCard";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, Clock } from "lucide-react";
import { Project, Task, TaskStatus, TaskPriority } from "@shared/schema";

// todo: remove mock data when integrating with backend
const mockProjects: Project[] = [
  {
    id: "proj-1",
    name: "个人项目管理应用",
    description: "开发一个功能完整的个人项目管理工具",
    status: "active",
    dueDate: new Date("2025-02-28"),
    createdAt: new Date("2025-01-01"),
  },
  {
    id: "proj-2",
    name: "网站重设计项目",
    description: "重新设计公司官方网站",
    status: "active",
    dueDate: new Date("2025-03-15"),
    createdAt: new Date("2025-01-10"),
  },
];

const mockTasks: Task[] = [
  {
    id: "task-1",
    projectId: "proj-1",
    title: "设计数据库架构",
    description: "设计项目和任务的数据模型",
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    dueDate: new Date("2025-01-20"),
    estimatedHours: 6,
    actualHours: 5,
    tags: ["后端", "数据库"],
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-15"),
  },
  {
    id: "task-2",
    projectId: "proj-1",
    title: "实现任务看板功能",
    description: "开发拖拽式任务看板",
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    dueDate: new Date("2025-01-25"),
    estimatedHours: 10,
    actualHours: null,
    tags: ["前端", "React"],
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-18"),
  },
  {
    id: "task-3",
    projectId: "proj-2",
    title: "用户体验研究",
    description: "进行用户访谈和需求分析",
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: new Date("2025-01-30"),
    estimatedHours: 8,
    actualHours: null,
    tags: ["UX", "研究"],
    createdAt: new Date("2025-01-12"),
    updatedAt: new Date("2025-01-12"),
  },
];

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = mockProjects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTasks = mockTasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentTasks = mockTasks
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const upcomingTasks = mockTasks
    .filter(task => task.dueDate && new Date(task.dueDate) > new Date() && task.status !== TaskStatus.DONE)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 3);

  const handleCreateProject = () => {
    console.log("Create new project");
  };

  const handleCreateTask = () => {
    console.log("Create new task");
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

      {/* Statistics */}
      <DashboardStats projects={mockProjects} tasks={mockTasks} />

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
                  tasks={mockTasks.filter(t => t.projectId === project.id)}
                  onEdit={(project) => console.log("Edit project:", project)}
                  onDelete={(id) => console.log("Delete project:", id)}
                  onOpen={(id) => console.log("Open project:", id)}
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
                  onEdit={(task) => console.log("Edit task:", task)}
                  onDelete={(id) => console.log("Delete task:", id)}
                  onStatusChange={(id, status) => console.log("Status change:", id, status)}
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