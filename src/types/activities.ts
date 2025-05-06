
export enum ActivityType {
  DAILY = 'daily',
  VOLUNTEER = 'volunteer',
  ENGAGEMENT = 'engagement',
  SUPPORT = 'support'
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  points: number;
  isCompleted: boolean;
  imageUrl?: string;
}

export interface UserProgress {
  userId: string;
  level: number;
  tier: string;
  points: number;
  completedActivities: string[]; // Array of activity IDs
  badges: string[]; // Array of badge IDs
  dailyStreak: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: ActivityType | 'achievement' | 'streak';
  requiredLevel?: number;
}
