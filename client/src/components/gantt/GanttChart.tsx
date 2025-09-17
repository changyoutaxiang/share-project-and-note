import React, { useMemo } from 'react';
import { Task, GanttChartProps } from './types';
import { Timeline } from './components/Timeline';
import { TaskRow } from './components/TaskRow';
import { eachDayOfInterval, min, max } from 'date-fns';
export const GanttChart: React.FC<GanttChartProps> = ({
  tasks,
  onTaskUpdate,
  onTaskClick,
  startDate,
  endDate,
  'data-id': dataId
}) => {
  const dayWidth = 40; // Width of each day column in pixels
  // Calculate chart date range
  const {
    chartStartDate,
    chartEndDate
  } = useMemo(() => {
    if (startDate && endDate) {
      return {
        chartStartDate: startDate,
        chartEndDate: endDate
      };
    }
    if (tasks.length === 0) {
      const today = new Date();
      return {
        chartStartDate: today,
        chartEndDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from today
      };
    }
    const allDates = tasks.flatMap(task => [task.startDate, task.endDate]);
    const minDate = min(allDates);
    const maxDate = max(allDates);
    return {
      chartStartDate: minDate,
      chartEndDate: maxDate
    };
  }, [tasks, startDate, endDate]);
  // Calculate total width
  const days = eachDayOfInterval({
    start: chartStartDate,
    end: chartEndDate
  });
  const totalWidth = days.length * dayWidth;
  return <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden" data-id={dataId}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">
          Project Timeline
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {tasks.length} tasks • {days.length} days
        </p>
      </div>
      {/* Gantt chart container */}
      <div className="overflow-auto">
        <div className="flex">
          {/* Task list header */}
          <div className="w-80 px-4 py-3 bg-gray-50 border-r border-gray-200 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Tasks</span>
              <span className="text-sm font-medium text-gray-700">
                Progress
              </span>
            </div>
          </div>
          {/* Timeline header */}
          <div style={{
          width: `${totalWidth}px`
        }}>
            <Timeline startDate={chartStartDate} endDate={chartEndDate} dayWidth={dayWidth} />
          </div>
        </div>
        {/* Task rows */}
        <div>
          {tasks.map(task => <TaskRow key={task.id} task={task} chartStartDate={chartStartDate} dayWidth={dayWidth} totalWidth={totalWidth} onTaskClick={onTaskClick} />)}
        </div>
        {/* Empty state */}
        {tasks.length === 0 && <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No tasks to display</p>
              <p className="text-xs text-gray-400 mt-1">
                Add some tasks to get started
              </p>
            </div>
          </div>}
      </div>
    </div>;
};