import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, MoreHorizontal } from "lucide-react";
import TaskCard from "./TaskCard";
import { Task, TaskStatusType } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";

interface KanbanColumnProps {
  title: string;
  status: TaskStatusType;
  tasks: Task[];
  onAddTask?: (status: TaskStatusType) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onStatusChange?: (taskId: string, newStatus: string) => void;
}

const statusConfig = {
  todo: {
    title: "待办",
    bgColor: "bg-gray-50 dark:bg-gray-900/50",
    headerColor: "bg-gray-100 dark:bg-gray-800",
    dotColor: "bg-gray-400",
    countBg: "bg-gray-200 dark:bg-gray-700",
    borderColor: "border-gray-200 dark:border-gray-700",
  },
  in_progress: {
    title: "进行中",
    bgColor: "bg-blue-50/50 dark:bg-blue-950/20",
    headerColor: "bg-blue-100/50 dark:bg-blue-900/30",
    dotColor: "bg-blue-500",
    countBg: "bg-blue-100 dark:bg-blue-900/50",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  done: {
    title: "已完成",
    bgColor: "bg-green-50/50 dark:bg-green-950/20",
    headerColor: "bg-green-100/50 dark:bg-green-900/30",
    dotColor: "bg-green-500",
    countBg: "bg-green-100 dark:bg-green-900/50",
    borderColor: "border-green-200 dark:border-green-800",
  },
};

export default function KanbanColumn({
  title,
  status,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const config = statusConfig[status] || statusConfig.todo;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set false if leaving the drop zone itself, not child elements
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const taskId = e.dataTransfer.getData("text/plain");

    if (taskId && onStatusChange) {
      onStatusChange(taskId, status);
    }
  };

  return (
    <div
      className={`
        flex flex-col h-full rounded-xl border transition-all
        ${config.borderColor}
        ${config.bgColor}
        ${isDragOver ? "ring-2 ring-primary ring-offset-2" : ""}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid={`kanban-column-${status}`}
    >
      {/* Column Header - Simple and Clean */}
      <div className={`px-4 py-3 rounded-t-xl ${config.headerColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${config.dotColor}`} />
            <h3 className="font-medium text-sm text-foreground" data-testid={`text-column-title-${status}`}>
              {title}
            </h3>
            <span
              className={`
                px-2 py-0.5 text-xs font-medium rounded-full
                ${config.countBg}
              `}
              data-testid={`badge-task-count-${status}`}
            >
              {tasks.length}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-background/60"
            onClick={() => onAddTask?.(status)}
            data-testid={`button-add-task-${status}`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tasks Container with Scroll */}
      <ScrollArea className="flex-1 px-3 py-3">
        <div className="space-y-2" data-testid={`drop-zone-${status}`}>
          {tasks.map((task) => (
            <div
              key={task.id}
              draggable
              className="cursor-grab active:cursor-grabbing transition-transform hover:scale-[1.02]"
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", task.id);
                e.dataTransfer.effectAllowed = "move";
              }}
              data-testid={`draggable-task-${task.id}`}
            >
              <TaskCard
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onStatusChange={onStatusChange}
              />
            </div>
          ))}

          {/* Empty State - More Subtle */}
          {tasks.length === 0 && (
            <div
              className="flex flex-col items-center justify-center py-12 text-muted-foreground"
              data-testid={`empty-state-${status}`}
            >
              <div className="p-3 rounded-full bg-background/60 mb-3">
                <FileText className="w-5 h-5 text-muted-foreground/60" />
              </div>
              <p className="text-xs text-center text-muted-foreground/80 mb-3">
                {status === "todo" && "暂无待办任务"}
                {status === "in_progress" && "暂无进行中任务"}
                {status === "done" && "暂无已完成任务"}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs hover:bg-background/60"
                onClick={() => onAddTask?.(status)}
                data-testid={`button-add-first-task-${status}`}
              >
                <Plus className="h-3 w-3 mr-1" />
                添加任务
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}