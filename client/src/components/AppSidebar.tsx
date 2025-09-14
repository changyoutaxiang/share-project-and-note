import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  FolderOpen,
  Kanban,
  List,
  Plus,
  Settings,
  Home,
} from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

const mainItems = [
  {
    title: "仪表板",
    url: "/",
    icon: Home,
    id: "dashboard",
  },
  {
    title: "项目",
    url: "/projects", 
    icon: FolderOpen,
    id: "projects",
  },
  {
    title: "看板",
    url: "/kanban",
    icon: Kanban,
    id: "kanban", 
  },
  {
    title: "任务列表",
    url: "/tasks",
    icon: List,
    id: "tasks",
  },
  {
    title: "统计",
    url: "/analytics", 
    icon: BarChart3,
    id: "analytics",
  },
];

const settingsItems = [
  {
    title: "设置",
    url: "/settings",
    icon: Settings,
    id: "settings",
  },
];

interface AppSidebarProps {
  onCreateProject?: () => void;
  onCreateTask?: () => void;
}

export default function AppSidebar({ onCreateProject, onCreateTask }: AppSidebarProps) {
  const [location] = useLocation();

  const handleCreateProject = () => {
    onCreateProject?.();
    console.log("Create new project clicked");
  };

  const handleCreateTask = () => {
    onCreateTask?.();
    console.log("Create new task clicked");
  };

  return (
    <Sidebar data-testid="app-sidebar">
      <SidebarContent>
        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel>快速操作</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2 px-2">
              <Button
                onClick={handleCreateProject}
                className="w-full justify-start"
                variant="outline"
                size="sm"
                data-testid="button-create-project"
              >
                <Plus className="mr-2 h-4 w-4" />
                新建项目
              </Button>
              <Button
                onClick={handleCreateTask}
                className="w-full justify-start"
                variant="outline"
                size="sm"
                data-testid="button-create-task"
              >
                <Plus className="mr-2 h-4 w-4" />
                新建任务
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>导航</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                  >
                    <a 
                      href={item.url}
                      data-testid={`link-${item.id}`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>其他</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                  >
                    <a 
                      href={item.url}
                      data-testid={`link-${item.id}`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}