import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, Folder, Users, Calendar, Archive, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import CreateProjectGroupDialog from "@/components/CreateProjectGroupDialog";
import type { ProjectGroup, Project } from "@shared/schema";

interface ProjectGroupCardProps {
  projectGroup: ProjectGroup;
}

export default function ProjectGroupCard({ projectGroup }: ProjectGroupCardProps) {
  const [isArchiving, setIsArchiving] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 获取项目组下的项目数量
  const { data: projects = [] } = useQuery({
    queryKey: ["projects", projectGroup.id],
    queryFn: async () => {
      const response = await fetch(`/api/projects?groupId=${projectGroup.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      return response.json() as Promise<Project[]>;
    },
  });

  // 归档/恢复项目组
  const archiveMutation = useMutation({
    mutationFn: async (status: "active" | "archived") => {
      const response = await fetch(`/api/project-groups/${projectGroup.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error("Failed to update project group");
      }
      return response.json();
    },
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ["project-groups"] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectGroup.id] });
      setIsArchiving(false);
      toast({
        title: status === "archived" ? "已归档" : "已恢复",
        description: `项目组已${status === "archived" ? "归档" : "恢复"}`,
      });
    },
    onError: () => {
      setIsArchiving(false);
      toast({
        title: "操作失败",
        description: "更新项目组状态时出现错误",
        variant: "destructive",
      });
    },
  });

  // 删除项目组
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/project-groups/${projectGroup.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete project group");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-groups"] });
      toast({
        title: "删除成功",
        description: "项目组已删除",
      });
    },
    onError: () => {
      toast({
        title: "删除失败",
        description: "删除项目组时出现错误",
        variant: "destructive",
      });
    },
  });

  // 编辑项目组
  const editMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/project-groups/${projectGroup.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update project group");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-groups"] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectGroup.id] });
      setIsEditDialogOpen(false);
      toast({
        title: "更新成功",
        description: "项目组已更新",
      });
    },
    onError: () => {
      toast({
        title: "更新失败",
        description: "更新项目组时出现错误",
        variant: "destructive",
      });
    },
  });

  const handleArchive = () => {
    setIsArchiving(true);
    const newStatus = projectGroup.status === "active" ? "archived" : "active";
    archiveMutation.mutate(newStatus);
  };

  const handleDelete = () => {
    if (projects.length > 0) {
      toast({
        title: "无法删除",
        description: "请先删除或移动该项目组下的所有项目",
        variant: "destructive",
      });
      return;
    }

    if (confirm("确定要删除这个项目组吗？此操作无法撤销。")) {
      deleteMutation.mutate();
    }
  };

  const statusConfig = {
    active: { label: "活跃", variant: "default" as const, color: "bg-green-500" },
    archived: { label: "已归档", variant: "secondary" as const, color: "bg-gray-500" },
  };

  const status = statusConfig[projectGroup.status as keyof typeof statusConfig];

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${
      projectGroup.status === "archived" ? "opacity-75" : ""
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: projectGroup.color }}
            />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg truncate">
                {projectGroup.name}
              </CardTitle>
              {projectGroup.description && (
                <CardDescription className="mt-1 line-clamp-2">
                  {projectGroup.description}
                </CardDescription>
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
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleArchive}
                disabled={isArchiving || archiveMutation.isPending}
              >
                <Archive className="h-4 w-4 mr-2" />
                {projectGroup.status === "active" ? "归档" : "恢复"}
              </DropdownMenuItem>
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
          {/* 状态和统计 */}
          <div className="flex items-center justify-between">
            <Badge variant={status.variant}>
              <div className={`w-2 h-2 rounded-full mr-2 ${status.color}`} />
              {status.label}
            </Badge>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Folder className="h-3 w-3" />
                <span>{projects.length} 个项目</span>
              </div>
            </div>
          </div>

          {/* 创建时间 */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              创建于 {format(new Date(projectGroup.createdAt), "yyyy年MM月dd日", { locale: zhCN })}
            </span>
          </div>

          {/* 项目预览 */}
          {projects.length > 0 && (
            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground mb-2">包含项目：</div>
              <div className="space-y-1">
                {projects.slice(0, 3).map((project) => (
                  <div key={project.id} className="text-xs text-foreground truncate">
                    • {project.name}
                  </div>
                ))}
                {projects.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    ...还有 {projects.length - 3} 个项目
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {/* 编辑对话框 */}
      <CreateProjectGroupDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={editMutation.mutateAsync}
        initialData={{
          name: projectGroup.name,
          description: projectGroup.description || "",
          color: projectGroup.color,
          status: projectGroup.status as "active" | "archived",
        }}
        mode="edit"
      />
    </Card>
  );
}