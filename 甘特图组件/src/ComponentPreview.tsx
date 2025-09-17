import React, { useState, Component } from 'react';
import { GanttChart } from './src/GanttChart';
import { Task } from './src/types';
import { addDays } from 'date-fns';
export function ComponentPreview() {
  const today = new Date();
  const [tasks] = useState<Task[]>([{
    id: '1',
    name: 'Project Planning',
    startDate: today,
    endDate: addDays(today, 5),
    progress: 100,
    assignee: 'Alice Chen',
    color: '#10B981'
  }, {
    id: '2',
    name: 'Design System',
    startDate: addDays(today, 3),
    endDate: addDays(today, 12),
    progress: 75,
    assignee: 'Bob Wilson',
    color: '#3B82F6'
  }, {
    id: '3',
    name: 'Frontend Development',
    startDate: addDays(today, 8),
    endDate: addDays(today, 25),
    progress: 45,
    assignee: 'Carol Davis',
    color: '#F59E0B'
  }, {
    id: '4',
    name: 'Backend API',
    startDate: addDays(today, 10),
    endDate: addDays(today, 22),
    progress: 30,
    assignee: 'David Kim',
    color: '#EF4444'
  }, {
    id: '5',
    name: 'Testing & QA',
    startDate: addDays(today, 20),
    endDate: addDays(today, 30),
    progress: 0,
    assignee: 'Eva Rodriguez',
    color: '#8B5CF6'
  }, {
    id: '6',
    name: 'Deployment',
    startDate: addDays(today, 28),
    endDate: addDays(today, 32),
    progress: 0,
    assignee: 'Frank Zhang',
    color: '#06B6D4'
  }]);
  const handleTaskClick = (task: Task) => {
    console.log('Task clicked:', task);
  };
  return <div className="w-full min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gantt Chart Component
          </h1>
          <p className="text-gray-600">
            A comprehensive project management timeline visualization
          </p>
        </div>

        {/* Main Gantt Chart */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Project Timeline
          </h2>
          <GanttChart tasks={tasks} onTaskClick={handleTaskClick} />
        </div>

        {/* Empty State Example */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Empty State
          </h2>
          <GanttChart tasks={[]} onTaskClick={handleTaskClick} />
        </div>

        {/* Features List */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Task timeline visualization
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Progress tracking
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Responsive design
              </li>
            </ul>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Customizable colors
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Task assignment display
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Interactive task bars
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>;
}