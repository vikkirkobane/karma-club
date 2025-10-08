import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MediaUpload } from "@/components/MediaUpload";
import { Activity } from '@/types/activities';
import { Loader2 } from 'lucide-react';

interface ActivitySubmissionFormProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (submission: { activityId: string; title: string; description: string; file?: File }) => void;
  isSubmitting?: boolean;
}

export const ActivitySubmissionForm: React.FC<ActivitySubmissionFormProps> = ({ 
  activity, 
  isOpen, 
  onClose, 
  onSubmit,
  isSubmitting = false 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!activity) return null;

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      console.log('Form validation failed:', { title: title.trim(), description: description.trim() });
      return;
    }

    console.log('Form submission initiated:', {
      activityId: activity.id,
      title: title.trim(),
      description: description.trim(),
      hasFile: !!selectedFile
    });

    onSubmit({ 
      activityId: activity.id, 
      title: title.trim(), 
      description: description.trim(), 
      file: selectedFile || undefined 
    });
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#222] text-white border-gray-700 max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Complete: {activity.title}</DialogTitle>
          <DialogDescription>
            Share details about how you completed this activity to earn karma points.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Submission Title *</Label>
            <Input 
              id="title" 
              placeholder="e.g., Helped my neighbor carry groceries" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-gray-800 border-gray-700"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea 
              id="description" 
              placeholder="Share your experience and the impact you made..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-gray-800 border-gray-700 min-h-[100px]"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <MediaUpload
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              selectedFile={selectedFile}
              previewUrl={previewUrl}
              maxSize={10}
            />
          </div>
        </div>
        <DialogFooter className="flex-shrink-0 p-4 border-t border-gray-700 bg-[#222]">
          <DialogClose asChild>
            <Button 
              type="button" 
              variant="secondary" 
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button 
            type="button" 
            onClick={handleSubmit} 
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={isSubmitting || !title.trim() || !description.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
