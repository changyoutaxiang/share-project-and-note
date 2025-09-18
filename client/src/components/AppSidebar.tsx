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
  FolderOpen,
  Kanban,
  List,
  Settings,
  Home,
} from "lucide-react";
import { useLocation } from "wouter";

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
];

const settingsItems = [
  {
    title: "设置",
    url: "/settings",
    icon: Settings,
    id: "settings",
  },
];

interface AppSidebarProps {}

export default function AppSidebar({}: AppSidebarProps) {
  const [location] = useLocation();

  return (
    <Sidebar data-testid="app-sidebar">
      <SidebarContent>
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