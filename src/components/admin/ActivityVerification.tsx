import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  AlertCircle,
  Search,
  Filter,
  Download,
  UserCheck,
  Image,
  Video,
  FileText
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { 
  getActivitySubmissions, 
  updateSubmissionStatus, 
  getSubmissionStats,
  updateUserPoints 
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface ActivitySubmission {
  id: string;
  user_id: string;
  activity_id: number;
  description: string;
  media_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  completed_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  review_notes?: string;
  // User info from join
  profiles: {
    username: string;
    avatar_url?: string;
    country?: string;
  };
  // Activity info from join
  activities: {
    title: string;
    description: string;
    points: number;
  };
}

export const ActivityVerification = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<ActivitySubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<ActivitySubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<ActivitySubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [reviewNotes, setReviewNotes] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    fetchSubmissions();
    fetchStats();
  }, []);

  // Create a ref to always have access to the latest filterSubmissions function
  const filterSubmissionsRef = useRef<() => void>();

  // Define filterSubmissions function first
  const filterSubmissions = useCallback(() => {
    let filtered = submissions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(submission =>
        submission.profiles?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.activities?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(submission => submission.status === statusFilter);
    }

    setFilteredSubmissions(filtered);
  }, [submissions, searchTerm, statusFilter]);

  // Update the ref whenever filterSubmissions changes
  useEffect(() => {
    filterSubmissionsRef.current = filterSubmissions;
  });

  useEffect(() => {
    if (filterSubmissionsRef.current) {
      filterSubmissionsRef.current();
    }
  }, [submissions, searchTerm, statusFilter]);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const data = await getActivitySubmissions();
      setSubmissions(data || []);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load activity submissions",
        variant: "destructive",
      });
      // Fallback to mock data for development
      setSubmissions([
        {
          id: "1",
          user_id: "user1",
          activity_id: 1,
          description: "I planted a tree in my backyard and took care of it for 2 hours. It was a great experience connecting with nature!",
          media_url: "https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=400",
          status: "pending",
          completed_at: new Date().toISOString(),
          profiles: {
            username: "EcoWarrior",
            avatar_url: "/placeholder.svg",
            country: "United States"
          },
          activities: {
            title: "Plant a Tree",
            description: "Plant a tree in your local area",
            points: 10
          }
        },
        {
          id: "2",
          user_id: "user2", 
          activity_id: 3,
          description: "Volunteered at the local food bank for 3 hours, helping sort donations and serve meals to families in need.",
          status: "approved",
          completed_at: new Date(Date.now() - 86400000).toISOString(),
          reviewed_at: new Date().toISOString(),
          reviewed_by: "admin1",
          profiles: {
            username: "KindnessSeeker",
            avatar_url: "/placeholder.svg",
            country: "Canada"
          },
          activities: {
            title: "Volunteer at Food Bank",
            description: "Help sort and distribute food",
            points: 20
          }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await getSubmissionStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Fallback stats
      setStats({ total: 2, pending: 1, approved: 1, rejected: 0 });
    }
  };

  const handleReview = async (submissionId: string, action: 'approve' | 'reject') => {
    setIsReviewing(true);
    try {
      const submission = submissions.find(s => s.id === submissionId);
      if (!submission) return;

      // Update submission status in database
      await updateSubmissionStatus(
        submissionId, 
        action === 'approve' ? 'approved' : 'rejected',
        reviewNotes,
        user?.id
      );

      // Award points if approved
      if (action === 'approve') {
        await updateUserPoints(submission.user_id, submission.activities.points);
        toast({
          title: "Activity Approved ✅",
          description: `Awarded ${submission.activities.points} points to ${submission.profiles.username}`,
        });
      } else {
        toast({
          title: "Activity Rejected ❌",
          description: "Submission has been rejected",
        });
      }

      // Update local state
      const updatedSubmissions = submissions.map(s => {
        if (s.id === submissionId) {
          return {
            ...s,
            status: action === 'approve' ? 'approved' : 'rejected',
            reviewed_at: new Date().toISOString(),
            reviewed_by: user?.id || 'admin',
            review_notes: reviewNotes
          };
        }
        return s;
      });

      setSubmissions(updatedSubmissions);
      setSelectedSubmission(null);
      setReviewNotes("");
      
      // Refresh stats
      fetchStats();

    } catch (error) {
      console.error('Review error:', error);
      toast({
        title: "Error",
        description: "Failed to update submission status",
        variant: "destructive",
      });
    } finally {
      setIsReviewing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-600 hover:bg-yellow-700"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600 hover:bg-red-700"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMediaType = (url?: string) => {
    if (!url) return null;
    if (url.includes('video') || url.endsWith('.mp4') || url.endsWith('.mov')) {
      return 'video';
    }
    return 'image';
  };

  const renderMedia = (submission: ActivitySubmission) => {
    if (!submission.media_url) return null;
    
    const mediaType = getMediaType(submission.media_url);
    
    if (mediaType === 'video') {
      return (
        <video 
          src={submission.media_url}
          controls
          className="max-h-40 rounded-lg object-cover w-full"
          preload="metadata"
        />
      );
    }
    
    return (
      <img 
        src={submission.media_url} 
        alt="Activity submission"
        className="max-h-40 rounded-lg object-cover w-full"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Submissions</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Eye className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Pending Review</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Rejected</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-[#222] border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search submissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-gray-800 border-gray-700">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <Card className="bg-[#222] border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <UserCheck className="w-5 h-5" />
            Activity Submissions ({filteredSubmissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-800 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No submissions found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => (
                <div key={submission.id} className="border border-gray-700 rounded-lg p-4 bg-gray-800/50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={submission.profiles?.avatar_url} />
                        <AvatarFallback className="bg-emerald-600">
                          {submission.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-white">{submission.profiles?.username || 'Unknown User'}</p>
                        <p className="text-sm text-gray-400">{submission.activities?.title || 'Unknown Activity'}</p>
                        <p className="text-xs text-gray-500">{submission.profiles?.country}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {submission.media_url && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getMediaType(submission.media_url) === 'video' ? (
                            <Video className="w-3 h-3" />
                          ) : (
                            <Image className="w-3 h-3" />
                          )}
                          Media
                        </Badge>
                      )}
                      <Badge className="bg-emerald-600">
                        {submission.activities?.points || 0} pts
                      </Badge>
                      {getStatusBadge(submission.status)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">{submission.description}</p>
                  
                  {submission.media_url && (
                    <div className="mb-3">
                      {renderMedia(submission)}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      Submitted {new Date(submission.completed_at).toLocaleDateString()}
                      {submission.reviewed_at && (
                        <span> • Reviewed {new Date(submission.reviewed_at).toLocaleDateString()}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSubmission(submission)}
                        className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      {selectedSubmission && (
        <Card className="bg-[#222] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Review Submission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedSubmission.profiles?.avatar_url} />
                <AvatarFallback className="bg-emerald-600">
                  {selectedSubmission.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg text-white">{selectedSubmission.profiles?.username || 'Unknown User'}</p>
                <p className="text-sm text-gray-400">{selectedSubmission.activities?.title || 'Unknown Activity'}</p>
                <p className="text-xs text-gray-500">{selectedSubmission.profiles?.country}</p>
              </div>
              <Badge className="ml-auto bg-emerald-600">
                {selectedSubmission.activities?.points || 0} points
              </Badge>
            </div>
            
            <div>
              <Label className="text-white">Description</Label>
              <div className="mt-1 p-3 bg-gray-800 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-300">{selectedSubmission.description}</p>
              </div>
            </div>
            
            {selectedSubmission.media_url && (
              <div>
                <Label className="text-white">Media</Label>
                <div className="mt-1">
                  {renderMedia(selectedSubmission)}
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="review-notes" className="text-white">Review Notes (Optional)</Label>
              <Textarea
                id="review-notes"
                placeholder="Add notes about this submission..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="mt-1 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => handleReview(selectedSubmission.id, 'approve')}
                disabled={isReviewing || selectedSubmission.status !== 'pending'}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isReviewing ? 'Processing...' : 'Approve'}
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleReview(selectedSubmission.id, 'reject')}
                disabled={isReviewing || selectedSubmission.status !== 'pending'}
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                {isReviewing ? 'Processing...' : 'Reject'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedSubmission(null);
                  setReviewNotes("");
                }}
                className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};