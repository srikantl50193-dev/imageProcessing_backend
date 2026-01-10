export default function handler(req, res) {
  // Enable CORS - Allow all Vercel origins for this demo
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // Check environment variables for debugging
  const PHOTOROOM_API_KEY = process.env.PHOTOROOM_API_KEY;
  const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
  const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

  const envStatus = {
    PHOTOROOM_API_KEY: !!PHOTOROOM_API_KEY,
    CLOUDINARY_CLOUD_NAME: !!CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: !!CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: !!CLOUDINARY_API_SECRET
  };

  const missing = Object.entries(envStatus).filter(([key, exists]) => !exists).map(([key]) => key);

  res.status(200).json({
    status: missing.length === 0 ? 'OK' : 'CONFIG_ERROR',
    message: missing.length === 0 ? 'All systems operational!' : 'Missing environment variables',
    timestamp: new Date().toISOString(),
    method: req.method,
    environment: {
      variables: envStatus,
      missing: missing,
      configured: missing.length === 0
    }
  });
}