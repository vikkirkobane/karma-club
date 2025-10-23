import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from "@/components/ui/use-toast";

interface UserStats {
  points: number;
  level: number;
  totalActivities: number;
  dailyStreak: number;
  dailyCompleted: number;
  volunteerCompleted: number;
  engagementCompleted: number;
  supportCompleted: number;
}

interface UserStatsContextType {
  stats: UserStats;
  refreshStats: () => Promise<void>;
  updateStats: (updates: Partial<UserStats>) => void;
  isLoading: boolean;
}

const UserStatsContext = createContext<UserStatsContextType | undefined>(undefined);

export const useUserStats = () => {
  const context = useContext(UserStatsContext);
  if (context === undefined) {
    throw new Error('useUserStats must be used within a UserStatsProvider');
  }
  return context;
};

export const UserStatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    points: user?.points || 0,
    level: user?.level || 1,
    totalActivities: user?.stats?.totalActivities || 0,
    dailyStreak: user?.stats?.dailyStreak || 0,
    dailyCompleted: user?.stats?.dailyCompleted || 0,
    volunteerCompleted: user?.stats?.volunteerCompleted || 0,
    engagementCompleted: user?.stats?.engagementCompleted || 0,
    supportCompleted: user?.stats?.supportCompleted || 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // Create a ref to always have access to the latest refreshStats function
  const refreshStatsRef = useRef<() => Promise<void>>();

  // Sync stats with user data when user changes
  useEffect(() => {
    if (user) {
      setStats({
        points: user.points || 0,
        level: user.level || 1,
        totalActivities: user.stats?.totalActivities || 0,
        dailyStreak: user.stats?.dailyStreak || 0,
        dailyCompleted: user.stats?.dailyCompleted || 0,
        volunteerCompleted: user.stats?.volunteerCompleted || 0,
        engagementCompleted: user.stats?.engagementCompleted || 0,
        supportCompleted: user.stats?.supportCompleted || 0,
      });
    }
  }, [user]);

  // Define refreshStats before using it in the subscription
  const refreshStats = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Fetch latest user stats
      const { data: userStats, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        throw statsError;
      }

      // Fetch activity counts
      const { data: activities, error: activitiesError } = await supabase
        .from('user_activities')
        .select(`
          activity_id,
          activities!inner(category_id, activity_categories!inner(name))
        `)
        .eq('user_id', user.id)
        .eq('status', 'approved');

      if (activitiesError) {
        console.error('Error fetching activities:', activitiesError);
      }

      // Calculate activity stats
      const activityStats = {
        totalActivities: activities?.length || 0,
        dailyCompleted: activities?.filter(a => 
          a.activities?.activity_categories?.name?.toLowerCase().includes('daily')
        ).length || 0,
        volunteerCompleted: activities?.filter(a => 
          a.activities?.activity_categories?.name?.toLowerCase().includes('volunteer')
        ).length || 0,
        engagementCompleted: activities?.filter(a => 
          a.activities?.activity_categories?.name?.toLowerCase().includes('engagement')
        ).length || 0,
        supportCompleted: activities?.filter(a => 
          a.activities?.activity_categories?.name?.toLowerCase().includes('support')  
        ).length || 0,
      };

      const newStats: UserStats = {
        points: userStats?.points || 0,
        level: calculateLevel(userStats?.points || 0),
        dailyStreak: userStats?.streak || 0,
        ...activityStats,
      };

      setStats(newStats);

      // Update user context with new stats
      updateUser({
        points: newStats.points,
        level: newStats.level,
        stats: {
          totalActivities: newStats.totalActivities,
          dailyStreak: newStats.dailyStreak,
          dailyCompleted: newStats.dailyCompleted,
          volunteerCompleted: newStats.volunteerCompleted,
          engagementCompleted: newStats.engagementCompleted,
          supportCompleted: newStats.supportCompleted,
        }
      });

    } catch (error) {
      console.error('Error refreshing stats:', error);
      // Fallback to user context data if database fails
      if (user) {
        setStats({
          points: user.points || 0,
          level: user.level || 1,
          totalActivities: user.stats?.totalActivities || 0,
          dailyStreak: user.stats?.dailyStreak || 0,
          dailyCompleted: user.stats?.dailyCompleted || 0,
          volunteerCompleted: user.stats?.volunteerCompleted || 0,
          engagementCompleted: user.stats?.engagementCompleted || 0,
          supportCompleted: user.stats?.supportCompleted || 0,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, updateUser]);

  // Update the ref whenever refreshStats changes
  useEffect(() => {
    refreshStatsRef.current = refreshStats;
  }, [refreshStats]);

  // Set up real-time subscription for user stats changes
  useEffect(() => {
    if (!user?.id) return;

    const subscription = supabase
      .channel(`user-stats-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_stats',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('User stats changed:', payload);
          if (refreshStatsRef.current) {
            refreshStatsRef.current();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public', 
          table: 'user_activities',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New activity completed:', payload);
          if (refreshStatsRef.current) {
            refreshStatsRef.current();
          }
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.warn('WebSocket subscription error (app continues to work):', err);
        } else if (status === 'SUBSCRIBED') {
          console.log('Real-time subscription established');
        }
      });

    return () => {
      try {
        subscription.unsubscribe();
      } catch (err) {
        console.warn('Error unsubscribing from real-time updates:', err);
      }
    };
  }, [user?.id]);

  const calculateLevel = (points: number): number => {
    // Simple level calculation: every 100 points = 1 level
    return Math.max(1, Math.floor(points / 100) + 1);
  };

  const updateStats = (updates: Partial<UserStats>) => {
    setStats(prevStats => {
      const newStats = { ...prevStats, ...updates };
      
      // Recalculate level if points changed
      if (updates.points !== undefined) {
        newStats.level = calculateLevel(updates.points);
      }

      // Update user context
      updateUser({
        points: newStats.points,
        level: newStats.level,
        stats: {
          totalActivities: newStats.totalActivities,
          dailyStreak: newStats.dailyStreak,
          dailyCompleted: newStats.dailyCompleted,
          volunteerCompleted: newStats.volunteerCompleted,
          engagementCompleted: newStats.engagementCompleted,
          supportCompleted: newStats.supportCompleted,
        }
      });

      return newStats;
    });
  };

  const value: UserStatsContextType = {
    stats,
    refreshStats,
    updateStats,
    isLoading,
  };

  return (
    <UserStatsContext.Provider value={value}>
      {children}
    </UserStatsContext.Provider>
  );
};