import {
  type Project,
  type InsertProject,
  type ProjectGroup,
  type InsertProjectGroup,
  type Task,
  type InsertTask,
  type Subtask,
  type InsertSubtask,
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
  // Project Group operations
  getProjectGroups(): Promise<ProjectGroup[]>;
  getProjectGroup(id: string): Promise<ProjectGroup | undefined>;
  createProjectGroup(projectGroup: InsertProjectGroup): Promise<ProjectGroup>;
  updateProjectGroup(id: string, updates: Partial<InsertProjectGroup>): Promise<ProjectGroup | undefined>;
  deleteProjectGroup(id: string): Promise<boolean>;

  // Project operations
  getProjects(groupId?: string): Promise<Project[]>;
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

  // Subtask operations
  getSubtasks(taskId?: string): Promise<Subtask[]>;
  getSubtask(id: string): Promise<Subtask | undefined>;
  createSubtask(subtask: InsertSubtask): Promise<Subtask>;
  updateSubtask(id: string, updates: Partial<InsertSubtask>): Promise<Subtask | undefined>;
  deleteSubtask(id: string): Promise<boolean>;
  updateSubtaskStatus(id: string, status: string): Promise<Subtask | undefined>;

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

  // Search operations
  searchTasks(query: string): Promise<Task[]>;
  searchProjects(query: string): Promise<Project[]>;
  searchProjectGroups(query: string): Promise<ProjectGroup[]>;
  searchSubtasks(query: string): Promise<Subtask[]>;

}

// Export MemStorage for use in routes.ts
export class MemStorage implements IStorage {
  private projectGroups: Map<string, ProjectGroup>;
  private projects: Map<string, Project>;
  private tasks: Map<string, Task>;
  private subtasks: Map<string, Subtask>;
  private tags: Map<string, Tag>;
  private milestones: Map<string, Milestone>;

  constructor() {
    this.projectGroups = new Map();
    this.projects = new Map();
    this.tasks = new Map();
    this.subtasks = new Map();
    this.tags = new Map();
    this.milestones = new Map();

    // Initialize with sample data for demonstration
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample projects
    const project1: Project = {
      id: "proj-1",
      groupId: null, // 暂时设为null，等项目组功能完善后再分配
      name: "个人项目管理应用",
      description: "开发一个功能完整的个人项目管理工具，支持任务管理、项目跟踪和进度可视化。",
      status: "active",
      dueDate: new Date("2025-02-28"),
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
    };

    const project2: Project = {
      id: "proj-2",
      groupId: null, // 暂时设为null，等项目组功能完善后再分配
      name: "网站重设计项目",
      description: "重新设计公司官方网站，提升用户体验和现代化设计。",
      status: "active",
      dueDate: new Date("2025-03-15"),
      createdAt: new Date("2025-01-10"),
      updatedAt: new Date("2025-01-10"),
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
  async getProjects(groupId?: string): Promise<Project[]> {
    const allProjects = Array.from(this.projects.values());
    const filtered = groupId
      ? allProjects.filter(project => project.groupId === groupId)
      : allProjects;

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const now = new Date();
    const project: Project = {
      id,
      groupId: insertProject.groupId ?? null, // 如果没有提供groupId，设为null
      name: insertProject.name,
      description: insertProject.description ?? null,
      status: insertProject.status ?? "active",
      dueDate: insertProject.dueDate ?? null,
      createdAt: now,
      updatedAt: now,
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

  // Project Group operations
  async getProjectGroups(): Promise<ProjectGroup[]> {
    return Array.from(this.projectGroups.values());
  }

  async getProjectGroup(id: string): Promise<ProjectGroup | undefined> {
    return this.projectGroups.get(id);
  }

  async createProjectGroup(insertProjectGroup: InsertProjectGroup): Promise<ProjectGroup> {
    const id = randomUUID();
    const now = new Date();
    const projectGroup: ProjectGroup = {
      id,
      name: insertProjectGroup.name,
      description: insertProjectGroup.description ?? null,
      color: insertProjectGroup.color ?? "#3B82F6",
      status: insertProjectGroup.status ?? "active",
      createdAt: now,
      updatedAt: now,
    };
    this.projectGroups.set(id, projectGroup);
    return projectGroup;
  }

  async updateProjectGroup(id: string, updates: Partial<InsertProjectGroup>): Promise<ProjectGroup | undefined> {
    const projectGroup = this.projectGroups.get(id);
    if (!projectGroup) return undefined;

    const updatedProjectGroup: ProjectGroup = {
      ...projectGroup,
      ...updates,
      updatedAt: new Date(),
    };
    this.projectGroups.set(id, updatedProjectGroup);
    return updatedProjectGroup;
  }

  async deleteProjectGroup(id: string): Promise<boolean> {
    return this.projectGroups.delete(id);
  }

  // Subtask operations
  async getSubtasks(taskId?: string): Promise<Subtask[]> {
    const allSubtasks = Array.from(this.subtasks.values());
    if (taskId) {
      return allSubtasks.filter(subtask => subtask.taskId === taskId);
    }
    return allSubtasks;
  }

  async getSubtask(id: string): Promise<Subtask | undefined> {
    return this.subtasks.get(id);
  }

  async createSubtask(insertSubtask: InsertSubtask): Promise<Subtask> {
    const id = randomUUID();
    const now = new Date();
    const subtask: Subtask = {
      id,
      taskId: insertSubtask.taskId,
      title: insertSubtask.title,
      description: insertSubtask.description ?? null,
      status: insertSubtask.status ?? "todo",
      priority: insertSubtask.priority ?? "medium",
      dueDate: insertSubtask.dueDate ?? null,
      assignee: insertSubtask.assignee ?? null,
      progress: insertSubtask.progress ?? 0,
      estimatedHours: insertSubtask.estimatedHours ?? null,
      actualHours: insertSubtask.actualHours ?? null,
      tags: insertSubtask.tags ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.subtasks.set(id, subtask);
    return subtask;
  }

  async updateSubtask(id: string, updates: Partial<InsertSubtask>): Promise<Subtask | undefined> {
    const subtask = this.subtasks.get(id);
    if (!subtask) return undefined;

    const updatedSubtask: Subtask = {
      ...subtask,
      ...updates,
      updatedAt: new Date(),
    };
    this.subtasks.set(id, updatedSubtask);
    return updatedSubtask;
  }

  async deleteSubtask(id: string): Promise<boolean> {
    return this.subtasks.delete(id);
  }

  async updateSubtaskStatus(id: string, status: string): Promise<Subtask | undefined> {
    const subtask = this.subtasks.get(id);
    if (!subtask) return undefined;

    const updatedSubtask: Subtask = {
      ...subtask,
      status,
      updatedAt: new Date(),
    };
    this.subtasks.set(id, updatedSubtask);
    return updatedSubtask;
  }

  // Enhanced search operations
  async searchProjectGroups(query: string): Promise<ProjectGroup[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.projectGroups.values()).filter(
      group =>
        group.name.toLowerCase().includes(lowerQuery) ||
        (group.description && group.description.toLowerCase().includes(lowerQuery))
    );
  }

  async searchSubtasks(query: string): Promise<Subtask[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.subtasks.values()).filter(
      subtask =>
        subtask.title.toLowerCase().includes(lowerQuery) ||
        (subtask.description && subtask.description.toLowerCase().includes(lowerQuery)) ||
        (subtask.assignee && subtask.assignee.toLowerCase().includes(lowerQuery))
    );
  }

}

export const storage = new MemStorage();