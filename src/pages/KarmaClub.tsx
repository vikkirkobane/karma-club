
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageLayout } from "@/components/layout/PageLayout";
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
    <PageLayout title="THE KARMA CLUB">
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
    </PageLayout>
  );
};

export default KarmaClub;
