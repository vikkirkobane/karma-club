import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageLayout } from "@/components/layout/PageLayout";
import { leaderboardData } from "@/data/leaderboard";

const Leaderboard = () => {
  const [filter, setFilter] = useState<'global' | 'country' | 'organization'>('global');

  return (
    <PageLayout title="LEADERBOARD">
      <Card className="mb-6 bg-[#222] text-white border-none">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Top Karma Contributors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="global" 
            value={filter}
            onValueChange={(value) => setFilter(value as 'global' | 'country' | 'organization')}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 bg-[#333] w-full">
              <TabsTrigger value="global" className="text-white data-[state=active]:bg-emerald-600">
                Global
              </TabsTrigger>
              <TabsTrigger value="country" className="text-white data-[state=active]:bg-emerald-600">
                By Country
              </TabsTrigger>
              <TabsTrigger value="organization" className="text-white data-[state=active]:bg-emerald-600">
                By Organization
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="global" className="mt-4">
              <LeaderboardList 
                data={leaderboardData}
                filter="global"
              />
            </TabsContent>
            
            <TabsContent value="country" className="mt-4">
              <LeaderboardList 
                data={leaderboardData.filter(user => user.country)}
                filter="country"
              />
            </TabsContent>
            
            <TabsContent value="organization" className="mt-4">
              <LeaderboardList 
                data={leaderboardData.filter(user => user.organization)}
                filter="organization"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

interface LeaderboardListProps {
  data: any[];
  filter: 'global' | 'country' | 'organization';
}

const LeaderboardList: React.FC<LeaderboardListProps> = ({ data }) => {
  return (
    <div className="space-y-4">
      {data.map((user, index) => (
        <div 
          key={user.id} 
          className="flex items-center p-3 bg-gray-800 rounded-lg"
        >
          <div className="text-xl font-bold mr-3 w-6 text-center">
            {index + 1}
          </div>
          
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={user.avatarUrl} alt={user.username} />
            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="font-medium">{user.username}</div>
            <div className="text-xs text-gray-400">
              Level {user.level} • {user.points} Points
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {user.country && (
              <div className="flex items-center">
                <img 
                  src={`https://flagcdn.com/w20/${user.countryCode.toLowerCase()}.png`} 
                  alt={user.country}
                  className="h-4 mr-1"
                />
              </div>
            )}
            
            {user.organization && (
              <Badge variant="outline" className="text-xs bg-gray-700">
                {user.organization}
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Leaderboard;