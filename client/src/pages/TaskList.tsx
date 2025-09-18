import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit,
  Calendar,
  Flag,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { taskApi, projectApi } from "@/lib/api";
import { Task, Project, TaskStatus, TaskPriority, TaskStatusType, TaskPriorityType, InsertTask, insertTaskSchema } from "@shared/schema";
import { useDebounce } from "@/hooks/use-debounce";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type SortField = "title" | "status" | "priority" | "dueDate" | "createdAt" | "updatedAt";
type SortDirection = "asc" | "desc";

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export default function TaskList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: "updatedAt", direction: "desc" });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Create form
  const createForm = useForm<z.infer<typeof insertTaskSchema>>({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      projectId: "",
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: undefined,
      estimatedHours: undefined,
      actualHours: undefined,
      tags: undefined,
    },
  });

  // Edit form
  const editForm = useForm<z.infer<typeof insertTaskSchema>>({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      projectId: "",
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: undefined,
      estimatedHours: undefined,
      actualHours: undefined,
      tags: undefined,
    },
  });

  // Fetch tasks and projects
  const { 
    data: allTasks = [], 
    isLoading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks 
  } = useQuery({
    queryKey: ["/api/tasks"],
    queryFn: () => taskApi.getAll(),
  });

  const { 
    data: projects = [],
    isLoading: projectsLoading 
  } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: () => projectApi.getAll(),
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (data: InsertTask) => taskApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setCreateDialogOpen(false);
      createForm.reset();
      toast({
        title: "任务创建成功",
        description: "新任务已成功创建。",
      });
    },
    onError: (error) => {
      toast({
        title: "创建失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertTask> }) =>
      taskApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setEditDialogOpen(false);
      setEditingTask(null);
      editForm.reset();
      toast({
        title: "任务更新成功",
        description: "任务信息已成功更新。",
      });
    },
    onError: (error) => {
      toast({
        title: "更新失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: taskApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "任务已删除" });
    },
    onError: (error) => {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive"
      });
    },
  });


  // Update task status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      taskApi.updateStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "任务状态已更新" });
    },
    onError: (error) => {
      toast({ 
        title: "更新失败", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  // Filter and sort tasks
  const getFilteredAndSortedTasks = () => {
    // Always create a copy to avoid mutating the React Query cache
    let filtered = [...allTasks];

    // Search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        (task.tags || []).some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Project filter
    if (projectFilter !== "all") {
      filtered = filtered.filter(task => task.projectId === projectFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      const { field, direction } = sortConfig;
      let aValue: any, bValue: any;

      switch (field) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "priority":
          const priorityOrder: Record<string, number> = { low: 1, medium: 2, high: 3, urgent: 4 };
          aValue = priorityOrder[a.priority] || 0;
          bValue = priorityOrder[b.priority] || 0;
          break;
        case "dueDate":
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          break;
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "updatedAt":
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const filteredTasks = getFilteredAndSortedTasks();

  // Handle sorting
  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc"
    }));
  };


  // Handle form submission
  const onCreateSubmit = (data: z.infer<typeof insertTaskSchema>) => {
    createTaskMutation.mutate(data);
  };

  const onEditSubmit = (data: z.infer<typeof insertTaskSchema>) => {
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, data });
    }
  };

  // Handle edit task
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    editForm.reset({
      title: task.title,
      description: task.description || "",
      projectId: task.projectId,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      estimatedHours: task.estimatedHours,
      actualHours: task.actualHours,
      tags: task.tags,
    });
    setEditDialogOpen(true);
  };

  // Get project name
  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || "未知项目";
  };

  // Format date
  const formatDate = (date: string | Date | null) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  // Highlight search terms
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, index) => 
          // Use index parity instead of regex.test to avoid stateful issues
          index % 2 === 1 ? (
            <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Status and priority display configs
  const statusConfig = {
    [TaskStatus.TODO]: { label: "待办", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
    [TaskStatus.IN_PROGRESS]: { label: "进行中", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
    [TaskStatus.DONE]: { label: "已完成", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  };

  const priorityConfig = {
    [TaskPriority.LOW]: { label: "低", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
    [TaskPriority.MEDIUM]: { label: "中", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
    [TaskPriority.HIGH]: { label: "高", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
    [TaskPriority.URGENT]: { label: "紧急", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  };

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return sortConfig.direction === "asc" ? 
      <ArrowUp className="w-4 h-4" /> : 
      <ArrowDown className="w-4 h-4" />;
  };

  if (tasksError) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-destructive mb-4">加载任务失败: {tasksError.message}</p>
          <Button onClick={() => refetchTasks()} variant="outline">
            重试
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="task-list-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="page-title">
            任务列表
          </h1>
          <p className="text-muted-foreground mt-1">
            管理和跟踪所有任务 • 共 {filteredTasks.length} 个任务
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-task">
              <Plus className="w-4 h-4 mr-2" />
              新建任务
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="搜索任务..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-tasks"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2 items-center">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px]" data-testid="select-status-filter">
                    <SelectValue placeholder="状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有状态</SelectItem>
                    <SelectItem value={TaskStatus.TODO}>待办</SelectItem>
                    <SelectItem value={TaskStatus.IN_PROGRESS}>进行中</SelectItem>
                    <SelectItem value={TaskStatus.DONE}>已完成</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[120px]" data-testid="select-priority-filter">
                    <SelectValue placeholder="优先级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有优先级</SelectItem>
                    <SelectItem value={TaskPriority.LOW}>低</SelectItem>
                    <SelectItem value={TaskPriority.MEDIUM}>中</SelectItem>
                    <SelectItem value={TaskPriority.HIGH}>高</SelectItem>
                    <SelectItem value={TaskPriority.URGENT}>紧急</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-[140px]" data-testid="select-project-filter">
                    <SelectValue placeholder="项目" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有项目</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardHeader className="border-b bg-muted/30">
          <div className="grid grid-cols-[auto_1fr_120px_100px_100px_120px_auto] gap-4 items-center text-sm font-medium text-muted-foreground">
            <div className="text-center">
              完成
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort("title")}
              className="justify-start p-0 h-auto font-medium text-muted-foreground hover:text-foreground"
              data-testid="button-sort-title"
            >
              任务标题
              {getSortIcon("title")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort("status")}
              className="justify-center p-0 h-auto font-medium text-muted-foreground hover:text-foreground"
              data-testid="button-sort-status"
            >
              状态
              {getSortIcon("status")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort("priority")}
              className="justify-center p-0 h-auto font-medium text-muted-foreground hover:text-foreground"
              data-testid="button-sort-priority"
            >
              优先级
              {getSortIcon("priority")}
            </Button>
            <div className="text-center">项目</div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-center p-0 h-auto font-medium text-muted-foreground hover:text-foreground"
                  data-testid="button-sort-date"
                >
                  日期排序 {getSortIcon(sortConfig.field.includes('Date') || sortConfig.field.includes('At') ? sortConfig.field as SortField : 'dueDate')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleSort("dueDate")}>执行日期</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("createdAt")}>创建时间</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("updatedAt")}>更新时间</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="text-center">操作</div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {tasksLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span className="text-muted-foreground">加载任务中...</span>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" || priorityFilter !== "all" || projectFilter !== "all" 
                  ? "没有找到符合条件的任务" 
                  : "暂无任务"}
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="grid grid-cols-[auto_1fr_120px_100px_100px_120px_auto] gap-4 items-center p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  data-testid={`task-row-${task.id}`}
                  onClick={() => handleEditTask(task)}
                >
                  {/* Complete/Incomplete Toggle */}
                  <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={task.status === TaskStatus.DONE}
                      onCheckedChange={(checked) => {
                        updateStatusMutation.mutate({
                          taskId: task.id,
                          status: checked ? TaskStatus.DONE : TaskStatus.TODO
                        });
                      }}
                      data-testid={`checkbox-task-${task.id}`}
                    />
                  </div>

                  {/* Title and Description */}
                  <div className="min-w-0">
                    <h3 
                      className="font-medium text-sm text-foreground line-clamp-1" 
                      data-testid={`text-task-title-${task.id}`}
                    >
                      {highlightSearchTerm(task.title, debouncedSearchQuery)}
                    </h3>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {highlightSearchTerm(task.description, debouncedSearchQuery)}
                      </p>
                    )}
                    {(task.tags && task.tags.length > 0) && (
                      <div className="flex gap-1 mt-2">
                        {task.tags.slice(0, 3).map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs px-1 py-0 h-5"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {task.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs px-1 py-0 h-5">
                            +{task.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="text-center">
                    <Badge 
                      className={statusConfig[task.status as TaskStatusType].color}
                      data-testid={`badge-status-${task.id}`}
                    >
                      {statusConfig[task.status as TaskStatusType].label}
                    </Badge>
                  </div>

                  {/* Priority */}
                  <div className="text-center">
                    <Badge 
                      className={priorityConfig[task.priority as TaskPriorityType].color}
                      data-testid={`badge-priority-${task.id}`}
                    >
                      <Flag className="w-3 h-3 mr-1" />
                      {priorityConfig[task.priority as TaskPriorityType].label}
                    </Badge>
                  </div>

                  {/* Project */}
                  <div className="text-center text-sm text-muted-foreground truncate">
                    {getProjectName(task.projectId)}
                  </div>

                  {/* Due Date */}
                  <div className="text-center text-sm text-muted-foreground">
                    {task.dueDate && (
                      <div className="flex items-center justify-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(task.dueDate)}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          data-testid={`button-task-actions-${task.id}`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ taskId: task.id, status: TaskStatus.TODO })}>
                          标记为待办
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ taskId: task.id, status: TaskStatus.IN_PROGRESS })}>
                          标记为进行中
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ taskId: task.id, status: TaskStatus.DONE })}>
                          标记为已完成
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => deleteTaskMutation.mutate(task.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Task Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent data-testid="dialog-create-task">
          <DialogHeader>
            <DialogTitle>创建新任务</DialogTitle>
            <DialogDescription>
              填写任务详细信息，开始跟踪您的工作进度。
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>任务标题 *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="输入任务标题"
                        {...field}
                        data-testid="input-task-title"
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
                    <FormLabel>任务描述</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="输入任务描述（可选）"
                        {...field}
                        value={field.value || ""}
                        data-testid="input-task-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>所属项目 *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-task-project">
                            <SelectValue placeholder="选择项目" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>优先级</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-task-priority">
                            <SelectValue placeholder="选择优先级" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={TaskPriority.LOW}>低</SelectItem>
                          <SelectItem value={TaskPriority.MEDIUM}>中</SelectItem>
                          <SelectItem value={TaskPriority.HIGH}>高</SelectItem>
                          <SelectItem value={TaskPriority.URGENT}>紧急</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                          data-testid="input-task-due-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="estimatedHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>预估工时（小时）</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          value={field.value || ""}
                          data-testid="input-task-estimated-hours"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  data-testid="button-cancel-create-task"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={createTaskMutation.isPending}
                  data-testid="button-submit-create-task"
                >
                  {createTaskMutation.isPending ? "创建中..." : "创建任务"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent data-testid="dialog-edit-task">
          <DialogHeader>
            <DialogTitle>编辑任务</DialogTitle>
            <DialogDescription>
              修改任务详细信息，更新工作进度。
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>任务标题 *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="输入任务标题"
                        {...field}
                        data-testid="input-edit-task-title"
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
                    <FormLabel>任务描述</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="输入任务描述（可选）"
                        {...field}
                        value={field.value || ""}
                        data-testid="input-edit-task-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>所属项目 *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-task-project">
                            <SelectValue placeholder="选择项目" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>任务状态</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-task-status">
                            <SelectValue placeholder="选择状态" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={TaskStatus.TODO}>待办</SelectItem>
                          <SelectItem value={TaskStatus.IN_PROGRESS}>进行中</SelectItem>
                          <SelectItem value={TaskStatus.DONE}>已完成</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>优先级</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-task-priority">
                            <SelectValue placeholder="选择优先级" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={TaskPriority.LOW}>低</SelectItem>
                          <SelectItem value={TaskPriority.MEDIUM}>中</SelectItem>
                          <SelectItem value={TaskPriority.HIGH}>高</SelectItem>
                          <SelectItem value={TaskPriority.URGENT}>紧急</SelectItem>
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
                      <FormLabel>执行日期</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          data-testid="input-edit-task-due-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="estimatedHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>预估工时（小时）</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          value={field.value || ""}
                          data-testid="input-edit-task-estimated-hours"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="actualHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>实际工时（小时）</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          value={field.value || ""}
                          data-testid="input-edit-task-actual-hours"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  data-testid="button-cancel-edit-task"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={updateTaskMutation.isPending}
                  data-testid="button-submit-edit-task"
                >
                  {updateTaskMutation.isPending ? "更新中..." : "更新任务"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}