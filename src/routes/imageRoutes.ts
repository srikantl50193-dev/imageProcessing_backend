import express, { Request, Response } from 'express';
import { upload } from '../middleware/uploadMiddleware';
import { ImageProcessingService } from '../services/imageProcessingService';
import { ImageStorageService } from '../services/imageStorageService';
import { UploadResponse, ImageStatusResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const imageProcessingService = new ImageProcessingService();
const imageStorage = new ImageStorageService();

// Upload and process image
router.post('/upload', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    const imageId = uuidv4();

    // Create initial metadata
    const metadata = {
      id: imageId,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date(),
      status: 'processing' as const
    };

    // Save initial metadata
    imageStorage.saveImage(metadata);

    // Start processing asynchronously
    processImageAsync(imageId, req.file.buffer, req.file.originalname, req.file.mimetype);

    const response: UploadResponse = {
      success: true,
      imageId,
      message: 'Image upload started. Check status for completion.',
      statusUrl: `/api/images/${imageId}/status`
    };

    res.json(response);

  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image',
      message: error.message
    });
  }
});

// Get image status
router.get('/:id/status', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const image = imageStorage.getImage(id);

    if (!image) {
      return res.status(404).json({
        error: 'Image not found'
      });
    }

    const response: ImageStatusResponse = {
      id: image.id,
      status: image.status,
      publicUrl: image.publicUrl,
      error: image.error,
      processedAt: image.processedAt
    };

    res.json(response);

  } catch (error: any) {
    console.error('Status check error:', error);
    res.status(500).json({
      error: 'Failed to check image status'
    });
  }
});

// Get processed image
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const image = imageStorage.getImage(id);

    if (!image) {
      return res.status(404).json({
        error: 'Image not found'
      });
    }

    if (image.status !== 'completed') {
      return res.status(400).json({
        error: 'Image processing not completed',
        status: image.status
      });
    }

    if (!image.publicUrl) {
      return res.status(404).json({
        error: 'Image URL not available'
      });
    }

    // Redirect to the hosted image
    res.redirect(image.publicUrl);

  } catch (error: any) {
    console.error('Image retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve image'
    });
  }
});

// Delete image
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const image = imageStorage.getImage(id);

    if (!image) {
      return res.status(404).json({
        error: 'Image not found'
      });
    }

    let cloudDeleteSuccess = false;

    // Delete from cloud storage if it exists
    if (image.cloudinaryId) {
      try {
        await imageProcessingService.deleteImage(image.cloudinaryId);
        cloudDeleteSuccess = true;
      } catch (cloudError: any) {
        console.error('Cloud delete failed, continuing with local cleanup:', cloudError.message);
        // Continue with local deletion even if cloud delete fails
      }
    }

    // Always remove from local storage
    imageStorage.deleteImage(id);

    res.json({
      success: true,
      message: cloudDeleteSuccess
        ? 'Image deleted successfully from cloud and local storage'
        : 'Image deleted from local storage (cloud delete may have failed)',
      cloudDeleteSuccess
    });

  } catch (error: any) {
    console.error('Delete error:', error);
    res.status(500).json({
      error: 'Failed to delete image',
      message: error.message
    });
  }
});

// Async processing function
async function processImageAsync(
  imageId: string,
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<void> {
  try {
    console.log(`🔄 Starting processing for image ${imageId}`);

    const result = await imageProcessingService.processImage(buffer, originalName, mimeType);

    // Update metadata with success
    imageStorage.updateImage(imageId, {
      status: 'completed',
      publicUrl: result.publicUrl,
      cloudinaryId: result.cloudinaryId,
      processedAt: new Date()
    });

    console.log(`✅ Processing completed for image ${imageId}`);

  } catch (error: any) {
    console.error(`❌ Processing failed for image ${imageId}:`, error);

    // Update metadata with failure
    imageStorage.updateImage(imageId, {
      status: 'failed',
      error: error.message,
      processedAt: new Date()
    });
  }
}

export { router as imageRoutes };