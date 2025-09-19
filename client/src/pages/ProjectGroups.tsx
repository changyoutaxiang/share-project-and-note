import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Folder, Settings } from "lucide-react";
import CreateProjectGroupDialog from "@/components/CreateProjectGroupDialog";
import ProjectGroupCard from "@/components/ProjectGroupCard";
import type { ProjectGroup } from "@shared/schema";

export default function ProjectGroups() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 获取项目组数据
  const { data: projectGroups = [], isLoading } = useQuery({
    queryKey: ["project-groups"],
    queryFn: async () => {
      const response = await fetch("/api/project-groups");
      if (!response.ok) {
        throw new Error("Failed to fetch project groups");
      }
      return response.json() as Promise<ProjectGroup[]>;
    },
  });

  // 搜索项目组
  const { data: searchResults = [] } = useQuery({
    queryKey: ["search-project-groups", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await fetch(`/api/search/project-groups?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error("Failed to search project groups");
      }
      return response.json() as Promise<ProjectGroup[]>;
    },
    enabled: searchQuery.trim().length > 0,
  });

  // 创建项目组
  const createProjectGroupMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/project-groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create project group");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-groups"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "创建成功",
        description: "项目组已成功创建",
      });
    },
    onError: () => {
      toast({
        title: "创建失败",
        description: "创建项目组时出现错误，请重试",
        variant: "destructive",
      });
    },
  });

  // 显示的项目组列表（搜索结果或全部）
  const displayedGroups = searchQuery.trim() ? searchResults : projectGroups;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">项目组管理</h1>
          <p className="text-muted-foreground">
            管理您的项目组，组织项目结构
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          新建项目组
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索项目组..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Folder className="h-4 w-4" />
              总项目组
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : projectGroups.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4" />
              活跃项目组
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                projectGroups.filter(g => g.status === "active").length
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">搜索结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {searchQuery.trim() ? displayedGroups.length : "-"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Groups Grid */}
      <div>
        {searchQuery.trim() && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              搜索结果：
            </span>
            <Badge variant="secondary">
              {displayedGroups.length} 个项目组
            </Badge>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : displayedGroups.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery.trim() ? "未找到匹配的项目组" : "暂无项目组"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery.trim()
                ? "尝试使用其他关键词搜索"
                : "创建您的第一个项目组来开始管理项目"
              }
            </p>
            {!searchQuery.trim() && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                创建项目组
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedGroups.map((group) => (
              <ProjectGroupCard key={group.id} projectGroup={group} />
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <CreateProjectGroupDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={async (data) => {
          await createProjectGroupMutation.mutateAsync(data);
        }}
      />
    </div>
  );
}