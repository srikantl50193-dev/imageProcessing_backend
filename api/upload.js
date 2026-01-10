// Clean, minimal upload handler for CORS testing

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