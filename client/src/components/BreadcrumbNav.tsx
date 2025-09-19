import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRight, Folders, FolderOpen, ListTodo, CheckSquare } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function BreadcrumbNav({ items, className }: BreadcrumbNavProps) {
  if (items.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const Icon = item.icon;

            return (
              <div key={index} className="flex items-center">
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="flex items-center gap-2 font-medium">
                      {Icon && <Icon className="h-4 w-4" />}
                      {item.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                      )}
                      <span className="truncate max-w-[200px]">{item.label}</span>
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      href={item.href || "#"}
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      {item.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                      )}
                      <span className="truncate max-w-[150px]">{item.label}</span>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && (
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>
                )}
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

// 便捷的面包屑构造函数
export const createBreadcrumbItems = {
  projectGroup: (group: { id: string; name: string; color: string }) => ({
    label: group.name,
    href: `/project-groups`,
    icon: Folders,
    color: group.color,
  }),

  project: (project: { id: string; name: string }, groupId?: string) => ({
    label: project.name,
    href: groupId ? `/projects?groupId=${groupId}` : `/projects`,
    icon: FolderOpen,
  }),

  task: (task: { id: string; title: string }, projectId?: string) => ({
    label: task.title,
    href: projectId ? `/tasks?projectId=${projectId}` : `/tasks`,
    icon: ListTodo,
  }),

  subtask: (subtask: { id: string; title: string }) => ({
    label: subtask.title,
    icon: CheckSquare,
  }),
};