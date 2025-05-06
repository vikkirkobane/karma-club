
import { useState, useEffect } from "react";
import { Activity, ActivityType, UserProgress, KARMA_LEVELS } from "@/types/activities";
import { toast } from "@/components/ui/use-toast";

// This is a mock hook that would normally interact with a backend
// In a real implementation, this would make API calls to get and update user progress

export function useActivityProgress(userId: string) {
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  
  // Mock initial data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUserProgress({
        userId,
        level: 5,
        tier: "Friend",
        points: 120,
        completedActivities: [
          "daily-1", 
          "daily-3", 
          "volunteer-1"
        ],
        badges: [
          "daily-starter",
          "bronze-tier",
          "newcomer"
        ],
        dailyStreak: 3,
        
        // New fields for the four categories
        dailyActsCompleted: 6,
        engagementCompleted: 10,
        volunteeringCompleted: 3,
        supportCompleted: 3,
        
        // Progress percentages
        dailyProgress: 75,   // 6 out of 8 required for Friend level
        engagementProgress: 62.5,  // 10 out of 16 required
        volunteeringProgress: 75,  // 3 out of 4 required
        supportProgress: 75   // 3 out of 4 required
      });
      setLoading(false);
    }, 1000);
  }, [userId]);
  
  // Complete an activity
  const completeActivity = async (
    activity: Activity, 
    description: string, 
    mediaFile: File | null
  ): Promise<boolean> => {
    if (!userProgress) return false;
    
    // Check if the activity is already completed
    if (userProgress.completedActivities.includes(activity.id)) {
      toast({
        title: "Already Completed",
        description: "You've already completed this activity.",
        variant: "destructive",
      });
      return false;
    }
    
    // Simulate API call
    setLoading(true);
    
    // In a real app, you would upload the media file and submit the description
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Update the user progress with the completed activity
        setUserProgress(prev => {
          if (!prev) return prev;
          
          const updatedCompletedActivities = [...prev.completedActivities, activity.id];
          const updatedPoints = prev.points + activity.points;
          
          // Determine activity type and update corresponding counter
          let updatedDailyActsCompleted = prev.dailyActsCompleted;
          let updatedEngagementCompleted = prev.engagementCompleted;
          let updatedVolunteeringCompleted = prev.volunteeringCompleted;
          let updatedSupportCompleted = prev.supportCompleted;
          
          if (activity.id.startsWith('daily')) {
            updatedDailyActsCompleted++;
          } else if (activity.id.startsWith('engagement')) {
            updatedEngagementCompleted++;
          } else if (activity.id.startsWith('volunteer')) {
            updatedVolunteeringCompleted++;
          } else if (activity.id.startsWith('support')) {
            updatedSupportCompleted++;
          }
          
          // Find current level requirements
          const currentLevelData = KARMA_LEVELS.find(level => level.level === prev.tier);
          if (!currentLevelData) return prev;
          
          // Calculate new progress percentages
          const dailyProgress = Math.min(100, (updatedDailyActsCompleted / currentLevelData.dailyRequirement) * 100);
          const engagementProgress = Math.min(100, (updatedEngagementCompleted / currentLevelData.engagementRequirement) * 100);
          const volunteeringProgress = Math.min(100, (updatedVolunteeringCompleted / currentLevelData.volunteeringRequirement) * 100);
          const supportProgress = Math.min(100, (updatedSupportCompleted / currentLevelData.supportRequirement) * 100);
          
          // Check if eligible for next level
          const currentLevelIndex = KARMA_LEVELS.findIndex(level => level.level === prev.tier);
          let newLevel = prev.tier;
          
          if (currentLevelIndex < KARMA_LEVELS.length - 1) {
            const nextLevelData = KARMA_LEVELS[currentLevelIndex + 1];
            
            // Check if all requirements are met
            if (updatedDailyActsCompleted >= nextLevelData.dailyRequirement &&
                updatedEngagementCompleted >= nextLevelData.engagementRequirement &&
                updatedVolunteeringCompleted >= nextLevelData.volunteeringRequirement &&
                updatedSupportCompleted >= nextLevelData.supportRequirement) {
              newLevel = nextLevelData.level;
              
              // Show level up toast
              toast({
                title: "Level Up!",
                description: `Congratulations! You've reached ${newLevel} level!`,
                variant: "default",
              });
            }
          }
          
          // Update badges (simplified logic)
          const updatedBadges = [...prev.badges];
          
          // Check for level milestone badges
          if (newLevel !== prev.tier && !updatedBadges.includes(`${newLevel.toLowerCase()}-tier`)) {
            updatedBadges.push(`${newLevel.toLowerCase()}-tier`);
          }
          
          // Check for activity milestone badges
          const totalActivities = updatedCompletedActivities.length;
          if (totalActivities >= 10 && !updatedBadges.includes("activity-10")) {
            updatedBadges.push("activity-10");
          }
          
          // Return updated progress
          return {
            ...prev,
            tier: newLevel,
            points: updatedPoints,
            completedActivities: updatedCompletedActivities,
            badges: updatedBadges,
            dailyActsCompleted: updatedDailyActsCompleted,
            engagementCompleted: updatedEngagementCompleted,
            volunteeringCompleted: updatedVolunteeringCompleted,
            supportCompleted: updatedSupportCompleted,
            dailyProgress,
            engagementProgress,
            volunteeringProgress,
            supportProgress
          };
        });
        
        setLoading(false);
        
        // Show toast notification
        toast({
          title: "Activity Completed!",
          description: `You earned ${activity.points} points for completing "${activity.title}"`,
        });
        
        resolve(true);
      }, 1500);
    });
  };
  
  // Check if activity is completed
  const isActivityCompleted = (activityId: string): boolean => {
    if (!userProgress) return false;
    return userProgress.completedActivities.includes(activityId);
  };
  
  // Get progress percentage for a category
  const getCategoryProgress = (type: ActivityType): number => {
    if (!userProgress) return 0;
    
    switch (type) {
      case ActivityType.DAILY:
        return userProgress.dailyProgress;
      case ActivityType.ENGAGEMENT:
        return userProgress.engagementProgress;
      case ActivityType.VOLUNTEER:
        return userProgress.volunteeringProgress;
      case ActivityType.SUPPORT:
        return userProgress.supportProgress;
      default:
        return 0;
    }
  };
  
  return {
    loading,
    userProgress,
    completeActivity,
    isActivityCompleted,
    getCategoryProgress
  };
}
