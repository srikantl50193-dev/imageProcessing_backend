export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://image-processing-l6d0tx1t2-srikant-lakshminarayans-projects.vercel.app');
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

  // Mock status response
  const status = {
    id: id,
    status: 'completed', // or 'processing', 'failed'
    progress: 100,
    result: {
      publicUrl: `https://res.cloudinary.com/demo/image/upload/v1234567890/${id}_processed.jpg`,
      cloudinaryId: `processed_${id}`
    }
  };

  res.status(200).json(status);
}