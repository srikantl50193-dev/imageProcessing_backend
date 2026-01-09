export interface ImageMetadata {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
  processedAt?: Date;
  publicUrl?: string;
  cloudinaryId?: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface ProcessedImageResult {
  id: string;
  publicUrl: string;
  cloudinaryId: string;
  originalSize: number;
  processedSize: number;
}

export interface UploadResponse {
  success: boolean;
  imageId: string;
  message: string;
  statusUrl?: string;
}

export interface ImageStatusResponse {
  id: string;
  status: ImageMetadata['status'];
  publicUrl?: string;
  error?: string;
  processedAt?: Date;
}


export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  bytes: number;
  format: string;
}