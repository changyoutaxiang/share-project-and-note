import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  type Project,
  type InsertProject,
  type Task,
  type InsertTask,
  type Tag,
  type InsertTag,
  type Milestone,
  type InsertMilestone,
} from "@shared/schema";
import { IStorage } from "./storage";
import { toSnakeCase, toCamelCase, arrayToCamelCase } from "./dbHelpers";

export class SupabaseStorage implements IStorage {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return arrayToCamelCase(data || []);
  }

  async getProject(id: string): Promise<Project | undefined> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
      throw error;
    }
    return toCamelCase(data);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .insert(toSnakeCase(project))
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data);
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const { data, error } = await this.supabase
      .from('projects')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }
    return toCamelCase(data);
  }

  async deleteProject(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') return false;
      throw error;
    }
    return true;
  }

  // Task operations
  async getTasks(projectId?: string): Promise<Task[]> {
    let query = this.supabase.from('tasks').select('*');

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return arrayToCamelCase(data || []);
  }

  async getTask(id: string): Promise<Task | undefined> {
    const { data, error } = await this.supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }
    return toCamelCase(data);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const { data, error } = await this.supabase
      .from('tasks')
      .insert(toSnakeCase(task))
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data);
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const { data, error } = await this.supabase
      .from('tasks')
      .update(toSnakeCase(updateData))
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }
    return toCamelCase(data);
  }

  async deleteTask(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') return false;
      throw error;
    }
    return true;
  }

  async updateTaskStatus(id: string, status: string): Promise<Task | undefined> {
    return this.updateTask(id, { status });
  }

  // Tag operations
  async getTags(): Promise<Tag[]> {
    const { data, error } = await this.supabase
      .from('tags')
      .select('*')
      .order('name');

    if (error) throw error;
    return arrayToCamelCase(data || []);
  }

  async getTag(id: string): Promise<Tag | undefined> {
    const { data, error } = await this.supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }
    return toCamelCase(data);
  }

  async createTag(tag: InsertTag): Promise<Tag> {
    const { data, error } = await this.supabase
      .from('tags')
      .insert(toSnakeCase(tag))
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data);
  }

  async updateTag(id: string, updates: Partial<InsertTag>): Promise<Tag | undefined> {
    const { data, error } = await this.supabase
      .from('tags')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }
    return toCamelCase(data);
  }

  async deleteTag(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('tags')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') return false;
      throw error;
    }
    return true;
  }

  // Milestone operations
  async getMilestones(projectId?: string): Promise<Milestone[]> {
    let query = this.supabase.from('milestones').select('*');

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query.order('date', { ascending: true });

    if (error) throw error;
    return arrayToCamelCase(data || []);
  }

  async getMilestone(id: string): Promise<Milestone | undefined> {
    const { data, error } = await this.supabase
      .from('milestones')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }
    return toCamelCase(data);
  }

  async createMilestone(milestone: InsertMilestone): Promise<Milestone> {
    const { data, error } = await this.supabase
      .from('milestones')
      .insert(toSnakeCase(milestone))
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data);
  }

  async updateMilestone(id: string, updates: Partial<InsertMilestone>): Promise<Milestone | undefined> {
    const { data, error } = await this.supabase
      .from('milestones')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }
    return toCamelCase(data);
  }

  async deleteMilestone(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('milestones')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') return false;
      throw error;
    }
    return true;
  }

  // Gantt chart operations
  async getGanttData(projectId: string): Promise<{
    tasks: Task[];
    milestones: Milestone[];
    dependencies: { taskId: string; dependsOn: string[] }[];
  }> {
    const [tasks, milestones] = await Promise.all([
      this.getTasks(projectId),
      this.getMilestones(projectId)
    ]);

    const dependencies = tasks
      .filter(task => task.dependencies && task.dependencies.length > 0)
      .map(task => ({
        taskId: task.id,
        dependsOn: task.dependencies || []
      }));

    return { tasks, milestones, dependencies };
  }

  async updateTaskSchedule(id: string, startDate: Date, endDate: Date): Promise<Task | undefined> {
    return this.updateTask(id, {
      startDate,
      endDate
    });
  }

  async updateTaskProgress(id: string, progress: number): Promise<Task | undefined> {
    return this.updateTask(id, { progress });
  }

  async updateTaskDependencies(id: string, dependencies: string[]): Promise<Task | undefined> {
    return this.updateTask(id, { dependencies });
  }

  // Search operations
  async searchTasks(query: string): Promise<Task[]> {
    const { data, error } = await this.supabase
      .from('tasks')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return arrayToCamelCase(data || []);
  }

  async searchProjects(query: string): Promise<Project[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return arrayToCamelCase(data || []);
  }

  // Analytics operations
  async getOverviewStats(): Promise<any> {
    const [projects, tasks] = await Promise.all([
      this.getProjects(),
      this.getTasks()
    ]);

    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const overdueTasks = tasks.filter(t => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < new Date() && t.status !== 'done';
    }).length;

    const taskCompletionRate = tasks.length > 0
      ? (completedTasks / tasks.length) * 100
      : 0;

    return {
      activeProjects,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      taskCompletionRate,
      totalTasks: tasks.length
    };
  }

  async getRiskAnalysis(): Promise<any> {
    const tasks = await this.getTasks();
    const now = new Date();

    const overdueTasks = tasks.filter(t =>
      t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
    );

    const highPriorityIncomplete = tasks.filter(t =>
      t.priority === 'high' && t.status !== 'done'
    );

    const blockedTasks = tasks.filter(t =>
      t.dependencies &&
      t.dependencies.length > 0 &&
      t.status === 'todo'
    );

    const lowProgressTasks = tasks.filter(t =>
      (t.progress || 0) < 30 && t.status === 'in_progress'
    );

    return {
      overdueTasks: overdueTasks.map(t => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueDate,
        daysOverdue: t.dueDate ?
          Math.floor((now.getTime() - new Date(t.dueDate).getTime()) / (1000 * 60 * 60 * 24)) : 0
      })),
      highPriorityIncomplete,
      blockedTasks,
      lowProgressTasks,
      riskScore: overdueTasks.length * 3 + highPriorityIncomplete.length * 2 + blockedTasks.length
    };
  }

  async getResourceUtilization(): Promise<any> {
    const tasks = await this.getTasks();

    const totalEstimatedHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    const totalActualHours = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);

    const efficiency = totalEstimatedHours > 0
      ? (totalActualHours / totalEstimatedHours) * 100
      : 0;

    const tasksByPriority = {
      urgent: tasks.filter(t => t.priority === 'urgent').length,
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length
    };

    return {
      totalEstimatedHours,
      totalActualHours,
      efficiency,
      tasksByPriority,
      averageTaskDuration: tasks.length > 0
        ? totalActualHours / tasks.length
        : 0
    };
  }

  async getEfficiencyStats(): Promise<any> {
    const tasks = await this.getTasks();

    const completedTasks = tasks.filter(t => t.status === 'done');
    const onTimeTasks = completedTasks.filter(t => {
      if (!t.dueDate) return true;
      return new Date(t.updatedAt) <= new Date(t.dueDate);
    });

    const onTimeDeliveryRate = completedTasks.length > 0
      ? (onTimeTasks.length / completedTasks.length) * 100
      : 0;

    const averageProgress = tasks.reduce((sum, t) => sum + (t.progress || 0), 0) / tasks.length;

    return {
      onTimeDeliveryRate,
      averageProgress,
      completedTasks: completedTasks.length,
      totalTasks: tasks.length,
      productivityScore: (onTimeDeliveryRate * 0.6 + averageProgress * 0.4)
    };
  }

  async getAgileMetrics(): Promise<any> {
    const tasks = await this.getTasks();
    const projects = await this.getProjects();

    const velocity = tasks.filter(t =>
      t.status === 'done' &&
      t.updatedAt &&
      new Date(t.updatedAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    const burndown = {
      total: tasks.length,
      remaining: tasks.filter(t => t.status !== 'done').length,
      completed: tasks.filter(t => t.status === 'done').length
    };

    const sprintHealth = {
      velocity,
      tasksInProgress: tasks.filter(t => t.status === 'in_progress').length,
      blockedTasks: tasks.filter(t =>
        t.dependencies && t.dependencies.length > 0 && t.status === 'todo'
      ).length
    };

    return {
      velocity,
      burndown,
      sprintHealth,
      activeProjects: projects.filter(p => p.status === 'active').length
    };
  }
}