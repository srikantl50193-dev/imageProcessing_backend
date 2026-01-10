// Dynamic imports to avoid Vercel loading issues
let uuidv4, sharp;

// Environment variables
const PHOTOROOM_API_KEY = process.env.PHOTOROOM_API_KEY;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

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
  const { v2: cloudinary } = require('cloudinary');

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

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
    // Temporary simple response to test CORS
    const imageId = Date.now().toString();

    res.status(200).json({
      success: true,
      id: imageId,
      publicUrl: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlPSIjZTFlM2U5IiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSIyMDAiIHk9IjE4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiMxZjI5M2QiIGZvbnQtd2VpZ2h0PSJib2xkIj7inIUgQ09SUyBXb3JraW5nIPCfkY08L3RleHQ+PHRleHQgeD0iMjAwIiB5PSIyMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNmI3MjgwIj5JRDogJHtpZH08L3RleHQ+PC9zdmc+`.replace('${id}', imageId),
      cloudinaryId: `processed_${imageId}`,
      originalSize: 1024000,
      processedSize: 800000,
      message: 'CORS test - simplified upload working!'
    });

  } catch (error) {
    console.error('❌ Upload failed:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
}