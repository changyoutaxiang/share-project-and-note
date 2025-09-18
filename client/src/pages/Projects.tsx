import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { projectApi, taskApi } from "@/lib/api";
import { Project, InsertProject, ProjectStatus } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema } from "@shared/schema";
import { z } from "zod";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Calendar, 
  Archive,
  CheckCircle,
  Circle,
  Clock,
  FolderOpen
} from "lucide-react";

export default function Projects() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "archived">("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  
  const [, navigate] = useLocation();

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading, error: projectsError } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: () => projectApi.getAll(),
  });

  // Fetch tasks for statistics
  const { data: allTasks = [] } = useQuery({
    queryKey: ["/api/tasks"],
    queryFn: () => taskApi.getAll(),
  });

  // Create form
  const createForm = useForm<z.infer<typeof insertProjectSchema>>({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active",
      dueDate: undefined,
    },
  });

  // Edit form
  const editForm = useForm<z.infer<typeof insertProjectSchema>>({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active",
      dueDate: undefined,
    },
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: (data: InsertProject) => projectApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setCreateDialogOpen(false);
      createForm.reset();
      toast({
        title: "项目创建成功",
        description: "新项目已成功创建。",
      });
    },
    onError: () => {
      toast({
        title: "创建失败",
        description: "项目创建失败，请重试。",
        variant: "destructive",
      });
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertProject> }) =>
      projectApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setEditDialogOpen(false);
      setEditingProject(null);
      editForm.reset();
      toast({
        title: "项目更新成功",
        description: "项目信息已成功更新。",
      });
    },
    onError: () => {
      toast({
        title: "更新失败",
        description: "项目更新失败，请重试。",
        variant: "destructive",
      });
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => projectApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "项目删除成功",
        description: "项目已成功删除。",
      });
    },
    onError: () => {
      toast({
        title: "删除失败",
        description: "项目删除失败，请重试。",
        variant: "destructive",
      });
    },
  });

  // Get project statistics
  const getProjectStats = (projectId: string) => {
    const projectTasks = allTasks.filter((task: any) => task.projectId === projectId);
    const total = projectTasks.length;
    const completed = projectTasks.filter((task: any) => task.status === "done").length;
    const inProgress = projectTasks.filter((task: any) => task.status === "in_progress").length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, inProgress, progress };
  };

  // Filter and search projects
  const getFilteredProjects = () => {
    let filtered = projects;

    // Apply search filter
    if (debouncedSearchQuery) {
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    return filtered;
  };

  const filteredProjects = getFilteredProjects();

  // Handle form submissions
  const onCreateSubmit = (data: z.infer<typeof insertProjectSchema>) => {
    createProjectMutation.mutate(data);
  };

  const onEditSubmit = (data: z.infer<typeof insertProjectSchema>) => {
    if (editingProject) {
      updateProjectMutation.mutate({ id: editingProject.id, data });
    }
  };

  // Handle edit dialog
  const handleEdit = (project: Project) => {
    setEditingProject(project);
    editForm.reset({
      name: project.name,
      description: project.description || "",
      status: project.status as "active" | "archived",
      dueDate: project.dueDate ? new Date(project.dueDate) : undefined,
    });
    setEditDialogOpen(true);
  };

  // Handle archive/unarchive
  const handleToggleArchive = (project: Project) => {
    const newStatus = project.status === "active" ? "archived" : "active";
    updateProjectMutation.mutate({ 
      id: project.id, 
      data: { status: newStatus } 
    });
  };

  // Format date
  const formatDate = (date: string | Date | null) => {
    if (!date) return "未设置";
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  // Status config
  const statusConfig = {
    active: { label: "活跃", color: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-300" },
    archived: { label: "已归档", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
  };

  if (projectsLoading) {
    return (
      <div className="space-y-6" data-testid="projects-loading">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">项目管理</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-2 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (projectsError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4" data-testid="projects-error">
        <FolderOpen className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold text-foreground">加载项目失败</h2>
        <p className="text-muted-foreground">请稍后重试或联系管理员。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="projects-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="page-title">
            项目管理
          </h1>
          <p className="text-muted-foreground mt-1">
            管理您的所有项目和任务进度
          </p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0" data-testid="button-create-project">
              <Plus className="w-4 h-4 mr-2" />
              新建项目
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-create-project">
            <DialogHeader>
              <DialogTitle>创建新项目</DialogTitle>
              <DialogDescription>
                填写项目基本信息，开始管理您的任务。
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>项目名称</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="输入项目名称" 
                          {...field} 
                          data-testid="input-project-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>项目描述</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="输入项目描述（可选）" 
                          {...field}
                          value={field.value || ""} 
                          data-testid="input-project-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>执行日期</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          data-testid="input-project-due-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setCreateDialogOpen(false)}
                    data-testid="button-cancel-create"
                  >
                    取消
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createProjectMutation.isPending}
                    data-testid="button-submit-create"
                  >
                    {createProjectMutation.isPending ? "创建中..." : "创建项目"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索项目名称或描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-projects"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value: "all" | "active" | "archived") => setStatusFilter(value)}>
          <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
            <SelectValue placeholder="筛选状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" data-testid="filter-all">全部项目</SelectItem>
            <SelectItem value="active" data-testid="filter-active">活跃项目</SelectItem>
            <SelectItem value="archived" data-testid="filter-archived">已归档</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary */}
      {debouncedSearchQuery && (
        <div className="text-sm text-muted-foreground" data-testid="search-results-summary">
          找到 {filteredProjects.length} 个项目包含 "{debouncedSearchQuery}"
        </div>
      )}

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4" data-testid="projects-empty">
          <FolderOpen className="w-16 h-16 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-foreground">
            {debouncedSearchQuery ? "没有找到匹配的项目" : "还没有项目"}
          </h2>
          <p className="text-muted-foreground text-center">
            {debouncedSearchQuery 
              ? "尝试调整搜索条件或筛选设置"
              : "点击上方的'新建项目'按钮开始创建您的第一个项目"
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="projects-grid">
          {filteredProjects.map((project) => {
            const stats = getProjectStats(project.id);
            return (
              <Card key={project.id} className="hover-elevate" data-testid={`project-card-${project.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg line-clamp-1" data-testid={`project-title-${project.id}`}>
                        {project.name}
                      </CardTitle>
                      {project.description && (
                        <CardDescription className="line-clamp-2 mt-1" data-testid={`project-description-${project.id}`}>
                          {project.description}
                        </CardDescription>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0" data-testid={`project-menu-${project.id}`}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(project)} data-testid={`project-edit-${project.id}`}>
                          <Edit className="w-4 h-4 mr-2" />
                          编辑项目
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleArchive(project)} data-testid={`project-archive-${project.id}`}>
                          <Archive className="w-4 h-4 mr-2" />
                          {project.status === "active" ? "归档项目" : "恢复项目"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            setProjectToDelete(project);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive focus:text-destructive"
                          data-testid={`project-delete-${project.id}`}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          删除项目
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Badge 
                      className={statusConfig[project.status as keyof typeof statusConfig].color}
                      data-testid={`project-status-${project.id}`}
                    >
                      {statusConfig[project.status as keyof typeof statusConfig].label}
                    </Badge>
                    {project.dueDate && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(project.dueDate)}
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Task Statistics */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">总任务</div>
                        <div className="text-sm font-medium" data-testid={`project-total-tasks-${project.id}`}>
                          {stats.total}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">进行中</div>
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400" data-testid={`project-in-progress-tasks-${project.id}`}>
                          {stats.inProgress}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">已完成</div>
                        <div className="text-sm font-medium text-green-600 dark:text-green-400" data-testid={`project-completed-tasks-${project.id}`}>
                          {stats.completed}
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">完成进度</span>
                        <span className="font-medium" data-testid={`project-progress-${project.id}`}>
                          {stats.progress}%
                        </span>
                      </div>
                      <Progress value={stats.progress} className="h-2" />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-3">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => navigate(`/kanban?project=${project.id}`)}
                    data-testid={`project-view-kanban-${project.id}`}
                  >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    查看看板
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent data-testid="dialog-edit-project">
          <DialogHeader>
            <DialogTitle>编辑项目</DialogTitle>
            <DialogDescription>
              修改项目信息。
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>项目名称</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="输入项目名称" 
                        {...field} 
                        data-testid="input-edit-project-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>项目描述</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="输入项目描述（可选）" 
                        {...field}
                        value={field.value || ""} 
                        data-testid="input-edit-project-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>项目状态</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-project-status">
                          <SelectValue placeholder="选择项目状态" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">活跃</SelectItem>
                        <SelectItem value="archived">已归档</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>到期日期</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        data-testid="input-edit-project-due-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditDialogOpen(false)}
                  data-testid="button-cancel-edit"
                >
                  取消
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateProjectMutation.isPending}
                  data-testid="button-submit-edit"
                >
                  {updateProjectMutation.isPending ? "更新中..." : "更新项目"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-delete-project">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除项目</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除项目 "{projectToDelete?.name}" 吗？此操作无法撤销，项目下的所有任务也将被删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">
              取消
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (projectToDelete) {
                  deleteProjectMutation.mutate(projectToDelete.id);
                  setDeleteDialogOpen(false);
                  setProjectToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}