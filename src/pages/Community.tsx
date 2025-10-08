import React, { useState, useEffect } from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { CommunityFeed } from "@/components/CommunityFeed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Heart, MessageSquare, Trophy } from "lucide-react";
import { getCommunityStats } from "@/lib/database";

const Community = () => {
  const [stats, setStats] = useState({
    activeMembers: 1247,
    actsShared: 15432,
    totalComments: 3891,
    badgesEarned: 892
  });

  useEffect(() => {
    const fetchStats = async () => {
      const communityStats = await getCommunityStats();
      setStats(communityStats);
    };

    fetchStats();
  }, []);

  return (
    <PageLayout title="COMMUNITY">
      <div className="space-y-6">
        {/* Community Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-emerald-800 to-emerald-900 text-white border-none">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-emerald-300" />
              <div className="text-2xl font-bold">{stats.activeMembers.toLocaleString()}</div>
              <div className="text-xs text-emerald-200">Active Members</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-800 to-blue-900 text-white border-none">
            <CardContent className="p-4 text-center">
              <Heart className="h-8 w-8 mx-auto mb-2 text-blue-300" />
              <div className="text-2xl font-bold">{stats.actsShared.toLocaleString()}</div>
              <div className="text-xs text-blue-200">Acts Shared</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-800 to-purple-900 text-white border-none">
            <CardContent className="p-4 text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-purple-300" />
              <div className="text-2xl font-bold">{stats.totalComments.toLocaleString()}</div>
              <div className="text-xs text-purple-200">Comments</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-800 to-orange-900 text-white border-none">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-orange-300" />
              <div className="text-2xl font-bold">{stats.badgesEarned.toLocaleString()}</div>
              <div className="text-xs text-orange-200">Badges Earned</div>
            </CardContent>
          </Card>
        </div>

        {/* Current Challenge */}
        <Card className="bg-gradient-to-r from-emerald-900 to-blue-900 text-white border-none">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>January Kindness Challenge</span>
              <Badge variant="outline" className="bg-yellow-600 border-yellow-500 text-white">
                Active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Complete 31 acts of kindness in 31 days! Join thousands of members spreading positivity this month.
            </p>
            <div className="flex items-center justify-between text-sm">
              <span>{stats.activeMembers.toLocaleString()} participants</span>
              <span>Rewards: Special Badge + 500 Bonus Points</span>
            </div>
          </CardContent>
        </Card>

        {/* Community Feed */}
        <CommunityFeed />
      </div>
    </PageLayout>
  );
};

export default Community;