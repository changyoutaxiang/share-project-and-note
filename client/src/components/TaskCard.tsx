import { useState } from "react";
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
  [TaskPriority.LOW]: "border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400",
  [TaskPriority.MEDIUM]: "border-yellow-200 text-yellow-600 dark:border-yellow-800 dark:text-yellow-400",
  [TaskPriority.HIGH]: "border-orange-200 text-orange-600 dark:border-orange-800 dark:text-orange-400",
  [TaskPriority.URGENT]: "border-red-200 text-red-600 dark:border-red-800 dark:text-red-400",
};

const statusColors: Record<string, string> = {
  [TaskStatus.TODO]: "border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400",
  [TaskStatus.IN_PROGRESS]: "border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400",
  [TaskStatus.DONE]: "border-green-200 text-green-600 dark:border-green-800 dark:text-green-400",
};

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStatusChange = (newStatus: string) => {
    onStatusChange?.(task.id, newStatus);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div
      className="group bg-background rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
      data-testid={`card-task-${task.id}`}
    >
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3
              className="font-medium text-sm text-foreground leading-tight line-clamp-2"
              data-testid={`text-task-title-${task.id}`}
            >
              {task.title}
            </h3>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Badge
              variant="outline"
              className={`${priorityColors[task.priority]} text-xs px-1.5 py-0`}
              data-testid={`badge-priority-${task.id}`}
            >
              <Flag className="w-2.5 h-2.5" />
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  data-testid={`button-task-menu-${task.id}`}
                >
                  <MoreHorizontal className="h-3 w-3" />
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
              {onEdit && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(task);
                  }}
                  data-testid={`button-edit-${task.id}`}
                >
                  编辑任务
                </DropdownMenuItem>
              )}
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
        </div>

        {/* Task Meta Info */}
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          {task.dueDate && (
            <div className="flex items-center gap-1" data-testid={`text-due-date-${task.id}`}>
              <Calendar className="w-3 h-3" />
              <span>{formatDate(new Date(task.dueDate))}</span>
            </div>
          )}
          {task.estimatedHours && (
            <div className="flex items-center gap-1" data-testid={`text-estimated-hours-${task.id}`}>
              <Clock className="w-3 h-3" />
              <span>{task.estimatedHours}h</span>
            </div>
          )}
          {/* Status indicator - subtle */}
          <Badge
            variant="outline"
            className={`${statusColors[task.status]} ml-auto`}
            data-testid={`badge-status-${task.id}`}
          >
            {task.status === TaskStatus.TODO && "待办"}
            {task.status === TaskStatus.IN_PROGRESS && "进行中"}
            {task.status === TaskStatus.DONE && "已完成"}
          </Badge>
        </div>

        {/* Expanded Content */}
        {isExpanded && task.description && (
          <p
            className="text-xs text-muted-foreground mt-2 pt-2 border-t leading-relaxed"
            data-testid={`text-task-description-${task.id}`}
          >
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground"
                data-testid={`badge-tag-${tag}-${task.id}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}