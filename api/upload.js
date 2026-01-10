// Simple UUID generation for now
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
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
    // Simple test response first
    const imageId = generateId();

    const result = {
      success: true,
      id: imageId,
      publicUrl: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlPSIjZTVlN2ViIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSIyMDAiIHk9IjIwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiMxMTE4MjciIGZvbnQtd2VpZ2h0PSJib2xkIj7inIUgUHJvY2Vzc2VkIEltYWdlPC90ZXh0Pjx0ZXh0IHg9IjIwMCIgeT0iMjI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzZiNzI4MCI+SUQ6ICRpZF0kPC90ZXh0Pjwvc3ZnPg==`.replace('$id', imageId),
      cloudinaryId: `processed_${imageId}`,
      originalSize: 1024000,
      processedSize: 800000,
      message: 'Image processing temporarily disabled - using placeholder'
    };

    res.status(200).json(result);

  } catch (error) {
    console.error('❌ Upload failed:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
}

export const config = {
  api: {
    bodyParser: false, // Disable body parsing for file uploads
  },
};// Force redeploy v4 - CORS wildcard fix
// Force backend redeploy - wildcard CORS for all origins
