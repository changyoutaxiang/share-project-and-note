import { Project, Task, Tag, Milestone, InsertProject, InsertTask, InsertTag, InsertMilestone } from "@shared/schema";
import { supabase } from "./supabase";

// Helper functions for case conversion
function toSnakeCase(obj: any): any {
  if (!obj) return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (typeof obj !== 'object') return obj;

  const converted: any = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    converted[snakeKey] = obj[key];
  }
  return converted;
}

function toCamelCase(obj: any): any {
  if (!obj) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (typeof obj !== 'object') return obj;

  const converted: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    converted[camelKey] = obj[key];
  }
  return converted;
}

// Project API functions
export const projectApi = {
  getAll: async (): Promise<Project[]> => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return toCamelCase(data || []);
  },

  getById: async (id: string): Promise<Project> => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return toCamelCase(data);
  },

  create: async (project: InsertProject): Promise<Project> => {
    const { data, error } = await supabase
      .from('projects')
      .insert(toSnakeCase(project))
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data);
  },

  update: async (id: string, updates: Partial<InsertProject>): Promise<Project> => {
    const { data, error } = await supabase
      .from('projects')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Task API functions
export const taskApi = {
  getAll: async (projectId?: string): Promise<Task[]> => {
    let query = supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return toCamelCase(data || []);
  },

  getById: async (id: string): Promise<Task> => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return toCamelCase(data);
  },

  create: async (task: InsertTask): Promise<Task> => {
    const { data, error } = await supabase
      .from('tasks')
      .insert(toSnakeCase(task))
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data);
  },

  update: async (id: string, updates: Partial<InsertTask>): Promise<Task> => {
    const { data, error } = await supabase
      .from('tasks')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data);
  },

  updateStatus: async (id: string, status: string): Promise<Task> => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Tag API functions
export const tagApi = {
  getAll: async (): Promise<Tag[]> => {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');

    if (error) throw error;
    return toCamelCase(data || []);
  },

  create: async (tag: InsertTag): Promise<Tag> => {
    const { data, error } = await supabase
      .from('tags')
      .insert(toSnakeCase(tag))
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data);
  },
};

// Search API functions
export const searchApi = {
  tasks: async (query: string): Promise<Task[]> => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return toCamelCase(data || []);
  },

  projects: async (query: string): Promise<Project[]> => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return toCamelCase(data || []);
  },
};

// Analytics API functions
export const analyticsApi = {
  getOverview: async (): Promise<any> => {
    const [projectsResult, tasksResult] = await Promise.all([
      supabase.from('projects').select('status', { count: 'exact' }),
      supabase.from('tasks').select('status', { count: 'exact' })
    ]);

    if (projectsResult.error) throw projectsResult.error;
    if (tasksResult.error) throw tasksResult.error;

    // Group tasks by status
    const todoTasks = await supabase.from('tasks').select('*', { count: 'exact' }).eq('status', 'todo');
    const inProgressTasks = await supabase.from('tasks').select('*', { count: 'exact' }).eq('status', 'in_progress');
    const doneTasks = await supabase.from('tasks').select('*', { count: 'exact' }).eq('status', 'done');

    return {
      projectsCount: projectsResult.count || 0,
      tasksCount: tasksResult.count || 0,
      todoCount: todoTasks.count || 0,
      inProgressCount: inProgressTasks.count || 0,
      doneCount: doneTasks.count || 0,
    };
  },

  getRiskAnalysis: async (): Promise<any> => {
    // Simple risk analysis based on overdue tasks
    const now = new Date().toISOString();
    const { data, count } = await supabase
      .from('tasks')
      .select('*', { count: 'exact' })
      .lt('due_date', now)
      .neq('status', 'done');

    return {
      overdueTasksCount: count || 0,
      riskLevel: (count || 0) > 10 ? 'high' : (count || 0) > 5 ? 'medium' : 'low'
    };
  },

  getResourceUtilization: async (): Promise<any> => {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('status, assignee');

    const utilization = (tasks || []).reduce((acc: any, task: any) => {
      if (!acc[task.assignee]) {
        acc[task.assignee] = { todo: 0, in_progress: 0, done: 0 };
      }
      acc[task.assignee][task.status] = (acc[task.assignee][task.status] || 0) + 1;
      return acc;
    }, {});

    return utilization;
  },

  getEfficiencyStats: async (): Promise<any> => {
    const { data: completedTasks } = await supabase
      .from('tasks')
      .select('created_at, updated_at')
      .eq('status', 'done');

    if (!completedTasks || completedTasks.length === 0) {
      return { averageCompletionTime: 0, tasksCompleted: 0 };
    }

    const completionTimes = completedTasks.map((task: any) => {
      const created = new Date(task.created_at).getTime();
      const updated = new Date(task.updated_at).getTime();
      return (updated - created) / (1000 * 60 * 60 * 24); // Convert to days
    });

    const avgTime = completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length;

    return {
      averageCompletionTime: avgTime,
      tasksCompleted: completedTasks.length
    };
  },

  getAgileMetrics: async (): Promise<any> => {
    // Get sprint velocity (tasks completed in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: velocity } = await supabase
      .from('tasks')
      .select('*', { count: 'exact' })
      .eq('status', 'done')
      .gte('updated_at', thirtyDaysAgo.toISOString());

    const { count: totalBacklog } = await supabase
      .from('tasks')
      .select('*', { count: 'exact' })
      .neq('status', 'done');

    return {
      velocity: velocity || 0,
      backlogSize: totalBacklog || 0,
      estimatedCompletion: (totalBacklog || 0) / Math.max(1, velocity || 1) * 30 // Days
    };
  },
};

// Milestone API functions
export const milestoneApi = {
  getAll: async (projectId?: string): Promise<Milestone[]> => {
    let query = supabase
      .from('milestones')
      .select('*')
      .order('due_date');

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return toCamelCase(data || []);
  },

  getById: async (id: string): Promise<Milestone> => {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return toCamelCase(data);
  },

  create: async (milestone: InsertMilestone): Promise<Milestone> => {
    const { data, error } = await supabase
      .from('milestones')
      .insert(toSnakeCase(milestone))
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data);
  },

  update: async (id: string, updates: Partial<InsertMilestone>): Promise<Milestone> => {
    const { data, error } = await supabase
      .from('milestones')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Gantt chart API functions
export const ganttApi = {
  getProjectData: async (projectId: string): Promise<{
    tasks: Task[];
    milestones: Milestone[];
    dependencies: { taskId: string; dependsOn: string[] }[];
  }> => {
    const [tasksResult, milestonesResult] = await Promise.all([
      supabase.from('tasks').select('*').eq('project_id', projectId),
      supabase.from('milestones').select('*').eq('project_id', projectId)
    ]);

    if (tasksResult.error) throw tasksResult.error;
    if (milestonesResult.error) throw milestonesResult.error;

    // Parse dependencies from tasks if stored in a field
    const tasks = toCamelCase(tasksResult.data || []);
    const dependencies = tasks
      .filter((task: any) => task.dependencies)
      .map((task: any) => ({
        taskId: task.id,
        dependsOn: Array.isArray(task.dependencies) ? task.dependencies : []
      }));

    return {
      tasks,
      milestones: toCamelCase(milestonesResult.data || []),
      dependencies
    };
  },

  updateTaskSchedule: async (id: string, startDate: Date, endDate: Date): Promise<Task> => {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data);
  },

  updateTaskProgress: async (id: string, progress: number): Promise<Task> => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ progress })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data);
  },

  updateTaskDependencies: async (id: string, dependencies: string[]): Promise<Task> => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ dependencies })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data);
  },
};

// Health check - for Supabase, we just check if we can connect
export const healthApi = {
  check: async (): Promise<{ status: string; timestamp: string }> => {
    try {
      // Try a simple query to check connection
      const { error } = await supabase
        .from('projects')
        .select('id')
        .limit(1);

      if (error) throw error;

      return {
        status: 'healthy',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString()
      };
    }
  },
};