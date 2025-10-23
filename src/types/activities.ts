
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
  
  // Progress tracking for the four categories
  dailyActsCompleted: number;
  engagementCompleted: number;
  volunteeringCompleted: number;
  supportCompleted: number;
  
  // Progress percentages
  dailyProgress: number;
  engagementProgress: number;
  volunteeringProgress: number;
  supportProgress: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: ActivityType | 'achievement' | 'streak';
  requiredLevel?: number;
}

export interface KarmaLevel {
  level: string;
  nextLevel: string;
  dailyRequirement: number;
  engagementRequirement: number;
  volunteeringRequirement: number;
  supportRequirement: number;
  donationValue: string;
}

export const KARMA_LEVELS: KarmaLevel[] = [
  {
    level: "Member",
    nextLevel: "Acquaintance",
    dailyRequirement: 2,
    engagementRequirement: 4,
    volunteeringRequirement: 1,
    supportRequirement: 1,
    donationValue: "$10"
  },
  {
    level: "Acquaintance",
    nextLevel: "Associate",
    dailyRequirement: 4,
    engagementRequirement: 8,
    volunteeringRequirement: 2,
    supportRequirement: 2,
    donationValue: "$25"
  },
  {
    level: "Associate",
    nextLevel: "Friend",
    dailyRequirement: 6,
    engagementRequirement: 12,
    volunteeringRequirement: 3,
    supportRequirement: 3,
    donationValue: "$50"
  },
  {
    level: "Friend",
    nextLevel: "Supporter",
    dailyRequirement: 8,
    engagementRequirement: 16,
    volunteeringRequirement: 4,
    supportRequirement: 4,
    donationValue: "$100"
  },
  {
    level: "Supporter",
    nextLevel: "Activist",
    dailyRequirement: 10,
    engagementRequirement: 20,
    volunteeringRequirement: 5,
    supportRequirement: 8,
    donationValue: "$250"
  },
  {
    level: "Activist",
    nextLevel: "Altruist",
    dailyRequirement: 12,
    engagementRequirement: 24,
    volunteeringRequirement: 6,
    supportRequirement: 12,
    donationValue: "$500"
  },
  {
    level: "Altruist",
    nextLevel: "Humanitarian",
    dailyRequirement: 16,
    engagementRequirement: 32,
    volunteeringRequirement: 8,
    supportRequirement: 16,
    donationValue: "$1,000"
  },
  {
    level: "Humanitarian",
    nextLevel: "Philanthropist",
    dailyRequirement: 20,
    engagementRequirement: 40,
    volunteeringRequirement: 10,
    supportRequirement: 20,
    donationValue: "$2,500"
  },
  {
    level: "Philanthropist",
    nextLevel: "Angel",
    dailyRequirement: 24,
    engagementRequirement: 48,
    volunteeringRequirement: 12,
    supportRequirement: 24,
    donationValue: "$5,000"
  },
  {
    level: "Angel",
    nextLevel: "Angel",
    dailyRequirement: 25,
    engagementRequirement: 50,
    volunteeringRequirement: 15,
    supportRequirement: 25,
    donationValue: "$10,000"
  }
];

export function getRequirementsForLevel(level: string): KarmaLevel | undefined {
  return KARMA_LEVELS.find(l => l.level === level);
}

export function getNextLevelRequirements(level: string): KarmaLevel | undefined {
  const currentLevelIndex = KARMA_LEVELS.findIndex(l => l.level === level);
  if (currentLevelIndex !== -1 && currentLevelIndex < KARMA_LEVELS.length - 1) {
    return KARMA_LEVELS[currentLevelIndex + 1];
  }
  return undefined;
}
