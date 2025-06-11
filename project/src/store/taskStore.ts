import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Priority } from '../types';
import { generateId } from '../lib/utils';

interface TaskState {
  tasks: Task[];
  categories: string[];
  addTask: (title: string, description?: string, dueDate?: Date, priority?: Priority, category?: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  getTasksByCategory: (category: string) => Task[];
  getCompletedTasks: () => Task[];
  getPendingTasks: () => Task[];
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      categories: ['Personal', 'Work'],
      
      addTask: (title, description, dueDate, priority = 'medium', category = 'Personal') => {
        const newTask: Task = {
          id: generateId(),
          title,
          description,
          completed: false,
          createdAt: new Date(),
          dueDate,
          priority,
          category,
        };
        
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
      },
      
      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) => 
            task.id === id ? { ...task, ...updates } : task
          ),
        }));
      },
      
      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },
      
      toggleTaskCompletion: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) => 
            task.id === id ? { ...task, completed: !task.completed } : task
          ),
        }));
      },
      
      addCategory: (category) => {
        set((state) => ({
          categories: [...state.categories, category],
        }));
      },
      
      deleteCategory: (category) => {
        set((state) => ({
          categories: state.categories.filter((c) => c !== category),
          tasks: state.tasks.map((task) => 
            task.category === category ? { ...task, category: 'Personal' } : task
          ),
        }));
      },
      
      getTasksByCategory: (category) => {
        return get().tasks.filter((task) => task.category === category);
      },
      
      getCompletedTasks: () => {
        return get().tasks.filter((task) => task.completed);
      },
      
      getPendingTasks: () => {
        return get().tasks.filter((task) => !task.completed);
      },
    }),
    {
      name: 'task-storage',
    }
  )
);