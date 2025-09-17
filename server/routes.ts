import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { MemStorage } from "./storage";
import { SupabaseStorage } from "./supabaseStorage";
import { insertProjectSchema, insertTaskSchema, insertTagSchema, insertMilestoneSchema } from "@shared/schema";

// Use Supabase in production, memory storage in development without Supabase config
const useSupabase = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY;
const storage = useSupabase ? new SupabaseStorage() : new MemStorage();

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable JSON parsing
  app.use(express.json());

  // Project routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      // Convert date string to Date object if provided
      const requestData = { ...req.body };
      if (requestData.dueDate && typeof requestData.dueDate === 'string') {
        requestData.dueDate = new Date(requestData.dueDate);
      }

      const validatedData = insertProjectSchema.parse(requestData);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(400).json({ error: "Invalid project data" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      // Convert date string to Date object if provided
      const requestData = { ...req.body };
      if (requestData.dueDate && typeof requestData.dueDate === 'string') {
        requestData.dueDate = new Date(requestData.dueDate);
      }

      const validatedData = insertProjectSchema.partial().parse(requestData);
      const project = await storage.updateProject(req.params.id, validatedData);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(400).json({ error: "Invalid project data" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const success = await storage.deleteProject(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Task routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const projectId = req.query.projectId as string;
      const tasks = await storage.getTasks(projectId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ error: "Failed to fetch task" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      // Convert date string to Date object if provided
      const requestData = { ...req.body };
      if (requestData.dueDate && typeof requestData.dueDate === 'string') {
        requestData.dueDate = new Date(requestData.dueDate);
      }

      const validatedData = insertTaskSchema.parse(requestData);
      const task = await storage.createTask(validatedData);
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(400).json({ error: "Invalid task data" });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      // Convert date string to Date object if provided
      const requestData = { ...req.body };
      if (requestData.dueDate && typeof requestData.dueDate === 'string') {
        requestData.dueDate = new Date(requestData.dueDate);
      }

      const validatedData = insertTaskSchema.partial().parse(requestData);
      const task = await storage.updateTask(req.params.id, validatedData);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(400).json({ error: "Invalid task data" });
    }
  });

  app.patch("/api/tasks/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      const task = await storage.updateTaskStatus(req.params.id, status);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error updating task status:", error);
      res.status(500).json({ error: "Failed to update task status" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const success = await storage.deleteTask(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Tag routes
  app.get("/api/tags", async (req, res) => {
    try {
      const tags = await storage.getTags();
      res.json(tags);
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({ error: "Failed to fetch tags" });
    }
  });

  app.post("/api/tags", async (req, res) => {
    try {
      const validatedData = insertTagSchema.parse(req.body);
      const tag = await storage.createTag(validatedData);
      res.status(201).json(tag);
    } catch (error) {
      console.error("Error creating tag:", error);
      res.status(400).json({ error: "Invalid tag data" });
    }
  });

  // Search routes
  app.get("/api/search/tasks", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      const tasks = await storage.searchTasks(query);
      res.json(tasks);
    } catch (error) {
      console.error("Error searching tasks:", error);
      res.status(500).json({ error: "Failed to search tasks" });
    }
  });

  app.get("/api/search/projects", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      const projects = await storage.searchProjects(query);
      res.json(projects);
    } catch (error) {
      console.error("Error searching projects:", error);
      res.status(500).json({ error: "Failed to search projects" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/overview", async (req, res) => {
    try {
      const overview = await storage.getOverviewStats();
      res.json(overview);
    } catch (error) {
      console.error("Error fetching overview stats:", error);
      res.status(500).json({ error: "Failed to fetch overview stats" });
    }
  });

  app.get("/api/analytics/risk", async (req, res) => {
    try {
      const risk = await storage.getRiskAnalysis();
      res.json(risk);
    } catch (error) {
      console.error("Error fetching risk analysis:", error);
      res.status(500).json({ error: "Failed to fetch risk analysis" });
    }
  });

  app.get("/api/analytics/resource", async (req, res) => {
    try {
      const resource = await storage.getResourceUtilization();
      res.json(resource);
    } catch (error) {
      console.error("Error fetching resource utilization:", error);
      res.status(500).json({ error: "Failed to fetch resource utilization" });
    }
  });

  app.get("/api/analytics/efficiency", async (req, res) => {
    try {
      const efficiency = await storage.getEfficiencyStats();
      res.json(efficiency);
    } catch (error) {
      console.error("Error fetching efficiency stats:", error);
      res.status(500).json({ error: "Failed to fetch efficiency stats" });
    }
  });

  app.get("/api/analytics/agile", async (req, res) => {
    try {
      const agile = await storage.getAgileMetrics();
      res.json(agile);
    } catch (error) {
      console.error("Error fetching agile metrics:", error);
      res.status(500).json({ error: "Failed to fetch agile metrics" });
    }
  });

  // Milestone routes
  app.get("/api/milestones", async (req, res) => {
    try {
      const projectId = req.query.projectId as string;
      const milestones = await storage.getMilestones(projectId);
      res.json(milestones);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      res.status(500).json({ error: "Failed to fetch milestones" });
    }
  });

  app.get("/api/milestones/:id", async (req, res) => {
    try {
      const milestone = await storage.getMilestone(req.params.id);
      if (!milestone) {
        return res.status(404).json({ error: "Milestone not found" });
      }
      res.json(milestone);
    } catch (error) {
      console.error("Error fetching milestone:", error);
      res.status(500).json({ error: "Failed to fetch milestone" });
    }
  });

  app.post("/api/milestones", async (req, res) => {
    try {
      const requestData = { ...req.body };
      if (requestData.date && typeof requestData.date === 'string') {
        requestData.date = new Date(requestData.date);
      }

      const validatedData = insertMilestoneSchema.parse(requestData);
      const milestone = await storage.createMilestone(validatedData);
      res.status(201).json(milestone);
    } catch (error) {
      console.error("Error creating milestone:", error);
      res.status(400).json({ error: "Invalid milestone data" });
    }
  });

  app.put("/api/milestones/:id", async (req, res) => {
    try {
      const requestData = { ...req.body };
      if (requestData.date && typeof requestData.date === 'string') {
        requestData.date = new Date(requestData.date);
      }

      const validatedData = insertMilestoneSchema.partial().parse(requestData);
      const milestone = await storage.updateMilestone(req.params.id, validatedData);
      if (!milestone) {
        return res.status(404).json({ error: "Milestone not found" });
      }
      res.json(milestone);
    } catch (error) {
      console.error("Error updating milestone:", error);
      res.status(400).json({ error: "Invalid milestone data" });
    }
  });

  app.delete("/api/milestones/:id", async (req, res) => {
    try {
      const success = await storage.deleteMilestone(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Milestone not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting milestone:", error);
      res.status(500).json({ error: "Failed to delete milestone" });
    }
  });

  // Gantt chart routes
  app.get("/api/gantt/project/:id", async (req, res) => {
    try {
      const ganttData = await storage.getGanttData(req.params.id);
      res.json(ganttData);
    } catch (error) {
      console.error("Error fetching Gantt data:", error);
      res.status(500).json({ error: "Failed to fetch Gantt data" });
    }
  });

  app.patch("/api/tasks/:id/schedule", async (req, res) => {
    try {
      const { startDate, endDate } = req.body;
      if (!startDate || !endDate) {
        return res.status(400).json({ error: "Start date and end date are required" });
      }

      const task = await storage.updateTaskSchedule(
        req.params.id,
        new Date(startDate),
        new Date(endDate)
      );

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error updating task schedule:", error);
      res.status(500).json({ error: "Failed to update task schedule" });
    }
  });

  app.patch("/api/tasks/:id/progress", async (req, res) => {
    try {
      const { progress } = req.body;
      if (typeof progress !== 'number') {
        return res.status(400).json({ error: "Progress must be a number" });
      }

      const task = await storage.updateTaskProgress(req.params.id, progress);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error updating task progress:", error);
      res.status(500).json({ error: "Failed to update task progress" });
    }
  });

  app.post("/api/tasks/:id/dependencies", async (req, res) => {
    try {
      const { dependencies } = req.body;
      if (!Array.isArray(dependencies)) {
        return res.status(400).json({ error: "Dependencies must be an array" });
      }

      const task = await storage.updateTaskDependencies(req.params.id, dependencies);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error updating task dependencies:", error);
      res.status(500).json({ error: "Failed to update task dependencies" });
    }
  });

  // Health check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}