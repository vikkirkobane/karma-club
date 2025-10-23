import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { KARMA_LEVELS } from "@/types/activities";

const LevelProgression = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  const calculatePercentage = (completed: number, requirement: number) => {
    if (requirement === 0) return 0;
    return Math.min(100, Math.round((completed / requirement) * 100));
  };

  // Find current level requirements
  const currentLevelData = KARMA_LEVELS.find(level => level.level === user.tier);
  
  // Calculate progress percentages based on user's current stats
  const userProgress = {
    userId: user.id,
    tier: user.tier,
    level: user.level,
    points: user.points,
    completedActivities: [],
    badges: user.badges,
    dailyStreak: user.stats.dailyStreak,
    dailyActsCompleted: user.stats.dailyCompleted,
    engagementCompleted: user.stats.engagementCompleted,
    volunteeringCompleted: user.stats.volunteerCompleted,
    supportCompleted: user.stats.supportCompleted,
    dailyProgress: calculatePercentage(user.stats.dailyCompleted, currentLevelData?.dailyRequirement || 1),
    engagementProgress: calculatePercentage(user.stats.engagementCompleted, currentLevelData?.engagementRequirement || 1),
    volunteeringProgress: calculatePercentage(user.stats.volunteerCompleted, currentLevelData?.volunteeringRequirement || 1),
        supportProgress: calculatePercentage(user.stats.supportCompleted, currentLevelData?.supportRequirement || 1)
  };

  return (
    <PageLayout title="KARMA CLUB LEVELS">
      {/* Current Progress Card */}
      <Card className="mb-6 bg-[#222] text-white border-none">
        <CardHeader className="pb-2">
          <CardTitle>Your Current Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Current Level: {userProgress.tier}</span>
              <span>Next Level: {
                KARMA_LEVELS.find(level => level.level === userProgress.tier)?.nextLevel
              }</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="flex justify-between mb-1">
                <span>Daily Acts</span>
                <span>{userProgress.dailyProgress}%</span>
              </div>
              <Progress value={userProgress.dailyProgress} className="h-2 progress-indicator-green" />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>Engagement</span>
                <span>{userProgress.engagementProgress}%</span>
              </div>
              <Progress value={userProgress.engagementProgress} className="h-2 progress-indicator-green" />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>Volunteering</span>
                <span>{userProgress.volunteeringProgress}%</span>
              </div>
              <Progress value={userProgress.volunteeringProgress} className="h-2 progress-indicator-green" />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>Support</span>
                <span>{userProgress.supportProgress}%</span>
              </div>
              <Progress value={userProgress.supportProgress} className="h-2 progress-indicator-green" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level Requirements Table */}
      <Card className="mb-6 bg-[#222] text-white border-none">
        <CardHeader className="pb-2">
          <CardTitle>Karma Club Level Requirements</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="text-white">
            <TableHeader className="bg-[#333]">
              <TableRow>
                <TableHead className="text-white">Level</TableHead>
                <TableHead className="text-white">Next Level</TableHead>
                <TableHead className="text-white">Daily Acts</TableHead>
                <TableHead className="text-white">Engagement</TableHead>
                <TableHead className="text-white">Volunteering</TableHead>
                <TableHead className="text-white">Support</TableHead>
                <TableHead className="text-white">Donation Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {KARMA_LEVELS.map((level) => (
                <TableRow key={level.level} className={
                  userProgress.tier === level.level ? "bg-emerald-900/30" : "hover:bg-[#333]"
                }>
                  <TableCell className="font-medium">
                    {level.level}
                    {userProgress.tier === level.level && (
                      <span className="ml-2 bg-emerald-600 text-xs px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{level.nextLevel}</TableCell>
                  <TableCell>{level.dailyRequirement}</TableCell>
                  <TableCell>{level.engagementRequirement}</TableCell>
                  <TableCell>{level.volunteeringRequirement}</TableCell>
                  <TableCell>{level.supportRequirement}</TableCell>
                  <TableCell>{level.donationValue}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default LevelProgression;