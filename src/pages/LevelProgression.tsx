
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KARMA_LEVELS } from "@/types/activities";

const LevelProgression = () => {
  // Mock user data for demonstration
  const userProgress = {
    userId: "user1",
    tier: "Friend", // Current level
    level: 8,
    points: 245,
    completedActivities: [],
    badges: [],
    dailyStreak: 12,
    dailyActsCompleted: 6,
    engagementCompleted: 10,
    volunteeringCompleted: 3,
    supportCompleted: 3,
    dailyProgress: 75,
    engagementProgress: 62.5,
    volunteeringProgress: 75,
    supportProgress: 75
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#121212]">
      {/* Header */}
      <header className="bg-emerald-600 p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <span className="text-white text-xl font-bold">KARMA CLUB LEVELS</span>
        </div>
        <button className="text-white">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 6h16M4 12h16M4 18h16" 
            />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
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
                  <span>{userProgress.dailyActsCompleted}/{
                    KARMA_LEVELS.find(l => l.level === userProgress.tier)?.dailyRequirement
                  }</span>
                </div>
                <Progress value={userProgress.dailyProgress} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span>Engagement</span>
                  <span>{userProgress.engagementCompleted}/{
                    KARMA_LEVELS.find(l => l.level === userProgress.tier)?.engagementRequirement
                  }</span>
                </div>
                <Progress value={userProgress.engagementProgress} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span>Volunteering</span>
                  <span>{userProgress.volunteeringCompleted}/{
                    KARMA_LEVELS.find(l => l.level === userProgress.tier)?.volunteeringRequirement
                  }</span>
                </div>
                <Progress value={userProgress.volunteeringProgress} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span>Support</span>
                  <span>{userProgress.supportCompleted}/{
                    KARMA_LEVELS.find(l => l.level === userProgress.tier)?.supportRequirement
                  }</span>
                </div>
                <Progress value={userProgress.supportProgress} className="h-2" />
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
      </main>

      {/* Footer Navigation */}
      <footer className="bg-[#222] text-white py-2">
        <div className="flex justify-around items-center">
          <button className="flex flex-col items-center p-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
              />
            </svg>
            <span className="text-xs">Home</span>
          </button>
          
          <button className="flex flex-col items-center p-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
              />
            </svg>
            <span className="text-xs">Daily Acts</span>
          </button>
          
          <button className="flex flex-col items-center p-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
              />
            </svg>
            <span className="text-xs">Leaders</span>
          </button>
          
          <button className="flex flex-col items-center p-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
            <span className="text-xs">Levels</span>
          </button>
          
          <button className="flex flex-col items-center p-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
              />
            </svg>
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default LevelProgression;
