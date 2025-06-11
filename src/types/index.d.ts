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
export interface Task {
    id: string;
    title: string;
    description?: string;
    dueDate?: Date | null;
    status: 'todo' | 'in_progress' | 'review' | 'done';
    priority: 'low' | 'medium' | 'high';
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
    export_format?: string;
    last_exported_at?: string;
    recording_url?: string;
    recording_duration?: number;
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
