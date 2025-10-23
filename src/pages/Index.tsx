import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PageLayout } from "@/components/layout/PageLayout";
import { UserDashboard } from "@/components/UserDashboard";
import KarmaClubLogo from "@/components/KarmaClubLogo";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <PageLayout title="PLANNED ACTS OF KINDNESS">
      <div className="flex flex-col items-center mb-8">
        <KarmaClubLogo className="w-48 h-48 mb-4" />
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-gray-300 text-center mb-6">
          Ready to make a difference today?
        </p>
      </div>

      {/* User Dashboard */}
      <div className="mb-8">
        <UserDashboard />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Button 
          className="bg-emerald-600 hover:bg-emerald-700 h-12"
          onClick={() => navigate("/karma-club-full")}
        >
          Start Daily Activities
        </Button>
        
        <Button 
          className="bg-blue-600 hover:bg-blue-700 h-12"
          onClick={() => navigate("/leaderboard")}
        >
          View Leaderboard
        </Button>
        
        <Button 
          className="bg-purple-600 hover:bg-purple-700 h-12"
          onClick={() => navigate("/levels")}
        >
          Check Level Progress
        </Button>
      </div>

      {/* Featured Section */}
      <Card className="mb-6 bg-[#222] text-white border-none">
        <CardHeader>
          <CardTitle>About Our NGO</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Planned Acts of Kindness is an NGO dedicated to promoting kindness, 
            volunteerism, and community service worldwide. We believe that even 
            small acts of kindness can have a significant impact on both individuals 
            and communities.
          </p>
          <p>
            Our mission is to inspire and encourage people to incorporate kindness 
            into their daily lives, creating a ripple effect that spreads positivity 
            and compassion throughout the world.
          </p>
        </CardContent>
      </Card>

      {/* The Karma Club Preview */}
      <Card className="mb-6 bg-gradient-to-r from-emerald-900 to-blue-900 text-white border-none">
        <CardHeader>
          <CardTitle>The Karma Club</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            The Karma Club is our flagship program where members perform daily 
            acts of kindness, engagement, volunteerism, and support each month.
          </p>
          <p className="mb-2">
            Membership is 100% free, and we've gamified the experience to make giving 
            back more fun and rewarding.
          </p>
          <p>
            "The More You Do, The Greater Your Rewards..."
          </p>
        </CardContent>
      </Card>

      {/* Footer - Only show on desktop */}
      <div className="hidden md:block bg-[#222] text-white py-4 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">© 2025 Planned Acts of Kindness</p>
          <p className="text-sm text-gray-400">
            Making the world a better place through planned acts of kindness
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Index;