import React from 'react';
import { Task, TaskStatus } from '../types';
import { KanbanTask } from './KanbanTask';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
}

export function KanbanColumn({ status, tasks }: KanbanColumnProps) {
  const getColumnTitle = (status: TaskStatus) => {
    switch (status) {
      case 'todo':
        return 'To Do';
      case 'in_progress':
        return 'In Progress';
      case 'review':
        return 'Review';
      case 'done':
        return 'Done';
    }
  };

  return (
    <div
      className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4"
      id={status}
    >
      <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
        {getColumnTitle(status)} ({tasks.length})
      </h3>
      <div className="space-y-2">
        {tasks.map((task) => (
          <KanbanTask key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}