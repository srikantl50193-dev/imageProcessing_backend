const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// In-memory storage for processing status (in production, use Redis/database)
const processingStatus = new Map();

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

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Image ID is required' });
  }

  try {
    // Check if image exists in Cloudinary
    const cloudinaryResult = await cloudinary.api.resource(id, { resource_type: 'image' });

    if (cloudinaryResult) {
      // Image exists in Cloudinary - processing completed
      const status = {
        id: id,
        status: 'completed',
        publicUrl: cloudinaryResult.secure_url,
        cloudinaryId: cloudinaryResult.public_id,
        originalSize: cloudinaryResult.bytes || 0,
        processedSize: cloudinaryResult.bytes || 0, // We don't store original size
        message: 'Image processed successfully!'
      };

      res.status(200).json(status);
    } else {
      // Image not found - either failed or still processing
      const currentStatus = processingStatus.get(id);

      if (currentStatus === 'processing') {
        res.status(200).json({
          id: id,
          status: 'processing',
          message: 'Image is being processed...'
        });
      } else if (currentStatus === 'failed') {
        res.status(200).json({
          id: id,
          status: 'failed',
          error: 'Image processing failed',
          message: 'Processing failed. Please try again.'
        });
      } else {
        // Unknown status - assume failed
        res.status(404).json({
          id: id,
          status: 'failed',
          error: 'Image not found',
          message: 'Image processing failed or was not found.'
        });
      }
    }

  } catch (error) {
    console.error('Status check error:', error);

    // If Cloudinary resource not found, it might still be processing or failed
    const currentStatus = processingStatus.get(id);

    if (currentStatus === 'processing') {
      res.status(200).json({
        id: id,
        status: 'processing',
        message: 'Image is being processed...'
      });
    } else {
      // Assume failed if we can't find it
      res.status(200).json({
        id: id,
        status: 'failed',
        error: 'Image processing failed',
        message: 'Unable to retrieve image status.'
      });
    }
  }
}