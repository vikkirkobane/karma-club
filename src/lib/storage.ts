import { supabase } from './supabase';

export interface UploadResult {
  url: string;
  path: string;
  size: number;
  type: string;
}

export class StorageService {
  private bucket = 'karma-club-media';

  async uploadFile(file: File, folder: string = 'uploads'): Promise<UploadResult> {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.bucket)
        .getPublicUrl(filePath);

      return {
        url: publicUrl,
        path: filePath,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  async uploadActivityMedia(file: File, userId: string, activityId: string): Promise<UploadResult> {
    const folder = `activities/${userId}/${activityId}`;
    return this.uploadFile(file, folder);
  }

  async uploadProfileImage(file: File, userId: string): Promise<UploadResult> {
    const folder = `profiles/${userId}`;
    return this.uploadFile(file, folder);
  }

  async deleteFile(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(this.bucket)
      .remove([path]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  // Compress image before upload
  async compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // Generate thumbnail for video
  async generateVideoThumbnail(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        video.currentTime = 1; // Seek to 1 second
      };

      video.onseeked = () => {
        ctx?.drawImage(video, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const thumbnailFile = new File([blob], `${file.name}-thumbnail.jpg`, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(thumbnailFile);
            } else {
              reject(new Error('Failed to generate thumbnail'));
            }
          },
          'image/jpeg',
          0.8
        );
      };

      video.onerror = () => reject(new Error('Failed to load video'));
      video.src = URL.createObjectURL(file);
    });
  }
}

export const storageService = new StorageService();