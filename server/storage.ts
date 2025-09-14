import { 
  type Project, 
  type InsertProject, 
  type Task, 
  type InsertTask,
  type Tag,
  type InsertTag,
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

  // Search operations
  searchTasks(query: string): Promise<Task[]>;
  searchProjects(query: string): Promise<Project[]>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, Project>;
  private tasks: Map<string, Task>;
  private tags: Map<string, Tag>;

  constructor() {
    this.projects = new Map();
    this.tasks = new Map();
    this.tags = new Map();
    
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

    // Create sample tasks
    const tasks: Task[] = [
      {
        id: "task-1",
        projectId: "proj-1",
        title: "设计数据库架构",
        description: "设计项目和任务的数据模型，确保数据完整性和查询性能。",
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        dueDate: new Date("2025-01-20"),
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
}

export const storage = new MemStorage();