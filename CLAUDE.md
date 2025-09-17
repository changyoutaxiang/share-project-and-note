# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个个人项目管理应用，使用 React + TypeScript (前端) 和 Node.js + Express (后端) 构建。项目支持任务管理、项目跟踪和进度可视化，采用 Material Design 风格设计。

## 开发命令

### 基本命令
- `npm run dev` - 启动开发服务器 (前端+后端)
- `npm run build` - 构建生产版本
- `npm run start` - 启动生产服务器
- `npm run check` - TypeScript 类型检查
- `npm run db:push` - 推送数据库架构变更

### 数据库操作
- 使用 Drizzle ORM 进行数据库操作
- 配置文件: `drizzle.config.ts`
- 架构定义: `shared/schema.ts`

## 项目架构

### 目录结构
```
├── client/          # React 前端应用
│   └── src/         # 源代码
├── server/          # Express 后端
│   ├── index.ts     # 服务器入口
│   ├── routes.ts    # API 路由
│   └── storage.ts   # 数据存储层
├── shared/          # 前后端共享代码
│   └── schema.ts    # 数据库架构和类型定义
└── package.json     # 项目配置
```

### 技术栈
**前端:**
- React 18 + TypeScript
- Vite (构建工具)
- TanStack Query (状态管理)
- Radix UI + shadcn/ui (组件库)
- Tailwind CSS (样式)
- Wouter (路由)

**后端:**
- Node.js + Express
- Drizzle ORM + PostgreSQL
- Zod (数据验证)

### 数据模型
核心实体包括:
- `projects` - 项目 (id, name, description, status, dueDate)
- `tasks` - 任务 (id, projectId, title, description, status, priority, tags)
- `tags` - 标签 (id, name, color)

任务状态: `todo`, `in_progress`, `done`
任务优先级: `low`, `medium`, `high`, `urgent`

### 存储层抽象
- `IStorage` 接口定义所有数据操作
- `MemStorage` 提供内存存储实现 (开发用)
- 生产环境使用 PostgreSQL + Drizzle ORM

### API 设计
RESTful API 结构:
- `/api/projects` - 项目管理
- `/api/tasks` - 任务管理
- `/api/tags` - 标签管理
- `/api/search` - 搜索功能

### 设计系统
- 基于 Material Design 的简洁设计
- 支持亮色/暗色主题
- 使用 Tailwind CSS 变量系统
- 响应式设计支持移动端

## 开发注意事项

### 代码风格
- 使用 TypeScript 严格模式
- 共享类型定义放在 `shared/schema.ts`
- 组件使用 Radix UI + shadcn/ui 模式
- CSS 使用 Tailwind 实用类

### 数据流
1. 前端使用 TanStack Query 管理服务器状态
2. API 层使用 Zod 进行请求验证
3. 存储层通过 IStorage 接口抽象
4. 开发环境使用内存存储，生产环境使用 PostgreSQL

### 功能特性
- 拖拽式任务看板 (Kanban)
- 项目和任务搜索
- 任务优先级和标签管理
- 进度跟踪和时间记录
- 多视图支持 (列表、看板、仪表板)