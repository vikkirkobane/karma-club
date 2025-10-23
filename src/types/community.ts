export interface ActivityPost {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  userCountry?: string;
  userCountryCode?: string;
  activityId: string;
  activityTitle: string;
  activityType: 'daily' | 'volunteer' | 'engagement' | 'support';
  description: string;
  mediaUrls: string[];
  pointsEarned: number;
  createdAt: string;
  likes: number;
  comments: Comment[];
  isLiked: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
}

export interface UserConnection {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  targetPoints: number;
  participants: number;
  rewards: string[];
  isActive: boolean;
}

export interface Appreciation {
  id: string;
  fromUserId: string;
  toUserId: string;
  postId?: string;
  type: 'like' | 'heart' | 'clap' | 'fire';
  message?: string;
  createdAt: string;
}