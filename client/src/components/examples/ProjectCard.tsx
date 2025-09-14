import ProjectCard from "../ProjectCard";
import { Project, Task, TaskStatus, TaskPriority } from "@shared/schema";

const mockProject: Project = {
  id: "proj-1",
  name: "个人项目管理应用",
  description: "开发一个功能完整的个人项目管理工具，支持任务管理、项目跟踪和进度可视化。包含看板视图、列表视图和仪表板功能。",
  status: "active",
  dueDate: new Date("2025-02-28"),
  createdAt: new Date("2025-01-01"),
};

const mockTasks: Task[] = [
  {
    id: "task-1",
    projectId: "proj-1",
    title: "设计数据库架构",
    description: "设计项目和任务的数据模型",
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    dueDate: new Date("2025-01-15"),
    estimatedHours: 4,
    actualHours: 3,
    tags: ["后端", "数据库"],
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-02"),
  },
  {
    id: "task-2",
    projectId: "proj-1",
    title: "实现任务看板功能",
    description: "开发拖拽式任务看板",
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    dueDate: new Date("2025-01-25"),
    estimatedHours: 8,
    actualHours: null,
    tags: ["前端", "React"],
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-15"),
  },
  {
    id: "task-3",
    projectId: "proj-1",
    title: "添加搜索功能",
    description: "实现全局搜索和筛选",
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: new Date("2025-02-05"),
    estimatedHours: 6,
    actualHours: null,
    tags: ["功能", "搜索"],
    createdAt: new Date("2025-01-12"),
    updatedAt: new Date("2025-01-12"),
  },
];

export default function ProjectCardExample() {
  return (
    <div className="max-w-sm space-y-4 p-4">
      <ProjectCard 
        project={mockProject} 
        tasks={mockTasks}
        onEdit={(project) => console.log("Edit project:", project)}
        onDelete={(id) => console.log("Delete project:", id)}
        onOpen={(id) => console.log("Open project:", id)}
      />
    </div>
  );
}