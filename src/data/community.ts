import { ActivityPost, Comment, CommunityChallenge } from "@/types/community";

export const mockActivityPosts: ActivityPost[] = [
  {
    id: "post-1",
    userId: "user-2",
    username: "HelpingHand",
    userAvatar: "/placeholder.svg",
    userCountry: "Canada",
    userCountryCode: "CA",
    activityId: "daily-1",
    activityTitle: "Compliment a Stranger",
    activityType: "daily",
    description: "Made a cashier's day by complimenting her beautiful smile! She said it was exactly what she needed to hear today. Small acts really do make a difference! 💫",
    mediaUrls: ["/placeholder.svg"],
    pointsEarned: 1,
    createdAt: "2024-01-15T10:30:00Z",
    likes: 24,
    comments: [
      {
        id: "comment-1",
        userId: "user-3",
        username: "KindSoul",
        userAvatar: "/placeholder.svg",
        content: "This is so beautiful! You never know how much someone needs to hear something kind. Keep spreading the love! ❤️",
        createdAt: "2024-01-15T11:00:00Z",
        likes: 5,
        isLiked: false
      },
      {
        id: "comment-2",
        userId: "user-4",
        username: "GoodVibes",
        userAvatar: "/placeholder.svg",
        content: "Love this! I'm inspired to do the same today 🌟",
        createdAt: "2024-01-15T11:15:00Z",
        likes: 3,
        isLiked: true
      }
    ],
    isLiked: true
  },
  {
    id: "post-2",
    userId: "user-5",
    username: "EcoWarrior",
    userAvatar: "/placeholder.svg",
    userCountry: "Germany",
    userCountryCode: "DE",
    activityId: "volunteer-1",
    activityTitle: "Community Clean-up",
    activityType: "volunteer",
    description: "Spent 3 hours cleaning up the local park with 20 other volunteers! We collected 15 bags of trash and planted 10 new trees. The park looks amazing now! 🌳",
    mediaUrls: ["/placeholder.svg", "/placeholder.svg"],
    pointsEarned: 3,
    createdAt: "2024-01-15T08:00:00Z",
    likes: 42,
    comments: [
      {
        id: "comment-3",
        userId: "user-1",
        username: "KindnessWarrior",
        userAvatar: "/placeholder.svg",
        content: "Amazing work! This is exactly the kind of impact we need to see more of. Thank you for taking care of our planet! 🌍",
        createdAt: "2024-01-15T09:00:00Z",
        likes: 8,
        isLiked: true
      }
    ],
    isLiked: false
  },
  {
    id: "post-3",
    userId: "user-6",
    username: "FoodHero",
    userAvatar: "/placeholder.svg",
    userCountry: "United States",
    userCountryCode: "US",
    activityId: "support-2",
    activityTitle: "Food Bank Donation",
    activityType: "support",
    description: "Donated 50 cans of food to the local food bank today. The volunteers there do such incredible work feeding families in need. Every can counts! 🥫",
    mediaUrls: ["/placeholder.svg"],
    pointsEarned: 2,
    createdAt: "2024-01-14T16:45:00Z",
    likes: 18,
    comments: [],
    isLiked: false
  },
  {
    id: "post-4",
    userId: "user-7",
    username: "MentorMike",
    userAvatar: "/placeholder.svg",
    userCountry: "Australia",
    userCountryCode: "AU",
    activityId: "engagement-3",
    activityTitle: "Mentor a Student",
    activityType: "engagement",
    description: "Had my weekly mentoring session with Sarah, a high school student interested in coding. We built her first website together! Seeing her excitement when it went live was priceless 💻",
    mediaUrls: [],
    pointsEarned: 2,
    createdAt: "2024-01-14T14:20:00Z",
    likes: 31,
    comments: [
      {
        id: "comment-4",
        userId: "user-8",
        username: "TechTeacher",
        userAvatar: "/placeholder.svg",
        content: "Mentoring is such a powerful way to give back! You're changing lives, one student at a time 👨‍🏫",
        createdAt: "2024-01-14T15:00:00Z",
        likes: 7,
        isLiked: false
      },
      {
        id: "comment-5",
        userId: "user-9",
        username: "CodeCrafter",
        userAvatar: "/placeholder.svg",
        content: "This is awesome! I'd love to start mentoring too. Any tips for getting started?",
        createdAt: "2024-01-14T15:30:00Z",
        likes: 2,
        isLiked: false
      }
    ],
    isLiked: true
  }
];

export const mockCommunityChallenge: CommunityChallenge = {
  id: "challenge-1",
  title: "January Kindness Challenge",
  description: "Complete 31 acts of kindness in 31 days! Join thousands of members spreading positivity this month.",
  startDate: "2024-01-01T00:00:00Z",
  endDate: "2024-01-31T23:59:59Z",
  targetPoints: 31,
  participants: 1247,
  rewards: ["Special January Badge", "500 Bonus Points", "Featured Member Status"],
  isActive: true
};