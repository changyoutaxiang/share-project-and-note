import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppSidebar from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import Dashboard from "@/pages/Dashboard";
import KanbanView from "@/pages/KanbanView";
import TaskList from "@/pages/TaskList";
import Projects from "@/pages/Projects";
import ProjectGroups from "@/pages/ProjectGroups";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import { useToast } from "@/hooks/use-toast";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={Auth} />
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/project-groups">
        <ProtectedRoute>
          <ProjectGroups />
        </ProtectedRoute>
      </Route>
      <Route path="/kanban">
        <ProtectedRoute>
          <KanbanView />
        </ProtectedRoute>
      </Route>
      <Route path="/projects">
        <ProtectedRoute>
          <Projects />
        </ProtectedRoute>
      </Route>
      <Route path="/tasks">
        <ProtectedRoute>
          <TaskList />
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <div className="p-6">设置页面开发中...</div>
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function UserMenu() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "登出失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "已登出",
        description: "您已成功登出",
      });
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">{user.email}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        className="gap-2"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">登出</span>
      </Button>
    </div>
  );
}

function AppContent() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const { user } = useAuth();

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full" data-testid="app-container">
        {user && <AppSidebar />}
        <div className="flex flex-col flex-1 overflow-hidden">
          <header
            className="flex items-center justify-between p-4 border-b bg-background"
            data-testid="app-header"
          >
            <div className="flex items-center gap-4">
              {user && <SidebarTrigger data-testid="button-sidebar-toggle" />}
              <h1 className="text-lg font-semibold text-foreground hidden sm:block">
                个人项目管理
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserMenu />
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
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="project-manager-theme">
        <AuthProvider>
          <TooltipProvider>
            <AppContent />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}