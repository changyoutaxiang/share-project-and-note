import React from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
interface TimelineProps {
  startDate: Date;
  endDate: Date;
  dayWidth: number;
}
export const Timeline: React.FC<TimelineProps> = ({
  startDate,
  endDate,
  dayWidth
}) => {
  const days = eachDayOfInterval({
    start: startDate,
    end: endDate
  });
  const months = eachDayOfInterval({
    start: startOfMonth(startDate),
    end: endOfMonth(endDate)
  }).filter(date => date.getDate() === 1);
  return <div className="border-b border-gray-200">
      {/* Month headers */}
      <div className="flex bg-gray-50 border-b border-gray-200">
        {months.map((month, index) => {
        const monthDays = days.filter(day => day.getMonth() === month.getMonth() && day.getFullYear() === month.getFullYear());
        const width = monthDays.length * dayWidth;
        return <div key={index} className="px-2 py-2 text-sm font-medium text-gray-700 border-r border-gray-200 flex items-center justify-center" style={{
          width: `${width}px`,
          minWidth: `${width}px`
        }}>
              {format(month, 'MMM yyyy')}
            </div>;
      })}
      </div>
      {/* Day headers */}
      <div className="flex bg-white">
        {days.map((day, index) => <div key={index} className="px-1 py-2 text-xs text-gray-600 border-r border-gray-100 text-center" style={{
        width: `${dayWidth}px`,
        minWidth: `${dayWidth}px`
      }}>
            <div>{format(day, 'd')}</div>
            <div className="text-gray-400">{format(day, 'EEE')}</div>
          </div>)}
      </div>
    </div>;
};