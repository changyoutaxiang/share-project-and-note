import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Flag, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task, TaskPriority, TaskStatus } from "@shared/schema";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: string) => void;
}

const priorityColors: Record<string, string> = {
  [TaskPriority.LOW]: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  [TaskPriority.MEDIUM]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  [TaskPriority.HIGH]: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  [TaskPriority.URGENT]: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const statusColors: Record<string, string> = {
  [TaskStatus.TODO]: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  [TaskStatus.IN_PROGRESS]: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  [TaskStatus.DONE]: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStatusChange = (newStatus: string) => {
    onStatusChange?.(task.id, newStatus);
    console.log(`Task ${task.id} status changed to ${newStatus}`);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <Card 
      className="hover-elevate cursor-pointer transition-all duration-200"
      onClick={() => setIsExpanded(!isExpanded)}
      data-testid={`card-task-${task.id}`}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex-1 min-w-0">
          <h3 
            className="font-medium text-sm text-foreground leading-tight" 
            data-testid={`text-task-title-${task.id}`}
          >
            {task.title}
          </h3>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <Badge 
            variant="secondary" 
            className={priorityColors[task.priority]}
            data-testid={`badge-priority-${task.id}`}
          >
            <Flag className="w-3 h-3 mr-1" />
            {task.priority}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                data-testid={`button-task-menu-${task.id}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(TaskStatus.TODO);
                }}
                data-testid={`button-status-todo-${task.id}`}
              >
                标记为待办
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(TaskStatus.IN_PROGRESS);
                }}
                data-testid={`button-status-progress-${task.id}`}
              >
                标记为进行中
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(TaskStatus.DONE);
                }}
                data-testid={`button-status-done-${task.id}`}
              >
                标记为完成
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(task);
                }}
                data-testid={`button-edit-${task.id}`}
              >
                编辑任务
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(task.id);
                }}
                className="text-destructive"
                data-testid={`button-delete-${task.id}`}
              >
                删除任务
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className={statusColors[task.status]}
            data-testid={`badge-status-${task.id}`}
          >
            {task.status === TaskStatus.TODO && "待办"}
            {task.status === TaskStatus.IN_PROGRESS && "进行中"}
            {task.status === TaskStatus.DONE && "已完成"}
          </Badge>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {task.dueDate && (
              <div className="flex items-center gap-1" data-testid={`text-due-date-${task.id}`}>
                <Calendar className="w-3 h-3" />
                {formatDate(new Date(task.dueDate))}
              </div>
            )}
            {task.estimatedHours && (
              <div className="flex items-center gap-1" data-testid={`text-estimated-hours-${task.id}`}>
                <Clock className="w-3 h-3" />
                {task.estimatedHours}h
              </div>
            )}
          </div>
        </div>
        {isExpanded && task.description && (
          <p 
            className="text-sm text-muted-foreground mt-2 leading-relaxed" 
            data-testid={`text-task-description-${task.id}`}
          >
            {task.description}
          </p>
        )}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs px-2 py-0"
                data-testid={`badge-tag-${tag}-${task.id}`}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}