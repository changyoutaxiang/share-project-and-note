import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText } from "lucide-react";
import TaskCard from "./TaskCard";
import { Task, TaskStatusType } from "@shared/schema";

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
    color: "bg-gray-100 dark:bg-gray-800",
    badgeColor: "bg-gray-500",
  },
  in_progress: {
    title: "进行中", 
    color: "bg-blue-50 dark:bg-blue-950/30",
    badgeColor: "bg-blue-500",
  },
  done: {
    title: "已完成",
    color: "bg-green-50 dark:bg-green-950/30", 
    badgeColor: "bg-green-500",
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
      console.log(`Calling onStatusChange for task ${taskId} -> ${status}`);
      onStatusChange(taskId, status);
      console.log(`Task ${taskId} moved to ${status}`);
    } else {
      console.warn('Drop event: missing taskId or onStatusChange handler');
    }
  };

  return (
    <div className="flex flex-col min-h-0">
      {/* Column Header */}
      <Card className={`${config.color} border-2 mb-4`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm font-medium">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${config.badgeColor}`}></div>
              <span data-testid={`text-column-title-${status}`}>{title}</span>
              <Badge 
                variant="secondary" 
                className="text-xs"
                data-testid={`badge-task-count-${status}`}
              >
                {tasks.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onAddTask?.(status)}
              data-testid={`button-add-task-${status}`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Drop Zone */}
      <div
        className={`flex-1 min-h-[200px] p-2 rounded-lg border-2 border-dashed transition-all ${
          isDragOver 
            ? "border-primary bg-primary/10" 
            : "border-transparent"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-testid={`drop-zone-${status}`}
      >
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              draggable
              className="cursor-grab active:cursor-grabbing"
              onDragStart={(e) => {
                console.log(`DragStart event for task: ${task.id}`);
                e.dataTransfer.setData("text/plain", task.id);
                e.dataTransfer.effectAllowed = "move";
                console.log(`DataTransfer set: ${task.id}`);
              }}
              onDragEnd={(e) => {
                console.log(`DragEnd event for task: ${task.id}`);
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
          
          {tasks.length === 0 && (
            <div 
              className="flex flex-col items-center justify-center py-8 text-muted-foreground"
              data-testid={`empty-state-${status}`}
            >
              <FileText className="w-8 h-8 mb-2" />
              <p className="text-sm text-center">
                {status === "todo" && "暂无待办任务"}
                {status === "in_progress" && "暂无进行中任务"}  
                {status === "done" && "暂无已完成任务"}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => onAddTask?.(status)}
                data-testid={`button-add-first-task-${status}`}
              >
                <Plus className="h-4 w-4 mr-1" />
                添加任务
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}