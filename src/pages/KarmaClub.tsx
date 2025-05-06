
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import KarmaClubLogo from "@/components/KarmaClubLogo";
import { ActivityCard } from "@/components/ActivityCard";
import { ActivityType } from "@/types/activities";
import { dailyActivities, volunteerActivities, engagementActivities, supportActivities } from "@/data/activities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const KarmaClub = () => {
  const [activeTab, setActiveTab] = useState<string>("daily");
  const [dailyProgress, setDailyProgress] = useState<number>(30);

  // Calculate the number of completed daily activities (for demo purposes, 30% complete)
  const completedDailyActivities = Math.floor(dailyActivities.length * (dailyProgress / 100));

  return (
    <div className="flex flex-col min-h-screen bg-[#121212]">
      {/* Header */}
      <header className="bg-emerald-600 p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <span className="text-white text-xl font-bold">THE KARMA CLUB</span>
        </div>
        <div className="flex space-x-2">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </button>
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
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <div className="flex justify-center mb-8">
          <KarmaClubLogo className="w-40 h-40" />
        </div>

        <Card className="mb-6 bg-[#222] text-white border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-center">
              Karma Gamified: The More You Do, The Greater Your Rewards
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300">
            <p>
              The Karma Club is a community of people that perform Planned Acts of Kindness, 
              Engagement, Volunteerism and Support each month. Membership is 100% free, and 
              "The More You Do, The Greater Your Rewards..." In short, we gamified karma. Do 
              a preset number of activities each month and automatically level up and be eligible to 
              win prizes that we give away every day to random members of the Karma Club.
            </p>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold text-white text-center mb-6">The Four Activities</h2>

        <Tabs 
          defaultValue="daily" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <TabsList className="grid grid-cols-2 md:grid-cols-4 bg-[#333]">
            <TabsTrigger value="daily" className="text-white data-[state=active]:bg-emerald-600">
              Daily Acts
            </TabsTrigger>
            <TabsTrigger value="volunteer" className="text-white data-[state=active]:bg-emerald-600">
              Volunteerism
            </TabsTrigger>
            <TabsTrigger value="engagement" className="text-white data-[state=active]:bg-emerald-600">
              Engagement
            </TabsTrigger>
            <TabsTrigger value="support" className="text-white data-[state=active]:bg-emerald-600">
              Support
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-4">
            <div className="mb-4">
              <div className="flex justify-between text-white mb-2">
                <span>Daily Progress</span>
                <span>{completedDailyActivities}/{dailyActivities.length} Activities</span>
              </div>
              <Progress value={dailyProgress} className="h-2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dailyActivities.map((activity) => (
                <ActivityCard 
                  key={activity.id} 
                  activity={activity} 
                  type={ActivityType.DAILY}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="volunteer" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {volunteerActivities.map((activity) => (
                <ActivityCard 
                  key={activity.id} 
                  activity={activity} 
                  type={ActivityType.VOLUNTEER}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {engagementActivities.map((activity) => (
                <ActivityCard 
                  key={activity.id} 
                  activity={activity} 
                  type={ActivityType.ENGAGEMENT}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="support" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {supportActivities.map((activity) => (
                <ActivityCard 
                  key={activity.id} 
                  activity={activity} 
                  type={ActivityType.SUPPORT}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
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
          
          <button className="flex flex-col items-center p-2 text-emerald-500">
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
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <span className="text-xs">Videos</span>
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <span className="text-xs">More</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default KarmaClub;
