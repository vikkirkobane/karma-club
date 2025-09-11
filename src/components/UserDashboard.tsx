import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Target, Flame, Star } from "lucide-react";

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  const nextLevelPoints = 400; // This would come from level progression logic
  const levelProgress = Math.round((user.points / nextLevelPoints) * 100);

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-800 to-emerald-900 text-white border-none">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
            <div className="text-2xl font-bold">{user.points}</div>
            <div className="text-xs text-emerald-200">Total Points</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-800 to-blue-900 text-white border-none">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-blue-300" />
            <div className="text-2xl font-bold">{user.level}</div>
            <div className="text-xs text-blue-200">Current Level</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-800 to-orange-900 text-white border-none">
          <CardContent className="p-4 text-center">
            <Flame className="h-8 w-8 mx-auto mb-2 text-orange-300" />
            <div className="text-2xl font-bold">{user.stats.dailyStreak}</div>
            <div className="text-xs text-orange-200">Day Streak</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-800 to-purple-900 text-white border-none">
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-purple-300" />
            <div className="text-2xl font-bold">{user.badges.length}</div>
            <div className="text-xs text-purple-200">Badges Earned</div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card className="bg-[#222] text-white border-none">
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            <span>Level Progress</span>
            <Badge variant="outline" className="bg-emerald-800 border-emerald-600">
              {user.tier} Tier
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level {user.level}</span>
              <span>{user.points}/{nextLevelPoints} Points</span>
            </div>
            <Progress value={levelProgress} className="h-3" />
            <div className="text-xs text-gray-400 text-center">
              {nextLevelPoints - user.points} points to next level
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Progress */}
      <Card className="bg-[#222] text-white border-none">
        <CardHeader className="pb-2">
          <CardTitle>Activity Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Daily Acts</span>
              <span>{user.stats.dailyCompleted} completed</span>
            </div>
            <Progress value={(user.stats.dailyCompleted / 100) * 100} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Volunteer Activities</span>
              <span>{user.stats.volunteerCompleted} completed</span>
            </div>
            <Progress value={(user.stats.volunteerCompleted / 20) * 100} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Engagement</span>
              <span>{user.stats.engagementCompleted} completed</span>
            </div>
            <Progress value={(user.stats.engagementCompleted / 10) * 100} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Support Activities</span>
              <span>{user.stats.supportCompleted} completed</span>
            </div>
            <Progress value={(user.stats.supportCompleted / 10) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};