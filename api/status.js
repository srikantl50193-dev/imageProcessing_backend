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

// Force redeploy - status fix for mock responses
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

  // For mock/placeholder mode, return completed status immediately
  // In production, this would check actual processing status
  const status = {
    id: id,
    status: 'completed',
    publicUrl: `data:image/svg+xml;base64,${Buffer.from(`<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="#ffffff" stroke="#e1e3e9" stroke-width="2"/><text x="200" y="180" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" fill="#1f293d" font-weight="bold">✅ CORS Working</text><text x="200" y="220" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="#6b7280">ID: ${id}</text></svg>`).toString('base64')}`,
    cloudinaryId: `processed_${id}`,
    originalSize: 1024000,
    processedSize: 800000,
    message: 'CORS working! Status check completed.'
  };

  res.status(200).json(status);
}