export interface Task {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number; // 0-100
  dependencies?: string[];
  assignee?: string;
  color?: string;
}
export interface GanttChartProps {
  tasks: Task[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onTaskClick?: (task: Task) => void;
  startDate?: Date;
  endDate?: Date;
  'data-id'?: string;
}