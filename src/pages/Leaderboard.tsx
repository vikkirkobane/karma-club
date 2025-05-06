
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { leaderboardData } from "@/data/leaderboard";

const Leaderboard = () => {
  const [filter, setFilter] = useState<'global' | 'country' | 'organization'>('global');

  return (
    <div className="flex flex-col min-h-screen bg-[#121212]">
      {/* Header */}
      <header className="bg-emerald-600 p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <span className="text-white text-xl font-bold">LEADERBOARD</span>
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

interface LeaderboardListProps {
  data: any[];
  filter: 'global' | 'country' | 'organization';
}

const LeaderboardList: React.FC<LeaderboardListProps> = ({ data, filter }) => {
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
