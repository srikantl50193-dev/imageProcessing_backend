export default function handler(req, res) {
  // Enable CORS - Allow all Vercel origins for this demo
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // Simple response for CORS testing
  const imageId = Date.now().toString();

  res.status(200).json({
    success: true,
    id: imageId,
    publicUrl: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2ZmZmZmYiIgc3Ryb2tlPSIjZTFlM2U5IiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSIyMDAiIHk9IjE4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiMxZjI5M2QiIGZvbnQtd2VpZ2h0PSJib2xkIj7iJwpQ29SUyBXb3JraW5nIPCfkY08L3RleHQ+PHRleHQgeD0iMjAwIiB5PSIyMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNmI3MjgwIj5JRDog${imageId}</dGV4dD48L3N2Zz4=`,
    cloudinaryId: `processed_${imageId}`,
    originalSize: 1024000,
    processedSize: 800000,
    message: 'CORS working! Upload endpoint accessible.',
    timestamp: new Date().toISOString(),
    method: req.method
  });
}