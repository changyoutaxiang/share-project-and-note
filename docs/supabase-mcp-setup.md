# Supabase MCP 服务器安装指南

## 📋 前置条件

1. **Supabase 账户**: 在 [supabase.com](https://supabase.com) 注册账户
2. **Claude Code** 或支持 MCP 的 AI 工具

## 🚀 安装步骤

### 1. 创建 Supabase 项目

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 "New Project" 创建新项目
3. 记录项目的 `project-ref`（项目 URL 中的标识符）

### 2. 获取访问令牌

1. 在项目中，进入 **Settings > Access Tokens**
2. 点击 "Generate new token"
3. 为令牌命名（如 "MCP Server"）
4. 选择权限范围（建议只读权限用于安全）
5. 复制生成的访问令牌

### 3. 配置 MCP 服务器

已为您创建配置文件：
- `.cursor/mcp.json` - MCP 服务器配置
- `.env.supabase.example` - 环境变量示例

### 4. 更新配置

编辑 `.cursor/mcp.json` 文件，替换以下占位符：
- `<project-ref>`: 您的 Supabase 项目引用
- `<access-token>`: 您的访问令牌

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase",
        "--read-only",
        "--project-ref=YOUR_PROJECT_REF"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "YOUR_ACCESS_TOKEN"
      }
    }
  }
}
```

## 🔒 安全建议

1. **只读模式**: 始终使用 `--read-only` 标志
2. **开发环境**: 不要连接到生产数据库
3. **权限范围**: 限制访问令牌的权限范围
4. **环境变量**: 不要将敏感信息提交到版本控制

## ✅ 配置完成

已为项目配置了 Supabase MCP 服务器：
- **项目引用**: `beromkwtszyotvlbqcaz`
- **项目URL**: https://beromkwtszyotvlbqcaz.supabase.co
- **MCP配置**: `.cursor/mcp.json` 已更新
- **环境变量**: `.env.supabase` 已创建
- **连接测试**: ✅ 成功

## 🧪 测试连接

重启 Claude Code 或您的 AI 工具，MCP 服务器应该会自动连接到 Supabase。

## 📚 使用示例

连接成功后，您可以：
- 查询数据库表结构
- 执行 SQL 查询
- 管理数据库迁移
- 查看项目统计信息

## 🔧 故障排除

1. **检查项目引用**: 确保格式正确（通常是 20 个字符的字符串）
2. **验证访问令牌**: 确保令牌有效且有正确权限
3. **网络连接**: 确保可以访问 Supabase 服务
4. **工具重启**: 配置更改后需要重启 AI 工具

## 📖 相关链接

- [Supabase MCP 官方文档](https://supabase.com/docs/guides/getting-started/mcp)
- [Model Context Protocol 规范](https://modelcontextprotocol.io/)