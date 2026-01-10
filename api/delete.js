import { v2 as cloudinary } from 'cloudinary';

// Environment variables
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// Helper function for retry delay
function getCloudinaryRetryDelay(attempt) {
  const baseDelay = 1000;
  return baseDelay * Math.pow(2, attempt - 1);
}

// Check if Cloudinary error is retryable
function isRetryableCloudinaryError(error) {
  if (error?.http_code === 499) return true;
  if (error?.http_code >= 500) return true;
  if (error?.name === 'TimeoutError') return true;
  if (error?.code === 'ECONNABORTED') return true;
  if (error?.code === 'ENOTFOUND') return true;
  return false;
}

// Delete image from Cloudinary
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

  // Only allow DELETE requests
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Image ID is required' });
  }

  console.log('🗑️ Attempting to delete image from Cloudinary:', id);

  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🗑️ Delete attempt ${attempt}/${maxRetries} for image:`, id);

      // Delete from Cloudinary
      const result = await cloudinary.uploader.destroy(id);

      console.log('✅ Successfully deleted from Cloudinary:', result);

      res.status(200).json({
        success: true,
        message: `Image ${id} successfully deleted from cloud storage`,
        id: id,
        cloudDeleteSuccess: true,
        cloudinaryResult: result
      });
      return;

    } catch (error) {
      console.error(`❌ Cloudinary delete attempt ${attempt}/${maxRetries} failed:`, error.message);
      lastError = error;

      const shouldRetry = isRetryableCloudinaryError(error);

      if (!shouldRetry || attempt === maxRetries) {
        console.error('❌ All delete attempts failed');
        break;
      }

      const retryDelay = getCloudinaryRetryDelay(attempt);
      console.log(`⏳ Retrying delete in ${retryDelay}ms... (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  // If we get here, all retries failed
  console.error('💥 Delete operation failed after all retries:', lastError?.message);

  // Still return success but indicate cloud delete failed
  res.status(200).json({
    success: true,
    message: `Image ${id} deletion request completed, but cloud deletion may have failed`,
    id: id,
    cloudDeleteSuccess: false,
    error: lastError?.message,
    partialSuccess: true
  });
}