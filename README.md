# 个人项目管理应用

一个功能完整的个人项目管理工具，支持任务管理、项目跟踪和进度可视化。

## 功能特性

- 📊 **仪表板** - 项目和任务概览，实时统计数据
- 📋 **项目管理** - 创建、编辑和跟踪项目进度
- ✅ **任务管理** - 支持多种状态和优先级的任务管理
- 🎯 **看板视图** - 拖拽式任务看板，直观管理任务流程
- 📅 **甘特图** - 可视化项目时间线和依赖关系
- 📈 **数据分析** - 项目和任务的统计分析
- 🌓 **暗色主题** - 支持明暗主题切换

## 技术栈

### 前端
- React 18 + TypeScript
- Vite (构建工具)
- TanStack Query (状态管理)
- Radix UI + shadcn/ui (组件库)
- Tailwind CSS (样式)
- Wouter (路由)

### 后端
- Node.js + Express
- Supabase (数据库和认证)
- Zod (数据验证)

## 快速开始

### 1. 克隆项目
```bash
git clone [your-repo-url]
cd project-management-app
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
复制 `.env.example` 并创建 `.env` 文件：
```bash
cp .env.example .env
```

在 `.env` 中填入您的 Supabase 配置：
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 启动开发服务器
```bash
npm run dev
```

应用将在 http://localhost:3000 启动

## 部署

### Vercel 部署

1. Fork 或克隆此仓库到您的 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量：
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
4. 部署！

### 环境变量

生产环境需要配置以下环境变量：
- `SUPABASE_URL` - Supabase 项目 URL
- `SUPABASE_ANON_KEY` - Supabase 匿名密钥

## 数据库架构

应用使用以下数据表：
- `projects` - 项目信息
- `tasks` - 任务信息
- `tags` - 标签系统
- `milestones` - 里程碑
- `users` - 用户信息

## 开发命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 类型检查
npm run check
```

## License

MIT