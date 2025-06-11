import React, { useState } from 'react';
import { useRoutineStore } from '../store/routineStore';
import { TaskTemplate, TaskTemplateItem, Routine } from '../types';
import { Button } from './ui/Button';
import { Plus, Play, Edit, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

export function RoutineManager() {
  const {
    templates,
    routines,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    executeRoutine,
  } = useRoutineStore();

  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [showAddRoutine, setShowAddRoutine] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);

  const [newTemplate, setNewTemplate] = useState<{
    name: string;
    description: string;
    tasks: TaskTemplateItem[];
  }>({
    name: '',
    description: '',
    tasks: [],
  });

  const [newRoutine, setNewRoutine] = useState<{
    name: string;
    description: string;
    templateId: string;
    schedule: {
      type: 'daily' | 'weekly' | 'monthly';
      time?: string;
      days?: number[];
      dayOfMonth?: number;
    };
  }>({
    name: '',
    description: '',
    templateId: '',
    schedule: {
      type: 'daily',
      time: '09:00',
    },
  });

  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTemplate(newTemplate);
      setNewTemplate({ name: '', description: '', tasks: [] });
      setShowAddTemplate(false);
      toast.success('Template created successfully');
    } catch (error) {
      toast.error('Failed to create template');
    }
  };

  const handleAddRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addRoutine({
        ...newRoutine,
        schedule: {
          ...newRoutine.schedule,
          startDate: new Date(),
        },
      });
      setNewRoutine({
        name: '',
        description: '',
        templateId: '',
        schedule: {
          type: 'daily',
          time: '09:00',
        },
      });
      setShowAddRoutine(false);
      toast.success('Routine created successfully');
    } catch (error) {
      toast.error('Failed to create routine');
    }
  };

  const handleExecuteRoutine = async (routineId: string) => {
    try {
      await executeRoutine(routineId);
      toast.success('Routine executed successfully');
    } catch (error) {
      toast.error('Failed to execute routine');
    }
  };

  return (
    <div className="space-y-6">
      {/* Templates Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-white">Task Templates</h2>
          <Button onClick={() => setShowAddTemplate(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Template
          </Button>
        </div>

        {showAddTemplate && (
          <form onSubmit={handleAddTemplate} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300">Name</label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300">Description</label>
                <textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300">Tasks</label>
                {newTemplate.tasks.map((task, index) => (
                  <div key={index} className="mt-2 p-2 border rounded-md dark:border-gray-600">
                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) => {
                        const tasks = [...newTemplate.tasks];
                        tasks[index] = { ...task, title: e.target.value };
                        setNewTemplate({ ...newTemplate, tasks });
                      }}
                      placeholder="Task title"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewTemplate({
                    ...newTemplate,
                    tasks: [...newTemplate.tasks, { title: '', priority: 'medium', category: 'personal' }],
                  })}
                  className="mt-2"
                >
                  Add Task
                </Button>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddTemplate(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Template</Button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold dark:text-white">{template.name}</h3>
                  {template.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingTemplate(template.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteTemplate(template.id)}
                    className="text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Routines Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-white">Routines</h2>
          <Button onClick={() => setShowAddRoutine(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Routine
          </Button>
        </div>

        {showAddRoutine && (
          <form onSubmit={handleAddRoutine} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300">Name</label>
                <input
                  type="text"
                  value={newRoutine.name}
                  onChange={(e) => setNewRoutine({ ...newRoutine, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300">Template</label>
                <select
                  value={newRoutine.templateId}
                  onChange={(e) => setNewRoutine({ ...newRoutine, templateId: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="">Select a template...</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300">Schedule Type</label>
                <select
                  value={newRoutine.schedule.type}
                  onChange={(e) => setNewRoutine({
                    ...newRoutine,
                    schedule: { ...newRoutine.schedule, type: e.target.value as 'daily' | 'weekly' | 'monthly' },
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300">Time</label>
                <input
                  type="time"
                  value={newRoutine.schedule.time}
                  onChange={(e) => setNewRoutine({
                    ...newRoutine,
                    schedule: { ...newRoutine.schedule, time: e.target.value },
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddRoutine(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Routine</Button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {routines.map((routine) => (
            <div
              key={routine.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold dark:text-white">{routine.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Schedule: {routine.schedule.type}
                    {routine.schedule.time && ` at ${routine.schedule.time}`}
                  </p>
                  {routine.lastRun && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Last run: {new Date(routine.lastRun).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExecuteRoutine(routine.id)}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteRoutine(routine.id)}
                    className="text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}