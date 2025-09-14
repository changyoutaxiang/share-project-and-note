import KanbanColumn from "../KanbanColumn";
import { Task, TaskStatus, TaskPriority } from "@shared/schema";

const mockTasks: Task[] = [
  {
    id: "task-1",
    projectId: "proj-1",
    title: "设计用户界面",
    description: "创建应用的基础UI设计",
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    dueDate: new Date("2025-01-20"),
    estimatedHours: 6,
    actualHours: null,
    tags: ["设计", "UI"],
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-15"),
  },
  {
    id: "task-2",
    projectId: "proj-1",
    title: "实现API接口",
    description: "开发后端API接口",
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    dueDate: new Date("2025-01-25"),
    estimatedHours: 8,
    actualHours: null,
    tags: ["后端", "API"],
    createdAt: new Date("2025-01-12"),
    updatedAt: new Date("2025-01-16"),
  },
];

export default function KanbanColumnExample() {
  return (
    <div className="max-w-sm h-96 p-4">
      <KanbanColumn
        title="进行中"
        status={TaskStatus.IN_PROGRESS}
        tasks={mockTasks}
        onAddTask={(status) => console.log("Add task to:", status)}
        onEditTask={(task) => console.log("Edit task:", task)}
        onDeleteTask={(id) => console.log("Delete task:", id)}
        onStatusChange={(id, status) => console.log("Status change:", id, status)}
      />
    </div>
  );
}