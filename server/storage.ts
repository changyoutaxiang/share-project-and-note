import {
  type Project,
  type InsertProject,
  type Task,
  type InsertTask,
  type Tag,
  type InsertTag,
  type Milestone,
  type InsertMilestone,
  TaskStatus,
  TaskPriority
} from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface for all CRUD operations
export interface IStorage {
  // Project operations
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;

  // Task operations
  getTasks(projectId?: string): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
  updateTaskStatus(id: string, status: string): Promise<Task | undefined>;

  // Tag operations
  getTags(): Promise<Tag[]>;
  getTag(id: string): Promise<Tag | undefined>;
  createTag(tag: InsertTag): Promise<Tag>;
  updateTag(id: string, updates: Partial<InsertTag>): Promise<Tag | undefined>;
  deleteTag(id: string): Promise<boolean>;

  // Milestone operations
  getMilestones(projectId?: string): Promise<Milestone[]>;
  getMilestone(id: string): Promise<Milestone | undefined>;
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  updateMilestone(id: string, updates: Partial<InsertMilestone>): Promise<Milestone | undefined>;
  deleteMilestone(id: string): Promise<boolean>;

  // Gantt chart operations
  getGanttData(projectId: string): Promise<{
    tasks: Task[];
    milestones: Milestone[];
    dependencies: { taskId: string; dependsOn: string[] }[];
  }>;
  updateTaskSchedule(id: string, startDate: Date, endDate: Date): Promise<Task | undefined>;
  updateTaskProgress(id: string, progress: number): Promise<Task | undefined>;
  updateTaskDependencies(id: string, dependencies: string[]): Promise<Task | undefined>;

  // Search operations
  searchTasks(query: string): Promise<Task[]>;
  searchProjects(query: string): Promise<Project[]>;

  // Analytics operations
  getOverviewStats(): Promise<any>;
  getRiskAnalysis(): Promise<any>;
  getResourceUtilization(): Promise<any>;
  getEfficiencyStats(): Promise<any>;
  getAgileMetrics(): Promise<any>;
}

// Export MemStorage for use in routes.ts
export class MemStorage implements IStorage {
  private projects: Map<string, Project>;
  private tasks: Map<string, Task>;
  private tags: Map<string, Tag>;
  private milestones: Map<string, Milestone>;

  constructor() {
    this.projects = new Map();
    this.tasks = new Map();
    this.tags = new Map();
    this.milestones = new Map();

    // Initialize with sample data for demonstration
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample projects
    const project1: Project = {
      id: "proj-1",
      name: "个人项目管理应用",
      description: "开发一个功能完整的个人项目管理工具，支持任务管理、项目跟踪和进度可视化。",
      status: "active",
      dueDate: new Date("2025-02-28"),
      createdAt: new Date("2025-01-01"),
    };

    const project2: Project = {
      id: "proj-2",
      name: "网站重设计项目",
      description: "重新设计公司官方网站，提升用户体验和现代化设计。",
      status: "active",
      dueDate: new Date("2025-03-15"),
      createdAt: new Date("2025-01-10"),
    };

    this.projects.set(project1.id, project1);
    this.projects.set(project2.id, project2);

    // Create sample tasks with Gantt chart data
    const tasks: Task[] = [
      {
        id: "task-1",
        projectId: "proj-1",
        title: "设计数据库架构",
        description: "设计项目和任务的数据模型，确保数据完整性和查询性能。",
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        dueDate: new Date("2025-01-20"),
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-01-20"),
        progress: 100,
        dependencies: [],
        milestoneId: "milestone-1",
        estimatedHours: 6,
        actualHours: 5,
        tags: ["后端", "数据库"],
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-15"),
      },
      {
        id: "task-2",
        projectId: "proj-1",
        title: "实现任务看板功能",
        description: "开发拖拽式任务看板，支持任务状态切换和实时更新。",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: new Date("2025-01-25"),
        startDate: new Date("2025-01-15"),
        endDate: new Date("2025-01-25"),
        progress: 60,
        dependencies: ["task-1"],
        milestoneId: null,
        estimatedHours: 10,
        actualHours: null,
        tags: ["前端", "React"],
        createdAt: new Date("2025-01-10"),
        updatedAt: new Date("2025-01-18"),
      },
      {
        id: "task-3",
        projectId: "proj-2",
        title: "用户体验研究",
        description: "进行用户访谈和需求分析，了解用户痛点和需求。",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date("2025-01-30"),
        startDate: new Date("2025-01-20"),
        endDate: new Date("2025-01-30"),
        progress: 0,
        dependencies: [],
        milestoneId: "milestone-2",
        estimatedHours: 8,
        actualHours: null,
        tags: ["UX", "研究"],
        createdAt: new Date("2025-01-12"),
        updatedAt: new Date("2025-01-12"),
      },
      {
        id: "task-4",
        projectId: "proj-1",
        title: "API接口开发",
        description: "开发RESTful API接口，支持项目和任务的CRUD操作。",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: new Date("2025-02-01"),
        startDate: new Date("2025-01-18"),
        endDate: new Date("2025-02-01"),
        progress: 40,
        dependencies: ["task-1"],
        milestoneId: null,
        estimatedHours: 12,
        actualHours: null,
        tags: ["后端", "API"],
        createdAt: new Date("2025-01-15"),
        updatedAt: new Date("2025-01-19"),
      },
    ];

    tasks.forEach(task => this.tasks.set(task.id, task));

    // Create sample tags
    const sampleTags: Tag[] = [
      { id: "tag-1", name: "前端", color: "#3B82F6", createdAt: new Date() },
      { id: "tag-2", name: "后端", color: "#10B981", createdAt: new Date() },
      { id: "tag-3", name: "设计", color: "#F59E0B", createdAt: new Date() },
      { id: "tag-4", name: "测试", color: "#8B5CF6", createdAt: new Date() },
    ];

    sampleTags.forEach(tag => this.tags.set(tag.id, tag));

    // Create sample milestones
    const sampleMilestones: Milestone[] = [
      {
        id: "milestone-1",
        projectId: "proj-1",
        name: "数据库设计完成",
        description: "完成所有数据模型设计和数据库架构规划",
        date: new Date("2025-01-20"),
        color: "#10B981",
        completed: true,
        createdAt: new Date("2025-01-01"),
      },
      {
        id: "milestone-2",
        projectId: "proj-2",
        name: "用户研究阶段完成",
        description: "完成用户需求调研和分析工作",
        date: new Date("2025-01-30"),
        color: "#EF4444",
        completed: false,
        createdAt: new Date("2025-01-12"),
      },
      {
        id: "milestone-3",
        projectId: "proj-1",
        name: "核心功能开发完成",
        description: "完成项目管理核心功能开发",
        date: new Date("2025-02-15"),
        color: "#8B5CF6",
        completed: false,
        createdAt: new Date("2025-01-15"),
      },
    ];

    sampleMilestones.forEach(milestone => this.milestones.set(milestone.id, milestone));
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = {
      id,
      name: insertProject.name,
      description: insertProject.description ?? null,
      status: insertProject.status ?? "active",
      dueDate: insertProject.dueDate ?? null,
      createdAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, ...updates };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: string): Promise<boolean> {
    // Also delete all tasks associated with this project
    const projectTasks = Array.from(this.tasks.values()).filter(task => task.projectId === id);
    projectTasks.forEach(task => this.tasks.delete(task.id));
    
    return this.projects.delete(id);
  }

  // Task operations
  async getTasks(projectId?: string): Promise<Task[]> {
    const allTasks = Array.from(this.tasks.values());
    const filteredTasks = projectId 
      ? allTasks.filter(task => task.projectId === projectId)
      : allTasks;
    
    return filteredTasks.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const now = new Date();
    const task: Task = {
      id,
      projectId: insertTask.projectId,
      title: insertTask.title,
      description: insertTask.description ?? null,
      status: insertTask.status ?? TaskStatus.TODO,
      priority: insertTask.priority ?? TaskPriority.MEDIUM,
      dueDate: insertTask.dueDate ?? null,
      startDate: insertTask.startDate ?? null,
      endDate: insertTask.endDate ?? null,
      progress: insertTask.progress ?? 0,
      dependencies: insertTask.dependencies ?? null,
      milestoneId: insertTask.milestoneId ?? null,
      estimatedHours: insertTask.estimatedHours ?? null,
      actualHours: insertTask.actualHours ?? null,
      tags: insertTask.tags ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { 
      ...task, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async updateTaskStatus(id: string, status: string): Promise<Task | undefined> {
    return this.updateTask(id, { status });
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Tag operations
  async getTags(): Promise<Tag[]> {
    return Array.from(this.tags.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getTag(id: string): Promise<Tag | undefined> {
    return this.tags.get(id);
  }

  async createTag(insertTag: InsertTag): Promise<Tag> {
    const id = randomUUID();
    const tag: Tag = {
      id,
      name: insertTag.name,
      color: insertTag.color ?? "#3B82F6",
      createdAt: new Date(),
    };
    this.tags.set(id, tag);
    return tag;
  }

  async updateTag(id: string, updates: Partial<InsertTag>): Promise<Tag | undefined> {
    const tag = this.tags.get(id);
    if (!tag) return undefined;
    
    const updatedTag = { ...tag, ...updates };
    this.tags.set(id, updatedTag);
    return updatedTag;
  }

  async deleteTag(id: string): Promise<boolean> {
    return this.tags.delete(id);
  }

  // Search operations
  async searchTasks(query: string): Promise<Task[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.tasks.values()).filter(task =>
      task.title.toLowerCase().includes(lowerQuery) ||
      task.description?.toLowerCase().includes(lowerQuery) ||
      task.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  async searchProjects(query: string): Promise<Project[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.projects.values()).filter(project =>
      project.name.toLowerCase().includes(lowerQuery) ||
      project.description?.toLowerCase().includes(lowerQuery)
    );
  }

  // Analytics operations
  async getOverviewStats(): Promise<any> {
    const projects = Array.from(this.projects.values());
    const tasks = Array.from(this.tasks.values());

    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;

    const totalTasks = tasks.length;
    const todoTasks = tasks.filter(t => t.status === TaskStatus.TODO).length;
    const inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
    const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE).length;

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0;

    // Calculate average task cycle time (completed tasks only)
    const completedTasksWithTime = tasks.filter(t =>
      t.status === TaskStatus.DONE && t.actualHours && t.estimatedHours
    );
    const avgCycleTime = completedTasksWithTime.length > 0
      ? (completedTasksWithTime.reduce((sum, t) => sum + (t.actualHours || 0), 0) / completedTasksWithTime.length).toFixed(1)
      : 0;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,
      completionRate: parseFloat(completionRate as string),
      avgCycleTime: parseFloat(avgCycleTime as string),
    };
  }

  async getResourceUtilization(): Promise<any> {
    const tasks = Array.from(this.tasks.values());
    const projects = Array.from(this.projects.values());
    const now = new Date();

    // 任务负载热力图数据 (7天 x 24小时)
    const heatmapData = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const date = new Date(now.getTime() - (6 - day) * 24 * 60 * 60 * 1000);

        // 模拟在特定时间段的任务创建和完成密度
        const createdInHour = tasks.filter(t => {
          const created = new Date(t.createdAt);
          return created.getDay() === date.getDay() &&
                 created.getHours() >= hour && created.getHours() < hour + 1;
        }).length;

        const completedInHour = tasks.filter(t => {
          const updated = new Date(t.updatedAt);
          return t.status === TaskStatus.DONE &&
                 updated.getDay() === date.getDay() &&
                 updated.getHours() >= hour && updated.getHours() < hour + 1;
        }).length;

        heatmapData.push({
          day: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][day],
          hour: hour,
          activity: createdInHour + completedInHour * 2, // 完成任务权重更高
          created: createdInHour,
          completed: completedInHour
        });
      }
    }

    // 并行任务趋势 (最近7天)
    const parallelTaskTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const tasksOnDate = tasks.filter(t => {
        const created = new Date(t.createdAt);
        return created <= date && (t.status === TaskStatus.IN_PROGRESS ||
               (t.status === TaskStatus.DONE && new Date(t.updatedAt) > date));
      });

      parallelTaskTrend.push({
        date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        inProgress: tasksOnDate.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
        todo: tasksOnDate.filter(t => t.status === TaskStatus.TODO).length,
        total: tasksOnDate.length
      });
    }

    // 项目工作量分布
    const projectWorkload = projects.map(project => {
      const projectTasks = tasks.filter(t => t.projectId === project.id);
      const totalEstimated = projectTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
      const totalActual = projectTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);
      const completedTasks = projectTasks.filter(t => t.status === TaskStatus.DONE).length;

      return {
        name: project.name,
        estimatedHours: totalEstimated,
        actualHours: totalActual,
        taskCount: projectTasks.length,
        completedCount: completedTasks,
        progress: projectTasks.length > 0 ? (completedTasks / projectTasks.length * 100).toFixed(1) : 0
      };
    });

    // 任务类型分布 (基于标签)
    const tagDistribution: Record<string, number> = {};
    tasks.forEach(task => {
      if (task.tags) {
        task.tags.forEach(tag => {
          tagDistribution[tag] = (tagDistribution[tag] || 0) + 1;
        });
      }
    });

    const tagData = Object.entries(tagDistribution).map(([tag, count]) => ({
      name: tag,
      value: count,
      fill: tag === '前端' ? '#3B82F6' :
            tag === '后端' ? '#10B981' :
            tag === '设计' ? '#F59E0B' :
            tag === '测试' ? '#8B5CF6' : '#6B7280'
    }));

    // 工作时间分析
    const workingHours = Array.from({length: 24}, (_, hour) => {
      const hourTasks = tasks.filter(t => {
        const created = new Date(t.createdAt);
        return created.getHours() === hour;
      });

      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        taskCount: hourTasks.length,
        productivity: hourTasks.filter(t => t.status === TaskStatus.DONE).length
      };
    });

    return {
      heatmapData,
      parallelTaskTrend,
      projectWorkload,
      tagDistribution: tagData,
      workingHours,
      summary: {
        avgParallelTasks: parallelTaskTrend.length > 0
          ? (parallelTaskTrend.reduce((sum, d) => sum + d.inProgress, 0) / parallelTaskTrend.length).toFixed(1)
          : 0,
        peakWorkingHour: workingHours.reduce((max, curr) =>
          curr.taskCount > max.taskCount ? curr : max, workingHours[0]).hour,
        mostActiveTag: tagData.length > 0
          ? tagData.reduce((max, curr) => curr.value > max.value ? curr : max, tagData[0]).name
          : '无'
      }
    };
  }

  async getRiskAnalysis(): Promise<any> {
    const tasks = Array.from(this.tasks.values());
    const now = new Date();

    // Calculate risk score for each task
    const riskData = tasks.map(task => {
      let riskScore = 0;
      let impact = 1;
      let probability = 1;

      // Impact based on priority
      if (task.priority === TaskPriority.URGENT) impact = 5;
      else if (task.priority === TaskPriority.HIGH) impact = 4;
      else if (task.priority === TaskPriority.MEDIUM) impact = 2;
      else impact = 1;

      // Probability based on due date proximity
      if (task.dueDate) {
        const daysUntilDue = Math.ceil((task.dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
        if (daysUntilDue < 0) probability = 5; // Overdue
        else if (daysUntilDue < 3) probability = 4; // Due soon
        else if (daysUntilDue < 7) probability = 3; // Due this week
        else if (daysUntilDue < 14) probability = 2; // Due in 2 weeks
        else probability = 1; // Not urgent
      }

      riskScore = impact * probability;

      return {
        id: task.id,
        title: task.title,
        impact,
        probability,
        riskScore,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate
      };
    });

    // Categorize risks
    const highRisk = riskData.filter(r => r.riskScore >= 15).length;
    const mediumRisk = riskData.filter(r => r.riskScore >= 8 && r.riskScore < 15).length;
    const lowRisk = riskData.filter(r => r.riskScore < 8).length;

    // Overdue tasks
    const overdueTasks = tasks.filter(t => t.dueDate && t.dueDate < now && t.status !== TaskStatus.DONE).length;

    return {
      riskMatrix: riskData,
      riskSummary: {
        high: highRisk,
        medium: mediumRisk,
        low: lowRisk
      },
      overdueTasks,
      upcomingDeadlines: riskData
        .filter(r => r.dueDate && r.dueDate > now && r.status !== TaskStatus.DONE)
        .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
        .slice(0, 5)
    };
  }

  async getEfficiencyStats(): Promise<any> {
    const tasks = Array.from(this.tasks.values());

    // Velocity calculation (tasks completed per week)
    const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE);
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const tasksCompletedThisWeek = completedTasks.filter(t =>
      t.updatedAt && new Date(t.updatedAt) >= oneWeekAgo
    ).length;

    // Cycle time analysis
    const tasksWithTime = tasks.filter(t => t.actualHours && t.estimatedHours);
    const cycleTimeData = tasksWithTime.map(t => ({
      id: t.id,
      title: t.title,
      estimated: t.estimatedHours,
      actual: t.actualHours,
      efficiency: t.estimatedHours && t.actualHours ? (t.estimatedHours / t.actualHours * 100).toFixed(1) : '0'
    }));

    // First-time completion rate
    const firstTimeRight = completedTasks.filter(t =>
      t.actualHours && t.estimatedHours && t.actualHours <= t.estimatedHours!
    ).length;
    const firstTimeRightRate = completedTasks.length > 0
      ? (firstTimeRight / completedTasks.length * 100).toFixed(1)
      : 0;

    // Weekly velocity trend (last 4 weeks)
    const velocityTrend = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekTasks = completedTasks.filter(t =>
        t.updatedAt && new Date(t.updatedAt) >= weekStart && new Date(t.updatedAt) < weekEnd
      ).length;

      velocityTrend.unshift({
        week: `第${4-i}周`,
        completed: weekTasks
      });
    }

    return {
      velocity: tasksCompletedThisWeek,
      velocityTrend,
      cycleTimeData,
      firstTimeRightRate: parseFloat(String(firstTimeRightRate)),
      avgEstimatedHours: tasksWithTime.length > 0
        ? parseFloat((tasksWithTime.reduce((sum, t) => sum + (t.estimatedHours || 0), 0) / tasksWithTime.length).toFixed(1))
        : 0,
      avgActualHours: tasksWithTime.length > 0
        ? parseFloat((tasksWithTime.reduce((sum, t) => sum + (t.actualHours || 0), 0) / tasksWithTime.length).toFixed(1))
        : 0
    };
  }

  async getAgileMetrics(): Promise<any> {
    const tasks = Array.from(this.tasks.values());
    const now = new Date();

    // Cumulative Flow Diagram data
    const cfdData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayTasks = tasks.filter(t => new Date(t.createdAt) <= date);

      cfdData.push({
        date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        TODO: dayTasks.filter(t => t.status === TaskStatus.TODO).length,
        '进行中': dayTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
        '已完成': dayTasks.filter(t => t.status === TaskStatus.DONE).length
      });
    }

    // Throughput (tasks completed per day, last 7 days)
    const throughputData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

      const completed = tasks.filter(t =>
        t.status === TaskStatus.DONE &&
        t.updatedAt &&
        new Date(t.updatedAt) >= date &&
        new Date(t.updatedAt) < nextDate
      ).length;

      throughputData.push({
        date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        completed
      });
    }

    // WIP limits monitoring
    const wipLimits = {
      TODO: tasks.filter(t => t.status === TaskStatus.TODO).length,
      '进行中': tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
      '已完成': tasks.filter(t => t.status === TaskStatus.DONE).length
    };

    // Lead time vs Cycle time
    const leadCycleData = tasks
      .filter(t => t.status === TaskStatus.DONE && t.actualHours)
      .map(t => {
        const leadTime = t.updatedAt && t.createdAt
          ? Math.ceil((new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        return {
          id: t.id,
          title: t.title,
          leadTime,
          cycleTime: t.actualHours || 0
        };
      });

    return {
      cumulativeFlow: cfdData,
      throughput: throughputData,
      wipLimits,
      leadCycleData,
      avgLeadTime: leadCycleData.length > 0
        ? parseFloat((leadCycleData.reduce((sum, t) => sum + t.leadTime, 0) / leadCycleData.length).toFixed(1))
        : 0,
      avgCycleTime: leadCycleData.length > 0
        ? parseFloat((leadCycleData.reduce((sum, t) => sum + t.cycleTime, 0) / leadCycleData.length).toFixed(1))
        : 0
    };
  }

  // Milestone operations
  async getMilestones(projectId?: string): Promise<Milestone[]> {
    const milestones = Array.from(this.milestones.values());
    if (projectId) {
      return milestones.filter(m => m.projectId === projectId)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    return milestones.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getMilestone(id: string): Promise<Milestone | undefined> {
    return this.milestones.get(id);
  }

  async createMilestone(milestone: InsertMilestone): Promise<Milestone> {
    const newMilestone: Milestone = {
      id: randomUUID(),
      projectId: milestone.projectId,
      name: milestone.name,
      description: milestone.description ?? null,
      date: milestone.date,
      color: milestone.color ?? '#EF4444',
      completed: milestone.completed ?? false,
      createdAt: new Date(),
    };
    this.milestones.set(newMilestone.id, newMilestone);
    return newMilestone;
  }

  async updateMilestone(id: string, updates: Partial<InsertMilestone>): Promise<Milestone | undefined> {
    const milestone = this.milestones.get(id);
    if (!milestone) return undefined;

    const updatedMilestone: Milestone = { ...milestone, ...updates };
    this.milestones.set(id, updatedMilestone);
    return updatedMilestone;
  }

  async deleteMilestone(id: string): Promise<boolean> {
    return this.milestones.delete(id);
  }

  // Gantt chart operations
  async getGanttData(projectId: string): Promise<{
    tasks: Task[];
    milestones: Milestone[];
    dependencies: { taskId: string; dependsOn: string[] }[];
  }> {
    const tasks = Array.from(this.tasks.values())
      .filter(t => t.projectId === projectId)
      .sort((a, b) => {
        const aStart = a.startDate ? new Date(a.startDate).getTime() : 0;
        const bStart = b.startDate ? new Date(b.startDate).getTime() : 0;
        return aStart - bStart;
      });

    const milestones = Array.from(this.milestones.values())
      .filter(m => m.projectId === projectId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const dependencies = tasks
      .filter(t => t.dependencies && t.dependencies.length > 0)
      .map(t => ({
        taskId: t.id,
        dependsOn: t.dependencies || []
      }));

    return { tasks, milestones, dependencies };
  }

  async updateTaskSchedule(id: string, startDate: Date, endDate: Date): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const updatedTask: Task = {
      ...task,
      startDate,
      endDate,
      updatedAt: new Date()
    };

    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async updateTaskProgress(id: string, progress: number): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    // Update task status based on progress
    let status = task.status;
    if (progress === 0) {
      status = TaskStatus.TODO;
    } else if (progress === 100) {
      status = TaskStatus.DONE;
    } else if (progress > 0) {
      status = TaskStatus.IN_PROGRESS;
    }

    const updatedTask: Task = {
      ...task,
      progress: Math.max(0, Math.min(100, progress)), // Clamp between 0-100
      status,
      updatedAt: new Date()
    };

    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async updateTaskDependencies(id: string, dependencies: string[]): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const updatedTask: Task = {
      ...task,
      dependencies,
      updatedAt: new Date()
    };

    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
}

export const storage = new MemStorage();