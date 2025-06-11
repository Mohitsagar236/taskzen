// Placeholder for types
export type Team = {
  id: string;
  name: string;
  members?: Array<{ id: string; name: string }>;
};

// Define Task and TaskComment types
export type Task = {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  due_date?: string;
  completed_at?: string;
  created_by: string;
  assigned_to?: string;
  teamId?: string;
  status?: 'todo' | 'in_progress' | 'review' | 'done';
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  // Client-side convenience properties
  createdAt?: Date;
  dueDate?: Date;
  completedAt?: Date;
  completed?: boolean;
};

export type TaskComment = {
  id: string;
  taskId: string;
  content: string;
  created_at: string;
  created_by: string;
};
