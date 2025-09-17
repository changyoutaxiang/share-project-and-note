import React from 'react';
import { Task } from '../types';
import { getTaskWidth, getTaskPosition } from '../utils/dateUtils';
interface TaskBarProps {
  task: Task;
  chartStartDate: Date;
  dayWidth: number;
  onClick?: (task: Task) => void;
}
export const TaskBar: React.FC<TaskBarProps> = ({
  task,
  chartStartDate,
  dayWidth,
  onClick
}) => {
  const width = getTaskWidth(task.startDate, task.endDate, dayWidth);
  const left = getTaskPosition(task.startDate, chartStartDate, dayWidth);
  const handleClick = () => {
    if (onClick) {
      onClick(task);
    }
  };
  return <div className="absolute top-1 bottom-1 cursor-pointer group" style={{
    left: `${left}px`,
    width: `${width}px`
  }} onClick={handleClick}>
      {/* Task bar background */}
      <div className="h-full rounded transition-all duration-200 group-hover:shadow-md" style={{
      backgroundColor: task.color || '#3B82F6',
      opacity: 0.8
    }}>
        {/* Progress bar */}
        <div className="h-full rounded bg-opacity-100 transition-all duration-300" style={{
        backgroundColor: task.color || '#3B82F6',
        width: `${task.progress}%`
      }} />
      </div>
      {/* Task label */}
      <div className="absolute inset-0 flex items-center px-2">
        <span className="text-white text-xs font-medium truncate">
          {task.name}
        </span>
      </div>
      {/* Progress percentage */}
      <div className="absolute -top-5 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <span className="text-xs text-gray-600 bg-white px-1 py-0.5 rounded shadow">
          {task.progress}%
        </span>
      </div>
    </div>;
};