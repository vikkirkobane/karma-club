import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { getLeaderboard, LeaderboardEntry } from "@/lib/database";
import { supabase } from "@/lib/supabase";
import { useUserStats } from "@/contexts/UserStatsContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Users, Building2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface LeaderboardUser {
  id: string;
  username: string;
  avatarUrl: string;
  country: string;
  countryCode: string;
  organization?: string;
  points: number;
  level: number;
}

const Leaderboard = () => {
  const { refreshStats } = useUserStats();
  const [filter, setFilter] = useState<'global' | 'country' | 'organization'>('global');
  const [data, setData] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchLeaderboard = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      const leaderboardData = await getLeaderboard(50);
      
      const formattedData = leaderboardData.map((item: LeaderboardEntry) => ({
        id: item.profiles?.id || item.user_id || Math.random().toString(),
        username: item.profiles?.username || 'Unknown User',
        avatarUrl: item.profiles?.avatar_url || '/placeholder.svg',
        country: item.profiles?.country || '',
        countryCode: item.profiles?.country_code || '',
        organization: item.profiles?.organization,
        points: item.points || 0,
        level: item.level || Math.max(1, Math.floor((item.points || 0) / 100) + 1),
      }));

      setData(formattedData);
      setLastRefresh(new Date());
      
      if (showRefreshIndicator) {
        toast({
          title: "Leaderboard Updated",
          description: "Rankings have been refreshed",
        });
      }
    } catch (err) {
      const errorMessage = "Failed to load leaderboard data.";
      setError(errorMessage);
      console.error(err);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Fallback to mock data for development
      const mockData: LeaderboardUser[] = [
        {
          id: '1',
          username: 'KindnessWarrior',
          avatarUrl: '/placeholder.svg',
          country: 'United States',
          countryCode: 'US',
          organization: 'Red Cross',
          points: 1250,
          level: 13
        },
        {
          id: '2',
          username: 'EcoHero',
          avatarUrl: '/placeholder.svg',
          country: 'Canada',
          countryCode: 'CA',
          points: 980,
          level: 10
        },
        {
          id: '3',
          username: 'CommunityBuilder',
          avatarUrl: '/placeholder.svg',
          country: 'United Kingdom',
          countryCode: 'GB',
          organization: 'Local Food Bank',
          points: 875,
          level: 9
        }
      ];
      setData(mockData);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    // Set up real-time subscription for user_stats changes
    const subscription = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_stats'
        },
        (payload) => {
          console.log('Leaderboard change detected:', payload);
          // Refresh leaderboard when stats change
          fetchLeaderboard(true);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_activities'
        },
        (payload) => {
          console.log('New activity completed:', payload);
          // Refresh after activity completion
          setTimeout(() => fetchLeaderboard(true), 2000);
        }
      )
      .subscribe();

    // Also refresh every 30 seconds to catch any missed updates
    const intervalId = setInterval(() => {
      const timeSinceRefresh = Date.now() - lastRefresh.getTime();
      if (timeSinceRefresh > 30000) { // 30 seconds
        fetchLeaderboard(true);
      }
    }, 30000);

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
      clearInterval(intervalId);
    };
  }, [lastRefresh]);

  const handleManualRefresh = async () => {
    await fetchLeaderboard(true);
    // Also refresh user's own stats
    await refreshStats();
  };

  const getFilteredData = () => {
    switch (filter) {
      case 'country':
        return data.filter(u => u.country);
      case 'organization':
        return data.filter(u => u.organization);
      case 'global':
      default:
        return data;
    }
  };

  const filteredData = getFilteredData();

  return (
    <PageLayout title="LEADERBOARD">
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Users</p>
                  <p className="text-3xl font-bold">{data.length}</p>
                </div>
                <Users className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-purple-500 text-white border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Top Score</p>
                  <p className="text-3xl font-bold">{data[0]?.points || 0}</p>
                </div>
                <Trophy className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Organizations</p>
                  <p className="text-3xl font-bold">
                    {new Set(data.filter(u => u.organization).map(u => u.organization)).size}
                  </p>
                </div>
                <Building2 className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Leaderboard Card */}
        <Card className="bg-[#222] text-white border-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                Top Karma Contributors
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="bg-gray-800 border-gray-700 hover:bg-gray-700"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
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
                  <Users className="h-4 w-4 mr-2" />
                  Global
                </TabsTrigger>
                <TabsTrigger value="country" className="text-white data-[state=active]:bg-emerald-600">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  By Country
                </TabsTrigger>
                <TabsTrigger value="organization" className="text-white data-[state=active]:bg-emerald-600">
                  <Building2 className="h-4 w-4 mr-2" />
                  By Organization
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="global" className="mt-4">
                <LeaderboardList 
                  data={filteredData}
                  isLoading={isLoading}
                  error={error}
                />
              </TabsContent>
              
              <TabsContent value="country" className="mt-4">
                <LeaderboardList 
                  data={filteredData}
                  isLoading={isLoading}
                  error={error}
                />
              </TabsContent>
              
              <TabsContent value="organization" className="mt-4">
                <LeaderboardList 
                  data={filteredData}
                  isLoading={isLoading}
                  error={error}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

interface LeaderboardListProps {
  data: LeaderboardUser[];
  isLoading: boolean;
  error: string | null;
}

const LeaderboardList: React.FC<LeaderboardListProps> = ({ data, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center p-4 bg-gray-800 rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full mr-4 bg-gray-700" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32 bg-gray-700" />
              <Skeleton className="h-3 w-24 bg-gray-700" />
            </div>
            <Skeleton className="h-4 w-16 bg-gray-700" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 p-6 bg-red-900/20 rounded-lg border border-red-800">
        <p className="font-semibold mb-2">Unable to load leaderboard</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-400 p-8 bg-gray-800/50 rounded-lg">
        <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="font-semibold mb-1">No users found</p>
        <p className="text-sm">Be the first to earn karma points!</p>
      </div>
    );
  }

  const getMedalEmoji = (index: number) => {
    switch (index) {
      case 0: return "🥇";
      case 1: return "🥈";
      case 2: return "🥉";
      default: return null;
    }
  };

  return (
    <div className="space-y-3">
      {data.map((user, index) => {
        const medal = getMedalEmoji(index);
        const isTopThree = index < 3;
        
        return (
          <div 
            key={user.id} 
            className={`flex items-center p-4 rounded-lg transition-all hover:scale-[1.02] ${
              isTopThree 
                ? 'bg-gradient-to-r from-yellow-900/30 to-gray-800 border border-yellow-700/50' 
                : 'bg-gray-800 hover:bg-gray-750'
            }`}
          >
            <div className="text-xl font-bold mr-4 w-8 text-center">
              {medal || `${index + 1}`}
            </div>
            
            <Avatar className="h-12 w-12 mr-4 border-2 border-gray-700">
              <AvatarImage src={user.avatarUrl} alt={user.username} />
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-blue-500 text-white">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="font-semibold text-lg">{user.username}</div>
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <span>Level {user.level}</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">{user.points.toLocaleString()} pts</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {user.countryCode && (
                <div className="flex items-center">
                  <img 
                    src={`https://flagcdn.com/w20/${user.countryCode.toLowerCase()}.png`} 
                    alt={user.country}
                    className="h-5 rounded shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              {user.organization && (
                <Badge variant="outline" className="text-xs bg-blue-900/30 border-blue-700 text-blue-300">
                  {user.organization}
                </Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Leaderboard;