export default function handler(req, res) {
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

  // Generate a simple ID
  const imageId = Date.now().toString();

  // Mock successful upload response
  const result = {
    success: true,
    id: imageId,
    originalSize: 1024000,
    processedSize: 800000,
    publicUrl: `https://res.cloudinary.com/demo/image/upload/v1234567890/${imageId}.jpg`,
    cloudinaryId: `image_processing_${imageId}`,
    message: 'Image uploaded and processed successfully!'
  };

  res.status(200).json(result);
}

export const config = {
  api: {
    bodyParser: false, // Disable body parsing for file uploads
  },
};// Force redeploy v2
// Force backend redeploy
