
import { useState, useEffect } from "react";
import { Activity, ActivityType, UserProgress } from "@/types/activities";
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
        tier: "Bronze",
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
        dailyStreak: 3
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
          
          // Calculate new level (simplified)
          const newLevel = Math.floor(updatedPoints / 25); // Every 25 points is a new level
          
          // Determine tier based on level
          let newTier = prev.tier;
          if (newLevel >= 15) newTier = "Platinum";
          else if (newLevel >= 10) newTier = "Gold";
          else if (newLevel >= 5) newTier = "Silver";
          else newTier = "Bronze";
          
          // Check for new badges (simplified logic)
          const updatedBadges = [...prev.badges];
          
          // Add level tier badge if needed
          if (newLevel >= 5 && !updatedBadges.includes("bronze-tier")) {
            updatedBadges.push("bronze-tier");
          }
          if (newLevel >= 10 && !updatedBadges.includes("silver-tier")) {
            updatedBadges.push("silver-tier");
          }
          
          // Check for activity milestone badges
          const activityCount = updatedCompletedActivities.length;
          if (activityCount >= 10 && !updatedBadges.includes("activity-10")) {
            updatedBadges.push("activity-10");
          }
          
          // Return updated progress
          return {
            ...prev,
            level: newLevel,
            tier: newTier,
            points: updatedPoints,
            completedActivities: updatedCompletedActivities,
            badges: updatedBadges,
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
  const getCategoryProgress = (type: ActivityType, totalActivities: number): number => {
    if (!userProgress) return 0;
    
    const completedInCategory = userProgress.completedActivities.filter(id => id.startsWith(type)).length;
    return Math.min(100, Math.round((completedInCategory / totalActivities) * 100));
  };
  
  return {
    loading,
    userProgress,
    completeActivity,
    isActivityCompleted,
    getCategoryProgress
  };
}
