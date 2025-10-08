import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, ActivityType } from "@/types/activities";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, Upload, Loader2, MoreVertical } from "lucide-react";
import { storageService, UploadResult } from "@/lib/storage";
import { ReportContent } from "@/components/ReportContent";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ActivityCardProps {
  activity: Activity;
  type: ActivityType;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, type }) => {
  const { user, updateUser } = useAuth();
  const [completed, setCompleted] = useState(activity.isCompleted);
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Different colors based on activity type
  const getBadgeColor = () => {
    switch (type) {
      case ActivityType.DAILY:
        return "bg-blue-500";
      case ActivityType.VOLUNTEER:
        return "bg-purple-500";
      case ActivityType.ENGAGEMENT:
        return "bg-orange-500";
      case ActivityType.SUPPORT:
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      
      // Create a preview URL
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!user) return null;
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Compress image if it's an image file
      let fileToUpload = file;
      if (file.type.startsWith('image/')) {
        fileToUpload = await storageService.compressImage(file);
      }
      
      // Upload to Supabase Storage
      const result: UploadResult = await storageService.uploadActivityMedia(
        fileToUpload, 
        user.id, 
        activity.id.toString()
      );
      
      setUploadProgress(100);
      return result.url;
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload your file. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCompleteActivity = async () => {
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please share what you did for this activity.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to complete activities.",
        variant: "destructive",
      });
      return;
    }

    let mediaUrl = null;
    
    // Upload file if selected
    if (selectedFile) {
      mediaUrl = await uploadFile(selectedFile);
      if (!mediaUrl && selectedFile) {
        // Upload failed but user selected a file, ask if they want to continue without it
        const continueWithoutFile = window.confirm(
          "File upload failed. Would you like to continue without the file?"
        );
        if (!continueWithoutFile) return;
      }
    }

    // Update user stats based on activity type
    const updatedStats = { ...user.stats };
    const pointsEarned = activity.points;
    
    switch (type) {
      case ActivityType.DAILY:
        updatedStats.dailyCompleted += 1;
        break;
      case ActivityType.VOLUNTEER:
        updatedStats.volunteerCompleted += 1;
        break;
      case ActivityType.ENGAGEMENT:
        updatedStats.engagementCompleted += 1;
        break;
      case ActivityType.SUPPORT:
        updatedStats.supportCompleted += 1;
        break;
    }
    
    updatedStats.totalActivities += 1;

    // Update user with new stats and points
    updateUser({
      points: user.points + pointsEarned,
      stats: updatedStats
    });

    // Store activity completion in database (for verification)
    try {
      await storageService.uploadActivityMedia(
        selectedFile || new File([], 'placeholder.txt'),
        user.id,
        activity.id.toString()
      );
    } catch (error) {
      console.error('Failed to record activity completion:', error);
    }

    setCompleted(true);
    toast({
      title: "Activity Completed! 🎉",
      description: `You earned ${pointsEarned} point${pointsEarned > 1 ? 's' : ''} for "${activity.title}"`,
    });

    // Clean up preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    // Reset form
    setDescription("");
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <Card className="overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900 text-white border-none h-full flex flex-col">
      <CardContent className="p-0 flex-1">
        <div 
          className="h-40 bg-gray-700 flex items-center justify-center"
          style={{ 
            backgroundImage: activity.imageUrl ? `url(${activity.imageUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {!activity.imageUrl && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg">{activity.title}</h3>
            <div className="flex items-center gap-2">
              <Badge className={`${getBadgeColor()} text-xs`}>
                {completed ? "Completed" : `${activity.points} Point${activity.points > 1 ? 's' : ''}`}
              </Badge>
              
              {/* Report Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-white">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                  <ReportContent
                    contentType="activity"
                    contentId={activity.id.toString()}
                    contentPreview={`${activity.title}: ${activity.description.substring(0, 100)}...`}
                    trigger={
                      <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-gray-700">
                        Report Activity
                      </DropdownMenuItem>
                    }
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <p className="text-sm text-gray-300">{activity.description}</p>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              className={`w-full ${completed ? 'bg-gray-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              disabled={completed || isUploading}
            >
              {isUploading ? (
                <div className="flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </div>
              ) : completed ? (
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Completed
                </div>
              ) : (
                "Complete Activity"
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-gray-900 text-white border-t border-gray-700 max-h-[90vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-white">{activity.title}</SheetTitle>
            </SheetHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">What did you do?</Label>
                <Textarea 
                  id="description"
                  placeholder="Describe what you did for this activity..."
                  className="bg-gray-800 border-gray-700"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isUploading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="media">Upload a photo or video (optional)</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('media')?.click()}
                    className="bg-gray-800 border-gray-700"
                    disabled={isUploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Select File
                  </Button>
                  <input
                    id="media"
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                  <span className="text-sm text-gray-400">
                    {selectedFile ? selectedFile.name : "No file selected"}
                  </span>
                </div>
                
                {selectedFile && (
                  <div className="mt-2 p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        disabled={isUploading}
                      >
                        Remove
                      </Button>
                    </div>
                    {previewUrl && (
                      <div className="mt-2">
                        {selectedFile.type.startsWith('image/') ? (
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-h-40 rounded object-cover"
                          />
                        ) : (
                          <video
                            src={previewUrl}
                            controls
                            className="max-h-40 rounded"
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {isUploading && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
              
              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4"
                onClick={handleCompleteActivity}
                disabled={isUploading || !description.trim()}
              >
                {isUploading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </div>
                ) : (
                  "Submit Activity"
                )}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </CardFooter>
    </Card>
  );
};