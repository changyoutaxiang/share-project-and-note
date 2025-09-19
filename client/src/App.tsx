import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/lib/theme";
import AppSidebar from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import Dashboard from "@/pages/Dashboard";
import KanbanView from "@/pages/KanbanView";
import TaskList from "@/pages/TaskList";
import Projects from "@/pages/Projects";
import ProjectGroups from "@/pages/ProjectGroups";
import NotFound from "@/pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/project-groups" component={ProjectGroups} />
      <Route path="/kanban" component={KanbanView} />
      <Route path="/projects" component={Projects} />
      <Route path="/tasks" component={TaskList} />
      <Route path="/settings" component={() => <div className="p-6">设置页面开发中...</div>} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="project-manager-theme">
        <TooltipProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full" data-testid="app-container">
              <AppSidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                <header 
                  className="flex items-center justify-between p-4 border-b bg-background"
                  data-testid="app-header"
                >
                  <div className="flex items-center gap-4">
                    <SidebarTrigger data-testid="button-sidebar-toggle" />
                    <h1 className="text-lg font-semibold text-foreground hidden sm:block">
                      个人项目管理
                    </h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                  </div>
                </header>
                <main 
                  className="flex-1 overflow-auto p-6 bg-background"
                  data-testid="app-main"
                >
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}