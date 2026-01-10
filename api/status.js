export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://image-processing-d5ciw69i6-srikant-lakshminarayans-projects.vercel.app');
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

  // Mock status response - using base64 encoded placeholder image
  // In a real app, this would be the actual processed image URL from Cloudinary
  const status = {
    id: id,
    status: 'completed', // or 'processing', 'failed'
    publicUrl: `data:image/svg+xml;base64,${Buffer.from(`<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="#f3f4f6"/><text x="200" y="200" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">Processed Image ${id}</text></svg>`).toString('base64')}`,
    cloudinaryId: `processed_${id}`
  };

  res.status(200).json(status);
}