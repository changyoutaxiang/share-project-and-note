import AppSidebar from "../AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AppSidebarExample() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar
          onCreateProject={() => console.log("Create project")}
          onCreateTask={() => console.log("Create task")}
        />
        <div className="flex-1 p-4">
          <p className="text-muted-foreground">主内容区域</p>
        </div>
      </div>
    </SidebarProvider>
  );
}