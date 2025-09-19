import dotenv from "dotenv";
// Load environment variables at the top of routes.ts
dotenv.config();

import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { MemStorage } from "./storage";
import { SupabaseStorage } from "./supabaseStorage";
import {
  insertProjectGroupSchema,
  insertProjectSchema,
  insertTaskSchema,
  insertSubtaskSchema,
  insertTagSchema,
  insertMilestoneSchema
} from "@shared/schema";

// Use Supabase in production, memory storage in development without Supabase config
const useSupabase = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY;
console.log('Environment check:', {
  SUPABASE_URL: process.env.SUPABASE_URL ? 'Set' : 'Not set',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not set',
  useSupabase
});
const storage = useSupabase ? new SupabaseStorage() : new MemStorage();
console.log('Using storage:', storage.constructor.name);

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable JSON parsing
  app.use(express.json());

  // Project Group routes
  app.get("/api/project-groups", async (req, res) => {
    try {
      const projectGroups = await storage.getProjectGroups();
      res.json(projectGroups);
    } catch (error) {
      console.error("Error fetching project groups:", error);
      res.status(500).json({ error: "Failed to fetch project groups" });
    }
  });

  app.get("/api/project-groups/:id", async (req, res) => {
    try {
      const projectGroup = await storage.getProjectGroup(req.params.id);
      if (!projectGroup) {
        return res.status(404).json({ error: "Project group not found" });
      }
      res.json(projectGroup);
    } catch (error) {
      console.error("Error fetching project group:", error);
      res.status(500).json({ error: "Failed to fetch project group" });
    }
  });

  app.post("/api/project-groups", async (req, res) => {
    try {
      const validatedData = insertProjectGroupSchema.parse(req.body);
      const projectGroup = await storage.createProjectGroup(validatedData);
      res.status(201).json(projectGroup);
    } catch (error) {
      console.error("Error creating project group:", error);
      res.status(400).json({ error: "Invalid project group data" });
    }
  });

  app.put("/api/project-groups/:id", async (req, res) => {
    try {
      const validatedData = insertProjectGroupSchema.partial().parse(req.body);
      const projectGroup = await storage.updateProjectGroup(req.params.id, validatedData);
      if (!projectGroup) {
        return res.status(404).json({ error: "Project group not found" });
      }
      res.json(projectGroup);
    } catch (error) {
      console.error("Error updating project group:", error);
      res.status(400).json({ error: "Invalid project group data" });
    }
  });

  app.delete("/api/project-groups/:id", async (req, res) => {
    try {
      const success = await storage.deleteProjectGroup(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Project group not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project group:", error);
      res.status(500).json({ error: "Failed to delete project group" });
    }
  });

  // Project routes
  app.get("/api/projects", async (req, res) => {
    try {
      const groupId = req.query.groupId as string;
      const projects = await storage.getProjects(groupId);
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

  // Subtask routes
  app.get("/api/tasks/:taskId/subtasks", async (req, res) => {
    try {
      const subtasks = await storage.getSubtasks(req.params.taskId);
      res.json(subtasks);
    } catch (error) {
      console.error("Error fetching subtasks:", error);
      res.status(500).json({ error: "Failed to fetch subtasks" });
    }
  });

  app.get("/api/subtasks/:id", async (req, res) => {
    try {
      const subtask = await storage.getSubtask(req.params.id);
      if (!subtask) {
        return res.status(404).json({ error: "Subtask not found" });
      }
      res.json(subtask);
    } catch (error) {
      console.error("Error fetching subtask:", error);
      res.status(500).json({ error: "Failed to fetch subtask" });
    }
  });

  app.post("/api/tasks/:taskId/subtasks", async (req, res) => {
    try {
      const requestData = { ...req.body, taskId: req.params.taskId };
      if (requestData.dueDate && typeof requestData.dueDate === 'string') {
        requestData.dueDate = new Date(requestData.dueDate);
      }

      const validatedData = insertSubtaskSchema.parse(requestData);
      const subtask = await storage.createSubtask(validatedData);
      res.status(201).json(subtask);
    } catch (error) {
      console.error("Error creating subtask:", error);
      res.status(400).json({ error: "Invalid subtask data" });
    }
  });

  app.put("/api/subtasks/:id", async (req, res) => {
    try {
      const requestData = { ...req.body };
      if (requestData.dueDate && typeof requestData.dueDate === 'string') {
        requestData.dueDate = new Date(requestData.dueDate);
      }

      const validatedData = insertSubtaskSchema.partial().parse(requestData);
      const subtask = await storage.updateSubtask(req.params.id, validatedData);
      if (!subtask) {
        return res.status(404).json({ error: "Subtask not found" });
      }
      res.json(subtask);
    } catch (error) {
      console.error("Error updating subtask:", error);
      res.status(400).json({ error: "Invalid subtask data" });
    }
  });

  app.patch("/api/subtasks/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      const subtask = await storage.updateSubtaskStatus(req.params.id, status);
      if (!subtask) {
        return res.status(404).json({ error: "Subtask not found" });
      }
      res.json(subtask);
    } catch (error) {
      console.error("Error updating subtask status:", error);
      res.status(500).json({ error: "Failed to update subtask status" });
    }
  });

  app.delete("/api/subtasks/:id", async (req, res) => {
    try {
      const success = await storage.deleteSubtask(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Subtask not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting subtask:", error);
      res.status(500).json({ error: "Failed to delete subtask" });
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

  app.get("/api/search/project-groups", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      const projectGroups = await storage.searchProjectGroups(query);
      res.json(projectGroups);
    } catch (error) {
      console.error("Error searching project groups:", error);
      res.status(500).json({ error: "Failed to search project groups" });
    }
  });

  app.get("/api/search/subtasks", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      const subtasks = await storage.searchSubtasks(query);
      res.json(subtasks);
    } catch (error) {
      console.error("Error searching subtasks:", error);
      res.status(500).json({ error: "Failed to search subtasks" });
    }
  });

  app.get("/api/search/all", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }

      const [projectGroups, projects, tasks, subtasks] = await Promise.all([
        storage.searchProjectGroups(query),
        storage.searchProjects(query),
        storage.searchTasks(query),
        storage.searchSubtasks(query),
      ]);

      res.json({
        projectGroups,
        projects,
        tasks,
        subtasks,
        total: projectGroups.length + projects.length + tasks.length + subtasks.length
      });
    } catch (error) {
      console.error("Error searching all:", error);
      res.status(500).json({ error: "Failed to search all" });
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


  // Health check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}