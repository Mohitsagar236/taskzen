import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from './Button';
import { Calendar, Clock, Tag, AlertCircle, CheckCircle2, X } from 'lucide-react';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  category: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done']).default('todo')
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void;
  initialData?: Partial<TaskFormData>;
}

export function TaskForm({ onSubmit, initialData }: TaskFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      ...initialData,
      status: 'todo',
      priority: 'medium'
    }
  });

  const handleFormSubmit = (data: TaskFormData) => {
    onSubmit(data);
    reset();
    setIsExpanded(false);
  };

  const priorityColors = {
    low: 'bg-blue-500 hover:bg-blue-600',
    medium: 'bg-yellow-500 hover:bg-yellow-600',
    high: 'bg-red-500 hover:bg-red-600'
  };

  const watchPriority = watch('priority');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-grow">
              <input
                {...register('title')}
                placeholder="What needs to be done?"
                className="w-full px-4 py-2 text-lg rounded-lg border-2 border-transparent bg-gray-100 dark:bg-gray-700 focus:border-blue-500 focus:bg-transparent dark:focus:bg-gray-800 focus:outline-none dark:text-white transition-colors"
                onClick={() => setIsExpanded(true)}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.title.message}
                </p>
              )}
            </div>
            {!isExpanded && (
              <Button type="submit" className="flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Add Task
              </Button>
            )}
          </div>

          {isExpanded && (
            <div className="mt-4 space-y-4">
              <div>
                <textarea
                  {...register('description')}
                  placeholder="Add a description..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border-2 border-transparent bg-gray-100 dark:bg-gray-700 focus:border-blue-500 focus:bg-transparent dark:focus:bg-gray-800 focus:outline-none dark:text-white resize-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Due Date
                  </label>
                  <input
                    {...register('dueDate')}
                    type="datetime-local"
                    className="w-full px-4 py-2 rounded-lg border-2 border-transparent bg-gray-100 dark:bg-gray-700 focus:border-blue-500 focus:bg-transparent dark:focus:bg-gray-800 focus:outline-none dark:text-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Tag className="w-4 h-4 inline mr-2" />
                    Category
                  </label>
                  <input
                    {...register('category')}
                    type="text"
                    placeholder="e.g., Work, Personal, Shopping"
                    className="w-full px-4 py-2 rounded-lg border-2 border-transparent bg-gray-100 dark:bg-gray-700 focus:border-blue-500 focus:bg-transparent dark:focus:bg-gray-800 focus:outline-none dark:text-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  Priority
                </label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((priority) => (
                    <label
                      key={priority}
                      className={`
                        flex-1 px-4 py-2 rounded-lg text-white text-center cursor-pointer transition-all
                        ${watchPriority === priority ? priorityColors[priority] : 'bg-gray-300 dark:bg-gray-600'}
                      `}
                    >
                      <input
                        type="radio"
                        {...register('priority')}
                        value={priority}
                        className="sr-only"
                      />
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setIsExpanded(false);
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Save Task
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}