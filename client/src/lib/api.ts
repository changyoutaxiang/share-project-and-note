import { Project, Task, Tag, Milestone, InsertProject, InsertTask, InsertTag, InsertMilestone } from "@shared/schema";

const API_BASE = "/api";

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Project API functions
export const projectApi = {
  getAll: (): Promise<Project[]> => 
    apiRequest<Project[]>("/projects"),
  
  getById: (id: string): Promise<Project> => 
    apiRequest<Project>(`/projects/${id}`),
  
  create: (project: InsertProject): Promise<Project> => 
    apiRequest<Project>("/projects", {
      method: "POST",
      body: JSON.stringify(project),
    }),
  
  update: (id: string, updates: Partial<InsertProject>): Promise<Project> => 
    apiRequest<Project>(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),
  
  delete: (id: string): Promise<void> => 
    apiRequest<void>(`/projects/${id}`, {
      method: "DELETE",
    }),
};

// Task API functions
export const taskApi = {
  getAll: (projectId?: string): Promise<Task[]> => {
    const params = projectId ? `?projectId=${projectId}` : "";
    return apiRequest<Task[]>(`/tasks${params}`);
  },
  
  getById: (id: string): Promise<Task> => 
    apiRequest<Task>(`/tasks/${id}`),
  
  create: (task: InsertTask): Promise<Task> => 
    apiRequest<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    }),
  
  update: (id: string, updates: Partial<InsertTask>): Promise<Task> => 
    apiRequest<Task>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),
  
  updateStatus: (id: string, status: string): Promise<Task> => 
    apiRequest<Task>(`/tasks/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  
  delete: (id: string): Promise<void> => 
    apiRequest<void>(`/tasks/${id}`, {
      method: "DELETE",
    }),
};

// Tag API functions
export const tagApi = {
  getAll: (): Promise<Tag[]> => 
    apiRequest<Tag[]>("/tags"),
  
  create: (tag: InsertTag): Promise<Tag> => 
    apiRequest<Tag>("/tags", {
      method: "POST",
      body: JSON.stringify(tag),
    }),
};

// Search API functions
export const searchApi = {
  tasks: (query: string): Promise<Task[]> => 
    apiRequest<Task[]>(`/search/tasks?q=${encodeURIComponent(query)}`),
  
  projects: (query: string): Promise<Project[]> => 
    apiRequest<Project[]>(`/search/projects?q=${encodeURIComponent(query)}`),
};

// Analytics API functions
export const analyticsApi = {
  getOverview: (): Promise<any> =>
    apiRequest("/analytics/overview"),

  getRiskAnalysis: (): Promise<any> =>
    apiRequest("/analytics/risk"),

  getResourceUtilization: (): Promise<any> =>
    apiRequest("/analytics/resource"),

  getEfficiencyStats: (): Promise<any> =>
    apiRequest("/analytics/efficiency"),

  getAgileMetrics: (): Promise<any> =>
    apiRequest("/analytics/agile"),
};

// Milestone API functions
export const milestoneApi = {
  getAll: (projectId?: string): Promise<Milestone[]> => {
    const params = projectId ? `?projectId=${projectId}` : "";
    return apiRequest<Milestone[]>(`/milestones${params}`);
  },

  getById: (id: string): Promise<Milestone> =>
    apiRequest<Milestone>(`/milestones/${id}`),

  create: (milestone: InsertMilestone): Promise<Milestone> =>
    apiRequest<Milestone>("/milestones", {
      method: "POST",
      body: JSON.stringify(milestone),
    }),

  update: (id: string, updates: Partial<InsertMilestone>): Promise<Milestone> =>
    apiRequest<Milestone>(`/milestones/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  delete: (id: string): Promise<void> =>
    apiRequest<void>(`/milestones/${id}`, {
      method: "DELETE",
    }),
};

// Gantt chart API functions
export const ganttApi = {
  getProjectData: (projectId: string): Promise<{
    tasks: Task[];
    milestones: Milestone[];
    dependencies: { taskId: string; dependsOn: string[] }[];
  }> =>
    apiRequest(`/gantt/project/${projectId}`),

  updateTaskSchedule: (id: string, startDate: Date, endDate: Date): Promise<Task> =>
    apiRequest<Task>(`/tasks/${id}/schedule`, {
      method: "PATCH",
      body: JSON.stringify({ startDate: startDate.toISOString(), endDate: endDate.toISOString() }),
    }),

  updateTaskProgress: (id: string, progress: number): Promise<Task> =>
    apiRequest<Task>(`/tasks/${id}/progress`, {
      method: "PATCH",
      body: JSON.stringify({ progress }),
    }),

  updateTaskDependencies: (id: string, dependencies: string[]): Promise<Task> =>
    apiRequest<Task>(`/tasks/${id}/dependencies`, {
      method: "POST",
      body: JSON.stringify({ dependencies }),
    }),
};

// Health check
export const healthApi = {
  check: (): Promise<{ status: string; timestamp: string }> =>
    apiRequest("/health"),
};