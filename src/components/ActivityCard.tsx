
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, ActivityType } from "@/types/activities";
import { toast } from "@/components/ui/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ActivityCardProps {
  activity: Activity;
  type: ActivityType;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, type }) => {
  const [completed, setCompleted] = useState(activity.isCompleted);
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create a preview URL
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const handleCompleteActivity = () => {
    if (!description) {
      toast({
        title: "Description Required",
        description: "Please share what you did for this activity.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFile) {
      toast({
        title: "Media Required",
        description: "Please upload a photo or video of your activity.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this is where you'd submit the activity to the backend
    setCompleted(true);
    toast({
      title: "Activity Completed!",
      description: `You earned 1 point for completing "${activity.title}"`,
    });

    // Clean up preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
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
            <Badge className={`${getBadgeColor()} text-xs`}>
              {completed ? "Completed" : "1 Point"}
            </Badge>
          </div>
          <p className="text-sm text-gray-300">{activity.description}</p>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              className={`w-full ${completed ? 'bg-gray-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              disabled={completed}
            >
              {completed ? "Completed" : "Complete Activity"}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-gray-900 text-white border-t border-gray-700">
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
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="media">Upload a photo or video</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('media')?.click()}
                    className="bg-gray-800 border-gray-700"
                  >
                    Select File
                  </Button>
                  <input
                    id="media"
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <span className="text-sm text-gray-400">
                    {selectedFile ? selectedFile.name : "No file selected"}
                  </span>
                </div>
                
                {previewUrl && (
                  <div className="mt-2">
                    {selectedFile?.type.startsWith('image/') ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-40 rounded"
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
              
              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4"
                onClick={handleCompleteActivity}
              >
                Submit Activity
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </CardFooter>
    </Card>
  );
};
