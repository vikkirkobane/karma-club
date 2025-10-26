import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageSquare, Send, Share2, Flag, Upload } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { Input } from './ui/input';
import { MediaUpload } from './MediaUpload';
import { ReportContent } from './ReportContent';
import { CloudinaryService } from '@/lib/cloudinary';
import { getCommunityPosts, createCommunityPost, togglePostLike, getPostComments, createComment } from '@/lib/database';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

interface CommunityPost {
  id: number;
  content: string;
  media_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
  comments?: Comment[];
  user_liked?: boolean;
}

export const CommunityFeed: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openComments, setOpenComments] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reportingPost, setReportingPost] = useState<number | null>(null);
  const [loadingComments, setLoadingComments] = useState<number | null>(null);

  // Define fetchPosts function first

  
  const fetchPostsRef = useRef<() => Promise<void>>();
  useEffect(() => {
    fetchPostsRef.current = fetchPosts;
  });

  useEffect(() => {
    if (fetchPostsRef.current) {
      fetchPostsRef.current();
    }
  }, []);

  // Load comments when opening comment section
  const handleToggleComments = async (postId: number) => {
    if (openComments === postId) {
      setOpenComments(null);
      return;
    }

    setOpenComments(postId);
    
    // Check if comments are already loaded
    const post = posts.find(p => p.id === postId);
    if (post && (!post.comments || post.comments.length === 0) && post.comments_count > 0) {
      setLoadingComments(postId);
      try {
        const comments = await getPostComments(postId);
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, comments: comments }
            : p
        ));
      } catch (error) {
        console.error('Error loading comments:', error);
      } finally {
        setLoadingComments(null);
      }
    }
  };

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const postsData = await getCommunityPosts(20, user?.id);
      
      if (postsData && postsData.length > 0) {
        // Don't load comments immediately - just load the posts, comments will be loaded on demand when user opens comments section
        setPosts(postsData);
      } else {
        // Fallback to mock data if no posts or database error
        const mockPosts: CommunityPost[] = [
          {
            id: 1,
            content: "Just helped an elderly neighbor with groceries today! 🛒 Small acts make a big difference. The smile on her face was worth everything! #KindnessMatters",
            media_url: undefined,
            likes_count: 15,
            comments_count: 3,
            created_at: new Date().toISOString(),
            profiles: {
              username: "KindnessWarrior",
              avatar_url: "/placeholder.svg"
            },
            user_liked: false,
            comments: [
              {
                id: "1",
                content: "This is so heartwarming! Thank you for being such a caring neighbor! 💝",
                created_at: new Date(Date.now() - 1800000).toISOString(),
                profiles: {
                  username: "CompassionateHeart",
                  avatar_url: "/placeholder.svg"
                }
              },
              {
                id: "2", 
                content: "Small acts like this really do make the world a better place. Inspiring! 🌟",
                created_at: new Date(Date.now() - 900000).toISOString(),
                profiles: {
                  username: "PositiveVibes",
                  avatar_url: "/placeholder.svg"
                }
              }
            ]
          },
          {
            id: 2,
            content: "Volunteered at the local food bank for 3 hours today! 🥫 Amazing to see the community come together to help those in need. Every can counts!",
            media_url: undefined,
            likes_count: 23,
            comments_count: 5,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            profiles: {
              username: "HelpingHand",
              avatar_url: "/placeholder.svg"
            },
            user_liked: false,
          },
          {
            id: 3,
            content: "Planted 5 trees in the local park with my kids today! 🌳 Teaching them early about caring for our environment. They loved getting their hands dirty!",
            media_url: undefined,
            likes_count: 31,
            comments_count: 8,
            created_at: new Date(Date.now() - 7200000).toISOString(),
            profiles: {
              username: "EcoFamily",
              avatar_url: "/placeholder.svg"
            },
            user_liked: false,
          }
        ];
        setPosts(mockPosts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Use mock data as fallback
      const mockPosts: CommunityPost[] = [
        {
          id: 1,
          content: "Just helped an elderly neighbor with groceries today! 🛒 Small acts make a big difference. The smile on her face was worth everything! #KindnessMatters",
          media_url: undefined,
          likes_count: 15,
          comments_count: 3,
          created_at: new Date().toISOString(),
          profiles: {
            username: "KindnessWarrior",
            avatar_url: "/placeholder.svg"
          },
          user_liked: false,
        }
      ];
      setPosts(mockPosts);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const handlePostSubmit = async () => {
    if (!newPost.trim() || !user) return;

    setIsSubmitting(true);
    
    try {
      let mediaUrl = undefined;

      // Upload media if provided
      if (selectedFile) {
        toast({
          title: "Uploading media...",
          description: "Please wait while we upload your photo/video.",
        });

        const uploadResult = await CloudinaryService.uploadMedia(selectedFile);
        mediaUrl = uploadResult.secure_url;
      }

      const success = await createCommunityPost(user.id, newPost, mediaUrl);
      
      if (success) {
        setNewPost('');
        setSelectedFile(null);
        if (fetchPostsRef.current) {
          await fetchPostsRef.current(); // Refresh posts
        }
        toast({ 
          title: 'Post shared! 🎉', 
          description: 'Your act of kindness has been shared with the community.' 
        });
      } else {
        // Fallback to local creation if database fails
        const newPostData: CommunityPost = {
          id: Date.now(),
          content: newPost,
          media_url: mediaUrl,
          likes_count: 0,
          comments_count: 0,
          created_at: new Date().toISOString(),
          profiles: {
            username: user.username,
            avatar_url: user.avatarUrl || user.avatar_url || "/placeholder.svg"
          },
          user_liked: false
        };

        setPosts(prevPosts => [newPostData, ...prevPosts]);
        setNewPost('');
        setSelectedFile(null);
        
        toast({ 
          title: 'Post shared! 🎉', 
          description: 'Your act of kindness has been shared (offline mode).' 
        });
      }
    } catch (error: unknown) {
      toast({ 
        title: 'Error sharing post', 
        description: error.message || 'Failed to share post. Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: number) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to like posts.",
        variant: "destructive"
      });
      return;
    }

    // Find the current post to get its current state
    const currentPost = posts.find(p => p.id === postId);
    if (!currentPost) return;

    const wasLiked = currentPost.user_liked;
    const newLikeCount = wasLiked ? currentPost.likes_count - 1 : currentPost.likes_count + 1;

    try {
      // Optimistic update
      setPosts(posts.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              likes_count: newLikeCount,
              user_liked: !wasLiked
            } 
          : p
      ));

      const success = await togglePostLike(user.id, postId);
      
      if (!success) {
        // Revert optimistic update if failed
        setPosts(posts.map(p => 
          p.id === postId 
            ? { 
                ...p, 
                likes_count: currentPost.likes_count,
                user_liked: wasLiked
              } 
            : p
        ));
        
        toast({ 
          title: 'Error', 
          description: 'Failed to update like. Please try again.', 
          variant: 'destructive' 
        });
      }
    } catch (error: unknown) {
      // Revert optimistic update
      setPosts(posts.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              likes_count: currentPost.likes_count,
              user_liked: wasLiked
            } 
          : p
      ));

      toast({ 
        title: 'Error liking post', 
        description: error.message || 'Failed to like post. Please try again.', 
        variant: 'destructive' 
      });
    }
  };

  const handleCommentSubmit = async (postId: number, content: string) => {
    if (!content.trim() || !user) return;

    try {
      const success = await createComment(user.id, postId, content);
      
      if (success) {
        // Refresh posts to get updated comment count
        if (fetchPostsRef.current) {
          await fetchPostsRef.current();
        }
        toast({ title: 'Comment posted! 💬', description: 'Your comment has been added.' });
      } else {
        // Fallback to local update
        const newComment: Comment = {
          id: `comment-${Date.now()}`,
          content: content,
          created_at: new Date().toISOString(),
          profiles: {
            username: user.username,
            avatar_url: user.avatarUrl || user.avatar_url || "/placeholder.svg"
          }
        };

        setPosts(posts.map(p => 
          p.id === postId 
            ? { 
                ...p, 
                comments: [...(p.comments || []), newComment],
                comments_count: p.comments_count + 1
              } 
            : p
        ));
        
        toast({ title: 'Comment posted! 💬', description: 'Your comment has been added (offline mode).' });
      }
    } catch (error: unknown) {
      toast({ 
        title: 'Error posting comment', 
        description: error.message || 'Failed to post comment. Please try again.', 
        variant: 'destructive' 
      });
    }
  };

  const handleShare = async (post: CommunityPost) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Karma Club - Act of Kindness',
          text: post.content,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(`${post.content}\n\nShared from Karma Club`);
        toast({
          title: "Copied to clipboard! 📋",
          description: "Post content copied to clipboard for sharing.",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-gray-400 mt-2">Loading community posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Create Post Card */}
      <Card className="bg-[#222] text-white border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-emerald-400" />
            Share an Act of Kindness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="What good deed did you do today? Share your story to inspire others... 🌟"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="bg-gray-800 border-gray-700 min-h-[100px]"
              maxLength={500}
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MediaUpload
                  onFileSelect={setSelectedFile}
                  acceptVideo={true}
                >
                  <Button variant="ghost" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Add Photo/Video
                  </Button>
                </MediaUpload>
                
                {selectedFile && (
                  <span className="text-sm text-gray-400">
                    {selectedFile.name}
                  </span>
                )}
              </div>
              
              <div className="text-sm text-gray-400">
                {newPost.length}/500
              </div>
            </div>
            
            <Button 
              onClick={handlePostSubmit} 
              disabled={isSubmitting || !newPost.trim()} 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? 'Sharing...' : 'Share Your Kindness'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card className="bg-[#222] text-white border-none">
            <CardContent className="text-center py-8">
              <Heart className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-gray-400">Be the first to share an act of kindness!</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="bg-[#222] text-white border-none hover:bg-[#242424] transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={post.profiles.avatar_url} />
                      <AvatarFallback className="bg-emerald-600">
                        {post.profiles.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{post.profiles.username}</p>
                      <p className="text-sm text-gray-400">{formatDate(post.created_at)}</p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReportingPost(post.id)}
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
                
                {post.media_url && (
                  <div className="mt-4 rounded-lg overflow-hidden">
                    {post.media_url.includes('video') ? (
                      <video
                        src={post.media_url}
                        controls
                        className="w-full max-h-64 object-cover"
                      />
                    ) : (
                      <img
                        src={post.media_url}
                        alt="Post media"
                        className="w-full max-h-64 object-cover"
                      />
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center space-x-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleLike(post.id)}
                      className={post.user_liked ? "text-red-500" : ""}
                    >
                      <Heart className={`h-5 w-5 mr-2 ${post.user_liked ? 'fill-current' : ''}`} />
                      {post.likes_count}
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleToggleComments(post.id)}
                    >
                      <MessageSquare className="h-5 w-5 mr-2" />
                      {post.comments_count}
                    </Button>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(post)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
                
                {openComments === post.id && (
                  <CommentSection
                    postId={post.id}
                    comments={post.comments || []}
                    onSubmit={(content) => handleCommentSubmit(post.id, content)}
                    isLoading={loadingComments === post.id}
                  />
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Report Content Modal */}
      {reportingPost && (
        <ReportContent
          contentId={reportingPost}
          contentType="post"
          onClose={() => setReportingPost(null)}
        />
      )}
    </div>
  );
};

const CommentSection: React.FC<{ 
  postId: number;
  comments: Comment[]; 
  onSubmit: (content: string) => void; 
  isLoading?: boolean;
}> = ({ postId, comments, onSubmit, isLoading = false }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim() && !isSubmitting) {
      setIsSubmitting(true);
      onSubmit(comment);
      setComment('');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-700">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2 mb-4">
        <Input
          type="text"
          placeholder="Add a thoughtful comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="bg-gray-800 border-gray-700"
          maxLength={200}
        />
        <Button 
          type="submit" 
          size="sm" 
          className="bg-emerald-600 hover:bg-emerald-700"
          disabled={!comment.trim() || isSubmitting}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="text-gray-400 text-sm mt-2">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-2">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map(c => (
            <div key={c.id} className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={c.profiles.avatar_url} />
                <AvatarFallback className="bg-blue-600 text-xs">
                  {c.profiles.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="bg-gray-800 rounded-lg p-3 text-sm flex-1">
                <p className="font-semibold text-emerald-400 mb-1">{c.profiles.username}</p>
                <p className="text-gray-200">{c.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(c.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};