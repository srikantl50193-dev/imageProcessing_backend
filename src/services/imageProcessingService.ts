import sharp from 'sharp';
import { BackgroundRemovalService } from './backgroundRemovalService';
import { CloudinaryService } from './cloudinaryService';
import { ProcessedImageResult } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class ImageProcessingService {
  private backgroundRemovalService: BackgroundRemovalService;
  private cloudinaryService: CloudinaryService;

  constructor() {
    this.backgroundRemovalService = new BackgroundRemovalService();
    this.cloudinaryService = new CloudinaryService();
  }

  async processImage(
    imageBuffer: Buffer,
    originalName: string,
    _mimeType: string
  ): Promise<ProcessedImageResult> {
    const imageId = uuidv4();

    try {
      // Step 1: Remove background
      console.log('🖼️ Removing background...');
      const backgroundRemovedBlob = await this.backgroundRemovalService.removeBackground(
        imageBuffer,
        originalName
      );

      // Convert blob to buffer for Sharp processing
      const backgroundRemovedBuffer = Buffer.from(await backgroundRemovedBlob.arrayBuffer());

      // Step 2: Flip horizontally
      console.log('🔄 Flipping image horizontally...');
      const flippedBuffer = await this.flipImageHorizontally(backgroundRemovedBuffer);

      // Step 3: Upload to cloud storage
      console.log('☁️ Uploading to cloud storage...');
      const uploadResult = await this.cloudinaryService.uploadImage(
        flippedBuffer,
        imageId,
        `processed_${originalName}`
      );

      const result: ProcessedImageResult = {
        id: imageId,
        publicUrl: uploadResult.secure_url,
        cloudinaryId: uploadResult.public_id,
        originalSize: imageBuffer.length,
        processedSize: flippedBuffer.length,
      };

      console.log('✅ Image processing completed successfully');
      return result;

    } catch (error: any) {
      console.error('❌ Image processing failed:', error.message);
      throw error;
    }
  }

  private async flipImageHorizontally(imageBuffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(imageBuffer)
        .flop() // Horizontal flip
        .jpeg({ quality: 90 }) // Compress to reduce file size
        .toBuffer();
    } catch (error: any) {
      throw new Error(`Failed to flip image: ${error.message}`);
    }
  }

  async deleteImage(cloudinaryId: string): Promise<void> {
    await this.cloudinaryService.deleteImage(cloudinaryId);
  }
}