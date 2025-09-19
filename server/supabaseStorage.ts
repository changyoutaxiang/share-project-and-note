import { createClient, SupabaseClient } from '@supabase/supabase-js';
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
  async getProjects(groupId?: string): Promise<Project[]> {
    let query = this.supabase
      .from('projects')
      .select('*');

    if (groupId) {
      query = query.eq('group_id', groupId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

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

  // TODO: Implement 4-layer architecture methods for production
  // Project Group operations
  async getProjectGroups(): Promise<ProjectGroup[]> {
    const { data, error } = await this.supabase
      .from('project_groups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return arrayToCamelCase(data || []);
  }

  async getProjectGroup(id: string): Promise<ProjectGroup | undefined> {
    const { data, error } = await this.supabase
      .from('project_groups')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
      throw error;
    }
    return toCamelCase(data);
  }

  async createProjectGroup(projectGroup: InsertProjectGroup): Promise<ProjectGroup> {
    const { data, error } = await this.supabase
      .from('project_groups')
      .insert(toSnakeCase(projectGroup))
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data);
  }

  async updateProjectGroup(id: string, updates: Partial<InsertProjectGroup>): Promise<ProjectGroup | undefined> {
    const { data, error } = await this.supabase
      .from('project_groups')
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

  async deleteProjectGroup(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('project_groups')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') return false;
      throw error;
    }
    return true;
  }

  // Subtask operations
  async getSubtasks(taskId?: string): Promise<Subtask[]> {
    let query = this.supabase.from('subtasks').select('*');

    if (taskId) {
      query = query.eq('task_id', taskId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return arrayToCamelCase(data || []);
  }

  async getSubtask(id: string): Promise<Subtask | undefined> {
    const { data, error } = await this.supabase
      .from('subtasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
      throw error;
    }
    return toCamelCase(data);
  }

  async createSubtask(subtask: InsertSubtask): Promise<Subtask> {
    const { data, error } = await this.supabase
      .from('subtasks')
      .insert(toSnakeCase(subtask))
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data);
  }

  async updateSubtask(id: string, updates: Partial<InsertSubtask>): Promise<Subtask | undefined> {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const { data, error } = await this.supabase
      .from('subtasks')
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

  async deleteSubtask(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('subtasks')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') return false;
      throw error;
    }
    return true;
  }

  async updateSubtaskStatus(id: string, status: string): Promise<Subtask | undefined> {
    return this.updateSubtask(id, { status });
  }

  // Enhanced search operations
  async searchProjectGroups(query: string): Promise<ProjectGroup[]> {
    const { data, error } = await this.supabase
      .from('project_groups')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return arrayToCamelCase(data || []);
  }

  async searchSubtasks(query: string): Promise<Subtask[]> {
    const { data, error } = await this.supabase
      .from('subtasks')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return arrayToCamelCase(data || []);
  }

}