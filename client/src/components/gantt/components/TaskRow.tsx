import React from 'react';
import { Task } from '../types';
import { TaskBar } from './TaskBar';
import { format } from 'date-fns';
interface TaskRowProps {
  task: Task;
  chartStartDate: Date;
  dayWidth: number;
  totalWidth: number;
  onTaskClick?: (task: Task) => void;
}
export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  chartStartDate,
  dayWidth,
  totalWidth,
  onTaskClick
}) => {
  return <div className="flex border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
      {/* Task info panel */}
      <div className="w-80 px-4 py-3 border-r border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {task.name}
            </h4>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-xs text-gray-500">
                {format(task.startDate, 'MMM d')} -{' '}
                {format(task.endDate, 'MMM d')}
              </span>
              {task.assignee && <span className="text-xs text-gray-500">{task.assignee}</span>}
            </div>
          </div>
          <div className="ml-2">
            <span className="text-xs font-medium text-gray-600">
              {task.progress}%
            </span>
          </div>
        </div>
      </div>
      {/* Timeline area */}
      <div className="relative bg-white" style={{
      width: `${totalWidth}px`
    }}>
        {/* Grid lines */}
        <div className="absolute inset-0 flex">
          {Array.from({
          length: Math.ceil(totalWidth / dayWidth)
        }).map((_, index) => <div key={index} className="border-r border-gray-100" style={{
          width: `${dayWidth}px`
        }} />)}
        </div>
        {/* Task bar */}
        <TaskBar task={task} chartStartDate={chartStartDate} dayWidth={dayWidth} onClick={onTaskClick} />
      </div>
    </div>;
};