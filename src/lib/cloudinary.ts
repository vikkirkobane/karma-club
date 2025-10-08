// Cloudinary upload service for media files
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  resource_type: 'image' | 'video';
  format: string;
  bytes: number;
}

export interface CloudinaryError {
  message: string;
  http_code: number;
  error?: {
    message: string;
  };
}

export class CloudinaryService {
  private static readonly CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  private static readonly UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  private static readonly API_URL = `https://api.cloudinary.com/v1_1/${CloudinaryService.CLOUD_NAME}`;

  // Verify configuration on class load
  static {
    if (!CloudinaryService.CLOUD_NAME || CloudinaryService.CLOUD_NAME === 'your-cloud-name') {
      console.error('❌ Cloudinary cloud name not configured. Please set VITE_CLOUDINARY_CLOUD_NAME in your .env file.');
    }
    if (!CloudinaryService.UPLOAD_PRESET || CloudinaryService.UPLOAD_PRESET === 'karma-club-uploads') {
      console.warn('⚠️  Using default upload preset. Please verify "karma-club-uploads" exists in your Cloudinary dashboard.');
    }
    if (CloudinaryService.CLOUD_NAME && CloudinaryService.UPLOAD_PRESET) {
      console.log('✅ Cloudinary configuration loaded:', {
        cloudName: CloudinaryService.CLOUD_NAME,
        uploadPreset: CloudinaryService.UPLOAD_PRESET
      });
    }
  }

  /**
   * Check if Cloudinary is properly configured
   */
  static isConfigured(): boolean {
    return !!(CloudinaryService.CLOUD_NAME && 
             CloudinaryService.UPLOAD_PRESET && 
             CloudinaryService.CLOUD_NAME !== 'your-cloud-name');
  }

  /**
   * Get configuration status for debugging
   */
  static getConfigStatus(): {
    isConfigured: boolean;
    cloudName: string | undefined;
    uploadPreset: string | undefined;
    issues: string[];
  } {
    const issues: string[] = [];
    
    if (!CloudinaryService.CLOUD_NAME) {
      issues.push('VITE_CLOUDINARY_CLOUD_NAME is not set');
    } else if (CloudinaryService.CLOUD_NAME === 'your-cloud-name') {
      issues.push('VITE_CLOUDINARY_CLOUD_NAME is using default value');
    }

    if (!CloudinaryService.UPLOAD_PRESET) {
      issues.push('VITE_CLOUDINARY_UPLOAD_PRESET is not set');
    }

    return {
      isConfigured: CloudinaryService.isConfigured(),
      cloudName: CloudinaryService.CLOUD_NAME,
      uploadPreset: CloudinaryService.UPLOAD_PRESET,
      issues
    };
  }

  /**
   * Upload media file to Cloudinary
   */
  static async uploadMedia(file: File, onProgress?: (progress: number) => void): Promise<CloudinaryUploadResult> {
    // Check configuration first
    if (!CloudinaryService.isConfigured()) {
      const status = CloudinaryService.getConfigStatus();
      throw new Error(`Cloudinary not configured: ${status.issues.join(', ')}`);
    }

    // Validate file
    const validationError = CloudinaryService.validateFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CloudinaryService.UPLOAD_PRESET);
    
    // Determine resource type based on file type
    const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
    formData.append('resource_type', resourceType);
    
    // Add folder organization
    formData.append('folder', 'karma-club/submissions');

    try {
      console.log(`📸 Uploading ${resourceType} to Cloudinary:`, {
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        fileType: file.type
      });

      const response = await fetch(`${CloudinaryService.API_URL}/${resourceType}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = errorData as CloudinaryError;
        
        let errorMessage = `Upload failed (${response.status}): ${response.statusText}`;
        if (error.error?.message) {
          errorMessage += ` - ${error.error.message}`;
        }
        
        // Specific error handling
        if (response.status === 400) {
          if (error.message?.includes('Invalid upload preset')) {
            errorMessage = 'Upload preset "karma-club-uploads" not found. Please create it in your Cloudinary dashboard.';
          } else if (error.message?.includes('File size too large')) {
            errorMessage = 'File is too large. Please use a file smaller than 10MB.';
          } else if (error.message?.includes('Invalid file format')) {
            errorMessage = 'Unsupported file format. Please use JPG, PNG, GIF, or MP4 files.';
          }
        } else if (response.status === 401) {
          errorMessage = 'Upload unauthorized. Please check your Cloudinary upload preset is set to "Unsigned".';
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      console.log('✅ Cloudinary upload successful:', {
        publicId: result.public_id,
        url: result.secure_url,
        size: `${(result.bytes / 1024 / 1024).toFixed(2)}MB`,
        format: result.format
      });
      
      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        resource_type: resourceType,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (error) {
      console.error('❌ Cloudinary upload error:', error);
      
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Upload failed due to network error. Please check your connection and try again.');
      }
    }
  }

  /**
   * Validate file before upload
   */
  private static validateFile(file: File): string | null {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

    if (file.size > MAX_SIZE) {
      return `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 10MB limit`;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Unsupported file type: ${file.type}. Please use JPG, PNG, GIF, or MP4 files.`;
    }

    return null;
  }

  /**
   * Generate optimized URL for existing Cloudinary image
   */
  static getOptimizedUrl(publicId: string, options: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | string;
    crop?: 'scale' | 'fill' | 'fit' | 'limit' | 'pad';
  } = {}): string {
    if (!CloudinaryService.CLOUD_NAME) {
      console.warn('Cannot generate optimized URL: Cloudinary cloud name not configured');
      return publicId; // Return original if not configured
    }

    const { 
      width = 800, 
      height = 600, 
      quality = 'auto', 
      format = 'auto',
      crop = 'scale'
    } = options;
    
    const transformations = [
      `w_${width}`,
      `h_${height}`,
      `c_${crop}`,
      `q_${quality}`,
      `f_${format}`
    ].join(',');

    return `https://res.cloudinary.com/${CloudinaryService.CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
  }

  /**
   * Test Cloudinary configuration by making a test request
   */
  static async testConfiguration(): Promise<{
    success: boolean;
    message: string;
    details?: unknown;
  }> {
    try {
      if (!CloudinaryService.isConfigured()) {
        const status = CloudinaryService.getConfigStatus();
        return {
          success: false,
          message: 'Configuration incomplete',
          details: status
        };
      }

      // Create a small test file (1x1 pixel image)
      const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const response = await fetch(testImageData);
      const blob = await response.blob();
      const testFile = new File([blob], 'test.png', { type: 'image/png' });

      // Try to upload the test file
      const result = await CloudinaryService.uploadMedia(testFile);
      
      return {
        success: true,
        message: 'Cloudinary configuration is working correctly',
        details: {
          uploadUrl: result.secure_url,
          publicId: result.public_id
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Configuration test failed',
        details: { error }
      };
    }
  }
}