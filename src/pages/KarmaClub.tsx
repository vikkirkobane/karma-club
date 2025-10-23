import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Users, Hand, Sparkles, Trophy, Clock, CheckCircle, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserStats } from "@/contexts/UserStatsContext";
import { ActivitySubmissionForm } from "@/components/ActivitySubmissionForm";
import { CloudinaryService } from "@/lib/cloudinary";
import { submitActivity, updateUserPoints, getUserCompletedActivities, checkActivityCompletion } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import {
  dailyActivities,
  volunteerActivities,
  engagementActivities,
  supportActivities
} from "@/data/activities";
import { Progress } from "@/components/ui/progress"; // Import Progress component

interface CompletedActivity {
  string_activity_id: string;
  completed_at: string;
  description?: string;
  activities?: {
    points: number;
  };
}

const KarmaClub = () => {
  const { user } = useAuth();
  const { stats, refreshStats, updateStats } = useUserStats();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isSubmissionFormOpen, setIsSubmissionFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedActivities, setCompletedActivities] = useState<CompletedActivity[]>([]);
  const [completedActivityIds, setCompletedActivityIds] = useState<Set<string>>(new Set());
  const [isLoadingCompleted, setIsLoadingCompleted] = useState(false);

  // Load completed activities when user changes
  useEffect(() => {
    const loadCompletedActivities = async () => {
      if (!user) {
        setCompletedActivities([]);
        setCompletedActivityIds(new Set());
        return;
      }

      setIsLoadingCompleted(true);
      try {
        const completed = await getUserCompletedActivities(user.id);
        setCompletedActivities(completed);
        
        // Create a set of completed activity IDs for quick lookup
        const completedIds = new Set<string>();
        completed.forEach(activity => {
          // Use the string_activity_id mapping we created in the API
          if (activity.string_activity_id) {
            completedIds.add(activity.string_activity_id);
          }
        });
        setCompletedActivityIds(completedIds);
      } catch (error) {
        console.error('Error loading completed activities:', error);
        toast({
          title: "Error",
          description: "Failed to load completed activities.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingCompleted(false);
      }
    };

    loadCompletedActivities();
  }, [user]);

  // The 4 main activity categories - SYSTEMATIC ORDER: PAKs, Engagement, Volunteerism, Support
  const categories = [
    { 
      id: "daily", 
      name: "PAKs", 
      description: "Planned Acts of Kindness", 
      icon: Sparkles,
      color: "emerald",
      activities: dailyActivities
    },
    { 
      id: "engagement", 
      name: "Engagement", 
      description: "Community engagement", 
      icon: Users,
      color: "purple",
      activities: engagementActivities
    },
    { 
      id: "volunteer", 
      name: "Volunteerism", 
      description: "Volunteer opportunities", 
      icon: Hand,
      color: "blue",
      activities: volunteerActivities
    },
    { 
      id: "support", 
      name: "Support", 
      description: "Support activities", 
      icon: Heart,
      color: "orange",
      activities: supportActivities
    }
  ];

  // Combine all activities with category info and completion status
  const allActivitiesWithCategory = categories.flatMap(cat => 
    cat.activities.map(activity => ({
      ...activity,
      categoryId: cat.id,
      categoryName: cat.name,
      categoryIcon: cat.icon,
      categoryColor: cat.color,
      isCompleted: completedActivityIds.has(activity.id)
    }))
  );

  const filteredActivities = selectedCategory === "all" 
    ? allActivitiesWithCategory 
    : selectedCategory === "completed"
    ? allActivitiesWithCategory.filter(activity => activity.isCompleted)
    : allActivitiesWithCategory.filter(activity => activity.categoryId === selectedCategory);

  const handleCompleteActivity = (activityId: string) => {
    const activity = allActivitiesWithCategory.find(a => a.id === activityId);
    if (activity && user) {
      setSelectedActivity(activity);
      setIsSubmissionFormOpen(true);
    }
  };

  const handleSubmissionFormClose = () => {
    setIsSubmissionFormOpen(false);
    setSelectedActivity(null);
  };

  const handleActivitySubmission = async (submission: { 
    activityId: string; 
    title: string; 
    description: string; 
    file?: File 
  }) => {
    if (!user) {
      console.log('No user found, aborting submission');
      return;
    }

    console.log('Starting activity submission:', submission);
    setIsSubmitting(true);
    
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.error('Submission timeout reached');
      setIsSubmitting(false);
      toast({
        title: "Submission Timeout",
        description: "The submission took too long. Please try again.",
        variant: "destructive",
      });
    }, 30000); // 30 second timeout
    
    try {
      let mediaUrl = undefined;

      // Upload file to Cloudinary if provided
      if (submission.file) {
        console.log('Uploading file to Cloudinary...');
        toast({
          title: "Uploading media...",
          description: "Please wait while we upload your photo/video.",
        });

        const uploadResult = await CloudinaryService.uploadMedia(submission.file);
        mediaUrl = uploadResult.secure_url;
        console.log('File uploaded successfully:', mediaUrl);
      }

      // Submit activity to Supabase
      console.log('Submitting activity to database...');
      await submitActivity(user.id, {
        activityId: submission.activityId,
        title: submission.title,
        description: submission.description,
        mediaUrl
      });
      console.log('Activity submitted to database successfully');

      // Find the activity to get points
      const activity = allActivitiesWithCategory.find(a => a.id === submission.activityId);
      if (activity) {
        console.log('Updating user points...');
        // Update user points
        await updateUserPoints(user.id, activity.points);
        console.log('User points updated successfully');

        // Update local stats immediately for better UX
        updateStats({
          points: stats.points + activity.points,
          totalActivities: stats.totalActivities + 1,
        });

        // Refresh from database to get accurate data
        setTimeout(() => refreshStats(), 1000);

        toast({
          title: "Activity Completed! 🎉",
          description: `You earned ${activity.points} points for completing "${activity.title}"`,
        });

        // Mark activity as completed locally
        setCompletedActivityIds(prev => new Set([...prev, activity.id]));

        // Refresh completed activities from database
        setTimeout(async () => {
          refreshStats();
          if (user) {
            try {
              const completed = await getUserCompletedActivities(user.id);
              setCompletedActivities(completed);
            } catch (error) {
              console.error('Error refreshing completed activities:', error);
            }
          }
        }, 1000);
      } else {
        console.error('Activity not found:', submission.activityId);
        throw new Error(`Activity not found: ${submission.activityId}`);
      }

      console.log('Closing submission form...');
      clearTimeout(timeoutId);
      handleSubmissionFormClose();
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Submission error:', error);
      
      // More specific error messages
      let errorMessage = "There was an error submitting your activity. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('Unknown activity ID')) {
          errorMessage = "Invalid activity selected. Please refresh the page and try again.";
        } else if (error.message.includes('duplicate key')) {
          errorMessage = "You have already completed this activity.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      clearTimeout(timeoutId);
      console.log('Setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  const allCategories = [
    { id: "all", name: "All Activities", icon: Trophy },
    { id: "completed", name: "Completed", icon: CheckCircle },
    ...categories
  ];

  return (
    <PageLayout title="KARMA CLUB">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Karma Club Activities</h1>
          <p className="text-gray-300">Make a positive impact and earn karma points</p>
        </div>

        {/* Progress Overview */}
        {user && (
          <Card className="bg-[#222] text-white border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center bg-gray-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-400">{stats.points}</div>
                  <div className="text-sm text-gray-400">Total Points</div>
                </div>
                <div className="text-center bg-gray-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{stats.dailyStreak}</div>
                  <div className="text-sm text-gray-400">Current Streak</div>
                </div>
                <div className="text-center bg-gray-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">Level {stats.level}</div>
                  <div className="text-sm text-gray-400">Current Level</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-6 bg-gray-800">
            {allCategories.map((category) => {
              const Icon = category.icon;
              return (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id} 
                  className="flex items-center gap-2 text-white data-[state=active]:bg-emerald-600"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{category.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            {/* Show completion summary for completed activities tab */}
            {selectedCategory === "completed" && (
              <Card className="bg-[#222] text-white border-none mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                    Completed Activities Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center bg-gray-800 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-400">
                        {completedActivities.length}
                      </div>
                      <div className="text-sm text-gray-400">Total Completed</div>
                    </div>
                    <div className="text-center bg-gray-800 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">
                        {completedActivities.reduce((sum, activity) => sum + (activity.activities?.points || 0), 0)}
                      </div>
                      <div className="text-sm text-gray-400">Points Earned</div>
                    </div>
                    <div className="text-center bg-gray-800 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-400">
                        {completedActivities.filter(a => {
                          const today = new Date().toDateString();
                          const completedDate = new Date(a.completed_at).toDateString();
                          return today === completedDate;
                        }).length}
                      </div>
                      <div className="text-sm text-gray-400">Today</div>
                    </div>
                    <div className="text-center bg-gray-800 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-orange-400">
                        {Math.round((completedActivities.length / allActivitiesWithCategory.length) * 100)}%
                      </div>
                      <div className="text-sm text-gray-400">Progress</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActivities.map((activity) => {
                const Icon = activity.categoryIcon;
                const colorMap = {
                  emerald: { gradient: 'from-emerald-100 to-emerald-200', badge: 'bg-emerald-100 text-emerald-800' },
                  blue: { gradient: 'from-blue-100 to-blue-200', badge: 'bg-blue-100 text-blue-800' },
                  purple: { gradient: 'from-purple-100 to-purple-200', badge: 'bg-purple-100 text-purple-800' },
                  orange: { gradient: 'from-orange-100 to-orange-200', badge: 'bg-orange-100 text-orange-800' },
                };
                const colors = colorMap[activity.categoryColor as keyof typeof colorMap] || colorMap.emerald;
                
                // Find completion details if this is the completed tab
                const completionDetails = selectedCategory === "completed" 
                  ? completedActivities.find(c => c.string_activity_id === activity.id)
                  : null;
                
                return (
                  <Card key={activity.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-[#222] text-white border-none">
                    <div className={`aspect-video bg-gradient-to-br ${colors.gradient} flex items-center justify-center relative`}>
                      <Icon className="h-16 w-16 text-gray-700" />
                      {activity.isCompleted && (
                        <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-1">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{activity.title}</CardTitle>
                        <Badge variant="secondary" className="ml-2 bg-emerald-600">
                          {activity.points} pts
                        </Badge>
                      </div>
                      <CardContent className="px-0">
                        <p className="text-sm text-gray-300 line-clamp-2">
                          {activity.description}
                        </p>
                        {completionDetails && (
                          <div className="mt-2 p-2 bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-1 text-xs text-emerald-400">
                              <Calendar className="h-3 w-3" />
                              Completed: {new Date(completionDetails.completed_at).toLocaleDateString()}
                            </div>
                            {completionDetails.description && (
                              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                {completionDetails.description}
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <Badge className={colors.badge}>
                            {activity.categoryName}
                          </Badge>
                          {activity.isCompleted ? (
                            <div className="flex items-center gap-1 text-emerald-400">
                              <CheckCircle className="h-4 w-4" />
                              Completed
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-gray-400">
                              <Clock className="h-4 w-4" />
                              Available
                            </div>
                          )}
                        </div>

                        <Button 
                          onClick={() => handleCompleteActivity(activity.id)}
                          className={`w-full ${activity.isCompleted ? 'bg-gray-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                          disabled={!user || activity.isCompleted}
                        >
                          {!user ? 'Login to Join' : activity.isCompleted ? 'Completed' : 'Complete Activity'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Loading state for completed activities */}
        {selectedCategory === "completed" && isLoadingCompleted && (
          <Card className="bg-[#222] text-white border-none">
            <CardContent className="text-center py-8">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
                <p className="text-gray-400">Loading completed activities...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!isLoadingCompleted && filteredActivities.length === 0 && (
          <Card className="bg-[#222] text-white border-none">
            <CardContent className="text-center py-8">
              {selectedCategory === "completed" ? (
                <div>
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No completed activities yet.</p>
                  <p className="text-gray-500 text-sm mt-2">Start completing activities to see them here!</p>
                </div>
              ) : (
                <p className="text-gray-400">No activities found in this category.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Activity Submission Form */}
      <ActivitySubmissionForm
        activity={selectedActivity}
        isOpen={isSubmissionFormOpen}
        onClose={handleSubmissionFormClose}
        onSubmit={handleActivitySubmission}
        isSubmitting={isSubmitting}
      />
    </PageLayout>
  );
};

export default KarmaClub;