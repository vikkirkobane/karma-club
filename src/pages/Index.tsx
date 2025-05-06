
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import KarmaClubLogo from "@/components/KarmaClubLogo";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-[#121212]">
      {/* Header */}
      <header className="bg-emerald-600 p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <span className="text-white text-xl font-bold">PLANNED ACTS OF KINDNESS</span>
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
        <div className="flex flex-col items-center mb-8">
          <KarmaClubLogo className="w-40 h-40 mb-4" />
          <h1 className="text-3xl font-bold text-white text-center mb-2">
            Planned Acts of Kindness
          </h1>
          <p className="text-gray-300 text-center mb-6">
            Creating a kinder world, one act at a time
          </p>
          
          <Button 
            className="w-full max-w-md bg-emerald-600 hover:bg-emerald-700 mb-3"
            onClick={() => navigate("/karma-club")}
          >
            Enter The Karma Club
          </Button>
          
          <Button 
            className="w-full max-w-md bg-blue-600 hover:bg-blue-700 mb-3"
            onClick={() => navigate("/leaderboard")}
          >
            View Leaderboard
          </Button>
          
          <Button 
            className="w-full max-w-md bg-purple-600 hover:bg-purple-700"
            onClick={() => navigate("/profile")}
          >
            My Profile
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
              The Karma Club is our flagship program where members perform planned 
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
      </main>

      {/* Footer */}
      <footer className="bg-[#222] text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">© 2025 Planned Acts of Kindness</p>
          <p className="text-sm text-gray-400">
            Making the world a better place through planned acts of kindness
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
