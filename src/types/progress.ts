// Define progress-related types
export interface UserProgress {
  user_id: string;
  userName?: string;
  xp: number;
  level: number;
  streak: number;
  streakDays: number;
  last_activity: string | null;
  lastTaskDate?: string | null;
  tasks_completed: number;
  tasksCompleted?: number;
  badges: string[];
  unlockedBadges?: Badge[];
}

export interface BadgeRequirement {
  type: 'tasks' | 'streak' | 'xp';
  value: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: BadgeRequirement;
  unlockedAt?: Date;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  xp: number;
  level: number;
  badges: number;
  rank: number;
}
