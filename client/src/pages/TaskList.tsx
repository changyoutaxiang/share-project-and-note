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
import { Task, Project, TaskStatus, TaskPriority, TaskStatusType, TaskPriorityType } from "@shared/schema";
import { useDebounce } from "@/hooks/use-debounce";

type SortField = "title" | "status" | "priority" | "dueDate" | "createdAt" | "updatedAt";
type SortDirection = "asc" | "desc";

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export default function TaskList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: "updatedAt", direction: "desc" });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

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

  // Batch delete mutation
  const batchDeleteMutation = useMutation({
    mutationFn: async (taskIds: string[]) => {
      for (const id of taskIds) {
        await taskApi.delete(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setSelectedTasks(new Set());
      toast({ title: "批量删除成功" });
    },
    onError: (error) => {
      toast({ 
        title: "批量删除失败", 
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

  // Handle task selection
  const handleTaskSelect = (taskId: string, checked: boolean) => {
    const newSelected = new Set(selectedTasks);
    if (checked) {
      newSelected.add(taskId);
    } else {
      newSelected.delete(taskId);
    }
    setSelectedTasks(newSelected);
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(new Set(filteredTasks.map(task => task.id)));
    } else {
      setSelectedTasks(new Set());
    }
  };

  // Handle batch operations
  const handleBatchDelete = () => {
    if (selectedTasks.size > 0) {
      batchDeleteMutation.mutate(Array.from(selectedTasks));
    }
  };

  const handleBatchStatusUpdate = (status: TaskStatusType) => {
    Array.from(selectedTasks).forEach(taskId => {
      updateStatusMutation.mutate({ taskId, status });
    });
    setSelectedTasks(new Set());
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
        <Button
          onClick={() => console.log("Create new task")}
          data-testid="button-create-task"
        >
          <Plus className="w-4 h-4 mr-2" />
          新建任务
        </Button>
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

            {/* Batch Operations */}
            {selectedTasks.size > 0 && (
              <div className="flex gap-2 items-center">
                <span className="text-sm text-muted-foreground">
                  已选择 {selectedTasks.size} 个任务
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" data-testid="button-batch-operations">
                      批量操作
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBatchStatusUpdate(TaskStatus.TODO)}>
                      标记为待办
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBatchStatusUpdate(TaskStatus.IN_PROGRESS)}>
                      标记为进行中
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBatchStatusUpdate(TaskStatus.DONE)}>
                      标记为已完成
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleBatchDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      批量删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardHeader className="border-b bg-muted/30">
          <div className="grid grid-cols-[auto_1fr_120px_100px_100px_120px_auto] gap-4 items-center text-sm font-medium text-muted-foreground">
            <div className="flex items-center">
              <Checkbox
                checked={selectedTasks.size === filteredTasks.length && filteredTasks.length > 0}
                onCheckedChange={handleSelectAll}
                data-testid="checkbox-select-all"
              />
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
                <DropdownMenuItem onClick={() => handleSort("dueDate")}>到期日期</DropdownMenuItem>
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
                  className="grid grid-cols-[auto_1fr_120px_100px_100px_120px_auto] gap-4 items-center p-4 hover:bg-muted/50 transition-colors"
                  data-testid={`task-row-${task.id}`}
                >
                  {/* Checkbox */}
                  <div className="flex items-center">
                    <Checkbox
                      checked={selectedTasks.has(task.id)}
                      onCheckedChange={(checked) => handleTaskSelect(task.id, checked as boolean)}
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
                  <div className="flex items-center justify-center">
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
                        <DropdownMenuItem onClick={() => console.log("Edit task:", task.id)}>
                          <Edit className="w-4 h-4 mr-2" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
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
    </div>
  );
}