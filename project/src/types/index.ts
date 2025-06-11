export type Priority = 'low' | 'medium' | 'high';

export type TaskTemplate = {
  id: string;
  name: string;
  tasks: Omit<Task, 'id' | 'createdAt'>[];
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  priority: Priority;
  category: string;
  sharedWith?: string[];
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    endDate?: Date;
  };
  subtasks?: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  attachments?: {
    id: string;
    name: string;
    url: string;
  }[];
  labels?: string[];
  estimatedTime?: number;
};

export type User = {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
  preferences?: {
    workingHours?: {
      start: string;
      end: string;
    };
    defaultView?: 'list' | 'board' | 'calendar';
    defaultPriority?: Priority;
    defaultCategory?: string;
  };
  statistics?: {
    tasksCompleted: number;
    streakDays: number;
    productiveHours: number;
  };
};