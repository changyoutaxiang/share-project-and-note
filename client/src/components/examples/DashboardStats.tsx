import DashboardStats from "../DashboardStats";
import { Project, Task, TaskStatus, TaskPriority } from "@shared/schema";

const mockProjects: Project[] = [
  {
    id: "proj-1",
    name: "网站重设计",
    description: "重新设计公司官网",
    status: "active",
    dueDate: new Date("2025-03-01"),
    createdAt: new Date("2025-01-01"),
  },
  {
    id: "proj-2", 
    name: "移动应用开发",
    description: "开发移动端应用",
    status: "active",
    dueDate: new Date("2025-04-15"),
    createdAt: new Date("2025-01-15"),
  },
  {
    id: "proj-3",
    name: "旧项目归档",
    description: "已完成的项目",
    status: "archived",
    dueDate: null,
    createdAt: new Date("2024-12-01"),
  },
];

const mockTasks: Task[] = [
  {
    id: "task-1",
    projectId: "proj-1",
    title: "设计首页",
    description: "创建新的首页设计",
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    dueDate: new Date("2025-01-20"),
    estimatedHours: 8,
    actualHours: 6,
    tags: ["设计"],
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-05"),
  },
  {
    id: "task-2", 
    projectId: "proj-1",
    title: "开发响应式布局",
    description: "实现移动端适配",
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    dueDate: new Date("2025-01-25"),
    estimatedHours: 12,
    actualHours: null,
    tags: ["开发", "响应式"],
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-15"),
  },
  {
    id: "task-3",
    projectId: "proj-2", 
    title: "API接口设计",
    description: "设计移动端API",
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
    dueDate: new Date("2025-01-10"), // 过期任务
    estimatedHours: 6,
    actualHours: null,
    tags: ["API", "后端"],
    createdAt: new Date("2025-01-05"),
    updatedAt: new Date("2025-01-05"),
  },
  {
    id: "task-4",
    projectId: "proj-2",
    title: "用户界面设计",
    description: "设计移动端界面",
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    dueDate: new Date("2025-02-01"),
    estimatedHours: 10,
    actualHours: null,
    tags: ["设计", "UI"],
    createdAt: new Date("2025-01-12"),
    updatedAt: new Date("2025-01-16"),
  },
];

export default function DashboardStatsExample() {
  return (
    <div className="max-w-4xl p-4">
      <DashboardStats projects={mockProjects} tasks={mockTasks} />
    </div>
  );
}