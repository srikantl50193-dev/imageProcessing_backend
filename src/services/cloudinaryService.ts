import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryUploadResponse } from '../types';
import { env } from '../utils/env';

export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME!,
      api_key: env.CLOUDINARY_API_KEY!,
      api_secret: env.CLOUDINARY_API_SECRET!,
    });
  }

  async uploadImage(
    imageBuffer: Buffer,
    publicId: string,
    _filename: string
  ): Promise<CloudinaryUploadResponse> {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: publicId,
            folder: 'image-processing-service',
            resource_type: 'image',
            format: 'jpg',
            quality: 'auto',
            transformation: [
              { width: 1200, height: 1200, crop: 'limit' } // Limit max dimensions
            ]
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(new Error(`Failed to upload image: ${error.message}`));
            } else if (result) {
              resolve(result as CloudinaryUploadResponse);
            } else {
              reject(new Error('Upload failed: No result returned'));
            }
          }
        );

        uploadStream.end(imageBuffer);
      });
    } catch (error: any) {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await cloudinary.uploader.destroy(publicId);
        return;
      } catch (error: any) {
        lastError = error;

        // Check if this is a retryable error
        const shouldRetry = this.isRetryableCloudinaryError(error);

        if (!shouldRetry || attempt === maxRetries) {
          // Either not retryable or we've exhausted retries
          throw new Error(`Failed to delete image: ${error.message}`);
        }

        // Calculate retry delay
        const retryDelay = this.getCloudinaryRetryDelay(attempt);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    throw lastError;
  }

  private isRetryableCloudinaryError(error: any): boolean {
    // Retry on timeouts, network errors, and server errors
    if (error?.http_code === 499) return true; // Timeout
    if (error?.http_code >= 500) return true; // Server errors
    if (error?.name === 'TimeoutError') return true;
    if (error?.code === 'ECONNABORTED') return true;
    if (error?.code === 'ENOTFOUND') return true;

    return false;
  }

  private getCloudinaryRetryDelay(attempt: number): number {
    // Exponential backoff: base delay * 2^(attempt - 1)
    const baseDelay = 1000; // 1 second
    return baseDelay * Math.pow(2, attempt - 1);
  }

  getPublicUrl(publicId: string): string {
    return cloudinary.url(publicId, {
      secure: true,
      quality: 'auto',
      format: 'jpg'
    });
  }
}