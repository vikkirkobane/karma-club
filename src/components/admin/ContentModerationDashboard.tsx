import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, XCircle, Flag, Eye, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface ReportedContent {
  id: string;
  content_type: 'activity' | 'comment' | 'profile';
  content_id: string;
  content_preview: string;
  reporter_id: string;
  reporter_username: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  reviewer_id?: string;
}

interface PendingActivity {
  id: string;
  title: string;
  description: string;
  user_id: string;
  username: string;
  media_url?: string;
  points: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const ContentModerationDashboard: React.FC = () => {
  const { user } = useAuth();
  const [reportedContent, setReportedContent] = useState<ReportedContent[]>([]);
  const [pendingActivities, setPendingActivities] = useState<PendingActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reports');

  // Check if user is admin (in real app, this would be a role check)
  const isAdmin = user?.email?.includes('admin') || user?.username?.toLowerCase().includes('admin');

  useEffect(() => {
    if (isAdmin) {
      loadModerationData();
    }
  }, [isAdmin]);

  const loadModerationData = async () => {
    setLoading(true);
    try {
      // Load reported content (mock data for now)
      const mockReports: ReportedContent[] = [
        {
          id: '1',
          content_type: 'activity',
          content_id: 'act_123',
          content_preview: 'Helped clean up the park today...',
          reporter_id: 'user_456',
          reporter_username: 'ConcernedUser',
          reason: 'Inappropriate content',
          status: 'pending',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          content_type: 'comment',
          content_id: 'comment_789',
          content_preview: 'This is a spam comment...',
          reporter_id: 'user_101',
          reporter_username: 'Moderator1',
          reason: 'Spam',
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ];

      // Load pending activities (mock data for now)
      const mockPendingActivities: PendingActivity[] = [
        {
          id: 'act_pending_1',
          title: 'Community Garden Volunteer',
          description: 'Spent 3 hours volunteering at the local community garden',
          user_id: 'user_789',
          username: 'GreenThumb',
          points: 30,
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ];

      setReportedContent(mockReports);
      setPendingActivities(mockPendingActivities);
    } catch (error) {
      console.error('Error loading moderation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId: string, action: 'approve' | 'reject') => {
    try {
      // In real implementation, this would update the database
      setReportedContent(prev => 
        prev.map(report => 
          report.id === reportId 
            ? { ...report, status: action === 'approve' ? 'approved' : 'rejected', reviewed_at: new Date().toISOString(), reviewer_id: user?.id }
            : report
        )
      );

      console.log(`Report ${reportId} ${action}d by ${user?.username}`);
    } catch (error) {
      console.error(`Error ${action}ing report:`, error);
    }
  };

  const handleActivityAction = async (activityId: string, action: 'approve' | 'reject') => {
    try {
      // In real implementation, this would update the database
      setPendingActivities(prev => 
        prev.map(activity => 
          activity.id === activityId 
            ? { ...activity, status: action === 'approve' ? 'approved' : 'rejected' }
            : activity
        )
      );

      console.log(`Activity ${activityId} ${action}d by ${user?.username}`);
    } catch (error) {
      console.error(`Error ${action}ing activity:`, error);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access the content moderation dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Content Moderation</h1>
        <div className="flex gap-4">
          <Badge variant="destructive" className="flex items-center gap-2">
            <Flag className="w-4 h-4" />
            {reportedContent.filter(r => r.status === 'pending').length} Reports
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            {pendingActivities.filter(a => a.status === 'pending').length} Pending
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Flag className="w-4 h-4" />
            Reported Content
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Pending Activities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="w-5 h-5" />
                Reported Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reportedContent.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No reported content</p>
              ) : (
                <div className="space-y-4">
                  {reportedContent.map((report) => (
                    <div 
                      key={report.id} 
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={
                              report.content_type === 'activity' ? 'default' : 
                              report.content_type === 'comment' ? 'secondary' : 'outline'
                            }>
                              {report.content_type}
                            </Badge>
                            <Badge variant={
                              report.status === 'pending' ? 'destructive' : 
                              report.status === 'approved' ? 'default' : 'secondary'
                            }>
                              {report.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <strong>Reported by:</strong> {report.reporter_username}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <strong>Reason:</strong> {report.reason}
                          </p>
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm">
                            <strong>Content Preview:</strong><br />
                            {report.content_preview}
                          </div>
                        </div>
                      </div>
                      
                      {report.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleReportAction(report.id, 'approve')}
                            className="flex items-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReportAction(report.id, 'reject')}
                            className="flex items-center gap-1"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Pending Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingActivities.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No pending activities</p>
              ) : (
                <div className="space-y-4">
                  {pendingActivities.map((activity) => (
                    <div 
                      key={activity.id} 
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{activity.title}</h3>
                            <Badge variant="secondary">{activity.points} pts</Badge>
                            <Badge variant={
                              activity.status === 'pending' ? 'destructive' : 
                              activity.status === 'approved' ? 'default' : 'secondary'
                            }>
                              {activity.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <strong>User:</strong> {activity.username}
                          </p>
                          <p className="text-sm mb-3">{activity.description}</p>
                          {activity.media_url && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-sm">
                              <strong>Media:</strong> {activity.media_url}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {activity.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleActivityAction(activity.id, 'approve')}
                            className="flex items-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleActivityAction(activity.id, 'reject')}
                            className="flex items-center gap-1"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentModerationDashboard;