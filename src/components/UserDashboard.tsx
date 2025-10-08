import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useUserStats } from "@/contexts/UserStatsContext";
import { UserDashboardSkeleton } from "@/components/LoadingSkeleton";
import { Trophy, Target, Flame, Star, TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { stats, refreshStats, isLoading: statsLoading } = useUserStats();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate initial loading time for dashboard data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!user) return null;
  
  if (isLoading) {
    return <UserDashboardSkeleton />;
  }

  const nextLevelPoints = (stats.level * 100); // Each level requires 100 more points
  const currentLevelProgress = stats.points % 100;
  const levelProgress = Math.round((currentLevelProgress / 100) * 100);
  
  // Calculate weekly progress (mock data based on current points)
  const weeklyGoal = 50;
  const weeklyProgress = Math.min((stats.points % 100), weeklyGoal);
  const weeklyProgressPercent = Math.round((weeklyProgress / weeklyGoal) * 100);

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-800 to-emerald-900 text-white border-none">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
            <div className="text-2xl font-bold">{stats.points}</div>
            <div className="text-xs text-emerald-200">Total Points</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-800 to-blue-900 text-white border-none">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-blue-300" />
            <div className="text-2xl font-bold">{stats.level}</div>
            <div className="text-xs text-blue-200">Current Level</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-800 to-orange-900 text-white border-none">
          <CardContent className="p-4 text-center">
            <Flame className="h-8 w-8 mx-auto mb-2 text-orange-300" />
            <div className="text-2xl font-bold">{stats.dailyStreak}</div>
            <div className="text-xs text-orange-200">Day Streak</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-800 to-purple-900 text-white border-none">
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-purple-300" />
            <div className="text-2xl font-bold">{user.badges?.length || 0}</div>
            <div className="text-xs text-purple-200">Badges Earned</div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card className="bg-[#222] text-white border-none">
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            <span>Level Progress</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-800 border-emerald-600">
                {user.tier} Tier
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refreshStats()}
                disabled={statsLoading}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className={`h-3 w-3 ${statsLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level {stats.level}</span>
              <span>{currentLevelProgress}/100 Points</span>
            </div>
            <Progress value={levelProgress} className="h-3" />
            <div className="text-xs text-gray-400 text-center">
              {100 - currentLevelProgress} points to next level
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Goal Progress */}
      <Card className="bg-gradient-to-r from-purple-800 to-pink-800 text-white border-none">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Weekly Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>This Week</span>
              <span>{weeklyProgress}/{weeklyGoal} Points</span>
            </div>
            <Progress value={weeklyProgressPercent} className="h-2" />
            <div className="text-xs text-purple-200 text-center">
              {weeklyProgressPercent >= 100 ? "Goal achieved! 🎉" : `${weeklyGoal - weeklyProgress} points to go`}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Progress - Systematic Order: Daily Acts, Engagement, Volunteerism, Support */}
      <Card className="bg-[#222] text-white border-none">
        <CardHeader className="pb-2">
          <CardTitle>Activity Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Daily Acts</span>
              <span>{stats.dailyCompleted} completed</span>
            </div>
            <Progress value={Math.min((stats.dailyCompleted / 100) * 100, 100)} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Engagement</span>
              <span>{stats.engagementCompleted} completed</span>
            </div>
            <Progress value={Math.min((stats.engagementCompleted / 10) * 100, 100)} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Volunteerism</span>
              <span>{stats.volunteerCompleted} completed</span>
            </div>
            <Progress value={Math.min((stats.volunteerCompleted / 20) * 100, 100)} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Support</span>
              <span>{stats.supportCompleted} completed</span>
            </div>
            <Progress value={Math.min((stats.supportCompleted / 10) * 100, 100)} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};