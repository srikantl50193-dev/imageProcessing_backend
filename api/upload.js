import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import formidable from 'formidable';
import { v2 as cloudinary } from 'cloudinary';

// Environment variables
const PHOTOROOM_API_KEY = process.env.PHOTOROOM_API_KEY;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// Helper function to get retry delay
function getRetryDelay(attempt) {
  const baseDelay = 2000;
  return baseDelay * Math.pow(2, attempt - 1);
}

// Check if error is retryable
function isRetryableError(error) {
  if (error.name === 'AbortError') return true;
  if (error.message?.includes('Photoroom API returned status')) {
    const statusMatch = error.message.match(/status (\d+)/);
    if (statusMatch) {
      const status = parseInt(statusMatch[1], 10);
      const retryableStatuses = [403, 429, 500, 502, 503, 504];
      return retryableStatuses.includes(status);
    }
  }
  return error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND' || error.name === 'TypeError';
}

// Upload to Cloudinary
async function uploadToCloudinary(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: 'image',
        format: 'jpg',
        quality: 90,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
  });
}

// Remove background using Photoroom API
async function removeBackground(imageBuffer, filename) {
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const formData = new FormData();
      const blob = new Blob([new Uint8Array(imageBuffer)]);
      formData.append('image_file', blob, filename);
      formData.append('size', 'auto');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

      const response = await fetch('https://sdk.photoroom.com/v1/segment', {
        method: 'POST',
        headers: {
          'x-api-key': PHOTOROOM_API_KEY,
          'User-Agent': 'ImageProcessing-Backend/1.0',
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return await response.blob();
      }

      throw new Error(`Photoroom API returned status ${response.status}`);

    } catch (error) {
      console.error(`Background removal attempt ${attempt}/${maxRetries} failed:`, error.message);

      const shouldRetry = isRetryableError(error);

      if (!shouldRetry || attempt === maxRetries) {
        throw error;
      }

      const retryDelay = getRetryDelay(attempt);
      console.log(`Retrying in ${retryDelay}ms... (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

// Flip image horizontally
async function flipImageHorizontally(imageBuffer) {
  return await sharp(imageBuffer)
    .flop()
    .jpeg({ quality: 90 })
    .toBuffer();
}

export default async function handler(req, res) {
  // Enable CORS - Allow all Vercel origins for this demo
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate environment variables
    if (!PHOTOROOM_API_KEY || !CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      console.error('Missing environment variables:', {
        PHOTOROOM_API_KEY: !!PHOTOROOM_API_KEY,
        CLOUDINARY_CLOUD_NAME: !!CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY: !!CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET: !!CLOUDINARY_API_SECRET
      });
      return res.status(500).json({
        error: 'Server configuration error',
        details: 'Missing required API keys. Please check Vercel environment variables.'
      });
    }

    // Parse multipart form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);

    if (!files.image || !files.image[0]) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const file = files.image[0];
    console.log('📁 File received:', {
      originalName: file.originalFilename,
      size: file.size,
      filepath: file.filepath
    });

    let imageBuffer;
    try {
      imageBuffer = require('fs').readFileSync(file.filepath);
    } catch (fsError) {
      console.error('❌ File read error:', fsError);
      return res.status(500).json({
        error: 'File processing error',
        message: 'Unable to read uploaded file'
      });
    }

    const originalName = file.originalFilename || 'uploaded-image.jpg';
    const imageId = uuidv4();

    console.log('🖼️ Starting REAL image processing with Photoroom + Sharp + Cloudinary...');
    console.log('📊 Original image size:', imageBuffer.length, 'bytes');

    // Step 1: Remove background
    console.log('🖼️ Removing background with Photoroom API...');
    const backgroundRemovedBlob = await removeBackground(imageBuffer, originalName);
    const backgroundRemovedBuffer = Buffer.from(await backgroundRemovedBlob.arrayBuffer());

    // Step 2: Flip horizontally
    console.log('🔄 Flipping image horizontally with Sharp...');
    const flippedBuffer = await flipImageHorizontally(backgroundRemovedBuffer);

    // Step 3: Upload to Cloudinary
    console.log('☁️ Uploading processed image to Cloudinary...');
    const uploadResult = await uploadToCloudinary(flippedBuffer, imageId);

    const result = {
      success: true,
      id: imageId,
      publicUrl: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id,
      originalSize: imageBuffer.length,
      processedSize: flippedBuffer.length,
      message: '✅ Image processed successfully! Background removed, flipped horizontally, and uploaded to cloud storage.'
    };

    console.log('✅ REAL image processing completed successfully');
    console.log('📊 Results:', {
      originalSize: imageBuffer.length,
      processedSize: flippedBuffer.length,
      cloudinaryUrl: uploadResult.secure_url
    });

    res.status(200).json(result);

  } catch (error) {
    console.error('❌ REAL image processing failed:', error);

    let errorMessage = 'Image processing failed';
    let statusCode = 500;

    if (error.message?.includes('Photoroom API returned status 403')) {
      errorMessage = 'Background removal service temporarily unavailable. Please try again.';
      statusCode = 503;
    } else if (error.message?.includes('Photoroom API returned status 402')) {
      errorMessage = 'Background removal service credits exhausted.';
      statusCode = 503;
    } else if (error.message?.includes('Photoroom API returned status 400')) {
      errorMessage = 'Invalid image format or corrupted image file.';
      statusCode = 400;
    }

    res.status(statusCode).json({
      error: errorMessage,
      message: error.message
    });
  }
}