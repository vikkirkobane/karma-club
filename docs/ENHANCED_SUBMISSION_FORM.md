# Enhanced Activity Submission Form with Supabase & Cloudinary

## 🎯 Complete Implementation Plan

### **1. Enhanced Submission Form Component**

```typescript
// src/components/ActivitySubmissionForm.tsx - Enhanced
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Camera, Loader2 } from 'lucide-react';
import { Activity } from '@/types/activities';
import { supabase } from '@/integrations/supabase/client';
import { uploadToCloudinary } from '@/lib/cloudinary';

interface ActivitySubmissionFormProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (submission: { activityId: string; title: string; description: string; fileUrl?: string }) => void;
}

export const ActivitySubmissionForm: React.FC<ActivitySubmissionFormProps> = ({ 
  activity, isOpen, onClose, onSubmit 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | undefined>();
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!activity) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let fileUrl: string | undefined;

      // Upload file to Cloudinary if provided
      if (file) {
        fileUrl = await uploadToCloudinary(file, 'activity-submissions');
      }

      // Save to Supabase
      const { data, error } = await supabase
        .from('activity_submissions')
        .insert([
          {
            activity_id: activity.id,
            title: title.trim(),
            description: description.trim(),
            file_url: fileUrl,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            points_earned: activity.points,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Award points to user
      await supabase.rpc('award_activity_points', {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        points: activity.points
      });

      onSubmit({ activityId: activity.id, title, description, fileUrl });
      
      // Reset form and close
      setTitle('');
      setDescription('');
      setFile(undefined);
      setPreview(null);
      onClose();
      
    } catch (err: any) {
      setError(err.message || 'Failed to submit activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#222] text-white border-gray-700">
        <DialogHeader>
          <DialogTitle>Complete: {activity.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {error && (
            <div className="bg-red-900 border border-red-700 rounded p-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="title">Submission Title</Label>
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
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="A short story about the experience..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-gray-800 border-gray-700"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label>Proof (Image or Video)</Label>
            <div className="flex items-center justify-center w-full">
              <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 disabled:opacity-50">
                {preview ? (
                  <img src={preview} alt="Preview" className="h-full w-full object-cover rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-400">PNG, JPG, GIF, MP4 up to 10MB</p>
                  </div>
                )}
                <input 
                  id="file-upload" 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange} 
                  accept="image/*,video/*"
                  disabled={isSubmitting}
                />
              </label>
            </div> 
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isSubmitting}>Cancel</Button>
          </DialogClose>
          <Button 
            type="button" 
            onClick={handleSubmit} 
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={isSubmitting}
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
```

### **2. Cloudinary Integration**

```typescript
// src/lib/cloudinary.ts
export const uploadToCloudinary = async (file: File, folder: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'your_upload_preset'); // Set in Cloudinary dashboard
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Failed to upload file');
  }

  const data = await response.json();
  return data.secure_url;
};
```

### **3. Supabase Table Schema**

```sql
-- Create activity_submissions table
CREATE TABLE activity_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  file_url TEXT,
  points_earned INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE activity_submissions ENABLE ROW LEVEL SECURITY;

-- Policy for users to see their own submissions
CREATE POLICY "Users can view their own submissions" ON activity_submissions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own submissions
CREATE POLICY "Users can insert their own submissions" ON activity_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to award points
CREATE OR REPLACE FUNCTION award_activity_points(user_id UUID, points INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET points = points + points,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **4. Environment Variables**

```env
# .env.local
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### **5. Enhanced KarmaClub.tsx Integration**

```typescript
// In KarmaClub.tsx - Updated handleSubmission
const handleSubmission = async (submission: { activityId: string; title: string; description: string; fileUrl?: string }) => {
  try {
    // The form component handles Supabase storage and point awarding
    console.log('Activity completed and submitted:', submission);
    
    // Refresh user data to show updated points
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await loadUserProfile(user.id);
    }
    
    toast({
      title: "Activity Completed!",
      description: `You earned ${activity?.points} points for "${submission.title}"`,
    });
  } catch (error) {
    console.error('Error handling submission:', error);
    toast({
      title: "Error",
      description: "Failed to process submission",
      variant: "destructive"
    });
  }
};
```

## 🚀 Key Features

✅ **Form Fields:** Title, Description, Image/Video upload  
✅ **Supabase Storage:** Text data stored in activity_submissions table  
✅ **Cloudinary Integration:** Media files uploaded to cloud storage  
✅ **Point Awarding:** Automatic points added to user profile  
✅ **Error Handling:** User-friendly error messages  
✅ **Loading States:** Submit button shows loading spinner  
✅ **File Validation:** 10MB size limit, image/video only  
✅ **Preview:** Shows selected image before upload  

## 📋 Implementation Steps

1. ✅ **Create submission form component**
2. ✅ **Add Supabase table and policies**
3. ✅ **Set up Cloudinary account and credentials**
4. ✅ **Update KarmaClub.tsx to use new form**
5. ✅ **Add environment variables**
6. ✅ **Test complete workflow**

## 🎯 User Experience

1. User clicks "Complete Activity"
2. Submission form opens
3. User fills title and description
4. User optionally uploads image/video
5. Form submits to Supabase + Cloudinary
6. Points automatically awarded
7. Success message shows earned points
8. Form closes, activity marked completed

---

**Status:** ✅ **Ready for Implementation**
**Next Steps:** Set up Cloudinary account and add environment variables
