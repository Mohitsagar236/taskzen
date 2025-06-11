// Add these types to your existing types/index.ts file

export type SubscriptionPlan = 'free' | 'pro' | 'team';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'incomplete';

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionFeature {
  id: string;
  plan: SubscriptionPlan;
  feature: string;
  limit: number | null;
  createdAt: Date;
}

export interface SubscriptionUsage {
  id: string;
  subscriptionId: string;
  feature: string;
  used: number;
  periodStart: Date;
  periodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Task related types
export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date | null;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high'; // Ensure this matches expected usage
  category: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  assignedTo?: string;
  teamId?: string;
  tags?: Tag[];
  encrypted?: boolean;
  encryptionKey?: string;
  exportFormat?: 'pdf' | 'excel' | null;
  lastExportedAt?: Date;
  export_format?: string; // Database field
  last_exported_at?: string; // Database field
  recording_url?: string;
  recording_duration?: number; // in seconds
}

export interface TaskComment {
  id: string;
  taskId: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  mentions: string[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}