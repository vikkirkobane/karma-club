import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Flag, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/components/ui/use-toast";

interface ReportContentProps {
  contentId: number;
  contentType: 'post' | 'comment';
  onClose: () => void;
}

const reportReasons = [
  { value: 'spam', label: 'Spam or unwanted content' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'misinformation', label: 'False or misleading information' },
  { value: 'hate', label: 'Hate speech or discrimination' },
  { value: 'other', label: 'Other' }
];

export const ReportContent: React.FC<ReportContentProps> = ({
  contentId,
  contentType,
  onClose
}) => {
  const { user } = useAuth();
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedReason || !user) return;

    setIsSubmitting(true);

    try {
      // In a real app, this would submit to the database
      // For now, we'll simulate the report submission
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community safe. We'll review this content.",
      });

      onClose();
    } catch (error) {
      toast({
        title: "Error submitting report",
        description: "There was an error submitting your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-[#222] text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-400" />
            Report {contentType === 'post' ? 'Post' : 'Comment'}
          </DialogTitle>
          <DialogDescription>
            Help us maintain a safe and positive community by reporting inappropriate content.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-orange-900/20 border border-orange-800 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-orange-200">
              Reports help us maintain a positive community. All reports are reviewed by our moderation team.
            </div>
          </div>

          <div className="space-y-3">
            <Label>Why are you reporting this {contentType}?</Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
              {reportReasons.map((reason) => (
                <div key={reason.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason.value} id={reason.value} />
                  <Label htmlFor={reason.value} className="cursor-pointer">
                    {reason.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              placeholder="Please provide any additional context that would help us understand the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-gray-800 border-gray-700"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedReason || isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};


export default ReportContent;