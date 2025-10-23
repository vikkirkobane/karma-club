import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { badgeData } from "@/data/badges";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!user) return null;

  const nextLevelPoints = 400; // This would come from level progression logic

  // Calculate progress to next level
  const levelProgress = Math.round((user.points / nextLevelPoints) * 100);
  
  // Get earned badges
  const earnedBadges = badgeData.filter(badge => user.badges.includes(badge.id));
  
  // Get locked badges (badges not yet earned)
  const lockedBadges = badgeData.filter(badge => !user.badges.includes(badge.id));

  return (
    <PageLayout title="MY PROFILE">
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
              <span>{user.points}/{nextLevelPoints} Points</span>
            </div>
            <Progress value={levelProgress} className="h-2 progress-indicator-green" />
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
      
      {/* Admin Dashboard Button - Only visible to admins */}
      {(user.isAdmin || user.role === 'admin') && (
        <Card className="mb-6 bg-gradient-to-r from-purple-900 to-indigo-900 text-white border-none overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-lg">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Admin Access</h3>
                  <p className="text-sm text-gray-200">Manage platform content and users</p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/admin')}
                className="bg-white text-purple-900 hover:bg-gray-100 font-semibold"
              >
                Open Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
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
                <Progress value={(user.stats.dailyCompleted / 100) * 100} className="h-2 progress-indicator-green" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span>Engagement</span>
                  <span>{user.stats.engagementCompleted} Completed</span>
                </div>
                <Progress value={(user.stats.engagementCompleted / 10) * 100} className="h-2 progress-indicator-green" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span>Volunteerism</span>
                  <span>{user.stats.volunteerCompleted} Completed</span>
                </div>
                <Progress value={(user.stats.volunteerCompleted / 20) * 100, 100)} className="h-2 progress-indicator-green" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span>Support</span>
                  <span>{user.stats.supportCompleted} Completed</span>
                </div>
                <Progress value={(user.stats.supportCompleted / 10) * 100, 100)} className="h-2 progress-indicator-green" />
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
    </PageLayout>
  );
};

export default Profile;