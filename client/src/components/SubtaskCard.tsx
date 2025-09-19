import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, CheckSquare, Clock, User, Calendar, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { Subtask } from "@shared/schema";

interface SubtaskCardProps {
  subtask: Subtask;
  onEdit?: (subtask: Subtask) => void;
}

export default function SubtaskCard({ subtask, onEdit }: SubtaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 更新子任务状态
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await fetch(`/api/subtasks/${subtask.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error("Failed to update subtask status");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subtasks", subtask.taskId] });
      setIsUpdating(false);
      toast({
        title: "状态已更新",
        description: "子任务状态已成功更新",
      });
    },
    onError: () => {
      setIsUpdating(false);
      toast({
        title: "更新失败",
        description: "更新子任务状态时出现错误",
        variant: "destructive",
      });
    },
  });

  // 删除子任务
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/subtasks/${subtask.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete subtask");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subtasks", subtask.taskId] });
      toast({
        title: "删除成功",
        description: "子任务已删除",
      });
    },
    onError: () => {
      toast({
        title: "删除失败",
        description: "删除子任务时出现错误",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (newStatus: string) => {
    setIsUpdating(true);
    updateStatusMutation.mutate(newStatus);
  };

  const handleDelete = () => {
    if (confirm("确定要删除这个子任务吗？")) {
      deleteMutation.mutate();
    }
  };

  const statusConfig = {
    todo: { label: "待办", variant: "secondary" as const, color: "bg-gray-500" },
    in_progress: { label: "进行中", variant: "default" as const, color: "bg-blue-500" },
    done: { label: "已完成", variant: "secondary" as const, color: "bg-green-500" },
  };

  const priorityConfig = {
    low: { label: "低", variant: "secondary" as const },
    medium: { label: "中", variant: "outline" as const },
    high: { label: "destructive" as const, variant: "destructive" as const },
    urgent: { label: "紧急", variant: "destructive" as const },
  };

  const status = statusConfig[subtask.status as keyof typeof statusConfig];
  const priority = priorityConfig[subtask.priority as keyof typeof priorityConfig];

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      subtask.status === "done" ? "opacity-75 bg-muted/50" : ""
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <CheckSquare
              className={`h-4 w-4 flex-shrink-0 ${
                subtask.status === "done" ? "text-green-600" : "text-muted-foreground"
              }`}
            />
            <div className="min-w-0 flex-1">
              <h4 className={`font-medium truncate ${
                subtask.status === "done" ? "line-through text-muted-foreground" : ""
              }`}>
                {subtask.title}
              </h4>
              {subtask.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {subtask.description}
                </p>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {subtask.status !== "done" && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange("done")}
                  disabled={isUpdating}
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  标记完成
                </DropdownMenuItem>
              )}
              {subtask.status === "done" && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange("todo")}
                  disabled={isUpdating}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  重新开始
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(subtask)}>
                  <Edit className="h-4 w-4 mr-2" />
                  编辑
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* 状态和优先级 */}
          <div className="flex items-center gap-2">
            <Badge variant={status.variant}>
              <div className={`w-2 h-2 rounded-full mr-2 ${status.color}`} />
              {status.label}
            </Badge>
            <Badge variant={priority.variant}>
              {priority.label}
            </Badge>
          </div>

          {/* 进度条 */}
          {subtask.progress !== null && subtask.progress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>进度</span>
                <span>{subtask.progress}%</span>
              </div>
              <Progress value={subtask.progress} className="h-2" />
            </div>
          )}

          {/* 详细信息 */}
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            {subtask.assignee && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span className="truncate">{subtask.assignee}</span>
              </div>
            )}
            {subtask.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {format(new Date(subtask.dueDate), "MM/dd", { locale: zhCN })}
                </span>
              </div>
            )}
            {subtask.estimatedHours && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{subtask.estimatedHours}h</span>
              </div>
            )}
          </div>

          {/* 标签 */}
          {subtask.tags && subtask.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {subtask.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {subtask.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{subtask.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}