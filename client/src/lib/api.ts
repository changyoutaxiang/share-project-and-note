import { Project, Task, Tag, InsertProject, InsertTask, InsertTag } from "@shared/schema";

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

// Health check
export const healthApi = {
  check: (): Promise<{ status: string; timestamp: string }> => 
    apiRequest("/health"),
};