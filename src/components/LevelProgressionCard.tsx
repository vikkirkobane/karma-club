import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { KARMA_LEVELS, KarmaLevel, UserProgress } from "@/types/activities";

interface LevelProgressionCardProps {
  userProgress: UserProgress;
}

const LevelProgressionCard: React.FC<LevelProgressionCardProps> = ({ userProgress }) => {
  // Find current level requirements
  const currentLevelData = KARMA_LEVELS.find(level => level.level === userProgress.tier);
  
  // Find next level requirements
  const currentLevelIndex = KARMA_LEVELS.findIndex(level => level.level === userProgress.tier);
  const nextLevelData = currentLevelIndex < KARMA_LEVELS.length - 1 
    ? KARMA_LEVELS[currentLevelIndex + 1] 
    : null;
  
  if (!currentLevelData) return null;

  const calculatePercentage = (completed: number, requirement: number) => {
    if (requirement === 0) return 0;
    return Math.min(100, Math.round((completed / requirement) * 100));
  };

  const dailyRequirement = nextLevelData?.dailyRequirement || currentLevelData.dailyRequirement;
  const engagementRequirement = nextLevelData?.engagementRequirement || currentLevelData.engagementRequirement;
  const volunteeringRequirement = nextLevelData?.volunteeringRequirement || currentLevelData.volunteeringRequirement;
  const supportRequirement = nextLevelData?.supportRequirement || currentLevelData.supportRequirement;

  return (
    <Card className="bg-[#222] text-white border-none">
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>Level Progression</span>
          <span>Current Level: {userProgress.tier}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Level Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="col-span-2">
            <h3 className="text-lg font-semibold mb-2">
              {nextLevelData 
                ? `Requirements to reach ${nextLevelData.level}:` 
                : "Maximum Level Reached!"}
            </h3>
          </div>

          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-sm text-gray-400">PAKs</div>
            <div className="flex justify-between">
              <span>{calculatePercentage(userProgress.dailyActsCompleted, dailyRequirement)}%</span>
              <span>({userProgress.dailyActsCompleted} / {dailyRequirement})</span>
            </div>
            <Progress 
              value={calculatePercentage(userProgress.dailyActsCompleted, dailyRequirement)} 
              className="h-2 mt-1 progress-indicator-green" 
            />
          </div>

          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-sm text-gray-400">Engagement</div>
            <div className="flex justify-between">
              <span>{calculatePercentage(userProgress.engagementCompleted, engagementRequirement)}%</span>
              <span>({userProgress.engagementCompleted} / {engagementRequirement})</span>
            </div>
            <Progress 
              value={calculatePercentage(userProgress.engagementCompleted, engagementRequirement)} 
              className="h-2 mt-1 progress-indicator-green" 
            />
          </div>

          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-sm text-gray-400">Volunteering</div>
            <div className="flex justify-between">
              <span>{calculatePercentage(userProgress.volunteeringCompleted, volunteeringRequirement)}%</span>
              <span>({userProgress.volunteeringCompleted} / {volunteeringRequirement})</span>
            </div>
            <Progress 
              value={calculatePercentage(userProgress.volunteeringCompleted, volunteeringRequirement)} 
              className="h-2 mt-1 progress-indicator-green" 
            />
          </div>

          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-sm text-gray-400">Support</div>
            <div className="flex justify-between">
              <span>{calculatePercentage(userProgress.supportCompleted, supportRequirement)}%</span>
              <span>({userProgress.supportCompleted} / {supportRequirement})</span>
            </div>
            <Progress 
              value={calculatePercentage(userProgress.supportCompleted, supportRequirement)} 
              className="h-2 mt-1 progress-indicator-green" 
            />
          </div>
        </div>

        {/* Level Ladder */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Karma Club Levels</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {KARMA_LEVELS.map((level, index) => (
              <div 
                key={level.level} 
                className={`p-2 rounded-lg flex justify-between items-center ${userProgress.tier === level.level 
                  ? 'bg-emerald-800 border border-emerald-500' 
                  : 'bg-gray-800'}`}
              >
                <div className="flex items-center">
                  <span className="font-medium">{level.level}</span>
                  {userProgress.tier === level.level && (
                    <span className="ml-2 bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-400">
                  Donation Value: {level.donationValue}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LevelProgressionCard;