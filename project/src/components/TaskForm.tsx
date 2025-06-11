import React, { useState } from 'react';
import Input from './ui/Input';
import { Button } from './ui/Button';
import { generateId } from '../lib/utils';

interface TaskFormProps {
  user?: {
    isPremium?: boolean;
  };
}

const TaskForm: React.FC<TaskFormProps> = ({ user }) => {
  const [recurring, setRecurring] = useState<{ frequency: 'daily' | 'weekly' | 'monthly' } | undefined>();
  const [sharedEmails, setSharedEmails] = useState('');
  const [estimatedTime, setEstimatedTime] = useState<number>();
  const [subtasks, setSubtasks] = useState<Array<{ id: string; title: string; completed: boolean }>>([]);

  return (
    <>
      {user?.isPremium && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Recurring Schedule
            </label>
            <select
              value={recurring?.frequency || ''}
              onChange={(e) => setRecurring(e.target.value ? { frequency: e.target.value as any } : undefined)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">No recurring schedule</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Share with (Email addresses)
            </label>
            <Input
              type="text"
              value={sharedEmails}
              onChange={(e) => setSharedEmails(e.target.value)}
              placeholder="Enter email addresses separated by commas"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estimated Time (minutes)
            </label>
            <Input
              type="number"
              value={estimatedTime || ''}
              onChange={(e) => setEstimatedTime(parseInt(e.target.value) || undefined)}
              placeholder="Enter estimated time in minutes"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subtasks
            </label>
            {subtasks.map((subtask, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <Input
                  value={subtask.title}
                  onChange={(e) => {
                    const newSubtasks = [...subtasks];
                    newSubtasks[index].title = e.target.value;
                    setSubtasks(newSubtasks);
                  }}
                  placeholder="Subtask title"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setSubtasks(subtasks.filter((_, i) => i !== index));
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSubtasks([...subtasks, { id: generateId(), title: '', completed: false }]);
              }}
            >
              Add Subtask
            </Button>
          </div>
        </>
      )}
    </>
  );
};

export default TaskForm;