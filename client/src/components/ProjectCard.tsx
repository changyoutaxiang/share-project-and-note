import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, MoreHorizontal, FolderOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Project, Task } from "@shared/schema";

interface ProjectCardProps {
  project: Project;
  tasks?: Task[];
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
  onOpen?: (projectId: string) => void;
}

export default function ProjectCard({ 
  project, 
  tasks = [], 
  onEdit, 
  onDelete, 
  onOpen 
}: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate project statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === "done").length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const inProgressTasks = tasks.filter(task => task.status === "in_progress").length;

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const handleOpen = () => {
    onOpen?.(project.id);
  };

  return (
    <Card 
      className="hover-elevate cursor-pointer transition-all duration-200"
      onClick={() => setIsExpanded(!isExpanded)}
      data-testid={`card-project-${project.id}`}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FolderOpen className="w-5 h-5 text-primary flex-shrink-0" />
          <h3 
            className="font-medium text-base text-foreground leading-tight truncate" 
            data-testid={`text-project-title-${project.id}`}
          >
            {project.name}
          </h3>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <Badge 
            variant={project.status === "active" ? "default" : "secondary"}
            data-testid={`badge-status-${project.id}`}
          >
            {project.status === "active" ? "进行中" : "已归档"}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                data-testid={`button-project-menu-${project.id}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpen();
                }}
                data-testid={`button-open-${project.id}`}
              >
                打开项目
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(project);
                }}
                data-testid={`button-edit-${project.id}`}
              >
                编辑项目
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(project.id);
                }}
                className="text-destructive"
                data-testid={`button-delete-${project.id}`}
              >
                删除项目
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Project Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">进度</span>
              <span className="text-foreground font-medium" data-testid={`text-progress-${project.id}`}>
                {completedTasks}/{totalTasks} 任务完成
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2"
              data-testid={`progress-bar-${project.id}`}
            />
          </div>

          {/* Task Summary */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className="text-muted-foreground" data-testid={`text-in-progress-${project.id}`}>
                {inProgressTasks} 进行中
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-muted-foreground" data-testid={`text-completed-${project.id}`}>
                {completedTasks} 已完成
              </span>
            </div>
          </div>

          {/* Due Date */}
          {project.dueDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span data-testid={`text-due-date-${project.id}`}>
                截止: {formatDate(new Date(project.dueDate))}
              </span>
            </div>
          )}

          {/* Expanded Description */}
          {isExpanded && project.description && (
            <p 
              className="text-sm text-muted-foreground leading-relaxed border-t pt-3" 
              data-testid={`text-project-description-${project.id}`}
            >
              {project.description}
            </p>
          )}

          {/* Action Button */}
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              handleOpen();
            }}
            className="w-full mt-3"
            variant="outline"
            data-testid={`button-open-project-${project.id}`}
          >
            打开项目
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}