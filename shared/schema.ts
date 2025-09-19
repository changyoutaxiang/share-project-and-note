import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Project Groups table (NEW - 项目组表)
export const projectGroups = pgTable("project_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  color: varchar("color", { length: 7 }).notNull().default("#3B82F6"), // hex color
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, archived
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id"), // 关联项目组 (暂时可为空以支持现有代码)
  name: text("name").notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, archived
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default("todo"), // todo, in_progress, done
  priority: varchar("priority", { length: 10 }).notNull().default("medium"), // low, medium, high, urgent
  dueDate: timestamp("due_date"), // 保留用于兼容性
  startDate: timestamp("start_date"), // 甘特图开始时间
  endDate: timestamp("end_date"), // 甘特图结束时间
  progress: integer("progress").default(0), // 完成进度 0-100
  dependencies: text("dependencies").array(), // 依赖任务ID列表
  milestoneId: varchar("milestone_id"), // 关联里程碑ID
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Tags table for better organization
export const tags = pgTable("tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  color: varchar("color", { length: 7 }).notNull().default("#3B82F6"), // hex color
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Milestones table for Gantt chart
export const milestones = pgTable("milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  color: varchar("color", { length: 7 }).notNull().default("#EF4444"), // hex color
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Subtasks table (NEW - 子任务表)
export const subtasks = pgTable("subtasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").notNull(), // 关联主任务
  title: text("title").notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default("todo"), // todo, in_progress, done
  priority: varchar("priority", { length: 10 }).notNull().default("medium"), // low, medium, high, urgent
  dueDate: timestamp("due_date"),
  assignee: text("assignee"), // 分配给谁
  progress: integer("progress").default(0), // 完成进度 0-100
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Insert schemas
export const insertProjectGroupSchema = createInsertSchema(projectGroups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubtaskSchema = createInsertSchema(subtasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTagSchema = createInsertSchema(tags).omit({
  id: true,
  createdAt: true,
});

export const insertMilestoneSchema = createInsertSchema(milestones).omit({
  id: true,
  createdAt: true,
});

// Types
export type ProjectGroup = typeof projectGroups.$inferSelect;
export type InsertProjectGroup = z.infer<typeof insertProjectGroupSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Subtask = typeof subtasks.$inferSelect;
export type InsertSubtask = z.infer<typeof insertSubtaskSchema>;

export type Tag = typeof tags.$inferSelect;
export type InsertTag = z.infer<typeof insertTagSchema>;

export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;

// Enums for better type safety
export const TaskStatus = {
  TODO: "todo" as const,
  IN_PROGRESS: "in_progress" as const,
  DONE: "done" as const,
} as const;

export const TaskPriority = {
  LOW: "low" as const,
  MEDIUM: "medium" as const,
  HIGH: "high" as const,
  URGENT: "urgent" as const,
} as const;

export const ProjectStatus = {
  ACTIVE: "active" as const,
  ARCHIVED: "archived" as const,
} as const;

export const ProjectGroupStatus = {
  ACTIVE: "active" as const,
  ARCHIVED: "archived" as const,
} as const;

export type TaskStatusType = typeof TaskStatus[keyof typeof TaskStatus];
export type TaskPriorityType = typeof TaskPriority[keyof typeof TaskPriority];
export type ProjectStatusType = typeof ProjectStatus[keyof typeof ProjectStatus];
export type ProjectGroupStatusType = typeof ProjectGroupStatus[keyof typeof ProjectGroupStatus];

// User schema (keeping the existing one)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;