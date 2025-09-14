import TaskCard from "../TaskCard";
import { Task, TaskStatus, TaskPriority } from "@shared/schema";

const mockTask: Task = {
  id: "1",
  projectId: "proj-1",
  title: "设计用户界面原型",
  description: "为项目管理应用创建高保真UI原型，包含任务看板和项目概览页面。需要考虑移动端适配和深色模式支持。",
  status: TaskStatus.IN_PROGRESS,
  priority: TaskPriority.HIGH,
  dueDate: new Date("2025-01-20"),
  estimatedHours: 8,
  actualHours: null,
  tags: ["设计", "UI/UX", "原型"],
  createdAt: new Date("2025-01-10"),
  updatedAt: new Date("2025-01-15"),
};

export default function TaskCardExample() {
  return (
    <div className="max-w-sm space-y-4 p-4">
      <TaskCard 
        task={mockTask} 
        onEdit={(task) => console.log("Edit task:", task)}
        onDelete={(id) => console.log("Delete task:", id)}
        onStatusChange={(id, status) => console.log("Status change:", id, status)}
      />
    </div>
  );
}