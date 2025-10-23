
import { ActivityType } from "@/types/activities";

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: ActivityType | 'achievement' | 'streak' | 'tier';
  requiredLevel?: number;
}

export const badgeData: Badge[] = [
  // Daily Streak Badges
  {
    id: "daily-streak-3",
    name: "3-Day Streak",
    description: "Completed activities for 3 days in a row",
    imageUrl: "/placeholder.svg",
    category: "streak"
  },
  {
    id: "daily-streak-7",
    name: "Weekly Warrior",
    description: "Completed activities for 7 days in a row",
    imageUrl: "/placeholder.svg",
    category: "streak"
  },
  {
    id: "daily-streak-14",
    name: "Fortnight Force",
    description: "Completed activities for 14 days in a row",
    imageUrl: "/placeholder.svg",
    category: "streak"
  },
  {
    id: "daily-streak-30",
    name: "30-Day Devotion",
    description: "Completed activities for 30 days in a row",
    imageUrl: "/placeholder.svg",
    category: "streak"
  },
  
  // Daily Activities Badges
  {
    id: "daily-starter",
    name: "Kindness Initiate",
    description: "Completed 5 daily acts of kindness",
    imageUrl: "/placeholder.svg",
    category: ActivityType.DAILY
  },
  {
    id: "daily-pro",
    name: "Kindness Adept",
    description: "Completed 25 daily acts of kindness",
    imageUrl: "/placeholder.svg",
    category: ActivityType.DAILY
  },
  {
    id: "daily-expert",
    name: "Kindness Expert",
    description: "Completed 50 daily acts of kindness",
    imageUrl: "/placeholder.svg",
    category: ActivityType.DAILY
  },
  {
    id: "daily-master",
    name: "Kindness Master",
    description: "Completed 100 daily acts of kindness",
    imageUrl: "/placeholder.svg",
    category: ActivityType.DAILY
  },
  
  // Volunteer Badges
  {
    id: "volunteer-beginner",
    name: "Volunteer Starter",
    description: "Completed 3 volunteer activities",
    imageUrl: "/placeholder.svg",
    category: ActivityType.VOLUNTEER
  },
  {
    id: "volunteer-star",
    name: "Rising Volunteer",
    description: "Completed 10 volunteer activities",
    imageUrl: "/placeholder.svg",
    category: ActivityType.VOLUNTEER
  },
  {
    id: "volunteer-pro",
    name: "Volunteer Pro",
    description: "Completed 20 volunteer activities",
    imageUrl: "/placeholder.svg",
    category: ActivityType.VOLUNTEER
  },
  
  // Engagement Badges
  {
    id: "engagement-starter",
    name: "Community Joiner",
    description: "Completed 3 engagement activities",
    imageUrl: "/placeholder.svg",
    category: ActivityType.ENGAGEMENT
  },
  {
    id: "engagement-pro",
    name: "Community Advocate",
    description: "Completed 10 engagement activities",
    imageUrl: "/placeholder.svg",
    category: ActivityType.ENGAGEMENT
  },
  {
    id: "engagement-master",
    name: "Community Leader",
    description: "Completed 20 engagement activities",
    imageUrl: "/placeholder.svg",
    category: ActivityType.ENGAGEMENT
  },
  
  // Support Badges
  {
    id: "support-starter",
    name: "Support Beginner",
    description: "Completed 3 support activities",
    imageUrl: "/placeholder.svg",
    category: ActivityType.SUPPORT
  },
  {
    id: "support-champion",
    name: "Support Champion",
    description: "Completed 10 support activities",
    imageUrl: "/placeholder.svg",
    category: ActivityType.SUPPORT
  },
  {
    id: "support-hero",
    name: "Support Hero",
    description: "Completed 20 support activities",
    imageUrl: "/placeholder.svg",
    category: ActivityType.SUPPORT
  },
  
  // Tier Badges
  {
    id: "bronze-tier",
    name: "Bronze Tier",
    description: "Reached Bronze Tier (Level 5)",
    imageUrl: "/placeholder.svg",
    category: "tier",
    requiredLevel: 5
  },
  {
    id: "silver-tier",
    name: "Silver Tier",
    description: "Reached Silver Tier (Level 10)",
    imageUrl: "/placeholder.svg",
    category: "tier",
    requiredLevel: 10
  },
  {
    id: "gold-tier",
    name: "Gold Tier",
    description: "Reached Gold Tier (Level 15)",
    imageUrl: "/placeholder.svg",
    category: "tier",
    requiredLevel: 15
  },
  {
    id: "platinum-tier",
    name: "Platinum Tier",
    description: "Reached Platinum Tier (Level 20)",
    imageUrl: "/placeholder.svg",
    category: "tier",
    requiredLevel: 20
  },
  
  // Achievement Badges
  {
    id: "activity-10",
    name: "Getting Started",
    description: "Completed 10 total activities",
    imageUrl: "/placeholder.svg",
    category: "achievement"
  },
  {
    id: "activity-50",
    name: "Halfway There",
    description: "Completed 50 total activities",
    imageUrl: "/placeholder.svg",
    category: "achievement"
  },
  {
    id: "activity-100",
    name: "Century Club",
    description: "Completed 100 total activities",
    imageUrl: "/placeholder.svg",
    category: "achievement"
  },
  {
    id: "newcomer",
    name: "Newcomer",
    description: "Welcome to The Karma Club!",
    imageUrl: "/placeholder.svg",
    category: "achievement"
  }
];
