
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { badgeData } from "@/data/badges";

const Profile = () => {
  // Mock user data
  const user = {
    id: "user1",
    username: "KindnessWarrior",
    avatarUrl: "/placeholder.svg",
    level: 12,
    points: 345,
    nextLevelPoints: 400,
    tier: "Gold",
    country: "United States",
    countryCode: "US",
    organization: "Red Cross",
    joinDate: "Jan 15, 2023",
    badges: [
      "daily-streak-30", 
      "volunteer-pro", 
      "engagement-master", 
      "gold-tier", 
      "activity-100"
    ],
    stats: {
      totalActivities: 127,
      dailyStreak: 32,
      dailyCompleted: 94,
      volunteerCompleted: 17,
      engagementCompleted: 8,
      supportCompleted: 8
    }
  };

  // Calculate progress to next level
  const levelProgress = Math.round((user.points / user.nextLevelPoints) * 100);
  
  // Get earned badges
  const earnedBadges = badgeData.filter(badge => user.badges.includes(badge.id));
  
  // Get locked badges (badges not yet earned)
  const lockedBadges = badgeData.filter(badge => !user.badges.includes(badge.id));

  return (
    <div className="flex flex-col min-h-screen bg-[#121212]">
      {/* Header */}
      <header className="bg-emerald-600 p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <span className="text-white text-xl font-bold">MY PROFILE</span>
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
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
            />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {/* User Info Card */}
        <Card className="mb-6 bg-[#222] text-white border-none overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-800 to-blue-800 p-6">
            <div className="flex items-center">
              <Avatar className="h-20 w-20 border-2 border-white mr-4">
                <AvatarImage src={user.avatarUrl} alt={user.username} />
                <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <div>
                <h2 className="text-2xl font-bold">{user.username}</h2>
                <div className="flex items-center mt-1">
                  {user.country && (
                    <div className="flex items-center mr-2">
                      <img 
                        src={`https://flagcdn.com/w20/${user.countryCode.toLowerCase()}.png`} 
                        alt={user.country}
                        className="h-4 mr-1"
                      />
                      <span className="text-sm">{user.country}</span>
                    </div>
                  )}
                  
                  {user.organization && (
                    <Badge variant="outline" className="text-xs bg-blue-900 border-blue-700">
                      {user.organization}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1">
                <span>Level {user.level} • {user.tier} Tier</span>
                <span>{user.points}/{user.nextLevelPoints} Points</span>
              </div>
              <Progress value={levelProgress} className="h-2" />
            </div>
          </div>
          
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold">{user.stats.totalActivities}</div>
                <div className="text-xs text-gray-400">Activities Completed</div>
              </div>
              
              <div className="bg-gray-800 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold">{user.stats.dailyStreak}</div>
                <div className="text-xs text-gray-400">Day Streak</div>
              </div>
              
              <div className="bg-gray-800 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold">{earnedBadges.length}</div>
                <div className="text-xs text-gray-400">Badges Earned</div>
              </div>
              
              <div className="bg-gray-800 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold">{user.joinDate}</div>
                <div className="text-xs text-gray-400">Member Since</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Activity Stats & Badges */}
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid grid-cols-2 bg-[#333] w-full">
            <TabsTrigger value="stats" className="text-white data-[state=active]:bg-emerald-600">
              Activity Stats
            </TabsTrigger>
            <TabsTrigger value="badges" className="text-white data-[state=active]:bg-emerald-600">
              Badges
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="stats" className="mt-4">
            <Card className="bg-[#222] text-white border-none">
              <CardHeader>
                <CardTitle>My Activity Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Daily Acts</span>
                    <span>{user.stats.dailyCompleted} Completed</span>
                  </div>
                  <Progress value={(user.stats.dailyCompleted / 100) * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Volunteerism</span>
                    <span>{user.stats.volunteerCompleted} Completed</span>
                  </div>
                  <Progress value={(user.stats.volunteerCompleted / 20) * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Engagement</span>
                    <span>{user.stats.engagementCompleted} Completed</span>
                  </div>
                  <Progress value={(user.stats.engagementCompleted / 10) * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Support</span>
                    <span>{user.stats.supportCompleted} Completed</span>
                  </div>
                  <Progress value={(user.stats.supportCompleted / 10) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="badges" className="mt-4">
            <Card className="bg-[#222] text-white border-none">
              <CardHeader className="pb-2">
                <CardTitle>My Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-semibold mb-2">Earned Badges ({earnedBadges.length})</h3>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {earnedBadges.map(badge => (
                    <div key={badge.id} className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-emerald-800 flex items-center justify-center mb-1">
                        <img 
                          src={badge.imageUrl || "/placeholder.svg"} 
                          alt={badge.name} 
                          className="w-12 h-12 rounded-full"
                        />
                      </div>
                      <span className="text-xs text-center line-clamp-2">
                        {badge.name}
                      </span>
                    </div>
                  ))}
                </div>
                
                <h3 className="text-lg font-semibold mb-2">Locked Badges ({lockedBadges.length})</h3>
                <div className="grid grid-cols-3 gap-4 opacity-60">
                  {lockedBadges.slice(0, 6).map(badge => (
                    <div key={badge.id} className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-1">
                        <img 
                          src={badge.imageUrl || "/placeholder.svg"} 
                          alt={badge.name} 
                          className="w-12 h-12 rounded-full grayscale"
                        />
                      </div>
                      <span className="text-xs text-center line-clamp-2">
                        {badge.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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

export default Profile;
