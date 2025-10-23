import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from "@/components/ui/use-toast";
import { Upload, X, Image, Video } from 'lucide-react';

interface MediaUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  selectedFile?: File | null;
  previewUrl?: string | null;
  accept?: string;
  maxSize?: number; // in MB
  acceptVideo?: boolean;
  children?: React.ReactNode; // For custom trigger elements
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  onFileSelect,
  onFileRemove,
  selectedFile,
  previewUrl,
  accept = "image/*,video/*",
  maxSize = 10,
  acceptVideo = true,
  children
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSelectFile(file);
    }
  };

  const validateAndSelectFile = (file: File) => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Please select a file smaller than ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }

    // Check file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && (!acceptVideo || !isVideo)) {
      toast({
        title: "Invalid file type",
        description: acceptVideo ? "Please select an image or video file" : "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSelectFile(file);
    }
  };

  const handleRemoveFile = () => {
    if (onFileRemove) {
      onFileRemove();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const isImage = selectedFile?.type.startsWith('image/');
  const isVideo = selectedFile?.type.startsWith('video/');

  // If children are provided, render as a trigger button
  if (children) {
    return (
      <>
        <div onClick={triggerFileInput} className="cursor-pointer">
          {children}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <Label htmlFor="media-upload">Upload Photo or Video</Label>

      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
              : 'border-gray-300 dark:border-gray-700'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-2">
            <Upload className="h-8 w-8 mx-auto text-gray-400" />
            <div>
              <Button
                type="button"
                variant="ghost"
                onClick={triggerFileInput}
                className="text-emerald-600 hover:text-emerald-700"
              >
                Choose file
              </Button>
              <p className="text-sm text-gray-500">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">
              {acceptVideo ? 'PNG, JPG, MP4 up to' : 'PNG, JPG up to'} {maxSize}MB
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              {isImage && <Image className="h-8 w-8 text-blue-500" />}
              {isVideo && <Video className="h-8 w-8 text-purple-500" />}
              <div className="flex-1">
                <p className="font-medium text-sm">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="text-red-500 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {previewUrl && (
            <div className="mt-4 rounded-lg overflow-hidden">
              {isImage && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-48 object-cover"
                />
              )}
              {isVideo && (
                <video
                  src={previewUrl}
                  controls
                  className="w-full max-h-48 object-cover"
                />
              )}
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        id="media-upload"
      />
    </div>
  );
};